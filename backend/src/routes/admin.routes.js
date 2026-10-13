import { Router } from 'express';
import {
  getDashboard,
  getUsers,
  updateUserStatus,
  getEvents,
  moderateEvent
} from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { updateEventStatusSchema } from '../validators/event.validators.js';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/events', getEvents);
router.patch('/events/:id/status', validate(updateEventStatusSchema), moderateEvent);

export default router;
