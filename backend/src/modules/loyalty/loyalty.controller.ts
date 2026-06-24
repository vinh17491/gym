import { Request, Response, NextFunction } from 'express';
import { query, executeProc } from '../../config/database';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/errorHandler';

export async function getPoints(req: Request, _res: Response, next: NextFunction) {
  try {
    const r = await query('SELECT * FROM Points WHERE user_id=@uid', { uid: req.user!.userId });
    if (r.recordset.length === 0) {
      await query('INSERT INTO Points (user_id, balance) VALUES (@uid, 0)', { uid: req.user!.userId });
      return sendSuccess(_res, { user_id: req.user!.userId, balance: 0, lifetime_earned: 0, lifetime_spent: 0 });
    }
    sendSuccess(_res, r.recordset[0]);
  } catch (err) { next(err); }
}

export async function getHistory(req: Request, _res: Response, next: NextFunction) {
  try {
    const r = await query('SELECT * FROM PointTransactions WHERE user_id=@uid ORDER BY created_at DESC', { uid: req.user!.userId });
    sendSuccess(_res, r.recordset);
  } catch (err) { next(err); }
}

export async function getRewardsCatalog(_req: Request, _res: Response, next: NextFunction) {
  try {
    const r = await query('SELECT * FROM RewardsCatalog WHERE is_active=1 AND stock>0');
    sendSuccess(_res, r.recordset);
  } catch (err) { next(err); }
}

export async function redeemReward(req: Request, _res: Response, next: NextFunction) {
  try {
    const { reward_id } = req.body;
    const reward = await query('SELECT * FROM RewardsCatalog WHERE id=@id AND is_active=1', { id: reward_id });
    if (reward.recordset.length === 0) throw new AppError(404, 'Reward not found');
    const rw = reward.recordset[0];
    const points = await query('SELECT balance FROM Points WHERE user_id=@uid', { uid: req.user!.userId });
    if (!points.recordset.length || points.recordset[0].balance < rw.points_cost)
      throw new AppError(400, 'Insufficient points');
    await executeProc('sp_SpendPoints', { UserID: req.user!.userId, Points: rw.points_cost, Source: 'redeem', RefID: reward_id, Description: rw.name });
    await query('INSERT INTO RewardRedemptions (user_id, reward_id, points_spent) VALUES (@uid, @rid, @pts)', { uid: req.user!.userId, rid: reward_id, pts: rw.points_cost });
    await query('UPDATE RewardsCatalog SET stock = stock - 1 WHERE id=@id', { id: reward_id });
    sendSuccess(_res, null, 'Reward redeemed', 201);
  } catch (err) { next(err); }
}

export async function loginDailyPoints(req: Request, _res: Response, next: NextFunction) {
  try {
    const today = await query(`SELECT id FROM PointTransactions WHERE user_id=@uid AND source='login' AND CAST(created_at AS DATE)=CAST(GETDATE() AS DATE)`, { uid: req.user!.userId });
    if (today.recordset.length > 0) return sendSuccess(_res, null, 'Already claimed today');
    await executeProc('sp_AddPoints', { UserID: req.user!.userId, Points: 10, Source: 'login', Description: 'Daily login bonus' });
    sendSuccess(_res, { points_earned: 10 }, 'Daily login points claimed');
  } catch (err) { next(err); }
}
