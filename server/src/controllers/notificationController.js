import Notification from '../models/Notification.js';

export async function getNotifications(req, res) {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({
    notifications,
    unreadCount: await Notification.countDocuments({ recipient: req.user._id, readAt: null }),
  });
}

export async function markRead(req, res) {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { readAt: new Date() },
    { new: true },
  );
  if (!notification) return res.status(404).json({ message: 'Notification not found.' });
  res.json({ notification });
}
