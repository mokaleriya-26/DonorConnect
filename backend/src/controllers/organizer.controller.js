import { getOrganizerDashboardMetrics } from '../services/organizer.service.js';
import { getOrganizerEvents } from '../services/event.service.js';
import { getEventAttendees } from '../services/registration.service.js';

export const getDashboard = async (req, res, next) => {
  try {
    const data = await getOrganizerDashboardMetrics(req.user.id);
    res.status(200).json({
      success: true,
      ...data
    });
  } catch (err) {
    next(err);
  }
};

export const getEvents = async (req, res, next) => {
  try {
    const events = await getOrganizerEvents(req.user.id);
    res.status(200).json({
      success: true,
      events
    });
  } catch (err) {
    next(err);
  }
};

export const getAttendees = async (req, res, next) => {
  try {
    const attendees = await getEventAttendees(req.params.id, req.user);
    res.status(200).json({
      success: true,
      attendees
    });
  } catch (err) {
    next(err);
  }
};
