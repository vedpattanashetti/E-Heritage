const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

let db;
let DB_PATH;

try {
  const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT;
  const DATA_DIR = isServerless ? path.join('/tmp', 'heritage_data') : path.join(__dirname, '..', 'data');
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  DB_PATH = path.join(DATA_DIR, 'dharma.db');
  db = new DatabaseSync(DB_PATH);
} catch (err) {
  console.warn('File database initialization failed, falling back to in-memory SQLite:', err.message);
  DB_PATH = ':memory:';
  db = new DatabaseSync(':memory:');
}

// Enable WAL mode and foreign keys
db.exec('PRAGMA foreign_keys = ON;');

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      age_group TEXT DEFAULT 'Ages 6–9',
      quiz_score INTEGER DEFAULT 0,
      quiz_streak INTEGER DEFAULT 0,
      best_streak INTEGER DEFAULT 0,
      badge TEXT DEFAULT 'Story Seeker',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_id, title)
    );

    CREATE TABLE IF NOT EXISTS observations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      content TEXT NOT NULL,
      archetype TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      source_epic TEXT NOT NULL,
      theme TEXT NOT NULL,
      simple_text TEXT NOT NULL,
      middle_text TEXT NOT NULL,
      detail_text TEXT NOT NULL,
      try_today TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS shlokas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      source TEXT NOT NULL,
      devanagari TEXT NOT NULL,
      transliteration TEXT NOT NULL,
      simple_meaning TEXT NOT NULL,
      middle_meaning TEXT NOT NULL,
      detail_meaning TEXT NOT NULL,
      word_breakdown TEXT,
      audio_text TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS festivals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      tagline TEXT NOT NULL,
      season TEXT NOT NULL,
      description TEXT NOT NULL,
      core_theme TEXT NOT NULL,
      traditions TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS glossary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      term TEXT UNIQUE NOT NULL,
      devanagari TEXT NOT NULL,
      definition TEXT NOT NULL,
      example TEXT NOT NULL,
      category TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      question TEXT NOT NULL,
      options TEXT NOT NULL, -- JSON array
      correct_index INTEGER NOT NULL,
      explanation TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS daily_lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      value_title TEXT NOT NULL,
      story_connection TEXT NOT NULL,
      try_today TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS student_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT,
      question TEXT NOT NULL,
      answer TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

initSchema();

module.exports = { db, DB_PATH };
