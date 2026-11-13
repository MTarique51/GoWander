import Notification from '../models/Notification.js';

export async function notify(recipient, title, message, type = 'system', link = '') {
  if (!recipient) return;
  await Notification.create({ recipient, title, message, type, link });
}
