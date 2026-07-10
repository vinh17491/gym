import { Router } from 'express';
import { register, login, logout, getMe, refreshToken } from './auth.controller';
import { getMe as getMyProfile, updateMe, changePassword, uploadAvatar, deleteAvatar } from './me.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { registerSchema, loginSchema } from './auth.validation';
import { authLimiter } from '../../middleware/rateLimiter';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import { mkdirSync } from 'fs';

const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');
try { mkdirSync(uploadDir, { recursive: true }); } catch {}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  cb(null, allowed.includes(file.mimetype));
}});

const router = Router();

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().max(20).optional(),
});

const changePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(6).max(100),
});

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', authenticate, logout);
router.post('/refresh', refreshToken);
router.get('/me', authenticate, getMe);

router.put('/me', authenticate, validate(updateProfileSchema), updateMe);
router.post('/password', authenticate, validate(changePasswordSchema), changePassword);
router.post('/avatar', authenticate, upload.single('avatar'), uploadAvatar);
router.delete('/avatar', authenticate, deleteAvatar);

export default router;
