import { google } from 'googleapis';
import { getServiceAuth } from './googleAuth.js';

export async function generateReport(zoneName, startDate, endDate, reportData, timeSlots) {
  const auth = getServiceAuth();
  if (!auth) throw new Error('Google service account not configured');

  const docs = google.docs({ version: 'v1', auth });
  const drive = google.drive({ version: 'v3', auth });

  const title = `Parking Report: ${zoneName} (${startDate} - ${endDate})`;
  const doc = await docs.documents.create({ requestBody: { title } });
  const docId = doc.data.documentId;

  const rows = reportData.length + 2;
  const cols = 1 + timeSlots.length * 3;

  const requests = [];

  requests.push({
    insertTable: {
      rows,
      columns: cols,
      location: { index: 1 },
    },
  });

  await docs.documents.batchUpdate({ documentId: docId, requestBody: { requests } });

  const updatedDoc = await docs.documents.get({ documentId: docId });
  const table = updatedDoc.data.body.content.find(el => el.table);
  if (!table) throw new Error('Table not found in document');

  const cellRequests = [];

  function addCellText(rowIndex, colIndex, text) {
    const row = table.table.tableRows[rowIndex];
    const cell = row.tableCells[colIndex];
    const cellIndex = cell.content[0].paragraph.elements[0].startIndex;
    cellRequests.push({
      insertText: {
        location: { index: cellIndex },
        text: String(text),
      },
    });
  }

  addCellText(0, 0, 'Date');
  timeSlots.forEach((slot, i) => {
    addCellText(0, 1 + i * 3, slot.label);
  });

  addCellText(1, 0, '');
  timeSlots.forEach((_, i) => {
    addCellText(1, 1 + i * 3, 'min');
    addCellText(1, 2 + i * 3, 'avg');
    addCellText(1, 3 + i * 3, 'max');
  });

  reportData.forEach((row, rowIdx) => {
    addCellText(rowIdx + 2, 0, row.date);
    row.slots.forEach((stats, slotIdx) => {
      addCellText(rowIdx + 2, 1 + slotIdx * 3, String(stats.min));
      addCellText(rowIdx + 2, 2 + slotIdx * 3, String(stats.avg));
      addCellText(rowIdx + 2, 3 + slotIdx * 3, String(stats.max));
    });
  });

  cellRequests.reverse();
  await docs.documents.batchUpdate({ documentId: docId, requestBody: { requests: cellRequests } });

  await drive.permissions.create({
    fileId: docId,
    requestBody: { role: 'reader', type: 'anyone' },
  });

  return `https://docs.google.com/document/d/${docId}`;
}
