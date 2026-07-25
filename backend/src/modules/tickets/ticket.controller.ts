import { Request, Response, NextFunction } from 'express';
import { query } from '../../config/database';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/errorHandler';

export async function create(req: Request, _res: Response, next: NextFunction) {
  try {
    const r = await query(`INSERT INTO Tickets (user_id, subject, category, priority) OUTPUT INSERTED.* VALUES (@uid, @sub, @cat, @pri)`, {
      uid: req.user!.userId, sub: req.body.subject, cat: req.body.category || 'general', pri: req.body.priority || 'medium'
    });
    const ticket = r.recordset[0];
    await query(`INSERT INTO TicketMessages (ticket_id, sender_id, message) VALUES (@tid, @uid, @msg)`, { tid: ticket.id, uid: req.user!.userId, msg: req.body.description });

    const coachRes = await query('SELECT assigned_coach_id FROM CRMCustomers WHERE user_id = @uid', { uid: req.user!.userId });
    if (coachRes.recordset.length > 0 && coachRes.recordset[0].assigned_coach_id) {
      const coachId = coachRes.recordset[0].assigned_coach_id;
      const userName = req.user!.name || 'A member';
      await query(`INSERT INTO Notifications (user_id, title, message, type) VALUES (@coachId, 'New Support Ticket', @msg, 'ticket_created')`, {
        coachId, msg: `Member ${userName} has submitted a new support ticket: ${req.body.subject}`
      });
    }

    sendSuccess(_res, ticket, 'Ticket created', 201);
  } catch (err) { next(err); }
}

export async function list(req: Request, _res: Response, next: NextFunction) {
  try {
    const { status } = req.query;
    let sql = `SELECT t.*, u.name as user_name, u.email as user_email
               FROM Tickets t
               JOIN Users u ON t.user_id = u.id
               WHERE 1=1`;
    const params: Record<string, unknown> = {};

    if (req.user!.role === 'member') {
      sql += ' AND t.user_id=@uid';
      params.uid = req.user!.userId;
    } else if (req.user!.role === 'coach') {
      sql += ' AND (t.assigned_to=@uid OR t.assigned_to IS NULL OR t.user_id IN (SELECT user_id FROM CRMCustomers WHERE assigned_coach_id=@uid))';
      params.uid = req.user!.userId;
    }

    if (status && status !== 'all') {
      sql += ' AND t.status=@st';
      params.st = status;
    }

    sql += ' ORDER BY t.updated_at DESC';
    const r = await query(sql, params);
    sendSuccess(_res, r.recordset);
  } catch (err) { next(err); }
}

export async function getById(req: Request, _res: Response, next: NextFunction) {
  try {
    const role = req.user!.role;
    let scoped = '';
    const params: Record<string, unknown> = { id: req.params.id, uid: req.user!.userId };

    if (role === 'member') {
      scoped = ' AND t.user_id=@uid';
    } else if (role === 'coach') {
      scoped = ' AND (t.assigned_to=@uid OR t.assigned_to IS NULL OR t.user_id IN (SELECT user_id FROM CRMCustomers WHERE assigned_coach_id=@uid))';
    }

    const r = await query(`SELECT t.*, u.name as user_name, u.email as user_email FROM Tickets t JOIN Users u ON t.user_id = u.id WHERE t.id=@id${scoped}`, params);
    if (r.recordset.length === 0) throw new AppError(404, 'Ticket not found');
    const ticket = r.recordset[0];
    const messages = await query('SELECT tm.*, u.name as sender_name, u.role as sender_role FROM TicketMessages tm JOIN Users u ON tm.sender_id=u.id WHERE tm.ticket_id=@tid AND (tm.is_internal=0 OR @role!=\'member\') ORDER BY tm.created_at', { tid: req.params.id, role: req.user!.role });
    sendSuccess(_res, { ...ticket, messages: messages.recordset });
  } catch (err) { next(err); }
}

export async function reply(req: Request, _res: Response, next: NextFunction) {
  try {
    const role = req.user!.role;
    let scoped = '';
    const params: Record<string, unknown> = { id: req.params.id, uid: req.user!.userId };

    if (role === 'member') {
      scoped = ' AND t.user_id=@uid';
    } else if (role === 'coach') {
      scoped = ' AND (t.assigned_to=@uid OR t.assigned_to IS NULL OR t.user_id IN (SELECT user_id FROM CRMCustomers WHERE assigned_coach_id=@uid))';
    }

    const ticket = await query(`SELECT t.* FROM Tickets t WHERE t.id=@id${scoped}`, params);
    if (ticket.recordset.length === 0) throw new AppError(404, 'Ticket not found');
    const tk = ticket.recordset[0];
    const msg = await query(`INSERT INTO TicketMessages (ticket_id, sender_id, message, is_internal) OUTPUT INSERTED.* VALUES (@tid, @uid, @msg, @int)`, {
      tid: req.params.id, uid: req.user!.userId, msg: req.body.message, int: (req.user!.role === 'admin' || req.user!.role === 'coach') ? Boolean(req.body.is_internal) : false
    });

    // Auto-assign coach to ticket if not assigned
    if (role === 'coach' && !tk.assigned_to) {
      await query('UPDATE Tickets SET assigned_to=@uid WHERE id=@id', { uid: req.user!.userId, id: req.params.id });
    }

    if (tk.status === 'closed') await query('UPDATE Tickets SET status=\'in_progress\', updated_at=GETDATE() WHERE id=@id', { id: req.params.id });
    else await query('UPDATE Tickets SET updated_at=GETDATE() WHERE id=@id', { id: req.params.id });

    if (req.user!.role === 'coach') {
      const coachName = req.user!.name || 'Your coach';
      await query(`INSERT INTO Notifications (user_id, title, message, type) VALUES (@userId, 'New Ticket Reply', @msg, 'ticket_reply')`, {
        userId: tk.user_id, msg: `Coach ${coachName} has replied to your ticket: ${tk.subject}`
      });
    } else if (req.user!.role === 'member') {
      const coachRes = await query('SELECT assigned_coach_id FROM CRMCustomers WHERE user_id = @uid', { uid: req.user!.userId });
      if (coachRes.recordset.length > 0 && coachRes.recordset[0].assigned_coach_id) {
        const coachId = coachRes.recordset[0].assigned_coach_id;
        const userName = req.user!.name || 'A member';
        await query(`INSERT INTO Notifications (user_id, title, message, type) VALUES (@coachId, 'New Ticket Reply', @msg, 'ticket_reply')`, {
          coachId, msg: `Member ${userName} has replied to the ticket: ${tk.subject}`
        });
      }
    }

    sendSuccess(_res, msg.recordset[0], 'Reply sent');
  } catch (err) { next(err); }
}

export async function updateStatus(req: Request, _res: Response, next: NextFunction) {
  try {
    const { status } = req.body;
    let scope = '';
    if (req.user!.role === 'coach') {
      scope = ' AND (assigned_to=@uid OR assigned_to IS NULL OR user_id IN (SELECT user_id FROM CRMCustomers WHERE assigned_coach_id=@uid))';
    }
    const r = await query(`UPDATE Tickets SET status=@st, updated_at=GETDATE() OUTPUT INSERTED.* WHERE id=@id${scope}`, { st: status, id: req.params.id, uid: req.user!.userId });
    if (r.recordset.length === 0) throw new AppError(404, 'Ticket not found');
    sendSuccess(_res, r.recordset[0], 'Status updated');
  } catch (err) { next(err); }
}

