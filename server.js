const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

loadEnv();

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const DB_PATH = path.join(DATA_DIR, 'medix-db.json');
const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || 'medix-local-development-secret';

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

const DEFAULT_DB = {
  users: [
    {
      id: 'user-demo',
      name: 'Aarav Mehta',
      email: 'aarav.mehta@example.com',
      passwordHash: hashPassword('password123'),
      role: 'Patient',
      createdAt: new Date().toISOString(),
    },
  ],
  sessions: {},
  appointments: [],
  prescriptions: [],
  reminders: [],
  payments: [],
  ambulanceRequests: [],
  messages: [],
};

ensureDb();

const server = http.createServer(async (req, res) => {
  try {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }
    
    if (req.url.startsWith('/api/')) {
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
  const method = req.method.toUpperCase();

  if (method === 'POST' && url.pathname === '/api/auth/signup') return signup(req, res);
  if (method === 'POST' && url.pathname === '/api/auth/login') return login(req, res);
  if (method === 'POST' && url.pathname === '/api/auth/logout') return logout(req, res);
  if (method === 'GET' && url.pathname === '/api/me') return me(req, res);
  if (method === 'GET' && url.pathname === '/api/appointments') return getAppointments(req, res);
  if (method === 'POST' && url.pathname === '/api/appointments') return saveAppointmentApi(req, res);
  if (method === 'DELETE' && /^\/api\/appointments\/[^/]+$/.test(url.pathname)) {
    const id = decodeURIComponent(url.pathname.split('/')[3]);
    return deleteAppointmentApi(req, res, id);
  }
  if (method === 'GET' && url.pathname === '/api/reminders') return getReminders(req, res);
  if (method === 'POST' && url.pathname === '/api/reminders') return saveReminderApi(req, res);
  if (method === 'DELETE' && /^\/api\/reminders\/[^/]+$/.test(url.pathname)) {
    const id = decodeURIComponent(url.pathname.split('/')[3]);
    return deleteReminderApi(req, res, id);
  }
  if (method === 'POST' && url.pathname === '/api/chat') return chat(req, res);
  if (method === 'POST' && url.pathname === '/api/prescriptions/upload') return uploadPrescription(req, res);
  if (method === 'POST' && /^\/api\/appointments\/[^/]+\/reminders$/.test(url.pathname)) {
    const id = decodeURIComponent(url.pathname.split('/')[3]);
    return sendAppointmentReminder(req, res, id);
  }
  if (method === 'POST' && url.pathname === '/api/payments/order') return createPaymentOrder(req, res);
  if (method === 'POST' && url.pathname === '/api/payments/verify') return verifyPayment(req, res);
  if (method === 'POST' && url.pathname === '/api/ambulance/request') return ambulanceRequest(req, res);
  if (method === 'GET' && url.pathname === '/api/analytics') return analytics(req, res);

  sendJson(res, 404, { ok: false, error: 'API route not found' });
}

async function signup(req, res) {
  const body = await readJson(req);
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!name || !email || password.length < 6) {
    return sendJson(res, 400, { ok: false, error: 'Name, valid email, and a 6+ character password are required.' });
  }

  const db = readDb();
  if (db.users.some((user) => user.email === email)) {
    return sendJson(res, 409, { ok: false, error: 'Email already registered.' });
  }

  const user = {
    id: createId('user'),
    name,
    email,
    passwordHash: hashPassword(password),
    role: 'Patient',
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  const token = createSession(db, user.id);
  writeDb(db);
  sendJson(res, 201, { ok: true, token, user: publicUser(user) });
}

async function login(req, res) {
  const body = await readJson(req);
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const db = readDb();
  const user = db.users.find((entry) => entry.email === email);
  if (!user || user.passwordHash !== hashPassword(password)) {
    return sendJson(res, 401, { ok: false, error: 'Invalid email or password.' });
  }
  const token = createSession(db, user.id);
  writeDb(db);
  sendJson(res, 200, { ok: true, token, user: publicUser(user) });
}

async function logout(req, res) {
  const token = bearerToken(req);
  const db = readDb();
  if (token) delete db.sessions[token];
  writeDb(db);
  sendJson(res, 200, { ok: true });
}

async function me(req, res) {
  const current = currentUser(req);
  if (!current) return sendJson(res, 401, { ok: false, error: 'Not signed in.' });
  sendJson(res, 200, { ok: true, user: publicUser(current.user) });
}

async function getAppointments(req, res) {
  const db = readDb();
  sendJson(res, 200, { ok: true, appointments: db.appointments });
}

async function saveAppointmentApi(req, res) {
  const body = await readJson(req);
  const db = readDb();
  const appointment = {
    id: createId('appt'),
    status: body.status || 'Booked',
    paymentStatus: body.paymentStatus || 'Pending',
    ...body,
    createdAt: new Date().toISOString(),
  };
  db.appointments.unshift(appointment);
  writeDb(db);
  sendJson(res, 201, { ok: true, appointment });
}

async function deleteAppointmentApi(req, res, appointmentId) {
  const db = readDb();
  const index = db.appointments.findIndex((appt) => appt.id === appointmentId);
  if (index === -1) return sendJson(res, 404, { ok: false, error: 'Appointment not found.' });
  db.appointments.splice(index, 1);
  writeDb(db);
  sendJson(res, 200, { ok: true, message: 'Appointment deleted.' });
}

async function getReminders(req, res) {
  const db = readDb();
  sendJson(res, 200, { ok: true, reminders: db.reminders });
}

async function saveReminderApi(req, res) {
  const body = await readJson(req);
  const db = readDb();
  const reminder = {
    id: createId('rem'),
    active: body.active !== false ? true : false,
    ...body,
    createdAt: new Date().toISOString(),
  };
  db.reminders.unshift(reminder);
  writeDb(db);
  sendJson(res, 201, { ok: true, reminder });
}

async function deleteReminderApi(req, res, reminderId) {
  const db = readDb();
  const index = db.reminders.findIndex((rem) => rem.id === reminderId);
  if (index === -1) return sendJson(res, 404, { ok: false, error: 'Reminder not found.' });
  db.reminders.splice(index, 1);
  writeDb(db);
  sendJson(res, 200, { ok: true, message: 'Reminder deleted.' });
}

async function chat(req, res) {
  const body = await readJson(req);
  const message = String(body.message || '').trim();
  if (!message) return sendJson(res, 400, { ok: false, error: 'Message is required.' });

  let reply = fallbackChatReply(message);
  let provider = 'local';
  if (process.env.OPENAI_API_KEY) {
    try {
      reply = await openAiChat(message);
      provider = 'openai';
    } catch (error) {
      reply = `${fallbackChatReply(message)} API note: ${error.message}`;
      provider = 'local-fallback';
    }
  }

  const db = readDb();
  db.messages.unshift({ id: createId('msg'), message, reply, provider, createdAt: new Date().toISOString() });
  db.messages = db.messages.slice(0, 100);
  writeDb(db);
  sendJson(res, 200, { ok: true, reply, provider });
}

async function uploadPrescription(req, res) {
  const body = await readJson(req, 12 * 1024 * 1024);
  const filename = String(body.filename || 'uploaded-prescription');
  const dataUrl = String(body.dataUrl || '');
  const manualText = String(body.text || '');
  if (!dataUrl && !manualText) return sendJson(res, 400, { ok: false, error: 'Upload a file or enter prescription text.' });

  let extracted = localPrescriptionExtract(manualText || filename);
  let provider = 'local';
  if (process.env.OPENAI_API_KEY && dataUrl) {
    try {
      extracted = await openAiPrescriptionExtract(dataUrl);
      provider = 'openai-vision';
    } catch (error) {
      extracted.notes = `${extracted.notes} Vision extraction fallback used: ${error.message}`;
      provider = 'local-fallback';
    }
  }

  const db = readDb();
  const prescription = {
    id: createId('rx'),
    filename,
    provider,
    ...extracted,
    createdAt: new Date().toISOString(),
  };
  db.prescriptions.unshift(prescription);
  writeDb(db);
  sendJson(res, 200, { ok: true, prescription });
}

async function sendAppointmentReminder(req, res, appointmentId) {
  const body = await readJson(req);
  const reminder = {
    id: createId('reminder'),
    appointmentId,
    doctorName: body.doctorName || 'Doctor',
    patientName: body.patientName || 'Patient',
    email: body.email || '',
    phone: body.phone || '',
    message: body.message || `Reminder: your Medix appointment with ${body.doctorName || 'your doctor'} is scheduled soon.`,
    channels: {
      sms: Boolean(body.sms),
      email: Boolean(body.emailReminder),
    },
    delivery: [],
    createdAt: new Date().toISOString(),
  };

  if (reminder.channels.sms) reminder.delivery.push(await sendSms(reminder.phone, reminder.message));
  if (reminder.channels.email) reminder.delivery.push(await sendEmail(reminder.email, 'Medix appointment reminder', reminder.message));

  const db = readDb();
  db.reminders.unshift(reminder);
  writeDb(db);
  sendJson(res, 200, { ok: true, reminder });
}

async function createPaymentOrder(req, res) {
  const body = await readJson(req);
  const amount = Number(body.amount || 0);
  const doctorName = String(body.doctorName || 'Medix consultation');
  if (!amount || amount < 1) return sendJson(res, 400, { ok: false, error: 'Valid amount is required.' });

  const payment = {
    id: createId('pay'),
    orderId: createId('order'),
    appointmentId: body.appointmentId || '',
    doctorName,
    amount,
    currency: 'INR',
    provider: hasRazorpay() ? 'razorpay-test' : 'sandbox',
    status: hasRazorpay() ? 'Order created' : 'Sandbox receipt ready',
    createdAt: new Date().toISOString(),
  };

  const db = readDb();
  db.payments.unshift(payment);
  writeDb(db);
  sendJson(res, 200, { ok: true, payment, keyId: process.env.RAZORPAY_KEY_ID || '' });
}

async function verifyPayment(req, res) {
  const body = await readJson(req);
  const db = readDb();
  const payment = db.payments.find((item) => item.id === body.paymentId || item.orderId === body.orderId);
  if (!payment) return sendJson(res, 404, { ok: false, error: 'Payment not found.' });
  payment.status = 'Paid';
  payment.receiptId = createId('receipt');
  payment.verifiedAt = new Date().toISOString();
  writeDb(db);
  sendJson(res, 200, { ok: true, payment });
}

async function ambulanceRequest(req, res) {
  const body = await readJson(req);
  const request = {
    id: createId('amb'),
    patientName: body.patientName || 'Patient',
    pickup: body.pickup || '',
    condition: body.condition || '',
    city: body.city || 'Delhi',
    status: 'Dispatch request recorded',
    eta: '8 min',
    mapUrl: `https://www.google.com/maps/search/emergency+hospitals+near+${encodeURIComponent(body.pickup || body.city || 'Delhi')}`,
    createdAt: new Date().toISOString(),
  };
  const db = readDb();
  db.ambulanceRequests.unshift(request);
  writeDb(db);
  sendJson(res, 201, { ok: true, request });
}

async function analytics(req, res) {
  const db = readDb();
  sendJson(res, 200, {
    ok: true,
    analytics: {
      serverUsers: db.users.length,
      prescriptionsUploaded: db.prescriptions.length,
      remindersSent: db.reminders.length,
      payments: db.payments.length,
      paidPayments: db.payments.filter((payment) => payment.status === 'Paid').length,
      ambulanceRequests: db.ambulanceRequests.length,
      chatbotMessages: db.messages.length,
      lastUpdated: new Date().toISOString(),
    },
  });
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.normalize(path.join(ROOT, pathname));
  if (!filePath.startsWith(ROOT) || filePath.includes(`${path.sep}.git${path.sep}`) || filePath.includes(`${path.sep}data${path.sep}`)) {
    return sendText(res, 403, 'Forbidden');
  }
  fs.readFile(filePath, (error, data) => {
    if (error) return sendText(res, 404, 'Not found');
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
}

function loadEnv() {
  const envPath = path.join(__dirname, '.env');
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

function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_PATH)) writeDb(DEFAULT_DB);
}

function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(`${JWT_SECRET}:${password}`).digest('hex');
}

function createSession(db, userId) {
  const token = crypto.randomBytes(32).toString('hex');
  db.sessions[token] = { userId, createdAt: new Date().toISOString() };
  return token;
}

function currentUser(req) {
  const token = bearerToken(req);
  if (!token) return null;
  const db = readDb();
  const session = db.sessions[token];
  if (!session) return null;
  const user = db.users.find((entry) => entry.id === session.userId);
  return user ? { db, token, session, user } : null;
}

function bearerToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : '';
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role || 'Patient' };
}

