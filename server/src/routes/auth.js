import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import db from '../db.js';
import { config } from '../config.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    config.jwtSecret,
    { expiresIn: '24h' }
  );
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)').run(name, email, hash);
    res.json({ message: 'Registration successful. Wait for manager approval.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (!user.password_hash) return res.status(401).json({ error: 'Use Google login' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    if (!user.role) return res.status(403).json({ error: 'Account pending approval' });

    res.json({ token: signToken(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/google', (req, res) => {
  const client = new OAuth2Client(
    config.google.clientId,
    config.google.clientSecret,
    config.google.redirectUri
  );
  const url = client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'openid',
      'email',
      'profile',
      'https://www.googleapis.com/auth/calendar',
    ],
  });
  res.redirect(url);
});

router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: 'No code provided' });

    const client = new OAuth2Client(
      config.google.clientId,
      config.google.clientSecret,
      config.google.redirectUri
    );
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: config.google.clientId,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    let user = db.prepare('SELECT * FROM users WHERE google_id = ?').get(googleId);
    if (!user) {
      user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (user) {
        db.prepare('UPDATE users SET google_id = ?, google_refresh_token = ? WHERE id = ?')
          .run(googleId, tokens.refresh_token || null, user.id);
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
      } else {
        db.prepare(
          'INSERT INTO users (email, name, google_id, google_refresh_token) VALUES (?, ?, ?, ?)'
        ).run(email, name, googleId, tokens.refresh_token || null);
        user = db.prepare('SELECT * FROM users WHERE google_id = ?').get(googleId);
      }
    } else if (tokens.refresh_token) {
      db.prepare('UPDATE users SET google_refresh_token = ? WHERE id = ?')
        .run(tokens.refresh_token, user.id);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
    }

    if (!user.role) {
      return res.redirect(`${config.clientUrl}/login?pending=true`);
    }

    const token = signToken(user);
    res.redirect(`${config.clientUrl}/login?token=${token}`);
  } catch (err) {
    console.error('Google callback error:', err);
    res.redirect(`${config.clientUrl}/login?error=google_auth_failed`);
  }
});

router.get('/me', requireAuth(), (req, res) => {
  const user = db.prepare('SELECT id, email, name, role, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

export default router;
