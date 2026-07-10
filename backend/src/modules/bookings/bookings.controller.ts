import { Request, Response, NextFunction } from 'express';
import { query } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { sendSuccess } from '../../utils/response';

export async function getCoaches(_req: Request, res: Response, next: NextFunction) {
  try {
    const result = await query(
      `SELECT u.id, u.name, u.email, u.avatar_url,
              COUNT(DISTINCT c.user_id) as total_members,
              COALESCE(AVG(CAST(r.rating AS FLOAT)), 0) as avg_rating,
              (SELECT COUNT(*) FROM Bookings WHERE coach_id = u.id AND status = 'completed') as total_sessions
       FROM Users u
       LEFT JOIN CRMCustomers c ON c.assigned_coach_id = u.id
       LEFT JOIN (SELECT DISTINCT coach_id, 5 as rating FROM Bookings) r ON r.coach_id = u.id
       WHERE u.role = 'coach' AND u.is_active = 1
       GROUP BY u.id, u.name, u.email, u.avatar_url
       ORDER BY total_sessions DESC`
    );
    sendSuccess(res, result.recordset);
  } catch (err) { next(err); }
}

export async function getCoachAvailability(req: Request, res: Response, next: NextFunction) {
  try {
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
    const bookedTimes = booked.recordset.map((r: any) => r.start_time?.substring(0, 5));
    const available = allSlots.filter(s => !bookedTimes.includes(s));

    sendSuccess(res, { date: targetDate, coach_id: coachId, available_slots: available, booked_slots: bookedTimes });
  } catch (err) { next(err); }
}

export async function createBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { coach_id, booking_date, start_time, end_time, notes } = req.body;

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
      { coach_id, userId, booking_date, start_time, end_time: end_time || '10:00', notes: notes || null }
    );

    sendSuccess(res, result.recordset[0], 'Booking created', 201);
  } catch (err) { next(err); }
}

export async function getMyBookings(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;
    let result;
    if (role === 'coach') {
      result = await query(
        `SELECT b.*, u.name as member_name, c.name as coach_name
         FROM Bookings b
         JOIN Users u ON b.member_id = u.id
         JOIN Users c ON b.coach_id = c.id
         WHERE b.coach_id = @userId
         ORDER BY b.booking_date DESC, b.start_time DESC`,
        { userId }
      );
    } else {
      result = await query(
        `SELECT b.*, u.name as member_name, c.name as coach_name
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
    const { id } = req.params;
    const { status } = req.body;
    const valid = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!valid.includes(status)) throw new AppError(400, 'Invalid status');

    const result = await query(
      `UPDATE Bookings SET status=@status, updated_at=GETDATE() OUTPUT INSERTED.* WHERE id=@id`,
      { id, status }
    );
    if (result.recordset.length === 0) throw new AppError(404, 'Booking not found');
    sendSuccess(res, result.recordset[0], 'Booking updated');
  } catch (err) { next(err); }
}
