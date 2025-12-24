import express from 'express';
import pool from './database.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'bhoomiai-secret';

// Authentication middleware
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        req.userType = decoded.userType;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

// Advocate-only middleware
const advocateOnly = (req, res, next) => {
    if (req.userType !== 'advocate') {
        return res.status(403).json({ success: false, message: 'Advocate access only' });
    }
    next();
};

// ============================================
// CREATE QUERY (User)
// POST /api/queries
// ============================================
router.post('/', authenticate, async (req, res) => {
    try {
        const { subject, question, propertyId } = req.body;

        if (!subject || !question) {
            return res.status(400).json({
                success: false,
                message: 'Subject and question are required'
            });
        }

        // Validate property if provided
        if (propertyId) {
            const propertyCheck = await pool.query(
                'SELECT id FROM properties WHERE id = $1 AND user_id = $2',
                [propertyId, req.userId]
            );
            if (propertyCheck.rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid property ID'
                });
            }
        }

        const result = await pool.query(
            `INSERT INTO legal_queries (user_id, property_id, question, status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING *`,
            [req.userId, propertyId || null, `${subject}\n\n${question}`]
        );

        res.status(201).json({
            success: true,
            message: 'Query submitted successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Create query error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================================
// GET USER'S QUERIES
// GET /api/queries
// ============================================
router.get('/', authenticate, async (req, res) => {
    try {
        let query;
        let params;

        if (req.userType === 'advocate') {
            // Advocates see all queries or assigned ones
            query = `
        SELECT 
          lq.*,
          u.full_name as user_name,
          u.email as user_email,
          p.survey_no,
          p.village,
          p.district,
          lr.answer,
          lr.responded_at,
          a.name as advocate_name
        FROM legal_queries lq
        JOIN users u ON lq.user_id = u.id
        LEFT JOIN properties p ON lq.property_id = p.id
        LEFT JOIN legal_responses lr ON lq.id = lr.query_id
        LEFT JOIN advocates a ON lr.advocate_id = a.id
        ORDER BY 
          CASE WHEN lq.status = 'pending' THEN 0 ELSE 1 END,
          lq.created_at DESC
      `;
            params = [];
        } else {
            // Regular users see their own queries
            query = `
        SELECT 
          lq.*,
          p.survey_no,
          p.village,
          p.district,
          lr.answer,
          lr.responded_at,
          a.name as advocate_name
        FROM legal_queries lq
        LEFT JOIN properties p ON lq.property_id = p.id
        LEFT JOIN legal_responses lr ON lq.id = lr.query_id
        LEFT JOIN advocates a ON lr.advocate_id = a.id
        WHERE lq.user_id = $1
        ORDER BY lq.created_at DESC
      `;
            params = [req.userId];
        }

        const result = await pool.query(query, params);

        // Parse subject from question (first line)
        const queries = result.rows.map(q => {
            const parts = q.question.split('\n\n');
            return {
                ...q,
                subject: parts[0],
                description: parts.slice(1).join('\n\n')
            };
        });

        res.json({
            success: true,
            data: queries
        });
    } catch (error) {
        console.error('Get queries error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================================
// GET SINGLE QUERY
// GET /api/queries/:id
// ============================================
router.get('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
      SELECT 
        lq.*,
        u.full_name as user_name,
        u.email as user_email,
        p.survey_no,
        p.village,
        p.mandal,
        p.district,
        p.land_type,
        lr.answer,
        lr.responded_at,
        a.name as advocate_name,
        a.email as advocate_email
      FROM legal_queries lq
      JOIN users u ON lq.user_id = u.id
      LEFT JOIN properties p ON lq.property_id = p.id
      LEFT JOIN legal_responses lr ON lq.id = lr.query_id
      LEFT JOIN advocates a ON lr.advocate_id = a.id
      WHERE lq.id = $1
    `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Query not found' });
        }

        const query = result.rows[0];

        // Check authorization (user can see their own, advocates can see all)
        if (query.user_id !== req.userId && req.userType !== 'advocate') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Parse subject
        const parts = query.question.split('\n\n');

        res.json({
            success: true,
            data: {
                ...query,
                subject: parts[0],
                description: parts.slice(1).join('\n\n')
            }
        });
    } catch (error) {
        console.error('Get query error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================================
// RESPOND TO QUERY (Advocate Only)
// POST /api/queries/:id/respond
// ============================================
router.post('/:id/respond', authenticate, advocateOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const { answer } = req.body;

        if (!answer) {
            return res.status(400).json({
                success: false,
                message: 'Answer is required'
            });
        }

        // Check query exists and is pending
        const queryCheck = await pool.query(
            'SELECT * FROM legal_queries WHERE id = $1',
            [id]
        );

        if (queryCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Query not found' });
        }

        if (queryCheck.rows[0].status === 'answered') {
            return res.status(400).json({
                success: false,
                message: 'Query has already been answered'
            });
        }

        // Get or create advocate record
        let advocateResult = await pool.query(
            'SELECT id FROM advocates WHERE email = (SELECT email FROM users WHERE id = $1)',
            [req.userId]
        );

        let advocateId;
        if (advocateResult.rows.length === 0) {
            // Create advocate record
            const userResult = await pool.query(
                'SELECT full_name, email FROM users WHERE id = $1',
                [req.userId]
            );
            const user = userResult.rows[0];

            const newAdvocate = await pool.query(
                'INSERT INTO advocates (name, email, verified) VALUES ($1, $2, true) RETURNING id',
                [user.full_name, user.email]
            );
            advocateId = newAdvocate.rows[0].id;
        } else {
            advocateId = advocateResult.rows[0].id;
        }

        // Create response
        const responseResult = await pool.query(
            `INSERT INTO legal_responses (query_id, advocate_id, answer)
       VALUES ($1, $2, $3)
       RETURNING *`,
            [id, advocateId, answer]
        );

        // Update query status
        await pool.query(
            `UPDATE legal_queries SET status = 'answered' WHERE id = $1`,
            [id]
        );

        res.status(201).json({
            success: true,
            message: 'Response submitted successfully',
            data: responseResult.rows[0]
        });
    } catch (error) {
        console.error('Respond to query error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================================
// CLOSE QUERY (User)
// POST /api/queries/:id/close
// ============================================
router.post('/:id/close', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `UPDATE legal_queries 
       SET status = 'closed' 
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
            [id, req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Query not found' });
        }

        res.json({
            success: true,
            message: 'Query closed successfully'
        });
    } catch (error) {
        console.error('Close query error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;