function createId(prefix) {
  return `${prefix}-${crypto.randomBytes(5).toString('hex')}`;
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

function fallbackChatReply(message) {
  const text = message.toLowerCase();
  if (text.includes('emergency') || text.includes('ambulance')) return 'For urgent symptoms, contact emergency services immediately. In Medix, open Emergency to request ambulance support and map nearby hospitals.';
  if (text.includes('hospital') || text.includes('doctor')) return 'Open Hospital Finder, choose a city, compare specialists, and book the slot that fits your care need.';
  if (text.includes('medicine') || text.includes('prescription')) return 'Use Health Records to upload prescriptions, then create medicine reminders from the extracted medicine list.';
  if (text.includes('payment')) return 'Use Appointments to create a test-mode payment order or a sandbox receipt when payment keys are not configured.';
  return 'I can help you navigate Medix features like hospitals, appointments, prescriptions, reminders, payments, and emergency support. I cannot diagnose symptoms.';
}

async function openAiChat(message) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
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
  if (!response.ok) throw new Error(`OpenAI chat failed (${response.status})`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || fallbackChatReply(message);
}

async function openAiPrescriptionExtract(dataUrl) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Extract prescription details as compact JSON with title, doctor, date, medicines, notes. medicines should be a semicolon-separated list with dosage/timing when visible. If uncertain, say so in notes.',
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract medicine reminder details from this prescription or receipt image.' },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 500,
    }),
  });
  if (!response.ok) throw new Error(`OpenAI vision failed (${response.status})`);
  const data = await response.json();
  return normalizePrescription(JSON.parse(data.choices?.[0]?.message?.content || '{}'));
}

