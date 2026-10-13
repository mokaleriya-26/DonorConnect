import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../services/notification.service.js';

export const listNotifications = async (req, res, next) => {
  try {
    const notifications = await getUserNotifications(req.user.id);
    res.status(200).json({
      success: true,
      notifications
    });
  } catch (err) {
    next(err);
  }
};

export const markRead = async (req, res, next) => {
  try {
    const notification = await markNotificationAsRead(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      notification
    });
  } catch (err) {
    next(err);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    await markAllNotificationsAsRead(req.user.id);
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (err) {
    next(err);
  }
};
