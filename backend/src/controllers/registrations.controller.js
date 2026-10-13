import {
  registerForEvent,
  getAttendeeBookings,
  cancelBooking
} from '../services/registration.service.js';

export const register = async (req, res, next) => {
  try {
    const ticketType = req.body.ticketType || 'General Admission';
    const booking = await registerForEvent(req.params.id, req.user, ticketType);
    res.status(201).json({
      success: true,
      booking,
      message: `Registration confirmed! Your booking reference is ${booking.bookingRef}.`
    });
  } catch (err) {
    next(err);
  }
};

export const getMyRegistrations = async (req, res, next) => {
  try {
    const bookings = await getAttendeeBookings(req.user.id);
    res.status(200).json({
      success: true,
      bookings
    });
  } catch (err) {
    next(err);
  }
};

export const cancelRegistration = async (req, res, next) => {
  try {
    const result = await cancelBooking(req.params.id, req.user);
    res.status(200).json({
      success: true,
      booking: result,
      message: 'Booking cancelled successfully.'
    });
  } catch (err) {
    next(err);
  }
};
