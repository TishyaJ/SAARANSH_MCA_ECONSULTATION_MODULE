const express = require('express');
const router = express.Router();

// Simple mock ML endpoint local testing ke liye
// POST /ml/analyze
// Body: { text: string, documentId?: number }
// Response: { sentiment: 'positive'|'negative'|'neutral', summary: string }
router.post('/analyze', (req, res) => {
  const { text } = req.body || {};
  if (!text) return res.status(400).json({ success: false, message: 'text is required' });

  const lower = String(text).toLowerCase();
  let sentiment = 'neutral';
  if (lower.includes('good') || lower.includes('excellent') || lower.includes('happy')) sentiment = 'positive';
  if (lower.includes('bad') || lower.includes('terrible') || lower.includes('angry')) sentiment = 'negative';

  const summary = String(text).length > 200 ? String(text).slice(0, 200) + '...' : String(text);
  // Model name aur mock confidence score provide karta hai (testing ke liye)
  const model = process.env.ML_MODEL_NAME || 'local-mock-model';
  const confidence = Math.min(5, Math.max(0, (summary.length % 5) + 3)); // mock 0-5 score (test ke liye)

  res.json({ success: true, sentiment, summary, model, confidence });
});

module.exports = router;
