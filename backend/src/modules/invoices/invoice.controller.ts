import { Request, Response, NextFunction } from 'express';
import { query, executeProc } from '../../config/database';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/errorHandler';

export async function list(req: Request, _res: Response, next: NextFunction) {
  try {
    let sql = 'SELECT i.*, u.name as user_name FROM Invoices i JOIN Users u ON i.user_id=u.id WHERE 1=1';
    const params: Record<string, any> = {};
    if (req.user!.role === 'member') { sql += ' AND i.user_id=@uid'; params.uid = req.user!.userId; }
    sql += ' ORDER BY i.created_at DESC';
    const r = await query(sql, params);
    sendSuccess(_res, r.recordset);
  } catch (err) { next(err); }
}

export async function getById(req: Request, _res: Response, next: NextFunction) {
  try {
    const r = await query('SELECT i.*, u.name as user_name, u.email FROM Invoices i JOIN Users u ON i.user_id=u.id WHERE i.id=@id', { id: req.params.id });
    if (r.recordset.length === 0) throw new AppError(404, 'Invoice not found');
    if (req.user!.role === 'member' && r.recordset[0].user_id !== req.user!.userId) throw new AppError(403, 'Forbidden');
    sendSuccess(_res, r.recordset[0]);
  } catch (err) { next(err); }
}

export async function generate(req: Request, _res: Response, next: NextFunction) {
  try {
    const { payment_id, amount, tax, discount } = req.body;
    const r = await executeProc('sp_GenerateInvoice', { UserID: req.user!.userId, PaymentID: payment_id, Amount: amount, Tax: tax || 0, Discount: discount || 0 });
    sendSuccess(_res, r.recordset[0], 'Invoice generated', 201);
  } catch (err) { next(err); }
}

export async function sendEmail(req: Request, _res: Response, next: NextFunction) {
  try {
    const inv = await query('SELECT * FROM Invoices WHERE id=@id', { id: req.params.id });
    if (inv.recordset.length === 0) throw new AppError(404, 'Invoice not found');
    await query('UPDATE Invoices SET email_sent=1 WHERE id=@id', { id: req.params.id });
    sendSuccess(_res, null, 'Invoice email sent');
  } catch (err) { next(err); }
}
