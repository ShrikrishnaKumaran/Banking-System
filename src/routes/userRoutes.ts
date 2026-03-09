import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { validate } from '../middleware/validate';
import { RegisterUserSchema, LoginUserSchema } from '../validators/userSchema';
import { register, login, logout } from '../controllers/userController';

const router = Router();

router.post('/register', requireAuth, validate(RegisterUserSchema), register);
router.post('/login', requireAuth, validate(LoginUserSchema), login);
router.post('/logout', requireAuth, logout);

export default router;
