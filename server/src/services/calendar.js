import { google } from 'googleapis';
import { getOAuth2Client } from './googleAuth.js';

export async function createCalendarEvent(refreshToken, { summary, date, startTime, endTime }) {
  const auth = getOAuth2Client(refreshToken);
  const calendar = google.calendar({ version: 'v3', auth });

  const event = {
    summary,
    start: {
      dateTime: `${date}T${startTime}:00`,
      timeZone: 'Europe/Moscow',
    },
    end: {
      dateTime: `${date}T${endTime}:00`,
      timeZone: 'Europe/Moscow',
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 1440 },
        { method: 'popup', minutes: 60 },
      ],
    },
  };

  const result = await calendar.events.insert({
    calendarId: 'primary',
    resource: event,
  });

  return result.data.id;
}

export async function deleteCalendarEvent(refreshToken, eventId) {
  const auth = getOAuth2Client(refreshToken);
  const calendar = google.calendar({ version: 'v3', auth });

  await calendar.events.delete({
    calendarId: 'primary',
    eventId,
  });
}
