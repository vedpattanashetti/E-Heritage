# E-Heritage Backend & Platform

E-Heritage is an educational platform for exploring Hindu stories, shlokas, festivals, timelines, murti iconography, and respectful inquiry.

This repository contains the complete backend service (Node.js, Express, native SQLite) and the frontend single-page application.

---

## Architecture Overview

```
Heritage/
├── server.js                 # Express server & static asset host
├── package.json              # Dependencies and start/test scripts
├── sounds/                   # Authentic audio recordings (temple bells, shlokas & bhajans)
├── db/
│   ├── database.js           # Native node:sqlite database connection & DDL schema
│   └── seeds.js              # Auto-seeding curriculum & quiz data
├── routes/
│   ├── index.js              # Aggregated API router (/api/...)
│   ├── stories.js            # Stories & character lessons
│   ├── shlokas.js            # Sacred verses with Devanagari, breakdowns & audio
│   ├── festivals.js          # Cultural festivals & seasonal context
│   ├── glossary.js           # A–Z Core cultural glossary
│   ├── quizzes.js            # Dynamic quiz engine & streak evaluator
│   ├── students.js           # Student profiles & leaderboards
│   ├── favorites.js          # Bookmarks & saved lessons
│   ├── notes.js              # Field observation journal
│   ├── daily.js              # Deterministic rotating daily thoughts
│   └── questions.js          # Student inquiry archive
├── tests/
│   └── api.test.js           # 13 automated integration tests
└── index.html                # Frontend application
```

---

## Quick Start

### 1. Start the Backend Server
```bash
npm start
```
The server will start at `http://localhost:3000`.

### 2. Run Automated Tests
```bash
npm test
```
Runs the full 13-test suite verifying database transactions, authentic audio serving, streak calculations, and API endpoints.

---

## REST API Reference

All endpoints are hosted under `/api`:

| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status and timestamp |
| `GET` | `/api/stories` | List all stories (supports `?epic=ramayana`) |
| `GET` | `/api/stories/:slug` | Retrieve detailed story with reading levels |
| `POST`| `/api/stories` | Add a new story lesson |
| `GET` | `/api/shlokas` | List all shlokas with Devanagari & word breakdown |
| `GET` | `/api/shlokas/:slug` | Get specific shloka |
| `GET` | `/api/festivals` | List all festivals (supports `?search=` and `?season=`) |
| `GET` | `/api/festivals/:slug` | Get festival details |
| `GET` | `/api/glossary` | Searchable glossary terms (supports `?category=`) |
| `GET` | `/api/quizzes` | Get interactive quiz questions |
| `POST`| `/api/quizzes/submit` | Validate answer, calculate score, streak, and badge |
| `GET` | `/api/students` | Leaderboard and learner list |
| `GET` | `/api/students/:id` | Student stats, rank, and badge progress |
| `POST`| `/api/students` | Register or update student name and age group |
| `GET` | `/api/favorites/:studentId` | Get all saved bookmarks for a student |
| `POST`| `/api/favorites` | Bookmark a lesson |
| `DELETE`| `/api/favorites/:id` | Remove a bookmark |
| `GET` | `/api/notes/:studentId` | Get observation notes |
| `POST`| `/api/notes` | Save field note |
| `DELETE`| `/api/notes/:id` | Delete note |
| `GET` | `/api/daily` | Get today's rotating daily thought |
| `POST`| `/api/questions` | Log student inquiry |

---

## Database Details

* Uses Node.js native `node:sqlite` (`DatabaseSync`) with WAL mode enabled.
* Stored locally at `data/dharma.db`.
* Fully auto-migrated and seeded on first run with:
  * 7 epic character stories across Ramayana, Mahabharata & Panchatantra
  * 6 classic shlokas & mantras
  * 8 major festivals
  * 15 core philosophical vocabulary items
  * 8 multi-topic quiz questions
  * Daily rotating lessons

