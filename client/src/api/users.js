import api from './client';

export function getPendingUsers() {
  return api.get('/users/pending');
}

export function approveUser(id) {
  return api.patch(`/users/${id}/approve`);
}

export function rejectUser(id) {
  return api.delete(`/users/${id}`);
}

export function getEmployees() {
  return api.get('/users/employees');
}
