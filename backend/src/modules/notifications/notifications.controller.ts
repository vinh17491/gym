import { Request, Response, NextFunction } from 'express';
import { query } from '../../config/database';
import { sendSuccess } from '../../utils/response';

export async function getNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const result = await query(
      `SELECT * FROM Notifications WHERE user_id = @userId ORDER BY created_at DESC`,
      { userId }
    );
    sendSuccess(res, result.recordset);
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    await query(
      `UPDATE Notifications SET is_read = 1 WHERE id = @id AND user_id = @userId`,
      { id, userId }
    );
    sendSuccess(res, null, 'Marked as read');
  } catch (err) {
    next(err);
  }
}

export async function markAllAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    await query(
      `UPDATE Notifications SET is_read = 1 WHERE user_id = @userId`,
      { userId }
    );
    sendSuccess(res, null, 'All marked as read');
  } catch (err) {
    next(err);
  }
}
