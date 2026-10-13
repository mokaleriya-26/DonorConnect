import { Router } from 'express';
import { getDashboard, getEvents, getAttendees } from '../controllers/organizer.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

router.use(authenticate);
router.use(authorize('organizer', 'admin'));

router.get('/dashboard', getDashboard);
router.get('/events', getEvents);
router.get('/events/:id/attendees', getAttendees);

export default router;
