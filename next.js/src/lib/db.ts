import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'notes.db');

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    initDb(_db);
  }
  return _db;
}

function initDb(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS user (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS note (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      content TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      user_id INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES user(id)
    );
  `);
}

// ---- User 操作 ----

export interface User {
  id: number;
  username: string;
  password_hash: string;
}

export function getUserByUsername(username: string): User | undefined {
  return getDb().prepare('SELECT * FROM user WHERE username = ?').get(username) as User | undefined;
}

export function getUserById(id: number): User | undefined {
  return getDb().prepare('SELECT * FROM user WHERE id = ?').get(id) as User | undefined;
}

export function createUser(username: string, passwordHash: string): number {
  const result = getDb().prepare('INSERT INTO user (username, password_hash) VALUES (?, ?)').run(username, passwordHash);
  return result.lastInsertRowid as number;
}

// ---- Note 操作 ----

export interface Note {
  id: number;
  title: string | null;
  content: string | null;
  created_at: string;
  updated_at: string;
  user_id: number;
}

export function getNotesByUserId(userId: number): Note[] {
  return getDb().prepare('SELECT * FROM note WHERE user_id = ? ORDER BY updated_at DESC').all(userId) as Note[];
}

export function getNoteById(noteId: number): Note | undefined {
  return getDb().prepare('SELECT * FROM note WHERE id = ?').get(noteId) as Note | undefined;
}

export function createNote(title: string, content: string, userId: number): number {
  const now = new Date().toISOString();
  const result = getDb().prepare(
    'INSERT INTO note (title, content, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
  ).run(title, content, userId, now, now);
  return result.lastInsertRowid as number;
}

export function updateNote(noteId: number, title: string, content: string): void {
  const now = new Date().toISOString();
  getDb().prepare('UPDATE note SET title = ?, content = ?, updated_at = ? WHERE id = ?').run(title, content, now, noteId);
}

export function deleteNote(noteId: number): void {
  getDb().prepare('DELETE FROM note WHERE id = ?').run(noteId);
}
