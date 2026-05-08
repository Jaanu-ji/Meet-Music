import Notification from '../models/Notification.js';
import { successResponse } from '../utils/apiResponse.js';

export const getNotifications = async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);
  return successResponse(res, notifications);
};

export const markRead = async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true }
  );
  return successResponse(res, {}, 'Marked as read');
};

export const markAllRead = async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  return successResponse(res, {}, 'All marked as read');
};
