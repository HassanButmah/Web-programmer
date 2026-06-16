import { Router } from 'express';
import { getProfile } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, getProfile);

export default router;
