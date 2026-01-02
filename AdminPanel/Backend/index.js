const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Security Guardrails Helper
function validateInput(text) {
  if (!text) return { isValid: false, error: 'Input is empty' };

  // 1. Length Limit (e.g., 3000 chars)
  if (text.length > 3000) {
    return { isValid: false, error: 'Input exceeds maximum length of 3000 characters.' };
  }

  // 2. Jailbreak / Injection Keywords
  const forbiddenPatterns = [
    /ignore previous instructions/i,
    /system override/i,
    /dan mode/i,
    /reset system/i,
    /reveal system prompt/i
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(text)) {
      console.warn(`[SECURITY] Blocked input containing forbidden pattern: ${pattern}`);
      return { isValid: false, error: 'Input contains forbidden keywords.' };
    }
  }

  return { isValid: true };
}

// Get recent activity from all bills
app.get('/api/recent-activity', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const query = `
      SELECT 'bill_1' as bill, comments_id as id, commenter_name, comment_data, sentiment, stakeholder_type, created_at 
      FROM bill_1_comments
      UNION ALL
      SELECT 'bill_2' as bill, comments_id, commenter_name, comment_data, sentiment, stakeholder_type, created_at 
      FROM bill_2_comments
      UNION ALL
      SELECT 'bill_3' as bill, comments_id, commenter_name, comment_data, sentiment, stakeholder_type, created_at 
      FROM bill_3_comments
      ORDER BY created_at DESC
      LIMIT $1
    `;

    const result = await pool.query(query, [limit]);
    res.json({ ok: true, data: result.rows });
  } catch (err) {
    console.error('Error fetching recent activity:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get comments for specific bill
app.get('/api/comments/:bill', async (req, res) => {
  try {
    const { bill } = req.params;
    const limit = parseInt(req.query.limit) || 1000; // Increased default limit to fetch all comments

    if (!['bill_1', 'bill_2', 'bill_3'].includes(bill)) {
      return res.status(400).json({ ok: false, error: 'Invalid bill name' });
    }

    const result = await pool.query(
      `SELECT * FROM ${bill}_comments ORDER BY created_at DESC LIMIT $1`,
      [limit]
    );

    res.json({ ok: true, data: result.rows });
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Add new comment
app.post('/api/comments/:bill', async (req, res) => {
  try {
    const { bill } = req.params;
    const { commenter_name, comment_data, stakeholder_type } = req.body;

    if (!['bill_1', 'bill_2', 'bill_3'].includes(bill)) {
      return res.status(400).json({ ok: false, error: 'Invalid bill name' });
    }

    if (!commenter_name || !comment_data) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }

    // Security Validation
    const validation = validateInput(comment_data);
    if (!validation.isValid) {
      return res.status(400).json({ ok: false, error: validation.error });
    }

    // Map bill to document_id
    const billMap = { 'bill_1': 1, 'bill_2': 2, 'bill_3': 3 };
    const documentId = billMap[bill];

    // Default values
    let sentiment = 'Neutral';
    let confidenceScore = 4.2; // Hardcoded default based on requirements
    let summary = null;

    // Call FastAPI for Sentiment
    try {
      const sentimentResponse = await fetch('http://192.168.1.16:8364/predict_sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: comment_data })
      });

      if (sentimentResponse.ok) {
        const data = await sentimentResponse.json();
        // Response format: { predicted_sentiment: "POSITIVE", ... }
        if (data.predicted_sentiment) {
          // Convert POSITIVE -> Positive (Title Case)
          const s = data.predicted_sentiment;
          const candidate = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

          // Output Validation: Ensure valid sentiment
          if (['Positive', 'Negative', 'Neutral'].includes(candidate)) {
            sentiment = candidate;
          } else {
            console.warn(`[SECURITY] Invalid sentiment received from model: ${candidate}. Defaulting to Neutral.`);
            sentiment = 'Neutral';
          }
        }
      } else {
        const errorText = await sentimentResponse.text();
        console.warn('Sentiment API returned non-OK status:', sentimentResponse.status, errorText);
      }
    } catch (e) {
      console.error('Failed to fetch sentiment:', e.message);
    }

    // Call FastAPI for Summary
    try {
      const summaryResponse = await fetch('http://192.168.1.16:8364/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comments: [comment_data] }) // Sending as list assuming plural
      });

      if (summaryResponse.ok) {
        const data = await summaryResponse.json();
        // Response format: { summaries: ["..."] }
        if (data.summaries && data.summaries.length > 0) {
          summary = data.summaries[0];
        }
      } else {
        const errorText = await summaryResponse.text();
        console.warn('Summary API returned non-OK status:', summaryResponse.status, errorText);
      }
    } catch (e) {
      console.error('Failed to fetch summary:', e.message);
    }

    const result = await pool.query(
      `INSERT INTO ${bill}_comments 
       (commenter_name, comment_data, sentiment, stakeholder_type, document_id, confidence_score, summary) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [commenter_name, comment_data, sentiment, stakeholder_type || 'Individual', documentId, confidenceScore, summary]
    );

    res.status(201).json({ ok: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error creating comment:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Unified User Panel Submission Endpoint
app.post('/api/submit-comment', async (req, res) => {
  try {
    const {
      documentId,
      section,
      commentData,
      sentiment: userSentiment, // User might send null
      summary: userSummary,     // User might send null
      commenterName,
      commenterEmail,
      commenterPhone,
      commenterAddress,
      idType,
      idNumber,
      stakeholderType,
      supportedDocFilename,
      supportedDocData
    } = req.body;

    if (!documentId || !commentData) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Security Validation
    const validation = validateInput(commentData);
    if (!validation.isValid) {
      return res.status(400).json({ success: false, message: validation.error });
    }

    // Dynamic Table Selection
    const tableMap = { 1: 'bill_1_comments', 2: 'bill_2_comments', 3: 'bill_3_comments' };
    const tableName = tableMap[documentId];
    if (!tableName) {
      return res.status(400).json({ success: false, message: 'Invalid Document ID' });
    }

    // AI Enrichment
    let sentiment = userSentiment || 'Neutral';
    let summary = userSummary || null;
    let confidenceScore = 4.2;

    try {
      // Sentiment
      const sentimentResponse = await fetch('http://192.168.1.16:8364/predict_sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: commentData })
      });
      if (sentimentResponse.ok) {
        const data = await sentimentResponse.json();
        if (data.predicted_sentiment) {
          const s = data.predicted_sentiment;
          const candidate = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
          // Output Validation
          if (['Positive', 'Negative', 'Neutral'].includes(candidate)) {
            sentiment = candidate;
          } else {
            console.warn(`[SECURITY] Invalid sentiment received from model: ${candidate}. Defaulting to Neutral.`);
            sentiment = 'Neutral';
          }
        }
      }

      // Summary
      const summaryResponse = await fetch('http://192.168.1.16:8364/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comments: [commentData] })
      });
      if (summaryResponse.ok) {
        const data = await summaryResponse.json();
        if (data.summaries && data.summaries.length > 0) {
          summary = data.summaries[0];
        }
      }
    } catch (e) {
      console.error('AI Enrichment Failed:', e.message);
      // Proceed without AI if it fails, fallback to defaults
    }

    // Insert into DB
    const query = `
      INSERT INTO ${tableName} (
        document_id, section, comment_data, sentiment, summary, confidence_score,
        supported_doc, supported_doc_filename,
        commenter_name, commenter_email, commenter_phone, commenter_address,
        id_type, id_number, stakeholder_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;

    const values = [
      documentId, section || null, commentData, sentiment, summary, confidenceScore,
      supportedDocData || null, supportedDocFilename || null,
      commenterName, commenterEmail, commenterPhone, commenterAddress || null,
      idType, idNumber, stakeholderType
    ];

    const result = await pool.query(query, values);

    res.status(201).json({ success: true, message: 'Comment submitted successfully', data: result.rows[0] });

  } catch (err) {
    console.error('Error submitting comment:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Generate Overview (Dynamic Summary)
app.post('/api/generate-overview/:bill', async (req, res) => {
  try {
    const { bill } = req.params;
    const { type, section } = req.body; // type: 'overall'|'positive'|'negative', section: 'Section 1'|'Section 2'|'Section 3'

    // Map bill to document_id
    const billMap = { 'bill_1': 1, 'bill_2': 2, 'bill_3': 3 };
    const documentId = billMap[bill];
    if (!documentId) return res.status(400).json({ ok: false, error: 'Invalid bill ID' });

    // 1. Fetch relevant comments
    let query = `SELECT comment_data, summary, sentiment, section FROM ${bill}_comments`;
    const queryParams = [];

    // If section is specified, filter by it
    if (section) {
      query += ` WHERE section = $1`;
      queryParams.push(section);
    }

    const result = await pool.query(query, queryParams);
    const rows = result.rows;

    if (rows.length === 0) {
      return res.json({ ok: true, message: 'No comments to summarize.' });
    }

    // 2. Group comments
    const allComments = [];
    const positiveComments = [];
    const negativeComments = [];

    rows.forEach(r => {
      const text = r.summary || r.comment_data;
      if (text) {
        allComments.push(text);
        const s = (r.sentiment || '').toLowerCase();
        if (s === 'positive') positiveComments.push(text);
        if (s === 'negative') negativeComments.push(text);
      }
    });

    // Helper to call Group Summary API
    async function getGroupSummary(commentsArray) {
      if (commentsArray.length === 0) return null;
      try {
        const response = await fetch('http://192.168.1.16:8364/api/summarize_group', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ comments: commentsArray })
        });
        if (response.ok) {
          const data = await response.json();
          return data.final_summary || data.summary || (data.summaries ? data.summaries[0] : null);
        } else {
          console.warn('Group Summary API failed:', response.status);
          return null;
        }
      } catch (e) {
        console.error('Group Summary Error:', e.message);
        return null;
      }
    }

    // 3. Generate Summaries based on type
    // If section IS provided, we update section columns
    // If section IS NOT provided, we update global columns

    let overallSum = null;
    let posSum = null;
    let negSum = null;

    if (!type || type === 'overall') {
      overallSum = await getGroupSummary(allComments);
    }
    if (!type || type === 'positive') {
      posSum = await getGroupSummary(positiveComments);
    }
    if (!type || type === 'negative') {
      negSum = await getGroupSummary(negativeComments);
    }

    // 4. Update Documents Table
    if (section) {
      // Determine column names based on section string 'Section 1', 'Section 2', 'Section 3'
      let overallCol, posCol, negCol;

      if (section === 'Section 1') {
        overallCol = 'section_1_summary';
        posCol = 'section1_positive';
        negCol = 'section1_negative';
      } else if (section === 'Section 2') {
        overallCol = 'section_2_summary';
        posCol = 'section2_positive';
        negCol = 'section2_negative';
      } else if (section === 'Section 3') {
        overallCol = 'section_3_summary';
        posCol = 'section3_positive';
        negCol = 'section3_negative';
      } else {
        return res.status(400).json({ ok: false, error: "Invalid section name" });
      }

      // Construct dynamic update query
      // We only update the columns that correspond to the requested 'type'
      // timestamps update is good practice

      const updates = [];
      const values = [];
      let idx = 1;

      if ((!type || type === 'overall') && overallSum) {
        updates.push(`${overallCol} = $${idx++}`);
        values.push(overallSum);
      }
      if ((!type || type === 'positive') && posSum) {
        updates.push(`${posCol} = $${idx++}`);
        values.push(posSum);
      }
      if ((!type || type === 'negative') && negSum) {
        updates.push(`${negCol} = $${idx++}`);
        values.push(negSum);
      }

      if (updates.length > 0) {
        updates.push(`updated_at = NOW()`);
        values.push(documentId);
        const updateQuery = `UPDATE documents SET ${updates.join(', ')} WHERE document_id = $${idx}`;
        await pool.query(updateQuery, values);
      }

    } else {
      // Global Update (existing logic)
      await pool.query(
        `UPDATE documents 
         SET summary = COALESCE($1, summary), 
             positive_summary = COALESCE($2, positive_summary), 
             negative_summary = COALESCE($3, negative_summary),
             updated_at = NOW()
         WHERE document_id = $4`,
        [overallSum, posSum, negSum, documentId]
      );
    }

    res.json({
      ok: true,
      data: { overall: overallSum, positive: posSum, negative: negSum }
    });

  } catch (err) {
    console.error('Error generating overview:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get sentiment summary for a bill
app.get('/api/sentiment/:bill', async (req, res) => {
  try {
    const { bill } = req.params;

    if (!['bill_1', 'bill_2', 'bill_3'].includes(bill)) {
      return res.status(400).json({ ok: false, error: 'Invalid bill name' });
    }

    const result = await pool.query(
      `SELECT sentiment, COUNT(*) as count FROM ${bill}_comments GROUP BY sentiment ORDER BY count DESC`
    );

    res.json({ ok: true, data: result.rows });
  } catch (err) {
    console.error('Error fetching sentiment:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get sentiment summaries from documents table for a specific bill
app.get('/api/summaries/:bill', async (req, res) => {
  try {
    const { bill } = req.params;

    if (!['bill_1', 'bill_2', 'bill_3'].includes(bill)) {
      return res.status(400).json({ ok: false, error: 'Invalid bill name' });
    }

    // Map bill_1 -> document_id 1, bill_2 -> 2, bill_3 -> 3
    const documentId = parseInt(bill.split('_')[1]);

    // Query the documents table using document_id
    const result = await pool.query(
      `SELECT summary, positive_summary, negative_summary 
       FROM documents 
       WHERE document_id = $1 
       LIMIT 1`,
      [documentId]
    );

    if (result.rows.length === 0) {
      return res.json({
        ok: true,
        data: {
          overall_summary: null,
          positive_summary: null,
          negative_summary: null
        }
      });
    }

    const row = result.rows[0];

    res.json({
      ok: true,
      data: {
        overall_summary: row.summary || null,
        positive_summary: row.positive_summary || null,
        negative_summary: row.negative_summary || null
      }
    });
  } catch (err) {
    console.error('Error fetching summaries:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get section-wise summaries from documents table for a specific bill
app.get('/api/sections/:bill', async (req, res) => {
  try {
    const { bill } = req.params;

    if (!['bill_1', 'bill_2', 'bill_3'].includes(bill)) {
      return res.status(400).json({ ok: false, error: 'Invalid bill name' });
    }

    // Map bill_1 -> document_id 1, bill_2 -> 2, bill_3 -> 3
    const documentId = parseInt(bill.split('_')[1]);

    // Query the documents table for section summaries
    const result = await pool.query(
      `SELECT section_1_summary, section_2_summary, section_3_summary 
       FROM documents 
       WHERE document_id = $1 
       LIMIT 1`,
      [documentId]
    );

    if (result.rows.length === 0) {
      return res.json({
        ok: true,
        data: {
          section_1: null,
          section_2: null,
          section_3: null
        }
      });
    }

    const row = result.rows[0];

    res.json({
      ok: true,
      data: {
        section_1: row.section_1_summary || null,
        section_2: row.section_2_summary || null,
        section_3: row.section_3_summary || null
      }
    });
  } catch (err) {
    console.error('Error fetching section summaries:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get section-wise sentiment summaries (positive/negative) from documents table for a specific bill
app.get('/api/section-sentiments/:bill', async (req, res) => {
  try {
    const { bill } = req.params;

    if (!['bill_1', 'bill_2', 'bill_3'].includes(bill)) {
      return res.status(400).json({ ok: false, error: 'Invalid bill name' });
    }

    // Map bill_1 -> document_id 1, bill_2 -> 2, bill_3 -> 3
    const documentId = parseInt(bill.split('_')[1]);

    // Query the documents table for positive and negative summaries for all sections
    const result = await pool.query(
      `SELECT 
         section1_positive, section1_negative,
         section2_positive, section2_negative,
         section3_positive, section3_negative
       FROM documents 
       WHERE document_id = $1 
       LIMIT 1`,
      [documentId]
    );

    if (result.rows.length === 0) {
      return res.json({ ok: true, data: null });
    }

    const row = result.rows[0];

    res.json({
      ok: true,
      data: {
        section1: {
          positive: row.section1_positive || null,
          negative: row.section1_negative || null
        },
        section2: {
          positive: row.section2_positive || null,
          negative: row.section2_negative || null
        },
        section3: {
          positive: row.section3_positive || null,
          negative: row.section3_negative || null
        }
      }
    });
  } catch (err) {
    console.error('Error fetching section sentiment summaries:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get consultations metadata (titles, description, dates, status) + submissions count
app.get('/api/consultations', async (req, res) => {
  try {
    const bills = [
      {
        id: 1,
        bill_key: 'bill_1',
        title: 'Establishment of Indian Multi-Disciplinary Partnership (MDP) firms by the Govt. of India',
        status: 'In Progress',
        endDate: '2025-10-10',
        description: 'New guidelines for CSR implementation and reporting',
        publishDate: '2025-09-01'
      },
      {
        id: 2,
        bill_key: 'bill_2',
        title: 'Digital Competition Bill, 2025',
        status: 'Completed',
        endDate: '2025-08-31',
        description: 'Proposed amendments to strengthen corporate governance and transparency',
        publishDate: '2025-07-15'
      },
      {
        id: 3,
        bill_key: 'bill_3',
        title: 'Companies Amendment Bill, 2025',
        status: 'Completed',
        endDate: '2025-07-15',
        description: 'Amendments to improve the insolvency resolution process',
        publishDate: '2025-06-01'
      }
    ];

    // For each bill, query count of comments
    const results = [];
    for (const b of bills) {
      const countQuery = `SELECT COUNT(*)::int AS count FROM ${b.bill_key}_comments`;
      let count = 0;
      try {
        const r = await pool.query(countQuery);
        count = r.rows[0]?.count || 0;
      } catch (e) {
        // If table doesn't exist or error, treat as zero and continue
        console.warn(`Could not get count for ${b.bill_key}:`, e.message || e);
        count = 0;
      }

      results.push({
        id: b.id,
        bill: b.bill_key,
        title: b.title,
        status: b.status,
        submissions: count,
        endDate: b.endDate,
        description: b.description,
        publishDate: b.publishDate
      });
    }

    res.json({ ok: true, data: results });
  } catch (err) {
    console.error('Error fetching consultations:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Minister Dashboard - Executive Summary Endpoint
app.get('/api/minister/dashboard-summary', async (req, res) => {
  try {
    // Get all consultations with their metadata
    const consultations = [
      { id: 1, bill_key: 'bill_1', title: 'Establishment of Indian Multi-Disciplinary Partnership (MDP) firms by the Govt. of India', status: 'In Progress' },
      { id: 2, bill_key: 'bill_2', title: 'Digital Competition Bill, 2025', status: 'Completed' },
      { id: 3, bill_key: 'bill_3', title: 'Companies Amendment Bill, 2025', status: 'Completed' }
    ];

    // Aggregate statistics across all bills
    let totalSubmissions = 0;
    let overallSentiment = { Positive: 0, Negative: 0, Neutral: 0 };
    let stakeholderBreakdown = {};

    for (const consultation of consultations) {
      const billKey = consultation.bill_key;

      // Get submission count
      const countQuery = `SELECT COUNT(*)::int AS count FROM ${billKey}_comments`;
      const countResult = await pool.query(countQuery);
      const count = countResult.rows[0]?.count || 0;
      totalSubmissions += count;

      // Get sentiment distribution
      const sentimentQuery = `SELECT sentiment, COUNT(*)::int as count FROM ${billKey}_comments GROUP BY sentiment`;
      const sentimentResult = await pool.query(sentimentQuery);
      sentimentResult.rows.forEach(row => {
        const sentiment = row.sentiment?.charAt(0).toUpperCase() + row.sentiment?.slice(1).toLowerCase();
        if (sentiment === 'Positive' || sentiment === 'Negative' || sentiment === 'Neutral') {
          overallSentiment[sentiment] += row.count;
        }
      });

      // Get stakeholder breakdown
      const stakeholderQuery = `SELECT stakeholder_type, COUNT(*)::int as count FROM ${billKey}_comments GROUP BY stakeholder_type`;
      const stakeholderResult = await pool.query(stakeholderQuery);
      stakeholderResult.rows.forEach(row => {
        const type = row.stakeholder_type || 'Unknown';
        stakeholderBreakdown[type] = (stakeholderBreakdown[type] || 0) + row.count;
      });
    }

    // Calculate percentages
    const totalSentimentCount = overallSentiment.Positive + overallSentiment.Negative + overallSentiment.Neutral;
    const sentimentPercentages = {
      Positive: totalSentimentCount > 0 ? ((overallSentiment.Positive / totalSentimentCount) * 100).toFixed(1) : 0,
      Negative: totalSentimentCount > 0 ? ((overallSentiment.Negative / totalSentimentCount) * 100).toFixed(1) : 0,
      Neutral: totalSentimentCount > 0 ? ((overallSentiment.Neutral / totalSentimentCount) * 100).toFixed(1) : 0
    };

    // Generate executive summary
    const activeConsultations = consultations.filter(c => c.status === 'In Progress').length;
    const dominantSentiment = overallSentiment.Positive > overallSentiment.Negative ? 'positive' :
      overallSentiment.Negative > overallSentiment.Positive ? 'negative' : 'neutral';

    const executiveSummary = `Currently ${activeConsultations} active consultation${activeConsultations !== 1 ? 's' : ''} with ${totalSubmissions} total submissions. Overall sentiment is predominantly ${dominantSentiment} (${sentimentPercentages[dominantSentiment.charAt(0).toUpperCase() + dominantSentiment.slice(1)]}%) with engagement from multiple stakeholder groups.`;

    res.json({
      ok: true,
      data: {
        totalSubmissions,
        activeConsultations,
        completedConsultations: consultations.length - activeConsultations,
        overallSentiment,
        sentimentPercentages,
        stakeholderBreakdown,
        executiveSummary,
        consultations: consultations.map(c => ({
          id: c.id,
          title: c.title,
          status: c.status
        }))
      }
    });
  } catch (err) {
    console.error('Error fetching minister dashboard summary:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Minister Dashboard - Top Comments Endpoint
app.get('/api/minister/top-comments', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const bills = ['bill_1', 'bill_2', 'bill_3'];
    const allTopComments = [];

    for (const bill of bills) {
      const query = `
        SELECT 
          comments_id,
          commenter_name,
          comment_data,
          sentiment,
          stakeholder_type,
          confidence_score,
          summary,
          created_at,
          '${bill}' as bill_key
        FROM ${bill}_comments
        WHERE confidence_score IS NOT NULL
        ORDER BY confidence_score DESC, created_at DESC
        LIMIT $1
      `;

      const result = await pool.query(query, [Math.ceil(limit / bills.length)]);
      allTopComments.push(...result.rows);
    }

    // Sort all comments by confidence score and take top N
    allTopComments.sort((a, b) => (b.confidence_score || 0) - (a.confidence_score || 0));
    const topComments = allTopComments.slice(0, limit);

    res.json({ ok: true, data: topComments });
  } catch (err) {
    console.error('Error fetching top comments:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Minister Dashboard - Consultation Summary Endpoint
app.get('/api/minister/consultation/:bill', async (req, res) => {
  try {
    const { bill } = req.params;

    if (!['bill_1', 'bill_2', 'bill_3'].includes(bill)) {
      return res.status(400).json({ ok: false, error: 'Invalid bill name' });
    }

    // Get submission count
    const countQuery = `SELECT COUNT(*)::int AS count FROM ${bill}_comments`;
    const countResult = await pool.query(countQuery);
    const submissionCount = countResult.rows[0]?.count || 0;

    // Get sentiment distribution
    const sentimentQuery = `SELECT sentiment, COUNT(*)::int as count FROM ${bill}_comments GROUP BY sentiment`;
    const sentimentResult = await pool.query(sentimentQuery);

    const sentimentDist = { Positive: 0, Negative: 0, Neutral: 0 };
    sentimentResult.rows.forEach(row => {
      const sentiment = row.sentiment?.charAt(0).toUpperCase() + row.sentiment?.slice(1).toLowerCase();
      if (sentiment === 'Positive' || sentiment === 'Negative' || sentiment === 'Neutral') {
        sentimentDist[sentiment] = row.count;
      }
    });

    // Calculate dominant sentiment
    const total = sentimentDist.Positive + sentimentDist.Negative + sentimentDist.Neutral;
    const dominantSentiment = sentimentDist.Positive > sentimentDist.Negative && sentimentDist.Positive > sentimentDist.Neutral ? 'Positive' :
      sentimentDist.Negative > sentimentDist.Positive && sentimentDist.Negative > sentimentDist.Neutral ? 'Negative' : 'Neutral';
    const dominantPercentage = total > 0 ? ((sentimentDist[dominantSentiment] / total) * 100).toFixed(1) : 0;

    // Get overall summary from documents table
    const documentId = parseInt(bill.split('_')[1]);
    const summaryQuery = `SELECT summary FROM documents WHERE document_id = $1`;
    const summaryResult = await pool.query(summaryQuery, [documentId]);
    const overallSummary = summaryResult.rows[0]?.summary || null;

    res.json({
      ok: true,
      data: {
        submissionCount,
        sentimentDistribution: sentimentDist,
        dominantSentiment,
        dominantPercentage,
        overallSummary
      }
    });
  } catch (err) {
    console.error('Error fetching consultation summary:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`\n✅ Server running on http://localhost:${PORT}\n`);
  console.log('Available endpoints:');

  console.log('  GET  /api/comments/:bill');
  console.log('  POST /api/comments/:bill');
  console.log('  GET  /api/sentiment/:bill');
  console.log('  GET  /api/summaries/:bill');
  console.log('  GET  /api/sections/:bill');
  console.log('  GET  /api/section-sentiments/:bill\n');
});
