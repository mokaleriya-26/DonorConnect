import {
  getPublicEvents,
  getEventById,
  createEvent,
  updateEvent,
  updateEventStatus,
  deleteEvent
} from '../services/event.service.js';

export const listEvents = async (req, res, next) => {
  try {
    const result = await getPublicEvents(req.query);
    res.status(200).json({
      success: true,
      data: result.events,
      pagination: result.pagination
    });
  } catch (err) {
    next(err);
  }
};

export const getEvent = async (req, res, next) => {
  try {
    const event = await getEventById(req.params.id, req.user);
    res.status(200).json({
      success: true,
      event
    });
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const event = await createEvent(req.body, req.user);
    res.status(201).json({
      success: true,
      event,
      message: 'Event created successfully.'
    });
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const event = await updateEvent(req.params.id, req.body, req.user);
    res.status(200).json({
      success: true,
      event,
      message: 'Event updated successfully.'
    });
  } catch (err) {
    next(err);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const event = await updateEventStatus(req.params.id, req.body.status, req.user);
    res.status(200).json({
      success: true,
      event,
      message: `Event status updated to ${req.body.status}.`
    });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    const result = await deleteEvent(req.params.id, req.user);
    res.status(200).json({
      success: true,
      message: 'Event deleted successfully.',
      data: result
    });
  } catch (err) {
    next(err);
  }
};
