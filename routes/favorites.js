const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

// GET /api/favorites/:studentId - Get all favorites for a student
router.get('/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const favorites = db.prepare(`
      SELECT id, student_id, title, category, created_at
      FROM favorites
      WHERE student_id = ?
      ORDER BY created_at DESC
    `).all(studentId);

    res.json({ success: true, count: favorites.length, data: favorites });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/favorites - Add favorite
router.post('/', (req, res) => {
  try {
    const { studentId, title, category } = req.body;

    if (!studentId || !title) {
      return res.status(400).json({ success: false, error: 'studentId and title are required' });
    }

    const insert = db.prepare(`
      INSERT OR IGNORE INTO favorites (student_id, title, category)
      VALUES (?, ?, ?)
    `);
    const result = insert.run(studentId, title.trim(), category ? category.trim() : 'general');

    if (result.changes === 0) {
      return res.status(200).json({ success: true, message: 'Item is already in favorites' });
    }

    res.status(201).json({ success: true, message: 'Favorite saved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/favorites/:id - Delete by ID
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM favorites WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Favorite not found' });
    }

    res.json({ success: true, message: 'Favorite removed' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
