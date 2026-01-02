const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/commentsController');
const { submitValidators, runValidation } = require('../middleware/validateComment');

// Routes (thin): controller functions ko call karta hai (thin router)
router.post('/submit-comment', submitValidators, runValidation, commentsController.submitComment);
router.get('/comments/:documentId', commentsController.getCommentsByDocument);
router.get('/comments', commentsController.getAllComments);
router.put('/comments/:commentId', commentsController.updateComment);

module.exports = router;
