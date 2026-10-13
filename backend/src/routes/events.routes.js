import { Router } from 'express';
import {
  listEvents,
  getEvent,
  create,
  update,
  updateStatus,
  remove
} from '../controllers/events.controller.js';
import { authenticate, optionalAuthenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  createEventSchema,
  updateEventSchema,
  updateEventStatusSchema,
  listEventsQuerySchema
} from '../validators/event.validators.js';

const router = Router();

// Public discovery
router.get('/', validate(listEventsQuerySchema), listEvents);
router.get('/:id', optionalAuthenticate, getEvent);

// Protected organizer/admin actions
router.post('/', authenticate, authorize('organizer', 'admin'), validate(createEventSchema), create);
router.put('/:id', authenticate, authorize('organizer', 'admin'), validate(updateEventSchema), update);
router.patch('/:id/status', authenticate, authorize('organizer', 'admin'), validate(updateEventStatusSchema), updateStatus);
router.delete('/:id', authenticate, authorize('organizer', 'admin'), remove);

export default router;
