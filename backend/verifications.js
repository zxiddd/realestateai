import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pool from './database.js';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'bhoomiai-secret';

// Create uploads directory
const uploadsDir = path.join(__dirname, '..', 'uploads', 'documents');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer config - store files on disk
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

// Auth middleware
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'No token' });
    }
    try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

// Generate mock verification report
const generateMockReport = (documents, formData) => {
    const riskScore = Math.floor(Math.random() * 30) + 10; // 10-40 score
    const riskLevel = riskScore < 25 ? 'LOW' : riskScore < 45 ? 'MEDIUM' : 'HIGH';

    return {
        metadata: {
            documents_uploaded: documents.map(d => ({
                type: d.documentType,
                filename: d.filename,
                url: d.url
            })),
            submitted_at: new Date().toISOString()
        },
        property_details: {
            survey_number: formData.surveyNumber || 'Pending extraction',
            village: formData.village || 'Pending extraction',
            mandal: formData.mandal || 'Pending extraction',
            district: formData.district || 'Pending extraction',
            owner_name: formData.ownerName || 'Pending extraction',
            land_type: formData.landType || 'Agricultural'
        },
        agent_results: {
            document_agent: {
                status: 'passed',
                notes: `${documents.length} documents uploaded successfully`
            },
            ownership_agent: {
                status: 'pending',
                notes: 'Ownership verification in progress'
            },
            encumbrance_agent: {
                status: 'pending',
                notes: 'Encumbrance check in progress'
            }
        },
        final_summary: {
            risk_score: riskScore,
            risk_level: riskLevel,
            recommendation: riskLevel === 'LOW' ? 'SAFE_TO_PROCEED' : 'NEEDS_REVIEW',
            summary: 'Initial document submission complete. Full verification will be processed within 24-48 hours.'
        }
    };
};

// ===========================================
// CREATE VERIFICATION (Upload PDFs)
// ===========================================
router.post('/', authenticate, upload.array('documents', 5), async (req, res) => {
    try {
        const { documentTypes, surveyNumber, village, mandal, district, ownerName, landType } = req.body;
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ success: false, message: 'No PDF files uploaded' });
        }

        const docTypes = documentTypes ? JSON.parse(documentTypes) : [];

        // Build document list with URLs
        const documents = files.map((file, i) => ({
            documentType: docTypes[i] || `document_${i + 1}`,
            filename: file.filename,
            originalName: file.originalname,
            size: file.size,
            url: `/uploads/documents/${file.filename}`
        }));

        // Generate mock report
        const verificationData = generateMockReport(documents, {
            surveyNumber, village, mandal, district, ownerName, landType
        });

        // Save to database
        const result = await pool.query(
            `INSERT INTO property_verifications (user_id, status, verification_data)
             VALUES ($1, $2, $3)
             RETURNING id, status, created_at`,
            [req.userId, 'completed', JSON.stringify(verificationData)]
        );

        res.status(201).json({
            success: true,
            message: 'Documents uploaded and verification initiated',
            data: {
                id: result.rows[0].id,
                status: result.rows[0].status,
                created_at: result.rows[0].created_at,
                verification_data: verificationData
            }
        });

    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

// ===========================================
// GET USER'S VERIFICATIONS
// ===========================================
router.get('/', authenticate, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, status, verification_data, created_at, updated_at
             FROM property_verifications
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [req.userId]
        );

        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Get verifications error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ===========================================
// GET SINGLE VERIFICATION
// ===========================================
router.get('/:id', authenticate, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM property_verifications WHERE id = $1 AND user_id = $2`,
            [req.params.id, req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Verification not found' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Get verification error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ===========================================
// LIST PROPERTY ON MARKETPLACE
// ===========================================
router.post('/:id/list', authenticate, async (req, res) => {
    try {
        const { price, area, description } = req.body;
        const verificationId = req.params.id;

        // Get verification
        const verification = await pool.query(
            `SELECT * FROM property_verifications WHERE id = $1 AND user_id = $2`,
            [verificationId, req.userId]
        );

        if (verification.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Verification not found' });
        }

        const vData = verification.rows[0].verification_data;
        const propertyDetails = vData.property_details || {};

        // Create property entry
        const property = await pool.query(
            `INSERT INTO properties (user_id, survey_no, village, mandal, district, owner_name, land_type, status, risk_score, risk_level, verification_summary)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'verified', $8, $9, $10)
             RETURNING id`,
            [
                req.userId,
                propertyDetails.survey_number || 'N/A',
                propertyDetails.village || 'N/A',
                propertyDetails.mandal || 'N/A',
                propertyDetails.district || 'N/A',
                propertyDetails.owner_name || 'N/A',
                propertyDetails.land_type || 'agricultural',
                vData.final_summary?.risk_score || 20,
                vData.final_summary?.risk_level?.toLowerCase() || 'low',
                JSON.stringify({
                    documents: vData.metadata?.documents_uploaded || [],
                    verification_id: verificationId
                })
            ]
        );

        // Create marketplace listing
        await pool.query(
            `INSERT INTO marketplace_listings (property_id, user_id, price, area, description)
             VALUES ($1, $2, $3, $4, $5)`,
            [property.rows[0].id, req.userId, price, area, description]
        );

        res.status(201).json({
            success: true,
            message: 'Property listed on marketplace',
            data: { propertyId: property.rows[0].id }
        });

    } catch (error) {
        console.error('List property error:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

export default router;
