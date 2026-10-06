const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

// GET /api/stories - List all stories, optional filter by source_epic
router.get('/', (req, res) => {
  try {
    const { epic } = req.query;
    let query = 'SELECT id, slug, title, source_epic, theme, try_today FROM stories';
    let params = [];

    if (epic) {
      query += ' WHERE LOWER(source_epic) LIKE ?';
      params.push(`%${epic.toLowerCase()}%`);
    }

    query += ' ORDER BY id ASC';
    const stories = db.prepare(query).all(...params);
    res.json({ success: true, count: stories.length, data: stories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/stories/:slug - Get detailed story by slug
router.get('/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const story = db.prepare('SELECT * FROM stories WHERE slug = ?').get(slug);

    if (!story) {
      return res.status(404).json({ success: false, error: `Story '${slug}' not found` });
    }

    res.json({ success: true, data: story });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/stories - Add a new story (e.g. by educators/parents)
router.post('/', (req, res) => {
  try {
    const { slug, title, source_epic, theme, simple_text, middle_text, detail_text, try_today } = req.body;

    if (!slug || !title || !source_epic || !theme || !simple_text) {
      return res.status(400).json({
        success: false,
        error: 'Required fields missing: slug, title, source_epic, theme, simple_text'
      });
    }

    const insert = db.prepare(`
      INSERT INTO stories (slug, title, source_epic, theme, simple_text, middle_text, detail_text, try_today)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      slug.toLowerCase().trim(),
      title.trim(),
      source_epic.trim(),
      theme.trim(),
      simple_text.trim(),
      middle_text ? middle_text.trim() : simple_text.trim(),
      detail_text ? detail_text.trim() : simple_text.trim(),
      try_today ? try_today.trim() : ''
    );

    res.status(201).json({ success: true, message: 'Story added successfully', slug });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ success: false, error: 'A story with this slug already exists' });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
