import api from './client';

export function syncRecords(dutyId) {
  return api.post(`/records/sync/${dutyId}`);
}

export function getRecords(dutyId) {
  return api.get(`/records/${dutyId}`);
}
