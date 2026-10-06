const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

// GET /api/festivals - List all festivals, optional search
router.get('/', (req, res) => {
  try {
    const { search, season } = req.query;
    let query = 'SELECT * FROM festivals WHERE 1=1';
    let params = [];

    if (search) {
      query += ' AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(core_theme) LIKE ?)';
      const term = `%${search.toLowerCase()}%`;
      params.push(term, term, term);
    }

    if (season) {
      query += ' AND LOWER(season) LIKE ?';
      params.push(`%${season.toLowerCase()}%`);
    }

    query += ' ORDER BY id ASC';
    const festivals = db.prepare(query).all(...params);
    res.json({ success: true, count: festivals.length, data: festivals });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/festivals/:slug - Get single festival
router.get('/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const festival = db.prepare('SELECT * FROM festivals WHERE slug = ?').get(slug);

    if (!festival) {
      return res.status(404).json({ success: false, error: `Festival '${slug}' not found` });
    }

    res.json({ success: true, data: festival });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
