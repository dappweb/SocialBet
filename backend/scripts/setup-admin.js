#!/usr/bin/env node
/**
 * Setup Admin Users Script
 * Configures admin users for the Operations & Management System
 * 
 * Usage:
 *   node scripts/setup-admin.js <user_id>
 *   node scripts/setup-admin.js <user_id1> <user_id2> ...
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', '..', 'data', 'socialbet.db');

if (process.argv.length < 3) {
  console.error('Usage: node setup-admin.js <user_id> [user_id2] ...');
  console.error('Example: node setup-admin.js me user1 user2');
  process.exit(1);
}

const userIds = process.argv.slice(2);

if (!require('fs').existsSync(dbPath)) {
  console.error(`Database not found at ${dbPath}`);
  console.error('Please initialize the database first.');
  process.exit(1);
}

const db = new Database(dbPath);

try {
  console.log('🔧 Setting up admin users...\n');

  for (const userId of userIds) {
    // Check if user exists
    const user = db.prepare('SELECT id, name, handle FROM users WHERE id = ?').get(userId);
    
    if (!user) {
      console.warn(`⚠️  User "${userId}" not found. Skipping...`);
      continue;
    }

    // Set as admin
    const result = db.prepare('UPDATE users SET is_admin = 1 WHERE id = ?').run(userId);
    
    if (result.changes > 0) {
      console.log(`✅ Set user "${userId}" (${user.name} / ${user.handle}) as admin`);
    } else {
      console.log(`ℹ️  User "${userId}" is already an admin`);
    }
  }

  // List all admin users
  console.log('\n📋 Current admin users:');
  const admins = db.prepare('SELECT id, name, handle FROM users WHERE is_admin = 1').all();
  
  if (admins.length === 0) {
    console.log('   (No admin users found)');
  } else {
    admins.forEach(admin => {
      console.log(`   - ${admin.id}: ${admin.name} (@${admin.handle})`);
    });
  }

  console.log('\n✅ Admin setup complete!');
} catch (error) {
  console.error('❌ Error setting up admin users:', error.message);
  process.exit(1);
} finally {
  db.close();
}

