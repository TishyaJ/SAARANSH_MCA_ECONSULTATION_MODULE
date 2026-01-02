const { body, validationResult } = require('express-validator');

const submitValidators = [
  body('documentId').exists().withMessage('documentId is required'),
  body('commentData').exists().withMessage('commentData is required'),
  body('commenterName').exists().withMessage('commenterName is required'),
  body('commenterEmail').exists().isEmail().withMessage('Valid commenterEmail is required'),
  body('commenterPhone').exists().withMessage('commenterPhone is required'),
  body('idType').exists().withMessage('idType is required'),
  body('idNumber').exists().withMessage('idNumber is required'),
  body('stakeholderType').exists().withMessage('stakeholderType is required')
];

function runValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
}

module.exports = { submitValidators, runValidation };
