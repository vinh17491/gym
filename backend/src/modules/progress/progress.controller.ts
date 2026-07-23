import { Request, Response, NextFunction } from 'express';
import { query } from '../../config/database';
import { sendSuccess } from '../../utils/response';

export async function getSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const role = req.user!.role;
    // Default to requesting user's progress. If coach/admin, they can provide a memberId query param.
    const memberId = (role === 'coach' || role === 'admin') && req.query.memberId ? req.query.memberId : req.user!.userId;

    // Verify coach assignment if needed
    if (role === 'coach' && memberId !== req.user!.userId) {
      const check = await query(`SELECT 1 FROM CRMCustomers WHERE user_id = @memberId AND assigned_coach_id = @coachId`, {
        memberId, coachId: req.user!.userId
      });
      if (check.recordset.length === 0) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this member' });
      }
    }

    // Calculate total volume (sets * reps * weight)
    const volumeResult = await query(`
      SELECT SUM(wsl.reps * wsl.weight) as total_volume
      FROM WorkoutSetLogs wsl
      JOIN WorkoutSessions ws ON wsl.session_id = ws.id
      WHERE ws.user_id = @memberId AND wsl.is_completed = 1
    `, { memberId });

    // Calculate completion stats
    const statsResult = await query(`
      SELECT 
        COUNT(id) as total_sessions,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_sessions
      FROM WorkoutSessions
      WHERE user_id = @memberId
    `, { memberId });

    sendSuccess(res, {
      totalVolume: volumeResult.recordset[0]?.total_volume || 0,
      totalSessions: statsResult.recordset[0]?.total_sessions || 0,
      completedSessions: statsResult.recordset[0]?.completed_sessions || 0,
      completionRate: statsResult.recordset[0]?.total_sessions > 0 
        ? Math.round((statsResult.recordset[0]?.completed_sessions / statsResult.recordset[0]?.total_sessions) * 100) 
        : 0
    });
  } catch (err) {
    next(err);
  }
}

export async function getHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const role = req.user!.role;
    const memberId = (role === 'coach' || role === 'admin') && req.query.memberId ? req.query.memberId : req.user!.userId;

    if (role === 'coach' && memberId !== req.user!.userId) {
      const check = await query(`SELECT 1 FROM CRMCustomers WHERE user_id = @memberId AND assigned_coach_id = @coachId`, {
        memberId, coachId: req.user!.userId
      });
      if (check.recordset.length === 0) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this member' });
      }
    }

    // Get daily volume for the last 30 days
    const historyResult = await query(`
      SELECT 
        CAST(ws.completed_at AS DATE) as date,
        SUM(wsl.reps * wsl.weight) as daily_volume
      FROM WorkoutSetLogs wsl
      JOIN WorkoutSessions ws ON wsl.session_id = ws.id
      WHERE ws.user_id = @memberId 
        AND wsl.is_completed = 1 
        AND ws.status = 'completed'
        AND ws.completed_at >= DATEADD(day, -30, GETDATE())
      GROUP BY CAST(ws.completed_at AS DATE)
      ORDER BY date ASC
    `, { memberId });

    sendSuccess(res, historyResult.recordset);
  } catch (err) {
    next(err);
  }
}
