import { Router } from 'express';
import { register, getMyRegistrations, cancelRegistration } from '../controllers/registrations.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { registerForEventSchema } from '../validators/category.validators.js';

const router = Router();

// Protected attendee endpoints
router.post('/events/:id/register', authenticate, validate(registerForEventSchema), register);
router.get('/me', authenticate, getMyRegistrations);
router.delete('/:id', authenticate, cancelRegistration);

export default router;
