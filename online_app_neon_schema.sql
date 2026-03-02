-- ============================================================
-- Run this SQL in your Neon database to create the Online App table
-- Connection: psql 'postgresql://neondb_owner:npg_VjQUeDagK0O9@ep-steep-fire-ae637xly-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
-- ============================================================

CREATE TABLE IF NOT EXISTS online_app (
  id                      SERIAL PRIMARY KEY,
  user_id                 TEXT UNIQUE NOT NULL,
  password                TEXT NOT NULL,
  account_name            TEXT NOT NULL,
  bank_name               TEXT,
  bank_amount             NUMERIC(15, 2) DEFAULT 0,
  withdraw_account_number TEXT,
  available_balance       NUMERIC(15, 2) DEFAULT 0,
  withdrawal_fee          NUMERIC(15, 2) DEFAULT 0,
  created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast user_id lookups
CREATE INDEX IF NOT EXISTS idx_online_app_user_id ON online_app (user_id);

-- Optional: verify table was created
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'online_app'
ORDER BY ordinal_position;
