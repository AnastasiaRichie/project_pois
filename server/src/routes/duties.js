import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { createCalendarEvent, deleteCalendarEvent } from '../services/calendar.js';

const router = Router();

router.get('/', requireAuth(), (req, res) => {
  let duties;
  if (req.user.role === 'manager') {
    duties = db.prepare(`
      SELECT d.*, u.name as employee_name, z.name as zone_name
      FROM duties d
      JOIN users u ON d.employee_id = u.id
      JOIN zones z ON d.zone_id = z.id
      ORDER BY d.date DESC
    `).all();
  } else {
    duties = db.prepare(`
      SELECT d.*, u.name as employee_name, z.name as zone_name
      FROM duties d
      JOIN users u ON d.employee_id = u.id
      JOIN zones z ON d.zone_id = z.id
      WHERE d.employee_id = ?
      ORDER BY d.date DESC
    `).all(req.user.id);
  }
  res.json(duties);
});

router.post('/', requireAuth(['manager']), async (req, res) => {
  try {
    const { employee_id, zone_id, date, start_time, end_time } = req.body;
    if (!employee_id || !zone_id || !date || !start_time || !end_time) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const result = db.prepare(
      'INSERT INTO duties (employee_id, zone_id, date, start_time, end_time) VALUES (?, ?, ?, ?, ?)'
    ).run(employee_id, zone_id, date, start_time, end_time);

    const duty = db.prepare(`
      SELECT d.*, z.name as zone_name FROM duties d
      JOIN zones z ON d.zone_id = z.id WHERE d.id = ?
    `).get(result.lastInsertRowid);

    const employee = db.prepare('SELECT * FROM users WHERE id = ?').get(employee_id);
    if (employee.google_refresh_token) {
      try {
        const eventId = await createCalendarEvent(employee.google_refresh_token, {
          summary: `Duty at ${duty.zone_name}`,
          date: duty.date,
          startTime: duty.start_time,
          endTime: duty.end_time,
        });
        if (eventId) {
          db.prepare('UPDATE duties SET calendar_event_id = ? WHERE id = ?').run(eventId, duty.id);
          duty.calendar_event_id = eventId;
        }
      } catch (calErr) {
        console.error('Calendar event creation failed:', calErr.message);
      }
    }

    res.status(201).json(duty);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAuth(['manager']), (req, res) => {
  const { id } = req.params;
  const { employee_id, zone_id, date, start_time, end_time, status } = req.body;

  db.prepare(
    'UPDATE duties SET employee_id = ?, zone_id = ?, date = ?, start_time = ?, end_time = ?, status = ? WHERE id = ?'
  ).run(employee_id, zone_id, date, start_time, end_time, status || 'scheduled', id);

  const duty = db.prepare('SELECT * FROM duties WHERE id = ?').get(id);
  if (!duty) return res.status(404).json({ error: 'Duty not found' });
  res.json(duty);
});

router.delete('/:id', requireAuth(['manager']), async (req, res) => {
  const duty = db.prepare('SELECT * FROM duties WHERE id = ?').get(req.params.id);
  if (!duty) return res.status(404).json({ error: 'Duty not found' });

  if (duty.calendar_event_id) {
    const employee = db.prepare('SELECT * FROM users WHERE id = ?').get(duty.employee_id);
    if (employee.google_refresh_token) {
      try {
        await deleteCalendarEvent(employee.google_refresh_token, duty.calendar_event_id);
      } catch (calErr) {
        console.error('Calendar event deletion failed:', calErr.message);
      }
    }
  }

  db.prepare('DELETE FROM duties WHERE id = ?').run(req.params.id);
  res.json({ message: 'Duty deleted' });
});

export default router;
