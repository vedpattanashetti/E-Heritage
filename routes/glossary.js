const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

// GET /api/glossary - List all terms, with optional search or category filter
router.get('/', (req, res) => {
  try {
    const { search, category } = req.query;
    let query = 'SELECT * FROM glossary WHERE 1=1';
    let params = [];

    if (search) {
      query += ' AND (LOWER(term) LIKE ? OR LOWER(definition) LIKE ? OR devanagari LIKE ?)';
      const term = `%${search.toLowerCase()}%`;
      params.push(term, term, `%${search}%`);
    }

    if (category) {
      query += ' AND LOWER(category) = ?';
      params.push(category.toLowerCase().trim());
    }

    query += ' ORDER BY term ASC';
    const terms = db.prepare(query).all(...params);
    res.json({ success: true, count: terms.length, data: terms });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/glossary/:term - Get single term
router.get('/:term', (req, res) => {
  try {
    const { term } = req.params;
    const item = db.prepare('SELECT * FROM glossary WHERE LOWER(term) = ?').get(term.toLowerCase().trim());

    if (!item) {
      return res.status(404).json({ success: false, error: `Glossary term '${term}' not found` });
    }

    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
