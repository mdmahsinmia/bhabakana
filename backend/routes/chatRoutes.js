import { Router } from 'express';
import { chat } from '../controllers/chatController';
import { apiKeyValidator } from '../middleware/apiKeyValidator';

const router = Router();

router.use('/api/', apiKeyValidator);
router.post('/api/chat', chat);

export default router;
