const express = require('express');
const router = express.Router();

const storiesRouter = require('./stories');
const shlokasRouter = require('./shlokas');
const festivalsRouter = require('./festivals');
const glossaryRouter = require('./glossary');
const quizzesRouter = require('./quizzes');
const studentsRouter = require('./students');
const favoritesRouter = require('./favorites');
const notesRouter = require('./notes');
const dailyRouter = require('./daily');
const questionsRouter = require('./questions');
const aiRouter = require('./ai');

router.use('/stories', storiesRouter);
router.use('/shlokas', shlokasRouter);
router.use('/festivals', festivalsRouter);
router.use('/glossary', glossaryRouter);
router.use('/quizzes', quizzesRouter);
router.use('/students', studentsRouter);
router.use('/favorites', favoritesRouter);
router.use('/notes', notesRouter);
router.use('/daily', dailyRouter);
router.use('/questions', questionsRouter);
router.use('/ai', aiRouter);
router.use('/vision', aiRouter);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    app: 'E-Heritage API',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
