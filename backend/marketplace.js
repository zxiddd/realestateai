import express from 'express';
import pool from './database.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'bhoomiai-secret';

// Authentication middleware (optional for public browsing)
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.userId = decoded.userId;
        } catch (error) {
            // Token invalid, but continue without auth
        }
    }
    next();
};

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

// ============================================
// GET ALL MARKETPLACE LISTINGS
// GET /api/marketplace
// ============================================
router.get('/', optionalAuth, async (req, res) => {
    try {
        const {
            search,
            propertyType,
            minPrice,
            maxPrice,
            district,
            limit = 20,
            offset = 0
        } = req.query;

        let query = `
      SELECT 
        ml.id as listing_id,
        ml.price,
        ml.area,
        ml.status as listing_status,
        ml.listed_at,
        p.id as property_id,
        p.survey_no,
        p.village,
        p.mandal,
        p.district,
        p.land_type,
        u.full_name as owner_name,
        vr.risk_score,
        vr.verdict
      FROM marketplace_listings ml
      JOIN properties p ON ml.property_id = p.id
      JOIN users u ON p.user_id = u.id
      LEFT JOIN verification_reports vr ON p.id = vr.property_id
      WHERE ml.status = 'active'
    `;

        const params = [];
        let paramCount = 0;

        // Search filter
        if (search) {
            paramCount++;
            query += ` AND (
        p.village ILIKE $${paramCount} OR 
        p.mandal ILIKE $${paramCount} OR 
        p.district ILIKE $${paramCount} OR
        p.survey_no ILIKE $${paramCount}
      )`;
            params.push(`%${search}%`);
        }

        // Property type filter
        if (propertyType) {
            paramCount++;
            query += ` AND p.land_type = $${paramCount}`;
            params.push(propertyType);
        }

        // Price filters
        if (minPrice) {
            paramCount++;
            query += ` AND ml.price >= $${paramCount}`;
            params.push(parseInt(minPrice));
        }

        if (maxPrice) {
            paramCount++;
            query += ` AND ml.price <= $${paramCount}`;
            params.push(parseInt(maxPrice));
        }

        // District filter
        if (district) {
            paramCount++;
            query += ` AND p.district ILIKE $${paramCount}`;
            params.push(`%${district}%`);
        }

        // Order and pagination
        query += ` ORDER BY ml.listed_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
        params.push(parseInt(limit), parseInt(offset));

        const result = await pool.query(query, params);

        // Get total count for pagination
        let countQuery = `
      SELECT COUNT(*) 
      FROM marketplace_listings ml
      JOIN properties p ON ml.property_id = p.id
      WHERE ml.status = 'active'
    `;

        const countParams = [];
        if (search) {
            countQuery += ` AND (p.village ILIKE $1 OR p.mandal ILIKE $1 OR p.district ILIKE $1)`;
            countParams.push(`%${search}%`);
        }

        const countResult = await pool.query(countQuery, countParams);

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                total: parseInt(countResult.rows[0].count),
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
    } catch (error) {
        console.error('Get marketplace listings error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================================
// GET SINGLE LISTING
// GET /api/marketplace/:id
// ============================================
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
      SELECT 
        ml.*,
        p.survey_no,
        p.village,
        p.mandal,
        p.district,
        p.land_type,
        p.status as property_status,
        u.full_name as owner_name,
        u.email as owner_email,
        u.phone as owner_phone,
        vr.risk_score,
        vr.verdict,
        vr.summary as verification_summary
      FROM marketplace_listings ml
      JOIN properties p ON ml.property_id = p.id
      JOIN users u ON p.user_id = u.id
      LEFT JOIN verification_reports vr ON p.id = vr.property_id
      WHERE ml.id = $1
    `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        // Get property documents
        const docsResult = await pool.query(
            'SELECT document_type, verification_status FROM property_documents WHERE property_id = $1',
            [result.rows[0].property_id]
        );

        res.json({
            success: true,
            data: {
                ...result.rows[0],
                documents: docsResult.rows
            }
        });
    } catch (error) {
        console.error('Get listing error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================================
// LIST PROPERTY ON MARKETPLACE
// POST /api/properties/:propertyId/list
// ============================================
router.post('/list/:propertyId', authenticate, async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { price, area } = req.body;

        if (!price || !area) {
            return res.status(400).json({
                success: false,
                message: 'Price and area are required'
            });
        }

        // Verify property ownership and verification status
        const propertyCheck = await pool.query(
            `SELECT p.*, vr.verdict 
       FROM properties p 
       LEFT JOIN verification_reports vr ON p.id = vr.property_id
       WHERE p.id = $1 AND p.user_id = $2`,
            [propertyId, req.userId]
        );

        if (propertyCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        const property = propertyCheck.rows[0];

        if (property.status !== 'verified') {
            return res.status(400).json({
                success: false,
                message: 'Property must be verified before listing on marketplace'
            });
        }

        // Check if already listed
        const existingListing = await pool.query(
            'SELECT id FROM marketplace_listings WHERE property_id = $1 AND status = $2',
            [propertyId, 'active']
        );

        if (existingListing.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Property is already listed on marketplace'
            });
        }

        // Create listing
        const result = await pool.query(
            `INSERT INTO marketplace_listings (property_id, price, area, status)
       VALUES ($1, $2, $3, 'active')
       RETURNING *`,
            [propertyId, price, area]
        );

        // Update property status
        await pool.query(
            `UPDATE properties SET status = 'listed' WHERE id = $1`,
            [propertyId]
        );

        res.status(201).json({
            success: true,
            message: 'Property listed on marketplace successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('List property error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================================
// WITHDRAW LISTING
// DELETE /api/marketplace/:id
// ============================================
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        // Verify ownership through property
        const listingCheck = await pool.query(`
      SELECT ml.*, p.user_id 
      FROM marketplace_listings ml
      JOIN properties p ON ml.property_id = p.id
      WHERE ml.id = $1
    `, [id]);

        if (listingCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        if (listingCheck.rows[0].user_id !== req.userId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Update listing status
        await pool.query(
            `UPDATE marketplace_listings SET status = 'withdrawn' WHERE id = $1`,
            [id]
        );

        // Update property status back to verified
        await pool.query(
            `UPDATE properties SET status = 'verified' WHERE id = $1`,
            [listingCheck.rows[0].property_id]
        );

        res.json({
            success: true,
            message: 'Listing withdrawn successfully'
        });
    } catch (error) {
        console.error('Withdraw listing error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;
