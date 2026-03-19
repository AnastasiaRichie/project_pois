import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { config } from '../config.js';

export function getOAuth2Client(refreshToken) {
  const client = new OAuth2Client(
    config.google.clientId,
    config.google.clientSecret,
    config.google.redirectUri
  );
  if (refreshToken) {
    client.setCredentials({ refresh_token: refreshToken });
  }
  return client;
}

export function getServiceAuth() {
  if (!config.google.serviceAccountKey) return null;

  let key;
  try {
    key = JSON.parse(config.google.serviceAccountKey);
  } catch {
    return null;
  }

  return new google.auth.GoogleAuth({
    credentials: key,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets.readonly',
      'https://www.googleapis.com/auth/documents',
      'https://www.googleapis.com/auth/drive',
    ],
  });
}
