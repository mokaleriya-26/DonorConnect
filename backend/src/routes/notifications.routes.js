import { Router } from 'express';
import { listNotifications, markRead, markAllRead } from '../controllers/notifications.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/', listNotifications);
router.patch('/:id/read', markRead);
router.post('/read-all', markAllRead);

export default router;
