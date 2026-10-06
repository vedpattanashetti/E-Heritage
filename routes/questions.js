const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

// GET /api/questions - List student inquiries / FAQ repository
router.get('/', (req, res) => {
  try {
    const questions = db.prepare(`
      SELECT id, student_id, question, answer, created_at
      FROM student_questions
      ORDER BY created_at DESC
      LIMIT 30
    `).all();

    res.json({ success: true, count: questions.length, data: questions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/questions - Record a student inquiry
router.post('/', (req, res) => {
  try {
    const { studentId, question, answer } = req.body;

    if (!question) {
      return res.status(400).json({ success: false, error: 'Question text is required' });
    }

    const insert = db.prepare(`
      INSERT INTO student_questions (student_id, question, answer)
      VALUES (?, ?, ?)
    `);

    insert.run(studentId || 'anonymous', question.trim(), answer ? answer.trim() : null);
    res.status(201).json({ success: true, message: 'Question recorded' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
