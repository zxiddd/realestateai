import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pool from './database.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'bhoomiai-secret';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const propertyDir = path.join(uploadsDir, req.params.propertyId || 'temp');
        if (!fs.existsSync(propertyDir)) {
            fs.mkdirSync(propertyDir, { recursive: true });
        }
        cb(null, propertyDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF and images are allowed.'));
        }
    }
});

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
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

// ============================================
// CREATE PROPERTY
// POST /api/properties
// ============================================
router.post('/', authenticate, async (req, res) => {
    try {
        const { surveyNo, village, mandal, district, landType, ownerName } = req.body;

        // Validation
        if (!surveyNo || !village || !mandal || !district || !landType) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required: surveyNo, village, mandal, district, landType'
            });
        }

        const result = await pool.query(
            `INSERT INTO properties (user_id, survey_no, village, mandal, district, land_type, owner_name, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
       RETURNING *`,
            [req.userId, surveyNo, village, mandal, district, landType, ownerName || 'Owner']
        );

        res.status(201).json({
            success: true,
            message: 'Property created successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Create property error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================================
// GET USER'S PROPERTIES
// GET /api/properties
// ============================================
router.get('/', authenticate, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.*, 
              vr.risk_score, vr.verdict, vr.summary as verification_summary,
              (SELECT COUNT(*) FROM property_documents WHERE property_id = p.id) as document_count
       FROM properties p
       LEFT JOIN verification_reports vr ON p.id = vr.property_id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
            [req.userId]
        );

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
// GET SINGLE PROPERTY
// GET /api/properties/:id
// ============================================
router.get('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        const propertyResult = await pool.query(
            `SELECT p.*, vr.risk_score, vr.verdict, vr.summary as verification_summary, vr.generated_at as verified_at
       FROM properties p
       LEFT JOIN verification_reports vr ON p.id = vr.property_id
       WHERE p.id = $1 AND p.user_id = $2`,
            [id, req.userId]
        );

        if (propertyResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        // Get documents
        const documentsResult = await pool.query(
            `SELECT * FROM property_documents WHERE property_id = $1`,
            [id]
        );

        res.json({
            success: true,
            data: {
                ...propertyResult.rows[0],
                documents: documentsResult.rows
            }
        });
    } catch (error) {
        console.error('Get property error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================================
// UPLOAD DOCUMENTS
// POST /api/properties/:id/documents
// ============================================
router.post('/:id/documents', authenticate, upload.single('document'), async (req, res) => {
    try {
        const { id } = req.params;
        const { documentType } = req.body;

        // Verify property ownership
        const propertyCheck = await pool.query(
            'SELECT id FROM properties WHERE id = $1 AND user_id = $2',
            [id, req.userId]
        );

        if (propertyCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const fileUrl = `/uploads/${id}/${req.file.filename}`;

        const result = await pool.query(
            `INSERT INTO property_documents (property_id, document_type, file_url, verification_status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING *`,
            [id, documentType, fileUrl]
        );

        res.status(201).json({
            success: true,
            message: 'Document uploaded successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Upload document error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================================
// TRIGGER VERIFICATION (Mock AI)
// POST /api/properties/:id/verify
// ============================================
router.post('/:id/verify', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Verifying property:', id);

        // Verify property ownership
        const propertyCheck = await pool.query(
            'SELECT * FROM properties WHERE id = $1 AND user_id = $2',
            [id, req.userId]
        );

        if (propertyCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        // Update property status to processing
        await pool.query(
            `UPDATE properties SET status = 'processing' WHERE id = $1`,
            [id]
        );

        // Simulate AI verification (in production, this would call an AI service)
        const riskScores = [15, 25, 35, 55, 75];
        const riskScore = riskScores[Math.floor(Math.random() * riskScores.length)];

        let verdict, riskLevel;
        if (riskScore <= 30) {
            verdict = 'low_risk';
            riskLevel = 'low';
        } else if (riskScore <= 60) {
            verdict = 'medium_risk';
            riskLevel = 'medium';
        } else {
            verdict = 'high_risk';
            riskLevel = 'high';
        }

        const summaries = {
            low_risk: 'Property documents verified successfully. No significant issues found. Clear title and proper documentation.',
            medium_risk: 'Property documents verified with some observations. Minor discrepancies found that may need clarification.',
            high_risk: 'Property documents require attention. Significant issues found that need resolution before proceeding.'
        };

        // Update property with risk info directly (skip verification_reports table if it causes issues)
        await pool.query(
            `UPDATE properties SET status = 'verified', risk_score = $2, risk_level = $3, verified_at = NOW() WHERE id = $1`,
            [id, riskScore, riskLevel]
        );

        // Try to create verification report, but don't fail if table doesn't exist
        try {
            await pool.query(
                `INSERT INTO verification_reports (property_id, risk_score, verdict, summary)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (property_id) DO UPDATE SET risk_score = $2, verdict = $3, summary = $4`,
                [id, riskScore, verdict, summaries[verdict]]
            );
        } catch (reportError) {
            console.log('Verification report insert skipped:', reportError.message);
        }

        console.log('Verification completed for property:', id, 'Risk:', riskLevel);

        res.json({
            success: true,
            message: 'Verification completed',
            data: {
                property_id: id,
                riskLevel,
                riskScore,
                verdict,
                summary: summaries[verdict]
            }
        });
    } catch (error) {
        console.error('Verify property error:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

// ============================================
// DELETE PROPERTY
// DELETE /api/properties/:id
// ============================================
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM properties WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        // Clean up uploaded files
        const propertyDir = path.join(uploadsDir, id);
        if (fs.existsSync(propertyDir)) {
            fs.rmSync(propertyDir, { recursive: true });
        }

        res.json({
            success: true,
            message: 'Property deleted successfully'
        });
    } catch (error) {
        console.error('Delete property error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;
