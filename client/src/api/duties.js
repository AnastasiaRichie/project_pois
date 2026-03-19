import api from './client';

export function getDuties() {
  return api.get('/duties');
}

export function createDuty(data) {
  return api.post('/duties', data);
}

export function updateDuty(id, data) {
  return api.put(`/duties/${id}`, data);
}

export function deleteDuty(id) {
  return api.delete(`/duties/${id}`);
}
