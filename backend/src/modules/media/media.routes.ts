import { Router } from 'express';
import { processProductMedia, batchProcessMedia, getMediaStatus } from './media.controller';

const router = Router();

router.get('/status', getMediaStatus);
router.post('/process/:productId', processProductMedia);
router.post('/batch-process', batchProcessMedia);

export default router;
