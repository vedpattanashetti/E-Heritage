const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

// GET /api/notes/:studentId - Get observation journal notes
router.get('/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const notes = db.prepare(`
      SELECT id, student_id, content, archetype, created_at
      FROM observations
      WHERE student_id = ?
      ORDER BY created_at DESC
    `).all(studentId);

    res.json({ success: true, count: notes.length, data: notes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/notes - Save observation note
router.post('/', (req, res) => {
  try {
    const { studentId, content, archetype } = req.body;

    if (!studentId || !content) {
      return res.status(400).json({ success: false, error: 'studentId and content are required' });
    }

    const insert = db.prepare(`
      INSERT INTO observations (student_id, content, archetype)
      VALUES (?, ?, ?)
    `);

    insert.run(studentId, content.trim(), archetype ? archetype.trim() : 'General');
    res.status(201).json({ success: true, message: 'Observation note saved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/notes/:id - Delete observation
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM observations WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Observation note not found' });
    }

    res.json({ success: true, message: 'Observation note deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
