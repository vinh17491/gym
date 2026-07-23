import { Request, Response, NextFunction } from 'express';
import { query } from '../../config/database';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/errorHandler';

export async function createWorkout(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, description, plan_type, difficulty, duration_minutes } = req.body;
    const coach_id = req.user!.userId;

    const result = await query(
      `INSERT INTO Workouts (name, description, coach_id, plan_type, difficulty, duration_minutes) 
       OUTPUT INSERTED.* 
       VALUES (@name, @description, @coachId, @planType, @difficulty, @duration)`,
      { name, description: description || null, coachId: coach_id, planType: plan_type || null, difficulty: difficulty || 'beginner', duration: duration_minutes || null }
    );

    sendSuccess(res, result.recordset[0], 'Workout created', 201);
  } catch (err) {
    next(err);
  }
}

export async function addWorkoutExercise(req: Request, res: Response, next: NextFunction) {
  try {
    const { workoutId } = req.params;
    const { exercise_id, name, sets, reps, weight, duration_seconds, rest_seconds, sort_order } = req.body;
    
    const result = await query(
      `INSERT INTO WorkoutExercises (workout_id, exercise_id, name, sets, reps, weight, duration_seconds, rest_seconds, sort_order)
       OUTPUT INSERTED.*
       VALUES (@workoutId, @exerciseId, @name, @sets, @reps, @weight, @duration, @rest, @sort)`,
      { 
        workoutId, exerciseId: exercise_id, name, sets: sets || null, reps: reps || null, 
        weight: weight || null, duration: duration_seconds || null, rest: rest_seconds || null, sort: sort_order || 0 
      }
    );

    sendSuccess(res, result.recordset[0], 'Exercise added to workout', 201);
  } catch (err) {
    next(err);
  }
}

export async function getWorkouts(req: Request, res: Response, next: NextFunction) {
  try {
    // Return coach's workouts OR all system active workouts (so coaches have a library to assign)
    const result = await query(`SELECT * FROM Workouts WHERE is_active = 1 ORDER BY created_at DESC`);
    sendSuccess(res, result.recordset);
  } catch (err) {
    next(err);
  }
}

export async function getWorkoutDetails(req: Request, res: Response, next: NextFunction) {
  try {
    const { workoutId } = req.params;
    
    const workoutResult = await query(`SELECT * FROM Workouts WHERE id = @workoutId`, { workoutId });
    if (workoutResult.recordset.length === 0) throw new AppError(404, 'Workout not found');
    
    const exercisesResult = await query(
      `SELECT we.*, e.thumbnail_url, e.video_url, e.instructions 
       FROM WorkoutExercises we 
       LEFT JOIN Exercises e ON we.exercise_id = e.id 
       WHERE we.workout_id = @workoutId 
       ORDER BY we.sort_order ASC`, 
      { workoutId }
    );

    sendSuccess(res, { ...workoutResult.recordset[0], exercises: exercisesResult.recordset });
  } catch (err) {
    next(err);
  }
}

export async function assignWorkout(req: Request, res: Response, next: NextFunction) {
  try {
    const { workoutId } = req.params;
    const { member_id, notes } = req.body;
    const coach_id = req.user!.userId;

    // Verify coach owns the member
    const check = await query(`SELECT 1 FROM CRMCustomers WHERE user_id = @memberId AND assigned_coach_id = @coachId`, { memberId: member_id, coachId: coach_id });
    if (check.recordset.length === 0) throw new AppError(403, 'Not authorized to assign workouts to this member');

    const result = await query(
      `INSERT INTO MemberWorkoutAssignments (member_id, coach_id, workout_id, notes)
       OUTPUT INSERTED.*
       VALUES (@memberId, @coachId, @workoutId, @notes)`,
      { memberId: member_id, coachId: coach_id, workoutId, notes: notes || null }
    );

    sendSuccess(res, result.recordset[0], 'Workout assigned', 201);
  } catch (err) {
    next(err);
  }
}

