import { Request, Response, NextFunction } from 'express';
import { query } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { sendSuccess } from '../../utils/response';
import { UserRole } from '../../types';

export async function getPlans(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await query('SELECT id, name, description, price, duration_days, type, features, sort_order FROM Plans WHERE is_active = 1 ORDER BY sort_order');
    sendSuccess(res, result.recordset);
  } catch (err) { next(err); }
}

export async function createPlan(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, description, price, duration_days, type, features, sort_order } = req.body;
    const result = await query(
      `INSERT INTO Plans (name, description, price, duration_days, type, features, sort_order, is_active)
       OUTPUT INSERTED.id, INSERTED.name, INSERTED.description, INSERTED.price, INSERTED.duration_days, INSERTED.type, INSERTED.features, INSERTED.sort_order, INSERTED.is_active
       VALUES (@name, @description, @price, @duration_days, @type, @features, @sort_order, 1)`,
      { name, description, price, duration_days, type, features: JSON.stringify(features || []), sort_order: sort_order || 99 }
    );
    sendSuccess(res, result.recordset[0], 'Plan created', 201);
  } catch (err) { next(err); }
}

export async function updatePlan(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { name, description, price, duration_days, type, features, sort_order, is_active } = req.body;
    const result = await query(
      `UPDATE Plans SET name=@name, description=@description, price=@price, duration_days=@duration_days, type=@type, features=@features, sort_order=@sort_order, is_active=@is_active, updated_at=GETDATE()
       OUTPUT INSERTED.*
       WHERE id=@id`,
      { id, name, description, price, duration_days, type, features: JSON.stringify(features), sort_order, is_active }
    );
    if (result.recordset.length === 0) throw new AppError(404, 'Plan not found');
    sendSuccess(res, result.recordset[0], 'Plan updated');
  } catch (err) { next(err); }
}

export async function deletePlan(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM Plans WHERE id=@id', { id });
    if (result.rowsAffected[0] === 0) throw new AppError(404, 'Plan not found');
    sendSuccess(res, null, 'Plan deleted');
  } catch (err) { next(err); }
}

export async function subscribe(req: Request, res: Response, next: NextFunction) {
  try {
    const { plan_id } = req.body;
    const userId = req.user!.userId;

    const plan = await query('SELECT * FROM Plans WHERE id=@id AND is_active=1', { id: plan_id });
    if (plan.recordset.length === 0) throw new AppError(404, 'Plan not found');

    const existing = await query("SELECT * FROM Memberships WHERE user_id=@userId AND status IN ('active', 'pending')", { userId });
    if (existing.recordset.length > 0) throw new AppError(409, 'You already have an active membership');

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.recordset[0].duration_days);

    const result = await query(
      `INSERT INTO Memberships (user_id, plan_id, start_date, end_date, status, auto_renew, created_at)
       OUTPUT INSERTED.*
       VALUES (@userId, @plan_id, @startDate, @endDate, 'active', 1, GETDATE())`,
      { userId, plan_id, startDate, endDate }
    );

    await query(
      `INSERT INTO Payments (user_id, plan_id, amount, status, payment_method, created_at)
       VALUES (@userId, @plan_id, @amount, 'pending', 'manual', GETDATE())`,
      { userId, plan_id, amount: plan.recordset[0].price }
    );

    sendSuccess(res, result.recordset[0], 'Membership created', 201);
  } catch (err) { next(err); }
}

export async function cancelMembership(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const result = await query(
      `UPDATE Memberships SET status='cancelled', end_date=GETDATE(), updated_at=GETDATE()
       OUTPUT INSERTED.*
       WHERE user_id=@userId AND status='active'`,
      { userId }
    );
    if (result.recordset.length === 0) throw new AppError(404, 'No active membership');
    sendSuccess(res, result.recordset[0], 'Membership cancelled');
  } catch (err) { next(err); }
}

export async function getMyMembership(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const result = await query(
      `SELECT m.*, p.name, p.price, p.type, p.features, p.duration_days
       FROM Memberships m
       JOIN Plans p ON m.plan_id = p.id
       WHERE m.user_id=@userId AND m.status IN ('active', 'pending')
       ORDER BY m.created_at DESC`,
      { userId }
    );
    sendSuccess(res, result.recordset[0] || null);
  } catch (err) { next(err); }
}
