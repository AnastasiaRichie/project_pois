import 'dotenv/config';

export const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback',
    sheetId: process.env.GOOGLE_SHEET_ID,
    formUrl: process.env.GOOGLE_FORM_URL,
    serviceAccountKey: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
  },
};
