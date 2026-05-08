import Notification from '../models/Notification.js';

/**
 * Creates a notification silently — never throws, so it won't break the caller.
 */
export const notify = async (userId, type, title, message) => {
  try {
    await Notification.create({ user: userId, type, title, message });
  } catch (_) {
    // silent fail
  }
};
