import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth(), (req, res) => {
  const zones = db.prepare('SELECT * FROM zones ORDER BY created_at DESC').all();
  res.json(zones);
});

router.post('/', requireAuth(['manager']), (req, res) => {
  const { name, description, polygon } = req.body;
  if (!name || !polygon) return res.status(400).json({ error: 'Name and polygon are required' });

  const result = db.prepare('INSERT INTO zones (name, description, polygon) VALUES (?, ?, ?)').run(
    name, description || '', JSON.stringify(polygon)
  );
  const zone = db.prepare('SELECT * FROM zones WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(zone);
});

router.put('/:id', requireAuth(['manager']), (req, res) => {
  const { id } = req.params;
  const { name, description, polygon } = req.body;

  db.prepare('UPDATE zones SET name = ?, description = ?, polygon = ? WHERE id = ?').run(
    name, description || '', JSON.stringify(polygon), id
  );
  const zone = db.prepare('SELECT * FROM zones WHERE id = ?').get(id);
  if (!zone) return res.status(404).json({ error: 'Zone not found' });
  res.json(zone);
});

router.delete('/:id', requireAuth(['manager']), (req, res) => {
  db.prepare('DELETE FROM zones WHERE id = ?').run(req.params.id);
  res.json({ message: 'Zone deleted' });
});

export default router;
