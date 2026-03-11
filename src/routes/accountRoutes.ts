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

router.get('/:accountNumber', requireAuth, getAccountDetails);
router.get('/:accountNumber/balance', requireAuth, getAccountBalance);
router.get('/:accountNumber/transactions', requireAuth, getAccountTransactions);
router.patch('/:accountNumber/status', requireAuth, validate(UpdateAccountStatusSchema), updateAccountStatus);

export default router;