import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { fetchSheetRecords } from '../services/sheets.js';

const router = Router();

router.post('/sync/:dutyId', requireAuth(), async (req, res) => {
  try {
    const { dutyId } = req.params;
    const duty = db.prepare('SELECT * FROM duties WHERE id = ?').get(dutyId);
    if (!duty) return res.status(404).json({ error: 'Duty not found' });

    if (req.user.role !== 'manager' && duty.employee_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const rows = await fetchSheetRecords(dutyId);
    let inserted = 0;

    const insert = db.prepare(
      'INSERT INTO vehicle_records (duty_id, license_plate, car_brand, parked_at, departed_at) VALUES (?, ?, ?, ?, ?)'
    );

    const existing = db.prepare('SELECT license_plate, parked_at FROM vehicle_records WHERE duty_id = ?').all(dutyId);
    const existingSet = new Set(existing.map(r => `${r.license_plate}_${r.parked_at}`));

    for (const row of rows) {
      const key = `${row.licensePlate}_${row.parkedAt}`;
      if (!existingSet.has(key)) {
        insert.run(dutyId, row.licensePlate, row.carBrand, row.parkedAt, row.departedAt || null);
        inserted++;
      }
    }

    res.json({ message: `Synced ${inserted} new records`, inserted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:dutyId', requireAuth(), (req, res) => {
  const { dutyId } = req.params;
  const records = db.prepare('SELECT * FROM vehicle_records WHERE duty_id = ? ORDER BY parked_at DESC').all(dutyId);
  res.json(records);
});

export default router;
