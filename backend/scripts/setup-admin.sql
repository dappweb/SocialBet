-- Setup Admin Users Script
-- This script sets up admin users for the Operations & Management System
-- Run this after initial database setup

-- Set a specific user as admin (replace 'user_id' with actual user ID)
-- Example: Set user 'me' as admin
UPDATE users SET is_admin = 1 WHERE id = 'me';

-- Or set multiple users as admin
-- UPDATE users SET is_admin = 1 WHERE id IN ('user1', 'user2', 'user3');

-- Verify admin users
SELECT id, name, handle, is_admin FROM users WHERE is_admin = 1;

-- Note: For production, you may want to set admin users based on:
-- - Wallet addresses
-- - Email addresses
-- - Specific user IDs from your authentication system

