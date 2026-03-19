import api from './client';

export function generateReport(data) {
  return api.post('/reports', data);
}
