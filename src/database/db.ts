import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

let db: Database.Database | null = null;

/**
 * Initialize and return the database connection
 */
export function getDatabase(): Database.Database {
  if (!db) {
    // Create database file in project root
    db = new Database('qa-bot.db', { verbose: console.log });

    // Enable WAL mode for better concurrent access
    db.pragma('journal_mode = WAL');

    // Initialize schema
    initializeSchema();

    console.log('✅ Database initialized successfully');
  }

  return db;
}

/**
 * Initialize database schema from SQL file
 */
function initializeSchema(): void {
  if (!db) throw new Error('Database not initialized');

  // Use path from project root, not from dist folder
  const schemaPath = join(__dirname, '../../src/database/schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');

  // Execute schema SQL
  db.exec(schema);

  console.log('✅ Database schema initialized');
}

/**
 * Record a deployment
 */
export function recordDeployment(
  type: 'ui' | 'backend',
  deployerId: number,
  deployerName: string
): void {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO deployments (type, deployer_id, deployer_name)
    VALUES (?, ?, ?)
  `);

  stmt.run(type, deployerId, deployerName);
}

/**
 * Create a bug report (initial state)
 */
export function createBug(
  reporterId: number,
  reporterName: string,
  messageId: number
): number {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO bugs (reporter_id, reporter_name, message_id, status)
    VALUES (?, ?, ?, 'pending')
  `);

  const result = stmt.run(reporterId, reporterName, messageId);
  return result.lastInsertRowid as number;
}

/**
 * Assign a bug to a user
 */
export function assignBug(
  bugId: number,
  assignedToId: number,
  assignedToName: string
): void {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE bugs
    SET assigned_to_id = ?, assigned_to_name = ?, status = 'assigned'
    WHERE id = ?
  `);

  stmt.run(assignedToId, assignedToName, bugId);
}

/**
 * Get bug by message ID
 */
export function getBugByMessageId(messageId: number): any | null {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM bugs WHERE message_id = ?
  `);

  return stmt.get(messageId) || null;
}

/**
 * Get recent deployments
 */
export function getRecentDeployments(limit: number = 10): any[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM deployments
    ORDER BY created_at DESC
    LIMIT ?
  `);

  return stmt.all(limit);
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    console.log('✅ Database connection closed');
  }
}

// Graceful shutdown handling
process.on('SIGINT', () => {
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDatabase();
  process.exit(0);
});
