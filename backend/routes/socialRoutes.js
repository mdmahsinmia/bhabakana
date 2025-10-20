import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { connectPlatform, callbackPlatform } from '../controllers/socialController.js';

const router = express.Router();

router.use(authenticate);
router.post('/connect/:platform', connectPlatform);
router.get('/callback/:platform', callbackPlatform);

export default router;
