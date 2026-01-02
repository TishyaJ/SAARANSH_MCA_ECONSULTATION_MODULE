-- Migration: bill_1_comments me ML metadata columns add karne ke liye
-- Is SQL ko apne Postgres DB me chalayein server start karne se pehle

ALTER TABLE bill_1_comments
  ADD COLUMN IF NOT EXISTS confidence_score NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS ml_used BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ml_model VARCHAR(255);

-- Optional: agar pehle se koi field hai to confidence_score backfill karne ke liye
-- UPDATE bill_1_comments SET confidence_score = COALESCE(confidence_score, 0);

-- Index banayein taaki sentiment ya ml_used par filtering tez ho
CREATE INDEX IF NOT EXISTS idx_bill1_comments_ml_used ON bill_1_comments(ml_used);
CREATE INDEX IF NOT EXISTS idx_bill1_comments_confidence ON bill_1_comments(confidence_score);
