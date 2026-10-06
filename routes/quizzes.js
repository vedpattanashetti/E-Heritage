const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

// GET /api/quizzes - Get quiz questions (for students, options included)
router.get('/', (req, res) => {
  try {
    const { category, limit } = req.query;
    let query = 'SELECT id, category, question, options, explanation FROM quizzes';
    let params = [];

    if (category) {
      query += ' WHERE LOWER(category) = ?';
      params.push(category.toLowerCase().trim());
    }

    query += ' ORDER BY id ASC';
    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit, 10));
    }

    const rows = db.prepare(query).all(...params);
    const formatted = rows.map(r => ({
      id: r.id,
      category: r.category,
      question: r.question,
      options: JSON.parse(r.options),
      explanation: r.explanation
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/quizzes/submit - Verify an answer and update student progress
router.post('/submit', (req, res) => {
  try {
    const { questionId, selectedIndex, studentId } = req.body;

    if (questionId === undefined || selectedIndex === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Required fields missing: questionId, selectedIndex'
      });
    }

    const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(questionId);
    if (!quiz) {
      return res.status(404).json({ success: false, error: 'Quiz question not found' });
    }

    const isCorrect = Number(selectedIndex) === quiz.correct_index;
    let studentStats = null;

    if (studentId) {
      let student = db.prepare('SELECT * FROM students WHERE student_id = ?').get(studentId);
      if (!student) {
        db.prepare(`
          INSERT INTO students (student_id, name, quiz_score, quiz_streak, best_streak, badge)
          VALUES (?, ?, 0, 0, 0, 'Story Seeker')
        `).run(studentId, `Student_${studentId.substring(0, 6)}`);
        student = db.prepare('SELECT * FROM students WHERE student_id = ?').get(studentId);
      }

      let newScore = student.quiz_score;
      let newStreak = student.quiz_streak;
      let bestStreak = student.best_streak;

      if (isCorrect) {
        newScore += 10;
        newStreak += 1;
        if (newStreak > bestStreak) {
          bestStreak = newStreak;
        }
      } else {
        newStreak = 0;
      }

      let badge = 'Story Seeker';
      if (newScore >= 30) badge = 'Curious Explorer';
      if (newScore >= 60) badge = 'Respectful Scholar';
      if (newScore >= 100) badge = 'Heritage Champion';

      db.prepare(`
        UPDATE students
        SET quiz_score = ?, quiz_streak = ?, best_streak = ?, badge = ?, updated_at = CURRENT_TIMESTAMP
        WHERE student_id = ?
      `).run(newScore, newStreak, bestStreak, badge, studentId);

      studentStats = {
        quizScore: newScore,
        quizStreak: newStreak,
        bestStreak: bestStreak,
        badge: badge
      };
    }

    res.json({
      success: true,
      isCorrect,
      correctIndex: quiz.correct_index,
      explanation: quiz.explanation,
      studentStats
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
