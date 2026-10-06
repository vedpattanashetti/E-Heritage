const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

// GET /api/students - Leaderboard / student list
router.get('/', (req, res) => {
  try {
    const students = db.prepare(`
      SELECT student_id, name, age_group, quiz_score, quiz_streak, best_streak, badge, updated_at
      FROM students
      ORDER BY quiz_score DESC, best_streak DESC
      LIMIT 50
    `).all();

    res.json({ success: true, count: students.length, data: students });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/students/:id - Get specific student profile & stats
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    let student = db.prepare('SELECT * FROM students WHERE student_id = ?').get(id);

    if (!student) {
      // Auto-provision on first visit
      db.prepare(`
        INSERT INTO students (student_id, name, quiz_score, quiz_streak, best_streak, badge)
        VALUES (?, ?, 0, 0, 0, 'Story Seeker')
      `).run(id, `Learner_${id.substring(0, 5)}`);
      student = db.prepare('SELECT * FROM students WHERE student_id = ?').get(id);
    }

    const favCount = db.prepare('SELECT COUNT(*) as count FROM favorites WHERE student_id = ?').get(id).count;
    const noteCount = db.prepare('SELECT COUNT(*) as count FROM observations WHERE student_id = ?').get(id).count;

    res.json({
      success: true,
      data: {
        ...student,
        favoritesCount: favCount,
        observationsCount: noteCount
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/students - Register or update profile name/age group
router.post('/', (req, res) => {
  try {
    const { studentId, name, ageGroup } = req.body;

    if (!studentId || !name) {
      return res.status(400).json({ success: false, error: 'studentId and name are required' });
    }

    const existing = db.prepare('SELECT * FROM students WHERE student_id = ?').get(studentId);

    if (existing) {
      db.prepare(`
        UPDATE students
        SET name = ?, age_group = COALESCE(?, age_group), updated_at = CURRENT_TIMESTAMP
        WHERE student_id = ?
      `).run(name.trim(), ageGroup ? ageGroup.trim() : null, studentId);
    } else {
      db.prepare(`
        INSERT INTO students (student_id, name, age_group, quiz_score, quiz_streak, best_streak, badge)
        VALUES (?, ?, ?, 0, 0, 0, 'Story Seeker')
      `).run(studentId, name.trim(), ageGroup ? ageGroup.trim() : 'Ages 6–9');
    }

    const updated = db.prepare('SELECT * FROM students WHERE student_id = ?').get(studentId);
    res.json({ success: true, message: 'Student profile updated', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
