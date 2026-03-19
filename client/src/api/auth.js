import api from './client';

export function register(data) {
  return api.post('/auth/register', data);
}

export function login(data) {
  return api.post('/auth/login', data);
}

export function getMe() {
  return api.get('/auth/me');
}
