import { google } from 'googleapis';
import { getServiceAuth } from './googleAuth.js';
import { config } from '../config.js';

export async function fetchSheetRecords(dutyId) {
  const auth = getServiceAuth();
  if (!auth) throw new Error('Google service account not configured');

  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: config.google.sheetId,
    range: 'Sheet1!A:F',
  });

  const rows = res.data.values || [];
  if (rows.length <= 1) return [];

  const records = [];
  for (let i = 1; i < rows.length; i++) {
    const [timestamp, formDutyId, licensePlate, carBrand, parkedAt, departedAt] = rows[i];
    if (String(formDutyId) === String(dutyId)) {
      records.push({ licensePlate, carBrand, parkedAt, departedAt });
    }
  }

  return records;
}
