import { Router } from 'express';
import {
  createStory,
  getStories,
  getStoryById,
  getStoriesByCity,
  likeStory,
} from '../controllers/story.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.get('/', optionalAuth, getStories);
router.get('/city/:cityId', optionalAuth, getStoriesByCity);
router.get('/:id', optionalAuth, getStoryById);
router.post('/', authenticate, upload.array('images', 5), createStory);
router.post('/:id/like', authenticate, likeStory);

export default router;