function localPrescriptionExtract(text) {
  return normalizePrescription({
    title: 'Uploaded prescription',
    doctor: 'Doctor not detected',
    date: new Date().toISOString().slice(0, 10),
    medicines: text && text !== 'uploaded-prescription' ? text : 'Medicine details need review',
    notes: 'Local fallback extraction. Configure OPENAI_API_KEY for image-based extraction.',
  });
}

function normalizePrescription(input) {
  return {
    title: String(input.title || 'Uploaded prescription').slice(0, 120),
    doctor: String(input.doctor || 'Doctor not detected').slice(0, 120),
    date: String(input.date || new Date().toISOString().slice(0, 10)).slice(0, 40),
    medicines: Array.isArray(input.medicines) ? input.medicines.join('; ') : String(input.medicines || 'Medicine details need review'),
    notes: String(input.notes || 'Review extracted details before using them for reminders.').slice(0, 500),
  };
}

async function sendSms(phone, message) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_FROM_NUMBER) {
    return { channel: 'sms', ok: true, provider: 'sandbox', detail: 'Twilio not configured; SMS simulated.' };
  }
  const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
  const params = new URLSearchParams({ To: phone, From: process.env.TWILIO_FROM_NUMBER, Body: message });
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });
  return { channel: 'sms', ok: response.ok, provider: 'twilio', detail: response.ok ? 'Sent' : `Twilio status ${response.status}` };
}

async function sendEmail(email, subject, message) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return { channel: 'email', ok: true, provider: 'sandbox', detail: 'SMTP not configured; email simulated.' };
  }
  return {
    channel: 'email',
    ok: true,
    provider: 'smtp-configured',
    detail: `SMTP credentials are configured for ${email}; install Nodemailer to send real email.`,
    subject,
    preview: message,
  };
}

function hasRazorpay() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}
