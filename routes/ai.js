const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
require('dotenv').config();

// Helper to get active Gemini API key
function getApiKey(req) {
  const envKey = process.env.GEMINI_API_KEY;
  if (envKey && envKey.trim() && envKey !== 'YOUR_GEMINI_API_KEY_HERE') {
    return envKey.trim();
  }
  // Allow client override if passed in header
  const clientKey = req.headers['x-gemini-key'] || req.headers['x-ai-key'] || req.body?.apiKey;
  if (clientKey && clientKey.trim() && clientKey !== 'YOUR_GEMINI_API_KEY_HERE') {
    return clientKey.trim();
  }
  return null;
}

// GET /api/ai/status - Check if single server API key is configured
router.get('/status', (req, res) => {
  const key = getApiKey(req);
  res.json({
    success: true,
    enabled: !!key,
    keyConfigured: !!key,
    model: 'E-Heritage Flash AI'
  });
});

// Helper to call Gemini API with fallback across model versions
async function callGemini(apiKey, payload) {
  const models = ['gemini-flash-lite-latest', 'gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.5-flash', 'gemini-flash-latest'];
  let lastError = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        const candidate = data.candidates?.[0];
        const text = candidate?.content?.parts?.map(p => p.text).join('') || '';
        if (text) {
          return { text, model };
        }
      } else {
        const errJson = await response.json().catch(() => ({}));
        lastError = new Error(errJson.error?.message || `AI API error ${response.status}`);
        console.warn(`Model ${model} returned error:`, errJson.error?.message || response.status);
      }
    } catch (err) {
      lastError = err;
      console.warn(`Failed calling ${model}:`, err.message);
    }
  }

  throw lastError || new Error('AI service failed to generate content');
}

// POST /api/ai/ask - Ask question powered by single API key
router.post('/ask', async (req, res) => {
  try {
    const { question, studentId } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, error: 'Question is required' });
    }

    const apiKey = getApiKey(req);
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Server AI key not configured. Using built-in engine.',
        fallback: true
      });
    }

    const systemInstruction = `You are E-Heritage AI, an educational, student-friendly, and culturally authentic guide for exploring Hindu philosophy, epics (Ramayana, Mahabharata), traditions, deities, and ethics (Dharma, Satya, Ahimsa, Seva).
Answer accurately, directly, and respectfully in engaging language for students. Highlight practical life lessons and school connections.
Be factually precise and do not confuse different deities or epics. Format your answer nicely in clean Markdown with sections and bullet points.`;

    const payload = {
      system_instruction: {
        parts: [{ text: systemInstruction }]
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: question.trim() }]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1200
      }
    };

    const { text, model } = await callGemini(apiKey, payload);

    // Record student question in database
    try {
      const stmt = db.prepare('INSERT INTO student_questions (student_id, question, answer) VALUES (?, ?, ?)');
      stmt.run(studentId || 'anonymous_student', question.trim(), text);
    } catch (dbErr) {
      console.warn('Could not record question in DB:', dbErr.message);
    }

    res.json({
      success: true,
      source: 'E-Heritage AI',
      answer: text
    });
  } catch (err) {
    console.error('AI ask error:', err);
    res.status(500).json({
      success: false,
      error: err.message,
      fallback: true
    });
  }
});

// Helper to strip emojis for strict compliance
function stripEmojis(str) {
  if (!str) return '';
  return str.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2702}-\u{27B0}\u{24C2}-\u{1F251}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}]/gu, '');
}

// Handler for Sacred iconography image analysis
async function handleVisionAnalysis(req, res) {
  try {
    const rawImage = req.body.imageBase64 || req.body.image;
    const prompt = req.body.prompt;
    let mimeType = req.body.mimeType || 'image/jpeg';
    if (!rawImage) {
      return res.status(400).json({ success: false, error: 'imageBase64 is required' });
    }

    // Auto-detect actual mimeType if imageBase64 is a data URL
    const mimeMatch = rawImage.match(/^data:(image\/[a-zA-Z0-9\+\-\.]+);base64,/);
    if (mimeMatch) {
      mimeType = mimeMatch[1];
    }

    const cleanBase64 = rawImage.replace(/^data:image\/[a-zA-Z0-9\+\-\.]+;base64,/, '');

    const apiKey = getApiKey(req);
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Server AI key not configured. Using built-in engine.',
        fallback: true
      });
    }

    const analysisPrompt = prompt || `Analyze this sacred Hindu artwork, murti, or traditional painting with deep cultural accuracy and reverence.
Identify:
1. Primary Deity or Figure depicted (e.g. Ganesha, Shiva, Krishna, Rama, Hanuman, Lakshmi, Saraswati, Durga).
2. Key Iconography & Symbols (Mudras/hand gestures, sacred weapons/ayudhas, vahanas/vehicles, posture/asana, ornaments, flora/lotus).
3. Cultural & Philosophical Significance: What values, virtues, or spiritual lessons does this artwork communicate?
4. Educational Student Takeaway: Practical advice for school and daily ethical living inspired by this form.

Strictly do NOT use emojis anywhere in your response. Format your analysis clearly in clean, beautiful Markdown with text-only headers and bullet points.`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: analysisPrompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: cleanBase64
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1200
      }
    };

    const { text, model } = await callGemini(apiKey, payload);
    const cleanedText = stripEmojis(text);

    res.json({
      success: true,
      source: 'E-Heritage Vision AI',
      analysis: cleanedText
    });
  } catch (err) {
    console.error('AI vision error:', err);
    res.status(500).json({
      success: false,
      error: err.message,
      fallback: true
    });
  }
}

// POST /api/ai/vision, /api/ai/vision/analyze, /api/vision, /api/vision/analyze
router.post('/vision', handleVisionAnalysis);
router.post('/vision/analyze', handleVisionAnalysis);
router.post('/analyze', handleVisionAnalysis);
router.post('/', (req, res, next) => {
  // If hit directly at /api/vision
  if (req.body && (req.body.imageBase64 || req.body.image)) {
    return handleVisionAnalysis(req, res);
  }
  next();
});

module.exports = router;
