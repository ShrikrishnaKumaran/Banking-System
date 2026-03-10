import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { validate } from '../middleware/validate';
import { deposit, withdraw } from '../controllers/ledgerController';
import { ExternalDepositSchema, ExternalWithdrawalSchema } from '../validators/ledgerSchema';

const router = Router();

router.post('/deposit', requireAuth, validate(ExternalDepositSchema), deposit);
router.post('/withdraw', requireAuth, validate(ExternalWithdrawalSchema), withdraw);

export default router;
