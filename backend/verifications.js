import express from 'express';
import multer from 'multer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Load pdf-parse - it exports differently in different environments
let pdfParse = null;
try {
    const pdfModule = require('pdf-parse');
    // Handle both default export and module itself
    pdfParse = pdfModule.default || pdfModule;
    console.log('✅ pdf-parse loaded successfully');
} catch (err) {
    console.error('⚠️ pdf-parse failed to load:', err.message);
}

import pool from './database.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'bhoomiai-secret';

// Test endpoint
router.get('/test', (req, res) => {
    res.json({ success: true, message: 'Verifications API is working!', pdfParseLoaded: !!pdfParse });
});

// Multer config - store in memory, don't save files
const upload = multer({
    storage: multer.memoryStorage(),
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

// Parse extracted text to find property details
const parsePropertyDetails = (text, docType) => {
    const fullText = text.toLowerCase();
    const extracted = {};
    const confidence = {};

    // Survey Number
    const surveyMatch = text.match(/(?:survey|sy|s\.?\s*no|సర్వే)[:\s.№]*([0-9]+[\/\-]?[0-9A-Za-z]*)/i);
    if (surveyMatch) {
        extracted.survey_number = surveyMatch[1];
        confidence.survey_number = 0.9;
    }

    // Village
    const villageMatch = text.match(/(?:village|grama|గ్రామం)[:\s]*([A-Za-z\s]+?)(?:\s|,|$)/i);
    if (villageMatch) {
        extracted.village = villageMatch[1].trim();
        confidence.village = 0.85;
    }

    // Mandal
    const mandalMatch = text.match(/(?:mandal|taluk|మండలం)[:\s]*([A-Za-z\s]+?)(?:\s|,|$)/i);
    if (mandalMatch) {
        extracted.mandal = mandalMatch[1].trim();
        confidence.mandal = 0.85;
    }

    // District
    const districtMatch = text.match(/(?:district|jilla|జిల్లా)[:\s]*([A-Za-z\s]+?)(?:\s|,|$)/i);
    if (districtMatch) {
        extracted.district = districtMatch[1].trim();
        confidence.district = 0.85;
    }
    // Common districts fallback
    const districts = ['hyderabad', 'rangareddy', 'medchal', 'sangareddy', 'warangal', 'karimnagar', 'nizamabad'];
    for (const d of districts) {
        if (fullText.includes(d)) {
            extracted.district = extracted.district || d.charAt(0).toUpperCase() + d.slice(1);
            confidence.district = confidence.district || 0.7;
            break;
        }
    }

    // Land Extent
    const extentMatch = text.match(/(\d+[\.\d]*)\s*(?:acres?|ac|ఎకరాలు)[,\s]*(\d+)?\s*(?:guntas?|గుంటలు)?/i);
    if (extentMatch) {
        extracted.extent_acres = parseFloat(extentMatch[1]);
        extracted.extent_guntas = extentMatch[2] ? parseInt(extentMatch[2]) : 0;
        confidence.extent = 0.9;
    }

    // Owner Name
    const nameMatch = text.match(/(?:name|owner|pattadar|పట్టాదారు)[:\s]*([A-Za-z\s\.]{3,40})/i);
    if (nameMatch) {
        extracted.owner_name = nameMatch[1].trim();
        confidence.owner_name = 0.8;
    }

    // Father's Name
    const fatherMatch = text.match(/(?:s\/o|son\s*of|d\/o|w\/o|father)[:\s]*([A-Za-z\s\.]{3,40})/i);
    if (fatherMatch) {
        extracted.father_name = fatherMatch[1].trim();
        confidence.father_name = 0.75;
    }

    // Land Type
    if (fullText.includes('agricultural') || fullText.includes('patta') || fullText.includes('వ్యవసాయ')) {
        extracted.land_classification = 'Agricultural';
        confidence.land_classification = 0.85;
    } else if (fullText.includes('residential') || fullText.includes('housing')) {
        extracted.land_classification = 'Residential';
        confidence.land_classification = 0.85;
    } else if (fullText.includes('commercial')) {
        extracted.land_classification = 'Commercial';
        confidence.land_classification = 0.85;
    }

    // Encumbrance detection (for EC documents)
    if (docType === 'encumbrance_certificate') {
        extracted.has_encumbrance = fullText.includes('mortgage') || fullText.includes('loan') || fullText.includes('hypothecation');
        extracted.encumbrance_details = [];
        if (extracted.has_encumbrance) {
            const loanMatch = text.match(/(?:mortgage|loan|hypothecation)[:\s]*([^.]+)/gi);
            if (loanMatch) {
                extracted.encumbrance_details = loanMatch.slice(0, 3);
            }
        }
        confidence.encumbrance = 0.7;
    }

    return { extracted, confidence };
};

// Simulate AI Agent Verification
const runAgentVerification = (extractedData, confidenceScores) => {
    const agents = {};
    const flags = [];
    let riskScore = 0;

    // Ownership Agent
    if (extractedData.owner_name) {
        agents.ownership_agent = {
            status: 'passed',
            notes: `Owner "${extractedData.owner_name}" identified from documents`
        };
    } else {
        agents.ownership_agent = {
            status: 'failed',
            notes: 'Could not extract owner name from documents'
        };
        flags.push('OWNER_NOT_IDENTIFIED');
        riskScore += 30;
    }

    // Land Details Agent
    if (extractedData.survey_number && extractedData.village) {
        agents.land_details_agent = {
            status: 'passed',
            notes: `Survey ${extractedData.survey_number} in ${extractedData.village} verified`
        };
    } else {
        agents.land_details_agent = {
            status: 'warning',
            notes: 'Incomplete land details - manual verification recommended'
        };
        flags.push('INCOMPLETE_LAND_DETAILS');
        riskScore += 20;
    }

    // Encumbrance Agent
    if (extractedData.has_encumbrance === false) {
        agents.encumbrance_agent = {
            status: 'passed',
            notes: 'No encumbrances or mortgages found'
        };
    } else if (extractedData.has_encumbrance === true) {
        agents.encumbrance_agent = {
            status: 'failed',
            notes: 'Active encumbrances detected - legal review required'
        };
        flags.push('ENCUMBRANCE_DETECTED');
        riskScore += 40;
    } else {
        agents.encumbrance_agent = {
            status: 'warning',
            notes: 'EC verification pending'
        };
        riskScore += 10;
    }

    // Confidence Agent
    const lowConfidenceFields = Object.entries(confidenceScores).filter(([k, v]) => v < 0.7);
    if (lowConfidenceFields.length > 0) {
        agents.confidence_agent = {
            status: 'warning',
            notes: `Low confidence in: ${lowConfidenceFields.map(([k]) => k).join(', ')}`
        };
        flags.push('LOW_CONFIDENCE_FIELDS');
        riskScore += 10;
    } else {
        agents.confidence_agent = {
            status: 'passed',
            notes: 'All extracted fields have high confidence'
        };
    }

    // Calculate risk level
    let riskLevel = 'LOW';
    let recommendation = 'SAFE_TO_PROCEED';
    if (riskScore >= 50) {
        riskLevel = 'HIGH';
        recommendation = 'LEGAL_REVIEW_REQUIRED';
    } else if (riskScore >= 25) {
        riskLevel = 'MEDIUM';
        recommendation = 'PROCEED_WITH_CAUTION';
    }

    return {
        agent_results: agents,
        flags,
        final_summary: {
            risk_score: riskScore,
            risk_level: riskLevel,
            recommendation,
            summary: riskLevel === 'LOW'
                ? 'No significant issues found. Property appears safe for transaction.'
                : riskLevel === 'MEDIUM'
                    ? 'Some concerns identified. Recommend additional verification.'
                    : 'Critical issues detected. Legal consultation strongly recommended.'
        }
    };
};

// ===========================================
// CREATE VERIFICATION (Upload PDFs)
// ===========================================
router.post('/', authenticate, upload.array('documents', 5), async (req, res) => {
    try {
        const { documentTypes } = req.body; // JSON string of doc types
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ success: false, message: 'No PDF files uploaded' });
        }

        const docTypes = documentTypes ? JSON.parse(documentTypes) : [];
        const ocrRawText = {};
        const allExtracted = {};
        const allConfidence = {};

        // Process each PDF
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const docType = docTypes[i] || `document_${i + 1}`;

            try {
                // Extract text from PDF
                const data = await pdfParse(file.buffer);
                const text = data.text;

                if (!text || text.trim().length < 50) {
                    ocrRawText[docType] = 'EXTRACTION_FAILED: PDF may be scanned image without OCR layer';
                    continue;
                }

                ocrRawText[docType] = text;

                // Parse property details
                const { extracted, confidence } = parsePropertyDetails(text, docType);
                Object.assign(allExtracted, extracted);
                Object.assign(allConfidence, confidence);
            } catch (err) {
                console.error(`Error parsing PDF ${i}:`, err.message);
                ocrRawText[docType] = `EXTRACTION_ERROR: ${err.message}`;
            }
        }

        // Check if we got any useful data
        const hasData = Object.keys(allExtracted).length > 0;
        if (!hasData) {
            return res.status(400).json({
                success: false,
                message: 'Could not extract data from uploaded PDFs. Please upload clear, text-based PDFs (not scanned images).',
                hint: 'For scanned documents, please upload searchable PDFs or use our image upload feature.'
            });
        }

        // Run AI agent verification
        const agentResults = runAgentVerification(allExtracted, allConfidence);

        // Build verification JSON
        const verificationData = {
            metadata: {
                documents_processed: Object.keys(ocrRawText),
                processed_at: new Date().toISOString()
            },
            ocr_raw_text: ocrRawText,
            extracted_data: {
                owner_details: {
                    owner_name: allExtracted.owner_name || null,
                    father_name: allExtracted.father_name || null
                },
                land_details: {
                    survey_number: allExtracted.survey_number || null,
                    village: allExtracted.village || null,
                    mandal: allExtracted.mandal || null,
                    district: allExtracted.district || null,
                    state: 'Telangana',
                    extent: {
                        acres: allExtracted.extent_acres || null,
                        guntas: allExtracted.extent_guntas || null
                    },
                    classification: allExtracted.land_classification || null
                },
                encumbrances: {
                    has_loan: allExtracted.has_encumbrance || false,
                    details: allExtracted.encumbrance_details || []
                }
            },
            confidence_scores: allConfidence,
            ...agentResults
        };

        // Save to database
        const result = await pool.query(
            `INSERT INTO property_verifications (user_id, status, verification_data)
             VALUES ($1, $2, $3)
             RETURNING id, status, created_at`,
            [req.userId, 'completed', JSON.stringify(verificationData)]
        );

        res.status(201).json({
            success: true,
            message: 'Verification completed',
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
// UPDATE VERIFICATION (Manual corrections)
// ===========================================
router.patch('/:id', authenticate, async (req, res) => {
    try {
        const { corrections } = req.body;

        const existing = await pool.query(
            `SELECT verification_data FROM property_verifications WHERE id = $1 AND user_id = $2`,
            [req.params.id, req.userId]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Verification not found' });
        }

        const currentData = existing.rows[0].verification_data;
        const updatedData = {
            ...currentData,
            extracted_data: {
                ...currentData.extracted_data,
                ...corrections
            },
            metadata: {
                ...currentData.metadata,
                manually_corrected: true,
                corrected_at: new Date().toISOString()
            }
        };

        // Re-run agent verification with corrected data
        const flatExtracted = {
            ...currentData.extracted_data.owner_details,
            ...currentData.extracted_data.land_details,
            ...currentData.extracted_data.encumbrances,
            ...corrections
        };
        const agentResults = runAgentVerification(flatExtracted, currentData.confidence_scores || {});
        Object.assign(updatedData, agentResults);

        await pool.query(
            `UPDATE property_verifications SET verification_data = $1, status = 'completed' WHERE id = $2`,
            [JSON.stringify(updatedData), req.params.id]
        );

        res.json({ success: true, message: 'Verification updated', data: updatedData });
    } catch (error) {
        console.error('Update verification error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;
