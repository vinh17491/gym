-- Migration 0007: Workout Foundation Additions

-- 1. Add exercise_id to WorkoutExercises to link with Exercises library
ALTER TABLE WorkoutExercises 
ADD exercise_id INT NULL;

ALTER TABLE WorkoutExercises
ADD CONSTRAINT FK_WorkoutExercises_Exercises 
FOREIGN KEY (exercise_id) REFERENCES Exercises(id);

-- 2. Create MemberWorkoutAssignments table
-- Allows Coaches to assign a specific Workout program to a Member
CREATE TABLE MemberWorkoutAssignments (
  id INT IDENTITY(1,1) PRIMARY KEY,
  member_id INT NOT NULL,
  coach_id INT NOT NULL,
  workout_id INT NOT NULL,
  assigned_at DATETIME2 NOT NULL DEFAULT GETDATE(),
  status NVARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  notes NVARCHAR(MAX) NULL,
  FOREIGN KEY (member_id) REFERENCES Users(id),
  FOREIGN KEY (coach_id) REFERENCES Users(id),
  FOREIGN KEY (workout_id) REFERENCES Workouts(id)
);

-- 3. Create WorkoutSetLogs table
-- Tracks actual sets, reps, and weight lifted per exercise per session
CREATE TABLE WorkoutSetLogs (
  id INT IDENTITY(1,1) PRIMARY KEY,
  session_id INT NOT NULL,
  exercise_id INT NOT NULL,
  set_number INT NOT NULL,
  reps INT NULL,
  weight DECIMAL(6,2) NULL,
  is_completed BIT NOT NULL DEFAULT 0,
  logged_at DATETIME2 NOT NULL DEFAULT GETDATE(),
  FOREIGN KEY (session_id) REFERENCES WorkoutSessions(id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES Exercises(id)
);
