import { Request, Response, NextFunction } from 'express';
import { query } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { sendSuccess } from '../../utils/response';

let columnsEnsured = false;
async function ensureBookingColumns() {
  if (columnsEnsured) return;
  try {
    await query(`
      IF COL_LENGTH(N'dbo.Bookings', N'coach_notes') IS NULL ALTER TABLE dbo.Bookings ADD coach_notes NVARCHAR(1000) NULL;
      IF COL_LENGTH(N'dbo.Bookings', N'rating') IS NULL ALTER TABLE dbo.Bookings ADD rating INT NULL;
      IF COL_LENGTH(N'dbo.Bookings', N'review') IS NULL ALTER TABLE dbo.Bookings ADD review NVARCHAR(1000) NULL;
      IF COL_LENGTH(N'dbo.Bookings', N'cancel_reason') IS NULL ALTER TABLE dbo.Bookings ADD cancel_reason NVARCHAR(500) NULL;
    `);
    columnsEnsured = true;
  } catch (e) {
    // Non-blocking fallback if query execution is safe
  }
}

export async function getCoaches(_req: Request, res: Response, next: NextFunction) {
  try {
    await ensureBookingColumns();
    const result = await query(
      `SELECT u.id, u.name, u.email, u.phone, u.avatar_url,
              COUNT(DISTINCT c.user_id) as total_members,
              COALESCE(AVG(CAST(r.rating AS FLOAT)), 5.0) as avg_rating,
              (SELECT COUNT(*) FROM Bookings WHERE coach_id = u.id AND status = 'completed') as total_sessions
       FROM Users u
       LEFT JOIN CRMCustomers c ON c.assigned_coach_id = u.id
       LEFT JOIN Bookings r ON r.coach_id = u.id AND r.status = 'completed' AND r.rating IS NOT NULL
       WHERE u.role = 'coach' AND u.is_active = 1
       GROUP BY u.id, u.name, u.email, u.phone, u.avatar_url
       ORDER BY total_sessions DESC`
    );
    sendSuccess(res, result.recordset);
  } catch (err) { next(err); }
}

export async function getCoachAvailability(req: Request, res: Response, next: NextFunction) {
  try {
    await ensureBookingColumns();
    const { id } = req.params;
    const { date } = req.query;
    const coachId = Number(id);
    const targetDate = (date as string) || new Date().toISOString().split('T')[0];

    const booked = await query(
      `SELECT start_time, end_time FROM Bookings
       WHERE coach_id = @coachId AND booking_date = @targetDate AND status IN ('pending', 'confirmed')`,
      { coachId, targetDate }
    );

    const allSlots = ['09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00'];
    const bookedTimes = booked.recordset.map((r: { start_time?: string }) => r.start_time?.substring(0, 5));
    const available = allSlots.filter(s => !bookedTimes.includes(s));

    sendSuccess(res, { date: targetDate, coach_id: coachId, available_slots: available, booked_slots: bookedTimes });
  } catch (err) { next(err); }
}

export async function createBooking(req: Request, res: Response, next: NextFunction) {
  try {
    await ensureBookingColumns();
    const userId = req.user!.userId;
    const { coach_id, booking_date, start_time, end_time, notes } = req.body;
    if (new Date(`${booking_date}T${start_time}:00`).getTime() <= Date.now()) throw new AppError(400, 'Booking must be in the future');
    if (start_time >= end_time) throw new AppError(400, 'End time must be after start time');
    const coach = await query("SELECT id FROM Users WHERE id=@id AND role='coach' AND is_active=1", { id: coach_id });
    if (!coach.recordset[0]) throw new AppError(404, 'Coach not found');

    const conflict = await query(
      `SELECT id FROM Bookings
       WHERE coach_id = @coach_id AND booking_date = @booking_date
       AND start_time = @start_time AND status IN ('pending', 'confirmed')`,
      { coach_id, booking_date, start_time }
    );
    if (conflict.recordset.length > 0) throw new AppError(409, 'Time slot already booked');

    const result = await query(
      `INSERT INTO Bookings (coach_id, member_id, booking_date, start_time, end_time, status, notes, created_at)
       OUTPUT INSERTED.*
       VALUES (@coach_id, @userId, @booking_date, @start_time, @end_time, 'pending', @notes, GETDATE())`,
      { coach_id, userId, booking_date, start_time, end_time, notes: notes || null }
    );

    const customer = await query(`SELECT id FROM CRMCustomers WHERE user_id = @userId`, { userId });
    if (customer.recordset.length === 0) {
      await query(
        `INSERT INTO CRMCustomers (user_id, assigned_coach_id, created_at)
         VALUES (@userId, @coach_id, GETDATE())`,
        { userId, coach_id }
      );
    } else {
      await query(
        `UPDATE CRMCustomers SET assigned_coach_id = @coach_id WHERE user_id = @userId`,
        { userId, coach_id }
      );
    }

    sendSuccess(res, result.recordset[0], 'Booking created', 201);
  } catch (err) { next(err); }
}

