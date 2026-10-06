require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('node:path');
const { seedDatabase } = require('./db/seeds');
const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize and seed database if not already seeded
try {
  seedDatabase();
} catch (err) {
  console.error('Error seeding database:', err);
}

// Middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-gemini-key');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Request logging in development
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// Mount API routes
app.use('/api', apiRoutes);

// Unmatched API routes get 404 JSON
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, error: 'API endpoint not found' });
});

// Serve static frontend
app.use(express.static(path.join(__dirname)));

// Fallback for SPA routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\nE-Heritage Backend Server running at http://localhost:${PORT}`);
    console.log(`API Health Check: http://localhost:${PORT}/api/health\n`);
  });
}

module.exports = app;
