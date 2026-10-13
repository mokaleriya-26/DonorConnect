import { Router } from 'express';
import { updateProfile } from '../controllers/users.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema } from '../validators/auth.validators.js';

const router = Router();

router.put('/profile', authenticate, validate(updateProfileSchema), updateProfile);

export default router;