export async function getMyBookings(req: Request, res: Response, next: NextFunction) {
  try {
    await ensureBookingColumns();
    const userId = req.user!.userId;
    const role = req.user!.role;
    let result;
    if (role === 'coach') {
      result = await query(
        `SELECT b.*, u.name as member_name, u.email as member_email, c.name as coach_name
         FROM Bookings b
         JOIN Users u ON b.member_id = u.id
         JOIN Users c ON b.coach_id = c.id
         WHERE b.coach_id = @userId
         ORDER BY b.booking_date DESC, b.start_time DESC`,
        { userId }
      );
    } else if (role === 'admin') {
      result = await query(`SELECT b.*, u.name member_name, u.email member_email, c.name coach_name FROM Bookings b JOIN Users u ON b.member_id=u.id JOIN Users c ON b.coach_id=c.id ORDER BY b.booking_date DESC, b.start_time DESC`);
    } else {
      result = await query(
        `SELECT b.*, u.name as member_name, c.name as coach_name, c.email as coach_email, c.phone as coach_phone, c.avatar_url as coach_avatar
         FROM Bookings b
         JOIN Users u ON b.member_id = u.id
         JOIN Users c ON b.coach_id = c.id
         WHERE b.member_id = @userId
         ORDER BY b.booking_date DESC, b.start_time DESC`,
        { userId }
      );
    }
    sendSuccess(res, result.recordset);
  } catch (err) { next(err); }
}

export async function updateBookingStatus(req: Request, res: Response, next: NextFunction) {
  try {
    await ensureBookingColumns();
    const id = Number(req.params.id);
    const { status, coach_notes, cancel_reason } = req.body;
    const role = req.user!.role;
    const current = await query<{ status: string }>('SELECT status FROM Bookings WHERE id=@id', { id });
    if (!current.recordset[0]) throw new AppError(404, 'Booking not found');
    const transitions: Record<string, string[]> = { pending: ['confirmed', 'cancelled'], confirmed: ['completed', 'cancelled', 'no_show'], completed: [], cancelled: [], no_show: [] };
    if (!transitions[current.recordset[0].status]?.includes(status)) throw new AppError(409, 'Invalid booking status transition');
    
    let scope = '';
    if (role === 'coach') scope = ' AND coach_id=@uid';
    else if (role === 'member') { scope = ' AND member_id=@uid'; if (status !== 'cancelled') throw new AppError(403, 'Forbidden'); }
    else if (role !== 'admin') throw new AppError(403, 'Forbidden');

    const result = await query(
      `UPDATE Bookings 
       SET status=@status, 
           coach_notes=COALESCE(@coach_notes, coach_notes), 
           cancel_reason=COALESCE(@cancel_reason, cancel_reason), 
           updated_at=GETDATE() 
       OUTPUT INSERTED.* 
       WHERE id=@id${scope}`,
      { id, status, uid: req.user!.userId, coach_notes: coach_notes || null, cancel_reason: cancel_reason || null }
    );
    if (result.recordset.length === 0) throw new AppError(404, 'Booking not found');
    sendSuccess(res, result.recordset[0], 'Booking updated');
  } catch (err) { next(err); }
}

export async function rateBooking(req: Request, res: Response, next: NextFunction) {
  try {
    await ensureBookingColumns();
    const id = Number(req.params.id);
    const userId = req.user!.userId;
    const { rating, review } = req.body;

    const booking = await query<{ id: number; status: string; member_id: number }>(
      'SELECT id, status, member_id FROM Bookings WHERE id = @id AND member_id = @userId',
      { id, userId }
    );
    if (!booking.recordset[0]) throw new AppError(404, 'Booking not found');
    if (booking.recordset[0].status !== 'completed') throw new AppError(400, 'Only completed sessions can be rated');

    const result = await query(
      `UPDATE Bookings
       SET rating = @rating, review = @review, updated_at = GETDATE()
       OUTPUT INSERTED.*
       WHERE id = @id AND member_id = @userId`,
      { id, userId, rating: Number(rating), review: review || null }
    );

    sendSuccess(res, result.recordset[0], 'Rating submitted successfully');
  } catch (err) { next(err); }
}

export async function getMyCoach(req: Request, res: Response, next: NextFunction) {
  try {
    await ensureBookingColumns();
    const userId = req.user!.userId;

    const coachResult = await query(
      `SELECT u.id, u.name, u.email, u.phone, u.avatar_url,
              COUNT(DISTINCT c.user_id) as total_members,
              COALESCE(AVG(CAST(b.rating AS FLOAT)), 5.0) as avg_rating,
              (SELECT COUNT(*) FROM Bookings WHERE coach_id = u.id AND status = 'completed') as total_sessions
       FROM CRMCustomers c
       JOIN Users u ON c.assigned_coach_id = u.id
       LEFT JOIN Bookings b ON b.coach_id = u.id AND b.status = 'completed' AND b.rating IS NOT NULL
       WHERE c.user_id = @userId
       GROUP BY u.id, u.name, u.email, u.phone, u.avatar_url`,
      { userId }
    );

    const coach = coachResult.recordset[0] || null;
    let upcomingSession = null;
    let latestCompleted = null;

    if (coach) {
      const upcomingRes = await query(
        `SELECT TOP 1 * FROM Bookings
         WHERE member_id = @userId AND coach_id = @coachId AND status IN ('pending', 'confirmed')
         ORDER BY booking_date ASC, start_time ASC`,
        { userId, coachId: coach.id }
      );
      upcomingSession = upcomingRes.recordset[0] || null;

      const completedRes = await query(
        `SELECT TOP 1 * FROM Bookings
         WHERE member_id = @userId AND coach_id = @coachId AND status = 'completed'
         ORDER BY booking_date DESC, start_time DESC`,
        { userId, coachId: coach.id }
      );
      latestCompleted = completedRes.recordset[0] || null;
    }

    sendSuccess(res, {
      coach,
      upcoming_session: upcomingSession,
      latest_completed: latestCompleted
    });
  } catch (err) { next(err); }
}

