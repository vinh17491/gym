import { Request, Response, NextFunction } from 'express';
import { query } from '../../config/database';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/errorHandler';

export async function startSession(req: Request, res: Response, next: NextFunction) {
  try {
    const { workout_id } = req.body;
    const userId = req.user!.userId;

    // Insert a new WorkoutSession
    const sessionResult = await query(
      `INSERT INTO WorkoutSessions (user_id, workout_id, status) 
       OUTPUT INSERTED.* 
       VALUES (@userId, @workoutId, 'in_progress')`,
      { userId, workoutId: workout_id }
    );

    sendSuccess(res, sessionResult.recordset[0], 'Workout session started', 201);
  } catch (err) {
    next(err);
  }
}

export async function logSet(req: Request, res: Response, next: NextFunction) {
  try {
    const { sessionId } = req.params;
    const { exercise_id, set_number, reps, weight } = req.body;
    
    // Verify session belongs to user
    const sessionCheck = await query(`SELECT id FROM WorkoutSessions WHERE id = @sessionId AND user_id = @userId`, {
      sessionId, userId: req.user!.userId
    });
    if (sessionCheck.recordset.length === 0) {
      throw new AppError(404, 'Session not found or not owned by user');
    }

    const setResult = await query(
      `INSERT INTO WorkoutSetLogs (session_id, exercise_id, set_number, reps, weight, is_completed)
       OUTPUT INSERTED.*
       VALUES (@sessionId, @exerciseId, @setNumber, @reps, @weight, 1)`,
      { sessionId, exerciseId: exercise_id, setNumber: set_number, reps, weight }
    );

    sendSuccess(res, setResult.recordset[0], 'Set logged successfully', 201);
  } catch (err) {
    next(err);
  }
}

export async function finishSession(req: Request, res: Response, next: NextFunction) {
  try {
    const { sessionId } = req.params;
    const { notes } = req.body;

    const updateResult = await query(
      `UPDATE WorkoutSessions 
       SET status = 'completed', completed_at = GETDATE(), notes = @notes 
       OUTPUT INSERTED.* 
       WHERE id = @sessionId AND user_id = @userId`,
      { sessionId, userId: req.user!.userId, notes: notes || null }
    );

    if (updateResult.recordset.length === 0) {
      throw new AppError(404, 'Session not found or not owned by user');
    }

    sendSuccess(res, updateResult.recordset[0], 'Workout session completed');
  } catch (err) {
    next(err);
  }
}

export async function getSessions(req: Request, res: Response, next: NextFunction) {
  try {
    const role = req.user!.role;
    let sql = `
      SELECT ws.*, w.name as workout_name 
      FROM WorkoutSessions ws
      JOIN Workouts w ON ws.workout_id = w.id
      WHERE 1=1
    `;
    const params: Record<string, unknown> = {};

    if (role === 'member') {
      sql += ` AND ws.user_id = @userId`;
      params.userId = req.user!.userId;
    } else if (role === 'coach') {
      // Coach sees sessions for their assigned members
      sql += ` AND ws.user_id IN (SELECT user_id FROM CRMCustomers WHERE assigned_coach_id = @coachId)`;
      params.coachId = req.user!.userId;
    }

    sql += ` ORDER BY ws.started_at DESC`;

    const sessionsResult = await query(sql, params);
    sendSuccess(res, sessionsResult.recordset);
  } catch (err) {
    next(err);
  }
}
