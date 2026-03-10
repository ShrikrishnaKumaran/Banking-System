import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/requireAuth';
import { registerUser, loginUser, logoutUser } from '../services/userService';

export const register = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { firebaseUid } = req.user!;

    const user = await registerUser(firebaseUid, req.body);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        legalName: user.legalName,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    next(error);
  }
};

export const login = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { firebaseUid, email } = req.user!;

    const user = await loginUser(firebaseUid, email, req.body);

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        legalName: user.legalName,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    next(error);
  }
};

export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { firebaseUid } = req.user!;

    await logoutUser(firebaseUid);

    res.status(200).json({ message: 'Logged out successfully. All sessions revoked.' });
  } catch (error: any) {
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    next(error);
  }
};
