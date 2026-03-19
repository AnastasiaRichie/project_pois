import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { generateReport } from '../services/docs.js';

const router = Router();

const TIME_SLOTS = [
  { label: '06:00-10:00', startHour: 6, endHour: 10 },
  { label: '10:00-14:00', startHour: 10, endHour: 14 },
  { label: '14:00-18:00', startHour: 14, endHour: 18 },
  { label: '18:00-22:00', startHour: 18, endHour: 22 },
];

function computeStats(records, slotStartHour, slotEndHour) {
  const matching = records.filter(r => {
    if (!r.parked_at || !r.departed_at) return false;
    const parkedHour = new Date(r.parked_at).getHours();
    return parkedHour >= slotStartHour && parkedHour < slotEndHour;
  });

  if (matching.length === 0) return { min: '-', avg: '-', max: '-' };

  const durations = matching.map(r => {
    const parked = new Date(r.parked_at).getTime();
    const departed = new Date(r.departed_at).getTime();
    return Math.round((departed - parked) / 60000);
  });

  return {
    min: Math.min(...durations),
    avg: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
    max: Math.max(...durations),
  };
}

router.post('/', requireAuth(['manager']), async (req, res) => {
  try {
    const { zoneId, startDate, endDate } = req.body;
    if (!zoneId || !startDate || !endDate) {
      return res.status(400).json({ error: 'zoneId, startDate, and endDate are required' });
    }

    const zone = db.prepare('SELECT * FROM zones WHERE id = ?').get(zoneId);
    if (!zone) return res.status(404).json({ error: 'Zone not found' });

    const records = db.prepare(`
      SELECT vr.* FROM vehicle_records vr
      JOIN duties d ON vr.duty_id = d.id
      WHERE d.zone_id = ? AND d.date >= ? AND d.date <= ?
    `).all(zoneId, startDate, endDate);

    const start = new Date(startDate);
    const end = new Date(endDate);
    const reportData = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayRecords = records.filter(r => r.parked_at && r.parked_at.startsWith(dateStr));

      const row = { date: dateStr, slots: [] };
      for (const slot of TIME_SLOTS) {
        row.slots.push(computeStats(dayRecords, slot.startHour, slot.endHour));
      }
      reportData.push(row);
    }

    const docUrl = await generateReport(zone.name, startDate, endDate, reportData, TIME_SLOTS);
    res.json({ url: docUrl, data: reportData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
