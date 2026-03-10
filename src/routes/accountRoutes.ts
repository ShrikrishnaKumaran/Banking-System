import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import {
  createAccount,
  listAccounts,
  getAccountDetails,
  getAccountBalance,
  getAccountTransactions,
  updateAccountStatus,
} from '../controllers/accountController';
import { validate } from '../middleware/validate';
import { UpdateAccountStatusSchema } from '../validators/accountSchema';

const router = Router();

router.post('/', requireAuth, createAccount); 
router.get('/', requireAuth, listAccounts);

router.get('/:accountId', requireAuth, getAccountDetails);
router.get('/:accountId/balance', requireAuth, getAccountBalance);
router.get('/:accountId/transactions', requireAuth, getAccountTransactions);
router.patch('/:accountId/status', requireAuth, validate(UpdateAccountStatusSchema), updateAccountStatus);

export default router;