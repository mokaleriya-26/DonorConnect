import { Router } from 'express';
import {
  listCategories,
  getCategory,
  getCategoryEvents,
  create,
  update,
  toggleActive,
  remove
} from '../controllers/categories.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createCategorySchema, updateCategorySchema } from '../validators/category.validators.js';

const router = Router();

// Public routes
router.get('/', listCategories);
router.get('/:slug', getCategory);
router.get('/:slug/events', getCategoryEvents);

// Admin-only management
router.post('/', authenticate, authorize('admin'), validate(createCategorySchema), create);
router.put('/:id', authenticate, authorize('admin'), validate(updateCategorySchema), update);
router.patch('/:id/toggle-active', authenticate, authorize('admin'), toggleActive);
router.delete('/:id', authenticate, authorize('admin'), remove);

export default router;
