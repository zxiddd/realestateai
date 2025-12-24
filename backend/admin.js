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

// Admin-only middleware
const adminOnly = async (req, res, next) => {
    try {
        const result = await pool.query(
            'SELECT is_admin FROM users WHERE id = $1',
            [req.userId]
        );

        if (result.rows.length === 0 || !result.rows[0].is_admin) {
            return res.status(403).json({ success: false, message: 'Admin access only' });
        }
        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ============================================
// DASHBOARD STATS
// GET /api/admin/stats
// ============================================
router.get('/stats', authenticate, adminOnly, async (req, res) => {
    try {
        const stats = {};

        // Users count by type
        const usersResult = await pool.query(`
      SELECT user_type, COUNT(*) as count 
      FROM users 
      GROUP BY user_type
    `);
        stats.usersByType = usersResult.rows;

        // Total users
        const totalUsers = await pool.query('SELECT COUNT(*) FROM users');
        stats.totalUsers = parseInt(totalUsers.rows[0].count);

        // Properties by status
        const propertiesResult = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM properties 
      GROUP BY status
    `);
        stats.propertiesByStatus = propertiesResult.rows;

        // Total properties
        const totalProperties = await pool.query('SELECT COUNT(*) FROM properties');
        stats.totalProperties = parseInt(totalProperties.rows[0].count);

        // Active marketplace listings
        const activeListings = await pool.query(
            "SELECT COUNT(*) FROM marketplace_listings WHERE status = 'active'"
        );
        stats.activeListings = parseInt(activeListings.rows[0].count);

        // Pending queries
        const pendingQueries = await pool.query(
            "SELECT COUNT(*) FROM legal_queries WHERE status = 'pending'"
        );
        stats.pendingQueries = parseInt(pendingQueries.rows[0].count);

        // Verified advocates
        const verifiedAdvocates = await pool.query(
            'SELECT COUNT(*) FROM advocates WHERE verified = true'
        );
        stats.verifiedAdvocates = parseInt(verifiedAdvocates.rows[0].count);

        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Get admin stats error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================================
// GET ALL USERS
// GET /api/admin/users
// ============================================
router.get('/users', authenticate, adminOnly, async (req, res) => {
    try {
        const { search, userType, isActive, limit = 50, offset = 0 } = req.query;

        let query = `
      SELECT id, full_name, email, phone, user_type, is_active, is_verified, 
             is_admin, created_at, last_login_at
      FROM users
      WHERE 1=1
    `;
        const params = [];
        let paramCount = 0;

        if (search) {
            paramCount++;
            query += ` AND (full_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
            params.push(`%${search}%`);
        }

        if (userType) {
            paramCount++;
            query += ` AND user_type = $${paramCount}`;
            params.push(userType);
        }

        if (isActive !== undefined) {
            paramCount++;
            query += ` AND is_active = $${paramCount}`;
            params.push(isActive === 'true');
        }

        query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
        params.push(parseInt(limit), parseInt(offset));

        const result = await pool.query(query, params);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================================
// UPDATE USER STATUS
// PUT /api/admin/users/:id
// ============================================
router.put('/users/:id', authenticate, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive, isAdmin, userType } = req.body;

        const updates = [];
        const params = [];
        let paramCount = 0;

        if (isActive !== undefined) {
            paramCount++;
            updates.push(`is_active = $${paramCount}`);
            params.push(isActive);
        }

        if (isAdmin !== undefined) {
            paramCount++;
            updates.push(`is_admin = $${paramCount}`);
            params.push(isAdmin);
        }

        if (userType) {
            paramCount++;
            updates.push(`user_type = $${paramCount}`);
            params.push(userType);
        }

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'No updates provided' });
        }

        paramCount++;
        params.push(id);

        const result = await pool.query(
            `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`,
            params
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            message: 'User updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================================
// GET ALL PROPERTIES (Admin view)
// GET /api/admin/properties
// ============================================
router.get('/properties', authenticate, adminOnly, async (req, res) => {
    try {
        const { status, limit = 50, offset = 0 } = req.query;

        let query = `
      SELECT p.*, u.full_name as owner_name, u.email as owner_email,
             vr.risk_score, vr.verdict,
             (SELECT COUNT(*) FROM property_documents WHERE property_id = p.id) as doc_count
      FROM properties p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN verification_reports vr ON p.id = vr.property_id
      WHERE 1=1
    `;
        const params = [];
        let paramCount = 0;

        if (status) {
            paramCount++;
            query += ` AND p.status = $${paramCount}`;
            params.push(status);
        }

        query += ` ORDER BY p.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
        params.push(parseInt(limit), parseInt(offset));

        const result = await pool.query(query, params);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get properties error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================================
// UPDATE PROPERTY STATUS (Admin)
// PUT /api/admin/properties/:id
// ============================================
router.put('/properties/:id', authenticate, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ success: false, message: 'Status is required' });
        }

        const result = await pool.query(
            `UPDATE properties SET status = $1 WHERE id = $2 RETURNING *`,
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        res.json({
            success: true,
            message: 'Property status updated',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update property error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================================
// GET ALL QUERIES (Admin view)
// GET /api/admin/queries
// ============================================
router.get('/queries', authenticate, adminOnly, async (req, res) => {
    try {
        const { status, limit = 50, offset = 0 } = req.query;

        let query = `
      SELECT lq.*, u.full_name as user_name, u.email as user_email,
             lr.answer, lr.responded_at, a.name as advocate_name
      FROM legal_queries lq
      JOIN users u ON lq.user_id = u.id
      LEFT JOIN legal_responses lr ON lq.id = lr.query_id
      LEFT JOIN advocates a ON lr.advocate_id = a.id
      WHERE 1=1
    `;
        const params = [];
        let paramCount = 0;

        if (status) {
            paramCount++;
            query += ` AND lq.status = $${paramCount}`;
            params.push(status);
        }

        query += ` ORDER BY lq.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
        params.push(parseInt(limit), parseInt(offset));

        const result = await pool.query(query, params);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get queries error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================================
// GET ALL ADVOCATES
// GET /api/admin/advocates
// ============================================
router.get('/advocates', authenticate, adminOnly, async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT a.*, 
             (SELECT COUNT(*) FROM legal_responses WHERE advocate_id = a.id) as response_count
      FROM advocates a
      ORDER BY a.created_at DESC
    `);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get advocates error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================================
// VERIFY/UNVERIFY ADVOCATE
// PUT /api/admin/advocates/:id
// ============================================
router.put('/advocates/:id', authenticate, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const { verified } = req.body;

        const result = await pool.query(
            `UPDATE advocates SET verified = $1 WHERE id = $2 RETURNING *`,
            [verified, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Advocate not found' });
        }

        res.json({
            success: true,
            message: `Advocate ${verified ? 'verified' : 'unverified'} successfully`,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update advocate error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;
