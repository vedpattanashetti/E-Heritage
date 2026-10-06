const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const app = require('../server');

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    // Listen on random free port
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}/api`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = `${baseUrl}${path}`;
    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

test('GET /api/health returns healthy status', async () => {
  const res = await request('/health');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.status, 'healthy');
  assert.strictEqual(res.body.app, 'E-Heritage API');
});

test('GET /api/stories returns seeded stories', async () => {
  const res = await request('/stories');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.data.length >= 6);
  assert.ok(res.body.data.some((s) => s.slug === 'hanuman'));
});

test('GET /api/stories/:slug returns single story details', async () => {
  const res = await request('/stories/hanuman');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.slug, 'hanuman');
  assert.strictEqual(res.body.data.title, 'Hanuman');
  assert.ok(res.body.data.simple_text);
  assert.ok(res.body.data.middle_text);
  assert.ok(res.body.data.detail_text);
});

test('GET /api/shlokas returns shlokas with word breakdowns and authentic audio metadata', async () => {
  const res = await request('/shlokas');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.data.length >= 6);
  const effort = res.body.data.find((s) => s.slug === 'effort');
  assert.ok(effort);
  assert.ok(effort.devanagari);
  assert.ok(Array.isArray(effort.word_breakdown));
  assert.ok(effort.audio_url);
  assert.ok(effort.reciter);
  assert.ok(effort.online_source);
  assert.ok(effort.phonetic_guide);
});

test('GET /sounds/temple-bell.mp3 serves authentic audio', async () => {
  const res = await request('/../sounds/temple-bell.mp3');
  assert.strictEqual(res.status, 200);
});

test('GET /api/festivals returns list with search support', async () => {
  const res = await request('/festivals?search=diwali');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.length, 1);
  assert.strictEqual(res.body.data[0].slug, 'diwali');
});

test('GET /api/glossary returns filtered glossary terms', async () => {
  const res = await request('/glossary?category=Philosophy');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.data.some((t) => t.term === 'Dharma'));
});

test('GET /api/quizzes returns questions with options array', async () => {
  const res = await request('/quizzes');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.data.length >= 8);
  assert.ok(Array.isArray(res.body.data[0].options));
});

test('GET /api/quizzes safely handles limit query parameter and non-numeric input', async () => {
  const resLimit = await request('/quizzes?limit=3');
  assert.strictEqual(resLimit.status, 200);
  assert.strictEqual(resLimit.body.data.length, 3);

  const resInvalid = await request('/quizzes?limit=notanumber');
  assert.strictEqual(resInvalid.status, 200);
  assert.ok(resInvalid.body.data.length >= 8);
});

test('POST /api/quizzes/submit verifies answer and tracks streak', async () => {
  const studentId = 'test_student_' + Date.now();
  // Question 1: Hanuman question (index 1 is correct)
  const resCorrect = await request('/quizzes/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { questionId: 1, selectedIndex: 1, studentId }
  });

  assert.strictEqual(resCorrect.status, 200);
  assert.strictEqual(resCorrect.body.isCorrect, true);
  assert.strictEqual(resCorrect.body.studentStats.quizScore, 10);
  assert.strictEqual(resCorrect.body.studentStats.quizStreak, 1);

  // Submit wrong answer
  const resWrong = await request('/quizzes/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { questionId: 1, selectedIndex: 0, studentId }
  });

  assert.strictEqual(resWrong.status, 200);
  assert.strictEqual(resWrong.body.isCorrect, false);
  assert.strictEqual(resWrong.body.studentStats.quizStreak, 0);
});

test('POST /api/favorites and GET /api/favorites/:studentId handles user bookmarks', async () => {
  const studentId = 'fav_student_' + Date.now();

  const addRes = await request('/favorites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { studentId, title: 'Story: Hanuman', category: 'story' }
  });
  assert.strictEqual(addRes.status, 201);

  const getRes = await request(`/favorites/${studentId}`);
  assert.strictEqual(getRes.status, 200);
  assert.strictEqual(getRes.body.data.length, 1);
  assert.strictEqual(getRes.body.data[0].title, 'Story: Hanuman');
});

test('POST /api/notes and GET /api/notes/:studentId manages observation journal', async () => {
  const studentId = 'note_student_' + Date.now();

  const saveRes = await request('/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { studentId, content: 'Noticed trident and damru drum on temple murti.', archetype: 'Shiva' }
  });
  assert.strictEqual(saveRes.status, 201);

  const listRes = await request(`/notes/${studentId}`);
  assert.strictEqual(listRes.status, 200);
  assert.strictEqual(listRes.body.data.length, 1);
  assert.strictEqual(listRes.body.data[0].archetype, 'Shiva');
});

test('GET /api/daily returns rotating daily lesson', async () => {
  const res = await request('/daily');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.data.value_title);
  assert.ok(res.body.data.try_today);
});

test('POST /api/questions logs student inquiry', async () => {
  const res = await request('/questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { studentId: 'student_123', question: 'Why is Diwali celebrated for five days?' }
  });
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.success, true);
});

test('GET /api/ai/status returns AI configuration state', async () => {
  const res = await request('/ai/status');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok('keyConfigured' in res.body);
  assert.ok('model' in res.body);
});

test('POST /api/ai/ask returns validation error on empty question', async () => {
  const res = await request('/ai/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { question: '' }
  });
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
});

test('POST /api/ai/vision returns validation error on missing image', async () => {
  const res = await request('/ai/vision', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {}
  });
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
  assert.strictEqual(res.body.error, 'imageBase64 is required');
});

test('POST /api/vision/analyze returns validation error on missing image', async () => {
  const res = await request('/vision/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {}
  });
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
  assert.strictEqual(res.body.error, 'imageBase64 is required');
});
