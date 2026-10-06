const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

// GET /api/daily - Returns the rotating daily lesson
router.get('/', (req, res) => {
  try {
    const lessons = db.prepare('SELECT * FROM daily_lessons ORDER BY id ASC').all();

    if (lessons.length === 0) {
      return res.json({
        success: true,
        data: {
          value_title: 'Value: Kindness',
          story_connection: 'Krishna is celebrated as a supportive guide and loyal friend.',
          try_today: 'Include someone who is sitting alone or needs help.'
        }
      });
    }

    // Determine today's index deterministically by day of year so all students see the same daily thought
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now - startOfYear;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const selected = lessons[dayOfYear % lessons.length];

    const formatLesson = (l) => ({
      ...l,
      title: l.value_title,
      text: l.story_connection,
      try_action: l.try_today
    });

    res.json({
      success: true,
      dayOfYear,
      data: formatLesson(selected)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/daily/random - Get random daily lesson
router.get('/random', (req, res) => {
  try {
    const lesson = db.prepare('SELECT * FROM daily_lessons ORDER BY RANDOM() LIMIT 1').get();
    const formatLesson = (l) => l ? ({
      ...l,
      title: l.value_title,
      text: l.story_connection,
      try_action: l.try_today
    }) : null;
    res.json({ success: true, data: formatLesson(lesson) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
