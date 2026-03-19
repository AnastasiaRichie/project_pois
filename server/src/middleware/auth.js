import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export function requireAuth(roles = []) {
  return (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: 'No token provided' });

    const token = header.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
      const payload = jwt.verify(token, config.jwtSecret);
      if (roles.length && !roles.includes(payload.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      req.user = payload;
      next();
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}
