import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { validate } from '../middleware/validate';
import { transfer } from '../controllers/transactionController';
import { TransferSchema } from '../validators/transactionSchema';

const router = Router();

router.post('/transfer', requireAuth, validate(TransferSchema), transfer);

export default router;
