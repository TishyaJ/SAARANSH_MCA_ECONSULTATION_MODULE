const pool = require('../db');

const insertQuery = `
  INSERT INTO bill_1_comments (
    document_id,
    section,
    comment_data,
    sentiment,
    summary,
    supported_doc,
    supported_doc_filename,
    commenter_name,
    commenter_email,
    commenter_phone,
    commenter_address,
    id_type,
    id_number,
    stakeholder_type,
    created_at,
    updated_at
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
  RETURNING *;
`;

async function insertComment(values) {
  const result = await pool.query(insertQuery, values);
  return result.rows[0];
}

async function getByDocument(documentId) {
  const result = await pool.query('SELECT * FROM bill_1_comments WHERE document_id = $1 ORDER BY created_at DESC;', [documentId]);
  return result.rows;
}

async function getAll() {
  const result = await pool.query('SELECT * FROM bill_1_comments ORDER BY created_at DESC;');
  return result.rows;
}

async function updateComment(commentId, commentData, sentiment, summary) {
  const query = `
    UPDATE bill_1_comments
    SET comment_data = $1, sentiment = $2, summary = $3, updated_at = NOW()
    WHERE comments_id = $4
    RETURNING *;
  `;
  const result = await pool.query(query, [commentData, sentiment, summary, commentId]);
  return result.rows[0] || null;
}

module.exports = {
  insertComment,
  getByDocument,
  getAll,
  updateComment
};
