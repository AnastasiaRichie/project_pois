import api from './client';

export function getZones() {
  return api.get('/zones');
}

export function createZone(data) {
  return api.post('/zones', data);
}

export function updateZone(id, data) {
  return api.put(`/zones/${id}`, data);
}

export function deleteZone(id) {
  return api.delete(`/zones/${id}`);
}
