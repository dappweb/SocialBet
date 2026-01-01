-- Migration Script: Add Operations & Management Tables
-- Run this if your database doesn't have the operations tables yet
-- This script is idempotent (safe to run multiple times)

-- Add is_admin column to users table if it doesn't exist
-- Note: SQLite doesn't support ALTER TABLE ADD COLUMN IF NOT EXISTS
-- So we'll check and add manually if needed
-- For Cloudflare D1, use: ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0;

-- Create operations tables
CREATE TABLE IF NOT EXISTS treasury_transactions (
  id TEXT PRIMARY KEY,
  transaction_type TEXT NOT NULL CHECK(transaction_type IN ('trade_fee', 'allocation', 'withdrawal', 'deposit')),
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  category TEXT CHECK(category IN ('development', 'operations', 'marketing', 'reserves', 'partnerships')),
  status TEXT DEFAULT 'completed' CHECK(status IN ('pending', 'completed', 'failed')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS operations_metrics (
  id TEXT PRIMARY KEY,
  metric_date TEXT NOT NULL,
  total_revenue REAL DEFAULT 0,
  monthly_revenue REAL DEFAULT 0,
  operational_fund REAL DEFAULT 0,
  total_trades INTEGER DEFAULT 0,
  monthly_trades INTEGER DEFAULT 0,
  platform_fee_percent REAL DEFAULT 2.5,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS fund_allocations (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK(category IN ('development', 'operations', 'marketing', 'reserves', 'partnerships')),
  allocated_amount REAL NOT NULL,
  used_amount REAL DEFAULT 0,
  percentage REAL NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_treasury_transactions_date ON treasury_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_treasury_transactions_type ON treasury_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_operations_metrics_date ON operations_metrics(metric_date);

-- Initialize default fund allocations if they don't exist
-- Note: Using simple UUIDs for Cloudflare D1 compatibility
INSERT OR IGNORE INTO fund_allocations (id, category, allocated_amount, used_amount, percentage) VALUES
  ('alloc-dev-001', 'development', 0, 0, 40),
  ('alloc-ops-001', 'operations', 0, 0, 30),
  ('alloc-mkt-001', 'marketing', 0, 0, 15),
  ('alloc-res-001', 'reserves', 0, 0, 10),
  ('alloc-par-001', 'partnerships', 0, 0, 5);

-- Initialize default operations metrics for current month
-- Note: Using date-based ID for Cloudflare D1 compatibility
INSERT OR IGNORE INTO operations_metrics (
  id, 
  metric_date, 
  total_revenue, 
  monthly_revenue, 
  operational_fund, 
  total_trades, 
  monthly_trades, 
  platform_fee_percent
) VALUES (
  'metrics-' || strftime('%Y-%m', 'now'),
  strftime('%Y-%m', 'now'),
  0,
  0,
  0,
  0,
  0,
  2.5
);

