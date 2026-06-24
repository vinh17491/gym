import { Request, Response, NextFunction } from 'express';
import { query } from '../../config/database';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/errorHandler';

export async function listCustomers(req: Request, _res: Response, next: NextFunction) {
  try {
    const { search, tag, page = 1, limit = 20 } = req.query;
    let sql = `SELECT c.*, u.name, u.email, u.phone, u.created_at as joined_at FROM CRMCustomers c JOIN Users u ON c.user_id=u.id WHERE 1=1`;
    const params: Record<string, any> = {};
    if (search) { sql += ' AND (u.name LIKE @s OR u.email LIKE @s)'; params.s = `%${search}%`; }
    if (tag) { sql += ' AND c.tags LIKE @tag'; params.tag = `%${tag}%`; }
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    sql += ' ORDER BY u.created_at DESC OFFSET @off ROWS FETCH NEXT @lim ROWS ONLY';
    params.off = offset; params.lim = parseInt(limit as string);
    const r = await query(sql, params);
    sendSuccess(_res, r.recordset);
  } catch (err) { next(err); }
}

export async function getCustomer(req: Request, _res: Response, next: NextFunction) {
  try {
    const r = await query(
      `SELECT c.*, u.name, u.email, u.phone, u.role, u.avatar_url, u.created_at as joined_at FROM CRMCustomers c JOIN Users u ON c.user_id=u.id WHERE c.id=@id`, { id: req.params.id });
    if (r.recordset.length === 0) throw new AppError(404, 'Customer not found');
    const notes = await query('SELECT * FROM CRMNotes WHERE customer_id=@id ORDER BY created_at DESC', { id: req.params.id });
    const tasks = await query('SELECT * FROM CRMTasks WHERE customer_id=@id ORDER BY due_date', { id: req.params.id });
    const purchases = await query('SELECT * FROM Payments WHERE user_id=@uid ORDER BY created_at DESC', { uid: r.recordset[0].user_id });
    sendSuccess(_res, { ...r.recordset[0], notes: notes.recordset, tasks: tasks.recordset, purchases: purchases.recordset });
  } catch (err) { next(err); }
}

export async function addNote(req: Request, _res: Response, next: NextFunction) {
  try {
    const r = await query(`INSERT INTO CRMNotes (customer_id, author_id, content, type) OUTPUT INSERTED.* VALUES (@cid, @aid, @content, @type)`, {
      cid: req.params.id, aid: req.user!.userId, content: req.body.content, type: req.body.type || 'note'
    });
    sendSuccess(_res, r.recordset[0], 'Note added', 201);
  } catch (err) { next(err); }
}

export async function createTask(req: Request, _res: Response, next: NextFunction) {
  try {
    const r = await query(`INSERT INTO CRMTasks (customer_id, assigned_to, title, description, due_date) OUTPUT INSERTED.* VALUES (@cid, @aid, @title, @desc, @due)`, {
      cid: req.params.id, aid: req.body.assigned_to || req.user!.userId,
      title: req.body.title, desc: req.body.description || null, due: req.body.due_date
    });
    sendSuccess(_res, r.recordset[0], 'Task created', 201);
  } catch (err) { next(err); }
}
