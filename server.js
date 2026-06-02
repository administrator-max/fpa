require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;
const PIN  = process.env.DASHBOARD_PIN;

// ── PIN TOGGLE ──────────────────────────────────────────────
// PIN is OFF by default. To turn it back ON later, set
// PIN_ENABLED=true (and DASHBOARD_PIN=xxxxxx) in .env — or, on
// Heroku:  heroku config:set PIN_ENABLED=true DASHBOARD_PIN=123456
const PIN_ENABLED = String(process.env.PIN_ENABLED || 'false').toLowerCase() === 'true';

if (PIN_ENABLED && !PIN) {
  console.error('❌  PIN_ENABLED=true but DASHBOARD_PIN is not set. Set it in environment variables.');
  process.exit(1);
}

// ── TRUST PROXY (wajib agar secure cookie bekerja di Heroku) ──
app.set('trust proxy', 1);

// ── MIDDLEWARE ──────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'fpa-fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS-only in prod (Heroku)
    sameSite: 'lax',
    maxAge: 8 * 60 * 60 * 1000  // 8 jam
  }
}));

// ── ANTI-CRAWL HEADERS ──────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-Robots-Tag',           'noindex, nofollow, noarchive, nosnippet, noimageindex');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options',        'DENY');
  res.setHeader('Referrer-Policy',        'no-referrer');
  res.setHeader('Cache-Control',          'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma',                 'no-cache');
  next();
});

// ── AUTH GUARD ──────────────────────────────────────────────
// When PIN is disabled, every request passes straight through.
function requireAuth(req, res, next) {
  if (!PIN_ENABLED) return next();
  if (req.session && req.session.authenticated) return next();
  res.redirect('/pin');
}

// ── ROUTES ──────────────────────────────────────────────────

// robots.txt — block all crawlers
app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send('User-agent: *\nDisallow: /\n');
});

// PIN page (GET)
app.get('/pin', (req, res) => {
  if (!PIN_ENABLED) return res.redirect('/');                 // PIN off → no gate
  if (req.session && req.session.authenticated) return res.redirect('/');
  res.sendFile(path.join(__dirname, 'views', 'pin.html'));
});

// PIN verification (POST)
app.post('/pin', (req, res) => {
  if (!PIN_ENABLED) return res.redirect('/');
  const entered = (req.body.pin || '').trim();
  if (entered === PIN) {
    req.session.authenticated = true;
    return res.redirect('/');
  }
  res.redirect('/pin?error=1');
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect(PIN_ENABLED ? '/pin' : '/'));
});

// Dashboard (protected when PIN is enabled)
app.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Static assets — protected
app.use('/static', requireAuth, express.static(path.join(__dirname, 'static')));

// ── START ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  FPA dashboard running on port ${PORT}  ·  PIN ${PIN_ENABLED ? 'ENABLED' : 'DISABLED'}`);
});
