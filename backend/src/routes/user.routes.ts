import { Router } from 'express';
import { getProfile, savePlace, unsavePlace } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/profile', authenticate, getProfile);
router.post('/saved-places', authenticate, savePlace);
router.delete('/saved-places/:cityId', authenticate, unsavePlace);

export default router;
