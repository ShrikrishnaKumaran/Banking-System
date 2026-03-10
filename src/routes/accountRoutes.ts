import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import {
  createAccount,
  listAccounts,
  getAccountDetails,
  getAccountBalance,
  getAccountTransactions,
} from '../controllers/accountController';

const router = Router();

router.post('/', requireAuth, createAccount); 
router.get('/', requireAuth, listAccounts);

router.get('/:accountId', requireAuth, getAccountDetails);
router.get('/:accountId/balance', requireAuth, getAccountBalance);
router.get('/:accountId/transactions', requireAuth, getAccountTransactions);

export default router;