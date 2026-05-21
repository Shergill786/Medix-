const http = require('http');
const fs = require('fs');
const path = require('path');

loadEnv();

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 3000);
const AI_PROVIDER = detectAiProvider();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

const server = http.createServer(async (req, res) => {
  try {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    if (req.url && req.url.startsWith('/api/')) {
      await handleApi(req, res);
      return;
    }

    serveStatic(req, res);
  } catch (error) {
    sendJson(res, 500, { ok: false, error: error.message || 'Server error' });
  }
});

server.listen(PORT, () => {
  console.log(`Medix running at http://localhost:${PORT}`);
});

async function handleApi(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && url.pathname === '/api/health') {
    sendJson(res, 200, { ok: true, status: 'ok', provider: AI_PROVIDER });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/chat') {
    await chat(req, res);
    return;
  }

  sendJson(res, 404, { ok: false, error: 'API route not found' });
}

async function chat(req, res) {
  const body = await readJson(req);
  const message = String(body.message || '').trim();
  if (!message) {
    sendJson(res, 400, { ok: false, error: 'Message is required.' });
    return;
  }

  let reply = fallbackChatReply(message);
  let provider = 'local';

  if (process.env.OPENAI_API_KEY) {
    try {
      reply = await chatCompletion(message);
      provider = AI_PROVIDER;
    } catch (error) {
      reply = `${fallbackChatReply(message)} API note: ${error.message}`;
      provider = 'local-fallback';
    }
  }

  sendJson(res, 200, { ok: true, reply, provider });
}

async function chatCompletion(message) {
  const response = await fetch(chatCompletionEndpoint(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: chatCompletionModel(),
      messages: [
        {
          role: 'system',
          content: 'You are Medix Assistant. Give brief practical navigation help for this healthcare web app. Do not diagnose or prescribe. For possible emergencies, tell users to contact emergency services immediately.',
        },
        { role: 'user', content: message },
      ],
      max_tokens: 160,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI request failed (${response.status})`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || fallbackChatReply(message);
}

function detectAiProvider() {
  if ((process.env.AI_PROVIDER || '').trim()) return process.env.AI_PROVIDER.trim().toLowerCase();
  if ((process.env.OPENAI_API_KEY || '').trim().startsWith('gsk_')) return 'groq';
  return 'openai';
}

function chatCompletionEndpoint() {
  return AI_PROVIDER === 'groq'
    ? 'https://api.groq.com/openai/v1/chat/completions'
    : 'https://api.openai.com/v1/chat/completions';
}

function chatCompletionModel() {
  return AI_PROVIDER === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini';
}

function fallbackChatReply(message) {
  const text = message.toLowerCase();
  if (text.includes('emergency') || text.includes('ambulance')) return 'For urgent symptoms, contact emergency services immediately. In Medix, open Emergency to request ambulance support and map nearby hospitals.';
  if (text.includes('hospital') || text.includes('doctor')) return 'Open Hospital Finder, choose a city, compare specialists, and book the slot that fits your care need.';
  if (text.includes('medicine') || text.includes('prescription')) return 'Use Health Records to upload prescriptions, then create medicine reminders from the extracted medicine list.';
  if (text.includes('payment')) return 'Use Appointments to create a test-mode payment order or a sandbox receipt when payment keys are not configured.';
  return 'I can help you navigate Medix features like hospitals, appointments, prescriptions, reminders, payments, and emergency support. I cannot diagnose symptoms.';
}

function loadEnv() {
  ['.env.local', '.env'].forEach((filename) => loadEnvFile(path.join(__dirname, filename)));
}

function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return;

  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const index = trimmed.indexOf('=');
    if (index === -1) return;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = value;
  });
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';

  const filePath = path.normalize(path.join(ROOT, pathname));
  if (!filePath.startsWith(ROOT)) {
    sendText(res, 403, 'Forbidden');
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      sendText(res, 404, 'Not found');
      return;
    }

    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
}

function readJson(req, limit = 2 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > limit) {
        reject(new Error('Request body too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });
  });
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(payload));
}

function sendText(res, status, text) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(text);
}