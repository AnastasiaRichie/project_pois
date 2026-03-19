import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/pending', requireAuth(['manager']), (req, res) => {
  const users = db.prepare('SELECT id, email, name, created_at FROM users WHERE role IS NULL').all();
  res.json(users);
});

router.patch('/:id/approve', requireAuth(['manager']), (req, res) => {
  const { id } = req.params;
  const user = db.prepare('SELECT id FROM users WHERE id = ? AND role IS NULL').get(id);
  if (!user) return res.status(404).json({ error: 'User not found or already approved' });

  db.prepare('UPDATE users SET role = ? WHERE id = ?').run('employee', id);
  res.json({ message: 'User approved' });
});

router.delete('/:id', requireAuth(['manager']), (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM users WHERE id = ? AND role IS NULL').run(id);
  res.json({ message: 'User rejected' });
});

router.get('/employees', requireAuth(['manager']), (req, res) => {
  const employees = db.prepare("SELECT id, email, name, created_at FROM users WHERE role = 'employee'").all();
  res.json(employees);
});

export default router;
