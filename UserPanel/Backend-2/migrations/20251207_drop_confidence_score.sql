-- Migration: bill_1_comments se confidence_score column drop karne ke liye
-- Is SQL ko apne Postgres DB me chalayein

-- Drop the index first
DROP INDEX IF EXISTS idx_bill1_comments_confidence;

-- Drop the column
ALTER TABLE bill_1_comments
  DROP COLUMN IF EXISTS confidence_score;
