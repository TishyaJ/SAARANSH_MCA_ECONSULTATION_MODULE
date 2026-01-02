const fetch = require('node-fetch');
const commentsModel = require('../models/commentsModel');

// Submit comment/controller: agar ML API configured hai to use call karke enrichment karta hai, phir model se DB me insert karta hai
async function submitComment(req, res, next) {
  try {
    const {
      documentId,
      section,
      commentData,
      sentiment,
      summary,
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

    // Zaroori fields ko validate kare
    if (!documentId || !commenterName || !commenterEmail || !commenterPhone ||
        !idType || !idNumber || !stakeholderType || !commentData) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: ['documentId', 'commenterName', 'commenterEmail', 'commenterPhone', 'idType', 'idNumber', 'stakeholderType', 'commentData']
      });
    }

    // ML enrichment (optional) — ML metadata set kare
    let predictedSentiment = sentiment || null;
    let predictedSummary = summary || null;

    const mlUrl = process.env.ML_API_URL;
    if (mlUrl && commentData && (!predictedSentiment || !predictedSummary)) {
      try {
        const mlResp = await fetch(mlUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: commentData, documentId, section })
        });
        if (mlResp.ok) {
          const mlJson = await mlResp.json();
          if (!predictedSentiment && mlJson.sentiment) predictedSentiment = mlJson.sentiment;
          if (!predictedSummary && mlJson.summary) predictedSummary = mlJson.summary;
        } else {
          console.warn('ML API responded with status', mlResp.status);
        }
      } catch (e) {
        console.error('Error calling ML API:', e.message || e);
      }
    }

    const values = [
      documentId,
      section || null,
      commentData,
      predictedSentiment || null,
      predictedSummary || null,
      supportedDocData || null,
      supportedDocFilename || null,
      commenterName,
      commenterEmail,
      commenterPhone,
      commenterAddress || null,
      idType,
      idNumber,
      stakeholderType
    ];

    const result = await commentsModel.insertComment(values);

    res.status(201).json({ success: true, message: 'Comment submitted successfully', data: result });
  } catch (error) {
    next(error);
  }
}

async function getCommentsByDocument(req, res, next) {
  try {
    const { documentId } = req.params;
    if (!documentId) return res.status(400).json({ success: false, message: 'Document ID is required' });
    const rows = await commentsModel.getByDocument(documentId);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
}

async function getAllComments(req, res, next) {
  try {
    const rows = await commentsModel.getAll();
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
}

async function updateComment(req, res, next) {
  try {
    const { commentId } = req.params;
    const { commentData, sentiment, summary } = req.body;

    if (!commentId || !commentData) {
      return res.status(400).json({ success: false, message: 'Comment ID and comment data are required' });
    }

    const updated = await commentsModel.updateComment(commentId, commentData, sentiment || null, summary || null);
    if (!updated) return res.status(404).json({ success: false, message: 'Comment not found' });
    res.status(200).json({ success: true, message: 'Comment updated successfully', data: updated });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  submitComment,
  getCommentsByDocument,
  getAllComments,
  updateComment
};
