import { Router } from 'express';
import { imageGenerator } from '../controllers/imageController';
import { apiKeyValidator } from '../middleware/apiKeyValidator';

const router = Router();

router.use('/api/', apiKeyValidator);
router.post('/api/image/generator', imageGenerator);

export default router;