export async function getMyAssignedWorkouts(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await query(
      `SELECT mwa.*, w.name as workout_name, w.description, w.difficulty, w.duration_minutes,
        (SELECT COUNT(wsl.id) 
         FROM WorkoutSetLogs wsl 
         WHERE wsl.session_id = (
             SELECT TOP 1 id FROM WorkoutSessions ws2 
             WHERE ws2.workout_id = mwa.workout_id 
               AND ws2.user_id = mwa.member_id 
               AND ws2.started_at >= mwa.assigned_at
               AND ws2.started_at < ISNULL((
                   SELECT MIN(assigned_at) FROM MemberWorkoutAssignments next_mwa
                   WHERE next_mwa.workout_id = mwa.workout_id 
                     AND next_mwa.member_id = mwa.member_id
                     AND next_mwa.assigned_at > mwa.assigned_at
               ), '9999-12-31')
             ORDER BY ws2.started_at DESC
         ) AND wsl.is_completed = 1) as completed_sets,
        (SELECT COALESCE(SUM(sets), 0) 
         FROM WorkoutExercises we 
         WHERE we.workout_id = mwa.workout_id) as total_sets
       FROM MemberWorkoutAssignments mwa
       JOIN Workouts w ON mwa.workout_id = w.id
       WHERE mwa.member_id = @userId
       ORDER BY mwa.assigned_at DESC`,
      { userId: req.user!.userId }
    );
    sendSuccess(res, result.recordset);
  } catch (err) {
    next(err);
  }
}
export async function getMemberAssignedWorkouts(req: Request, res: Response, next: NextFunction) {
  try {
    const { memberId } = req.params;
    const coachId = req.user!.userId;
    
    // Verify coach owns the member
    const check = await query(`SELECT 1 FROM CRMCustomers WHERE user_id = @memberId AND assigned_coach_id = @coachId`, { memberId, coachId });
    if (check.recordset.length === 0) throw new AppError(403, 'Not authorized to view workouts for this member');

    const result = await query(
      `SELECT mwa.*, w.name as workout_name, w.description, w.difficulty, w.duration_minutes,
        (SELECT COUNT(wsl.id) 
         FROM WorkoutSetLogs wsl 
         WHERE wsl.session_id = (
             SELECT TOP 1 id FROM WorkoutSessions ws2 
             WHERE ws2.workout_id = mwa.workout_id 
               AND ws2.user_id = mwa.member_id 
               AND ws2.started_at >= mwa.assigned_at
               AND ws2.started_at < ISNULL((
                   SELECT MIN(assigned_at) FROM MemberWorkoutAssignments next_mwa
                   WHERE next_mwa.workout_id = mwa.workout_id 
                     AND next_mwa.member_id = mwa.member_id
                     AND next_mwa.assigned_at > mwa.assigned_at
               ), '9999-12-31')
             ORDER BY ws2.started_at DESC
         ) AND wsl.is_completed = 1) as completed_sets,
        (SELECT COALESCE(SUM(sets), 0) 
         FROM WorkoutExercises we 
         WHERE we.workout_id = mwa.workout_id) as total_sets
       FROM MemberWorkoutAssignments mwa
       JOIN Workouts w ON mwa.workout_id = w.id
       WHERE mwa.member_id = @memberId
       ORDER BY mwa.assigned_at DESC`,
      { memberId }
    );
    sendSuccess(res, result.recordset);
  } catch (err) {
    next(err);
  }
}

export async function cancelAssignment(req: Request, res: Response, next: NextFunction) {
  try {
    const { assignmentId } = req.params;
    const coachId = req.user!.userId;

    // Verify coach owns the member this is assigned to
    const check = await query(`
      SELECT 1 FROM MemberWorkoutAssignments mwa
      JOIN CRMCustomers crm ON mwa.member_id = crm.user_id
      WHERE mwa.id = @assignmentId AND crm.assigned_coach_id = @coachId
    `, { assignmentId, coachId });

    if (check.recordset.length === 0) {
      throw new AppError(403, 'Not authorized to cancel this assignment');
    }

    await query(`
      UPDATE MemberWorkoutAssignments 
      SET status = 'cancelled' 
      WHERE id = @assignmentId
    `, { assignmentId });

    sendSuccess(res, null, 'Assignment cancelled successfully');
  } catch (err) {
    next(err);
  }
}
