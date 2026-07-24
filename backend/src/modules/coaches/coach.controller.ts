import { Request, Response, NextFunction } from 'express';
import { query } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { sendSuccess } from '../../utils/response';

export async function getCoaches(req: Request, res: Response, next: NextFunction) {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    let where = "WHERE u.role = 'coach' AND u.is_active = 1";
    const params: Record<string, any> = {};

    if (search) {
      where += ' AND (u.name LIKE @search OR u.email LIKE @search)';
      params.search = `%${search}%`;
    }

    const result = await query(
      `SELECT u.id, u.name, u.email, u.phone, u.avatar_url, u.is_active, u.created_at,
              COUNT(DISTINCT c.user_id) as total_members,
              COALESCE(AVG(CAST(b.rating AS FLOAT)), 5.0) as avg_rating,
              (SELECT COUNT(*) FROM Bookings WHERE coach_id = u.id AND status = 'completed') as total_sessions
       FROM Users u
       LEFT JOIN CRMCustomers c ON c.assigned_coach_id = u.id
       LEFT JOIN Bookings b ON b.coach_id = u.id AND b.status = 'completed' AND b.rating IS NOT NULL
       ${where}
       GROUP BY u.id, u.name, u.email, u.phone, u.avatar_url, u.is_active, u.created_at
       ORDER BY total_sessions DESC, avg_rating DESC
       OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
      { ...params, offset, limit: Number(limit) }
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM Users u ${where}`,
      params
    );

    sendSuccess(res, {
      coaches: result.recordset,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: countResult.recordset[0].total,
        totalPages: Math.ceil(countResult.recordset[0].total / Number(limit))
      }
    });
  } catch (err) { next(err); }
}

export async function getCoachById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT u.id, u.name, u.email, u.phone, u.avatar_url, u.is_active, u.created_at,
              COUNT(DISTINCT c.user_id) as total_members,
              COALESCE(AVG(CAST(b.rating AS FLOAT)), 5.0) as avg_rating,
              (SELECT COUNT(*) FROM Bookings WHERE coach_id = u.id AND status = 'completed') as total_sessions
       FROM Users u
       LEFT JOIN CRMCustomers c ON c.assigned_coach_id = u.id
       LEFT JOIN Bookings b ON b.coach_id = u.id AND b.status = 'completed' AND b.rating IS NOT NULL
       WHERE u.id = @id AND u.role = 'coach' AND u.is_active = 1
       GROUP BY u.id, u.name, u.email, u.phone, u.avatar_url, u.is_active, u.created_at`,
      { id }
    );
    if (result.recordset.length === 0) throw new AppError(404, 'Coach not found');

    const reviews = await query(
      `SELECT b.id, b.rating, b.review, b.updated_at, u.name as member_name, u.avatar_url as member_avatar
       FROM Bookings b
       JOIN Users u ON b.member_id = u.id
       WHERE b.coach_id = @id AND b.rating IS NOT NULL AND b.status = 'completed'
       ORDER BY b.updated_at DESC`,
      { id }
    );

    sendSuccess(res, {
      ...result.recordset[0],
      reviews: reviews.recordset || []
    });
  } catch (err) { next(err); }
}

