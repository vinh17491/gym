import { Request, Response, NextFunction } from 'express';
import { query } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { sendSuccess } from '../../utils/response';
import * as bcrypt from 'bcryptjs';

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const result = await query('SELECT id,email,name,phone,role,referral_code,avatar_url,is_active,created_at FROM Users WHERE id=@id', { id: userId });
    if (result.recordset.length === 0) throw new AppError(404, 'User not found');
    sendSuccess(res, result.recordset[0]);
  } catch (err) { next(err); }
}

export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { name, phone } = req.body;
    const result = await query(
      'UPDATE Users SET name=@name, phone=@phone, updated_at=GETDATE() OUTPUT INSERTED.* WHERE id=@id',
      { id: userId, name, phone: phone || null }
    );
    if (result.recordset.length === 0) throw new AppError(404, 'User not found');
    sendSuccess(res, result.recordset[0], 'Profile updated');
  } catch (err) { next(err); }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { current_password, new_password } = req.body;
    const getUser = await query('SELECT password FROM Users WHERE id=@id', { id: userId });
    if (getUser.recordset.length === 0) throw new AppError(404, 'User not found');

    const stored = getUser.recordset[0].password;
    const valid = await bcrypt.compare(current_password, stored);
    if (!valid) throw new AppError(401, 'Current password is incorrect');

    const hashed = await bcrypt.hash(new_password, 12);
    await query('UPDATE Users SET password=@password, updated_at=GETDATE() WHERE id=@id', { id: userId, password: hashed });
    sendSuccess(res, null, 'Password changed successfully');
  } catch (err) { next(err); }
}

export async function uploadAvatar(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) throw new AppError(400, 'Avatar file required');
    const userId = req.user!.userId;
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await query('UPDATE Users SET avatar_url=@avatarUrl, updated_at=GETDATE() WHERE id=@id', { avatarUrl, id: userId });
    sendSuccess(res, { avatar_url: avatarUrl }, 'Avatar uploaded');
  } catch (err) { next(err); }
}

export async function deleteAvatar(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    await query('UPDATE Users SET avatar_url=NULL, updated_at=GETDATE() WHERE id=@id', { id: userId });
    sendSuccess(res, null, 'Avatar removed');
  } catch (err) { next(err); }
}
