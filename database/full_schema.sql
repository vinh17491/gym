-- ============================================
-- GYMER DATABASE — Full Schema + Procs + Demo Data
-- 1 file duy nhất. Mở SSMS, F5 là chạy.
-- ============================================

USE master;
GO
IF DB_ID('gymer') IS NOT NULL
BEGIN
  ALTER DATABASE gymer SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
  DROP DATABASE gymer;
END
GO

CREATE DATABASE gymer;
GO

USE gymer;
GO

-- ============================================
-- DROP stored procedures first (avoid dependency errors)
-- ============================================
DROP PROCEDURE IF EXISTS sp_GetDAU;
DROP PROCEDURE IF EXISTS sp_GetRevenueByPeriod;
DROP PROCEDURE IF EXISTS sp_GetRetentionCohort;
DROP PROCEDURE IF EXISTS sp_CalculateChurnRate;
DROP PROCEDURE IF EXISTS sp_AddPoints;
DROP PROCEDURE IF EXISTS sp_SpendPoints;
DROP PROCEDURE IF EXISTS sp_ProcessReferralCommission;
DROP PROCEDURE IF EXISTS sp_GenerateInvoice;
GO

-- ============================================
-- DROP TABLES (order matters for FK)
-- ============================================
DROP TABLE IF EXISTS TicketAttachments;
DROP TABLE IF EXISTS TicketMessages;
DROP TABLE IF EXISTS Tickets;
DROP TABLE IF EXISTS NutritionEntries;
DROP TABLE IF EXISTS NutritionPlans;
DROP TABLE IF EXISTS WorkoutSessions;
DROP TABLE IF EXISTS WorkoutExercises;
DROP TABLE IF EXISTS Workouts;
DROP TABLE IF EXISTS CRMTasks;
DROP TABLE IF EXISTS CRMNotes;
DROP TABLE IF EXISTS CRMCustomers;
DROP TABLE IF EXISTS InvoiceItems;
DROP TABLE IF EXISTS Invoices;
DROP TABLE IF EXISTS BackupLogs;
DROP TABLE IF EXISTS AuditLogs;
DROP TABLE IF EXISTS RewardRedemptions;
DROP TABLE IF EXISTS RewardsCatalog;
DROP TABLE IF EXISTS PointTransactions;
DROP TABLE IF EXISTS Points;
DROP TABLE IF EXISTS Promotions;
DROP TABLE IF EXISTS CouponUsages;
DROP TABLE IF EXISTS Coupons;
DROP TABLE IF EXISTS AffiliatePayouts;
DROP TABLE IF EXISTS Affiliates;
DROP TABLE IF EXISTS ReferralRewards;
DROP TABLE IF EXISTS ReferralClicks;
DROP TABLE IF EXISTS ReferralTransactions;
DROP TABLE IF EXISTS ReferralCodes;
DROP TABLE IF EXISTS Notifications;
DROP TABLE IF EXISTS Payments;
DROP TABLE IF EXISTS Memberships;
DROP TABLE IF EXISTS Plans;
DROP TABLE IF EXISTS AnalyticsRetention;
DROP TABLE IF EXISTS AnalyticsDaily;
DROP TABLE IF EXISTS Users;
GO

-- ============================================
-- TABLES
-- ============================================

CREATE TABLE Users (
  id INT IDENTITY(1,1) PRIMARY KEY,
  email NVARCHAR(255) NOT NULL UNIQUE,
  password NVARCHAR(255) NOT NULL,
  name NVARCHAR(100) NOT NULL,
  phone NVARCHAR(20) NULL,
  role NVARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('member','coach','admin')),
  referral_code NVARCHAR(10) NULL,
  referred_by INT NULL,
  avatar_url NVARCHAR(500) NULL,
  is_active BIT NOT NULL DEFAULT 1,
  email_verified BIT NOT NULL DEFAULT 0,
  last_login_at DATETIME2 NULL,
  created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
  updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
  FOREIGN KEY (referred_by) REFERENCES Users(id)
);
CREATE INDEX IX_Users_Email ON Users(email);
CREATE INDEX IX_Users_Role ON Users(role);

CREATE TABLE Plans (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(100) NOT NULL,
  description NVARCHAR(500),
  price DECIMAL(10,2) NOT NULL,
  duration_days INT NOT NULL,
  type NVARCHAR(20) NOT NULL CHECK (type IN ('monthly','quarterly','yearly','custom')),
  features NVARCHAR(MAX) NULL,
  is_active BIT NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

CREATE TABLE Memberships (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NOT NULL,
  plan_id INT NOT NULL,
  start_date DATETIME2 NOT NULL,
  end_date DATETIME2 NOT NULL,
  status NVARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','expired','cancelled','suspended')),
  payment_id INT NULL,
  auto_renew BIT NOT NULL DEFAULT 0,
  created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
  FOREIGN KEY (user_id) REFERENCES Users(id)
);

CREATE TABLE Payments (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NOT NULL,
  plan_id INT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method NVARCHAR(50) NOT NULL,
  status NVARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed','refunded')),
  transaction_id NVARCHAR(255) NULL,
  coupon_id INT NULL,
  points_used INT NULL DEFAULT 0,
  created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
  FOREIGN KEY (user_id) REFERENCES Users(id)
);

CREATE TABLE Invoices (
  id INT IDENTITY(1,1) PRIMARY KEY,
  invoice_number NVARCHAR(50) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  payment_id INT NULL,
  amount DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  pdf_path NVARCHAR(500) NULL,
  email_sent BIT NOT NULL DEFAULT 0,
  created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
  FOREIGN KEY (user_id) REFERENCES Users(id),
  FOREIGN KEY (payment_id) REFERENCES Payments(id)
);
CREATE INDEX IX_Invoices_User ON Invoices(user_id);

CREATE TABLE Notifications (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NOT NULL,
  title NVARCHAR(200) NOT NULL,
  message NVARCHAR(MAX) NOT NULL,
  type NVARCHAR(50) NOT NULL,
  is_read BIT NOT NULL DEFAULT 0,
  created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
  FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- Referral
CREATE TABLE ReferralCodes (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NOT NULL,
  code NVARCHAR(20) NOT NULL UNIQUE,
  status NVARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled')),
  created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
  FOREIGN KEY (user_id) REFERENCES Users(id)
);
CREATE INDEX IX_ReferralCodes_Code ON ReferralCodes(code);

CREATE TABLE ReferralClicks (
  id INT IDENTITY(1,1) PRIMARY KEY,
  referral_code NVARCHAR(20) NOT NULL,
  ip NVARCHAR(45) NULL,
  user_agent NVARCHAR(500) NULL,
  timestamp DATETIME2 NOT NULL DEFAULT GETDATE(),
  FOREIGN KEY (referral_code) REFERENCES ReferralCodes(code)
);

CREATE TABLE ReferralRewards (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NOT NULL,
  type NVARCHAR(50) NOT NULL CHECK (type IN ('points','discount','free_days','cash')),
  amount DECIMAL(10,2) NOT NULL,
  status NVARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','credited','rejected')),
  reference_id INT NULL,
  created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
  FOREIGN KEY (user_id) REFERENCES Users(id)
);

CREATE TABLE ReferralTransactions (
  id INT IDENTITY(1,1) PRIMARY KEY,
  referrer_id INT NOT NULL,
  referred_id INT NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  transaction_type NVARCHAR(50) NOT NULL,
  status NVARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','paid')),
  created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
  FOREIGN KEY (referrer_id) REFERENCES Users(id),
  FOREIGN KEY (referred_id) REFERENCES Users(id)
);

CREATE TABLE Affiliates (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  tier NVARCHAR(20) NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze','silver','gold','platinum')),
  commission_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  total_earned DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_paid DECIMAL(10,2) NOT NULL DEFAULT 0,
  status NVARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','suspended')),
  approved_at DATETIME2 NULL,
  created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
  FOREIGN KEY (user_id) REFERENCES Users(id)
);

CREATE TABLE AffiliatePayouts (
  id INT IDENTITY(1,1) PRIMARY KEY,
  affiliate_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method NVARCHAR(50) NOT NULL,
  status NVARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  processed_at DATETIME2 NULL,
  created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
  FOREIGN KEY (affiliate_id) REFERENCES Affiliates(id)
);

-- Coupons & Promotions
CREATE TABLE Coupons (
  id INT IDENTITY(1,1) PRIMARY KEY,
  code NVARCHAR(50) NOT NULL UNIQUE,
  type NVARCHAR(20) NOT NULL CHECK (type IN ('fixed','percentage','free_trial','first_purchase','referral','flash_sale')),
  value DECIMAL(10,2) NOT NULL,
  min_purchase DECIMAL(10,2) NOT NULL DEFAULT 0,
  start_date DATETIME2 NOT NULL,
  end_date DATETIME2 NOT NULL,
  usage_limit INT NULL,
  user_limit INT NOT NULL DEFAULT 1,
  applicable_plans NVARCHAR(500) NULL,
  is_active BIT NOT NULL DEFAULT 1,
  created_by INT NULL,
  created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
  FOREIGN KEY (created_by) REFERENCES Users(id)
);
CREATE INDEX IX_Coupons_Code ON Coupons(code);

CREATE TABLE CouponUsages (
  id INT IDENTITY(1,1) PRIMARY KEY,
  coupon_id INT NOT NULL,
  user_id INT NOT NULL,
  order_id INT NULL,
  discount_amount DECIMAL(10,2) NOT NULL,
  used_at DATETIME2 NOT NULL DEFAULT GETDATE(),
  FOREIGN KEY (coupon_id) REFERENCES Coupons(id),
  FOREIGN KEY (user_id) REFERENCES Users(id)
);

CREATE TABLE Promotions (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(100) NOT NULL,
  type NVARCHAR(50) NOT NULL,
  config NVARCHAR(MAX) NULL,
  start_date DATETIME2 NOT NULL,
  end_date DATETIME2 NOT NULL,
  priority INT NOT NULL DEFAULT 0,
  is_active BIT NOT NULL DEFAULT 1,
  created_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Loyalty Points
CREATE TABLE Points (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  balance INT NOT NULL DEFAULT 0,
  lifetime_earned INT NOT NULL DEFAULT 0,
  lifetime_spent INT NOT NULL DEFAULT 0,
  created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
  updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
  FOREIGN KEY (user_id) REFERENCES Users(id)
);

CREATE TABLE PointTransactions (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NOT NULL,
  type NVARCHAR(20) NOT NULL CHECK (type IN ('earn','spend')),
  points INT NOT NULL,
  source NVARCHAR(50) NOT NULL CHECK (source IN ('login','workout','purchase','referral','community','redeem')),
  reference_id INT NULL,
  description NVARCHAR(200) NULL,
  created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
  FOREIGN KEY (user_id) REFERENCES Users(id)
);
CREATE INDEX IX_PointTransactions_User ON PointTransactions(user_id, created_at);

CREATE TABLE RewardsCatalog (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(100) NOT NULL,
  description NVARCHAR(500),
  points_cost INT NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  image NVARCHAR(500) NULL,
  category NVARCHAR(50) NULL,
  is_active BIT NOT NULL DEFAULT 1,
  created_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

CREATE TABLE RewardRedemptions (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NOT NULL,
  reward_id INT NOT NULL,
  points_spent INT NOT NULL,
  status NVARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','fulfilled','cancelled')),
  created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
  FOREIGN KEY (user_id) REFERENCES Users(id),
  FOREIGN KEY (reward_id) REFERENCES RewardsCatalog(id)
);

-- Workouts & Training
CREATE TABLE Workouts (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(200) NOT NULL,
  description NVARCHAR(MAX) NULL,
  coach_id INT NULL,
  plan_type NVARCHAR(50) NULL,
  difficulty NVARCHAR(20) CHECK (difficulty IN ('beginner','intermediate','advanced')),
  duration_minutes INT NULL,
  is_active BIT NOT NULL DEFAULT 1,
  created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
  FOREIGN KEY (coach_id) REFERENCES Users(id)
);

CREATE TABLE WorkoutExercises (
  id INT IDENTITY(1,1) PRIMARY KEY,
  workout_id INT NOT NULL,
  name NVARCHAR(200) NOT NULL,
  sets INT NULL,
  reps INT NULL,
  weight DECIMAL(6,2) NULL,
  duration_seconds INT NULL,
  rest_seconds INT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (workout_id) REFERENCES Workouts(id) ON DELETE CASCADE
);

CREATE TABLE WorkoutSessions (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NOT NULL,
  workout_id INT NOT NULL,
  started_at DATETIME2 NOT NULL DEFAULT GETDATE(),
  completed_at DATETIME2 NULL,
  status NVARCHAR(20) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','completed','cancelled')),
  notes NVARCHAR(MAX) NULL,
  FOREIGN KEY (user_id) REFERENCES Users(id),
  FOREIGN KEY (workout_id) REFERENCES Workouts(id)
);

CREATE TABLE NutritionPlans (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NOT NULL,
  coach_id INT NULL,
  name NVARCHAR(200) NOT NULL,
  calories_target INT NULL,
  protein_target INT NULL,
  carbs_target INT NULL,
  fat_target INT NULL,
  start_date DATE NOT NULL,
  end_date DATE NULL,
  is_active BIT NOT NULL DEFAULT 1,
  created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
  FOREIGN KEY (user_id) REFERENCES Users(id),
  FOREIGN KEY (coach_id) REFERENCES Users(id)
);

CREATE TABLE NutritionEntries (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NOT NULL,
  plan_id INT NULL,
  meal_name NVARCHAR(100) NOT NULL,
  food_name NVARCHAR(200) NOT NULL,
  calories INT NOT NULL,
  protein DECIMAL(6,2) NULL,
  carbs DECIMAL(6,2) NULL,
  fat DECIMAL(6,2) NULL,
  logged_at DATETIME2 NOT NULL DEFAULT GETDATE(),
  FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- Support Tickets
CREATE TABLE Tickets (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NOT NULL,
  subject NVARCHAR(200) NOT NULL,
  category NVARCHAR(50) NOT NULL DEFAULT 'general',
  priority NVARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  status NVARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open','pending','resolved','closed')),
  assigned_to INT NULL,
  created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
  updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
  FOREIGN KEY (user_id) REFERENCES Users(id),
  FOREIGN KEY (assigned_to) REFERENCES Users(id)
);
CREATE INDEX IX_Tickets_Status ON Tickets(status);
CREATE INDEX IX_Tickets_User ON Tickets(user_id);

CREATE TABLE TicketMessages (
  id INT IDENTITY(1,1) PRIMARY KEY,
  ticket_id INT NOT NULL,
  sender_id INT NOT NULL,
  message NVARCHAR(MAX) NOT NULL,
  is_internal BIT NOT NULL DEFAULT 0,
  created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
  FOREIGN KEY (ticket_id) REFERENCES Tickets(id),
  FOREIGN KEY (sender_id) REFERENCES Users(id)
);

CREATE TABLE TicketAttachments (
  id INT IDENTITY(1,1) PRIMARY KEY,
  message_id INT NOT NULL,
  filename NVARCHAR(255) NOT NULL,
  file_path NVARCHAR(500) NOT NULL,
  file_size INT NOT NULL,
  mime_type NVARCHAR(100) NOT NULL,
  created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
  FOREIGN KEY (message_id) REFERENCES TicketMessages(id)
);

-- CRM
CREATE TABLE CRMCustomers (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  tags NVARCHAR(500) NULL,
  last_contact_at DATETIME2 NULL,
  assigned_coach_id INT NULL,
  lifetime_value DECIMAL(12,2) NOT NULL DEFAULT 0,
  risk_score INT NOT NULL DEFAULT 0,
  created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
  FOREIGN KEY (user_id) REFERENCES Users(id),
  FOREIGN KEY (assigned_coach_id) REFERENCES Users(id)
);

CREATE TABLE CRMNotes (
  id INT IDENTITY(1,1) PRIMARY KEY,
  customer_id INT NOT NULL,
  author_id INT NOT NULL,
  content NVARCHAR(MAX) NOT NULL,
  type NVARCHAR(20) NOT NULL DEFAULT 'note' CHECK (type IN ('note','follow_up','coach_note')),
  created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
  FOREIGN KEY (customer_id) REFERENCES CRMCustomers(id),
  FOREIGN KEY (author_id) REFERENCES Users(id)
);

CREATE TABLE CRMTasks (
  id INT IDENTITY(1,1) PRIMARY KEY,
  customer_id INT NOT NULL,
  assigned_to INT NULL,
  title NVARCHAR(200) NOT NULL,
  description NVARCHAR(MAX) NULL,
  due_date DATETIME2 NOT NULL,
  status NVARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','cancelled')),
  created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
  FOREIGN KEY (customer_id) REFERENCES CRMCustomers(id),
  FOREIGN KEY (assigned_to) REFERENCES Users(id)
);

-- Audit & Backup
CREATE TABLE AuditLogs (
  id BIGINT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NULL,
  action NVARCHAR(100) NOT NULL,
  entity_type NVARCHAR(50) NOT NULL,
  entity_id INT NULL,
  old_value NVARCHAR(MAX) NULL,
  new_value NVARCHAR(MAX) NULL,
  ip NVARCHAR(45) NULL,
  device NVARCHAR(500) NULL,
  timestamp DATETIME2 NOT NULL DEFAULT GETDATE(),
  FOREIGN KEY (user_id) REFERENCES Users(id)
);
CREATE INDEX IX_AuditLogs_User ON AuditLogs(user_id);
CREATE INDEX IX_AuditLogs_Action ON AuditLogs(action);
CREATE INDEX IX_AuditLogs_Timestamp ON AuditLogs(timestamp);

CREATE TABLE BackupLogs (
  id INT IDENTITY(1,1) PRIMARY KEY,
  type NVARCHAR(20) NOT NULL CHECK (type IN ('daily','weekly','monthly','manual')),
  status NVARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','running','completed','failed')),
  file_path NVARCHAR(500) NULL,
  file_size BIGINT NULL,
  duration_seconds INT NULL,
  verified BIT NOT NULL DEFAULT 0,
  created_by INT NULL,
  created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
  FOREIGN KEY (created_by) REFERENCES Users(id)
);

-- Analytics
CREATE TABLE AnalyticsDaily (
  id INT IDENTITY(1,1) PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  dau INT NOT NULL DEFAULT 0,
  new_users INT NOT NULL DEFAULT 0,
  new_memberships INT NOT NULL DEFAULT 0,
  revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
  workouts_completed INT NOT NULL DEFAULT 0,
  tickets_created INT NOT NULL DEFAULT 0,
  coupons_used INT NOT NULL DEFAULT 0,
  points_earned INT NOT NULL DEFAULT 0,
  points_redeemed INT NOT NULL DEFAULT 0
);

CREATE TABLE AnalyticsRetention (
  id INT IDENTITY(1,1) PRIMARY KEY,
  cohort_date DATE NOT NULL,
  day_1 INT NULL, day_7 INT NULL, day_14 INT NULL, day_30 INT NULL, day_60 INT NULL, day_90 INT NULL,
  total_users INT NOT NULL DEFAULT 0
);
GO

PRINT '=== ALL TABLES CREATED ===';
GO

-- ============================================
-- STORED PROCEDURES
-- ============================================

CREATE OR ALTER PROCEDURE sp_GetDAU
  @StartDate DATE = NULL, @EndDate DATE = NULL
AS BEGIN
  SET NOCOUNT ON;
  SELECT @StartDate = ISNULL(@StartDate, DATEADD(day, -30, GETDATE()));
  SELECT @EndDate = ISNULL(@EndDate, GETDATE());
  SELECT date, dau, new_users, revenue FROM AnalyticsDaily
  WHERE date BETWEEN @StartDate AND @EndDate ORDER BY date;
END;
GO

CREATE OR ALTER PROCEDURE sp_GetRevenueByPeriod
  @StartDate DATE, @EndDate DATE, @GroupBy NVARCHAR(10) = 'daily'
AS BEGIN
  SET NOCOUNT ON;
  SELECT date, SUM(revenue) as revenue, SUM(new_memberships) as memberships
  FROM AnalyticsDaily WHERE date BETWEEN @StartDate AND @EndDate
  GROUP BY date ORDER BY date;
END;
GO

CREATE OR ALTER PROCEDURE sp_GetRetentionCohort
  @CohortDate DATE
AS BEGIN
  SET NOCOUNT ON;
  SELECT * FROM AnalyticsRetention WHERE cohort_date = @CohortDate;
END;
GO

CREATE OR ALTER PROCEDURE sp_CalculateChurnRate
  @Month INT = NULL, @Year INT = NULL
AS BEGIN
  SET NOCOUNT ON;
  SET @Month = ISNULL(@Month, MONTH(GETDATE()));
  SET @Year = ISNULL(@Year, YEAR(GETDATE()));
  DECLARE @TotalStart INT, @Cancelled INT;
  SELECT @TotalStart = COUNT(*) FROM Memberships WHERE MONTH(start_date) < @Month OR YEAR(start_date) < @Year;
  SELECT @Cancelled = COUNT(*) FROM Memberships WHERE status='cancelled' AND MONTH(end_date)=@Month AND YEAR(end_date)=@Year AND status='cancelled';
  SELECT CAST(@Cancelled AS FLOAT) / NULLIF(@TotalStart, 0) * 100 AS churn_rate;
END;
GO

CREATE OR ALTER PROCEDURE sp_AddPoints
  @UserID INT, @Points INT, @Source NVARCHAR(50), @RefID INT = NULL, @Description NVARCHAR(200) = NULL
AS BEGIN
  SET NOCOUNT ON;
  IF NOT EXISTS (SELECT 1 FROM Points WHERE user_id = @UserID)
    INSERT INTO Points (user_id, balance, lifetime_earned, lifetime_spent) VALUES (@UserID, @Points, @Points, 0);
  ELSE
    UPDATE Points SET balance = balance + @Points, lifetime_earned = lifetime_earned + @Points, updated_at = GETDATE()
    WHERE user_id = @UserID;
  INSERT INTO PointTransactions (user_id, type, points, source, reference_id, description)
  VALUES (@UserID, 'earn', @Points, @Source, @RefID, @Description);
END;
GO

CREATE OR ALTER PROCEDURE sp_SpendPoints
  @UserID INT, @Points INT, @Source NVARCHAR(50), @RefID INT = NULL, @Description NVARCHAR(200) = NULL
AS BEGIN
  SET NOCOUNT ON;
  DECLARE @Balance INT = (SELECT balance FROM Points WHERE user_id = @UserID);
  IF @Balance < @Points THROW 50001, 'Insufficient points', 1;
  UPDATE Points SET balance = balance - @Points, lifetime_spent = lifetime_spent + @Points, updated_at = GETDATE()
  WHERE user_id = @UserID;
  INSERT INTO PointTransactions (user_id, type, points, source, reference_id, description)
  VALUES (@UserID, 'spend', @Points, @Source, @RefID, @Description);
END;
GO

CREATE OR ALTER PROCEDURE sp_ProcessReferralCommission
  @ReferrerID INT, @ReferredID INT, @PaymentAmount DECIMAL(10,2)
AS BEGIN
  SET NOCOUNT ON;
  DECLARE @CommissionRate DECIMAL(5,2);
  SELECT @CommissionRate = commission_rate FROM Affiliates WHERE user_id = @ReferrerID;
  SET @CommissionRate = ISNULL(@CommissionRate, 10.0);
  DECLARE @Commission DECIMAL(10,2) = @PaymentAmount * @CommissionRate / 100;
  INSERT INTO ReferralTransactions (referrer_id, referred_id, commission_amount, transaction_type, status)
  VALUES (@ReferrerID, @ReferredID, @Commission, 'purchase', 'confirmed');
  UPDATE Affiliates SET total_earned = total_earned + @Commission WHERE user_id = @ReferrerID;
  DECLARE @Points INT = CAST(@Commission AS INT) * 10;
  EXEC sp_AddPoints @UserID = @ReferrerID, @Points = @Points, @Source = 'referral';
END;
GO

CREATE OR ALTER PROCEDURE sp_GenerateInvoice
  @UserID INT, @PaymentID INT, @Amount DECIMAL(10,2), @Tax DECIMAL(10,2), @Discount DECIMAL(10,2)
AS BEGIN
  SET NOCOUNT ON;
  DECLARE @Total DECIMAL(10,2) = @Amount + @Tax - @Discount;
  DECLARE @InvoiceNum NVARCHAR(50) = 'GYM-' + FORMAT(GETDATE(),'yyyyMMdd') + '-' + RIGHT('00000' + CAST((SELECT ISNULL(MAX(id),0)+1 FROM Invoices) AS NVARCHAR), 5);
  INSERT INTO Invoices (invoice_number, user_id, payment_id, amount, tax, discount, total)
  VALUES (@InvoiceNum, @UserID, @PaymentID, @Amount, @Tax, @Discount, @Total);
  SELECT @InvoiceNum AS invoice_number, @Total AS total;
END;
GO

PRINT '=== ALL PROCEDURES CREATED ===';
GO

-- ============================================
-- SEED DATA
-- ============================================

-- 1. Users
-- admin: id=1, coaches: id=2-3, members: id=4-15
INSERT INTO Users (email, password, name, role, referral_code, phone, is_active, email_verified) VALUES
('admin@gymer.com', '$2a$12$peO0xH0BGS8z7kkXfpD3pOFbBcd6OpMdmyaUnMsERZmu3OshkZl0.', 'Admin', 'admin', 'ADMIN001', '0901000001', 1, 1),
('coach1@gymer.com', '$2a$12$peO0xH0BGS8z7kkXfpD3pOFbBcd6OpMdmyaUnMsERZmu3OshkZl0.', 'Coach Minh', 'coach', NULL, '0901000002', 1, 1),
('coach2@gymer.com', '$2a$12$peO0xH0BGS8z7kkXfpD3pOFbBcd6OpMdmyaUnMsERZmu3OshkZl0.', 'Coach Lan', 'coach', NULL, '0901000003', 1, 1),
('member1@gymer.com', '$2a$12$peO0xH0BGS8z7kkXfpD3pOFbBcd6OpMdmyaUnMsERZmu3OshkZl0.', 'Nguyen Van An', 'member', 'GETFIT01', '0901000004', 1, 1),
('member2@gymer.com', '$2a$12$peO0xH0BGS8z7kkXfpD3pOFbBcd6OpMdmyaUnMsERZmu3OshkZl0.', 'Tran Thi Binh', 'member', 'FITFAM02', '0901000005', 1, 1),
('member3@gymer.com', '$2a$12$peO0xH0BGS8z7kkXfpD3pOFbBcd6OpMdmyaUnMsERZmu3OshkZl0.', 'Le Van Cuong', 'member', 'GYMPAL03', '0901000006', 1, 1),
('member4@gymer.com', '$2a$12$peO0xH0BGS8z7kkXfpD3pOFbBcd6OpMdmyaUnMsERZmu3OshkZl0.', 'Pham Thi Dung', 'member', 'STRONG04', '0901000007', 1, 1),
('member5@gymer.com', '$2a$12$peO0xH0BGS8z7kkXfpD3pOFbBcd6OpMdmyaUnMsERZmu3OshkZl0.', 'Hoang Van Em', 'member', 'POWER05', '0901000008', 1, 1),
('member6@gymer.com', '$2a$12$peO0xH0BGS8z7kkXfpD3pOFbBcd6OpMdmyaUnMsERZmu3OshkZl0.', 'Vo Thi Phuong', 'member', NULL, '0901000009', 1, 0),
('member7@gymer.com', '$2a$12$peO0xH0BGS8z7kkXfpD3pOFbBcd6OpMdmyaUnMsERZmu3OshkZl0.', 'Dang Van Giang', 'member', NULL, '0901000010', 1, 1),
('member8@gymer.com', '$2a$12$peO0xH0BGS8z7kkXfpD3pOFbBcd6OpMdmyaUnMsERZmu3OshkZl0.', 'Bui Thi Hanh', 'member', NULL, '0901000011', 1, 0),
('member9@gymer.com', '$2a$12$peO0xH0BGS8z7kkXfpD3pOFbBcd6OpMdmyaUnMsERZmu3OshkZl0.', 'Ngo Van Ich', 'member', NULL, '0901000012', 0, 0),
('member10@gymer.com', '$2a$12$peO0xH0BGS8z7kkXfpD3pOFbBcd6OpMdmyaUnMsERZmu3OshkZl0.', 'Ly Thi Kim', 'member', NULL, '0901000013', 1, 0);
PRINT 'Users: ' + CAST(@@ROWCOUNT AS VARCHAR);
GO

-- 2. Plans
INSERT INTO Plans (name, description, price, duration_days, type, features, sort_order) VALUES
('Basic', 'Access to gym equipment', 29.99, 30, 'monthly', '["Gym Access","Locker Room"]', 1),
('Premium', 'Full gym + classes', 59.99, 30, 'monthly', '["Gym Access","Classes","Sauna","Locker Room"]', 2),
('VIP', 'Premium + personal trainer', 99.99, 30, 'monthly', '["Gym Access","Classes","Sauna","Personal Trainer","Nutrition Plan"]', 3),
('Annual Basic', '12 months Basic', 299.99, 365, 'yearly', '["Gym Access","Locker Room"]', 4),
('Annual Premium', '12 months Premium', 599.99, 365, 'yearly', '["Gym Access","Classes","Sauna","Locker Room"]', 5);
PRINT 'Plans: ' + CAST(@@ROWCOUNT AS VARCHAR);
GO

-- 3. Memberships (user_id, plan_id, start, end, status, auto_renew)
INSERT INTO Memberships (user_id, plan_id, start_date, end_date, status, auto_renew, created_at) VALUES
(4, 1, DATEADD(month,-2,GETDATE()), DATEADD(month,4,DATEADD(month,-2,GETDATE())), 'active', 1, DATEADD(month,-2,GETDATE())),
(5, 2, DATEADD(month,-3,GETDATE()), DATEADD(month,3,DATEADD(month,-3,GETDATE())), 'active', 1, DATEADD(month,-3,GETDATE())),
(6, 3, DATEADD(month,-1,GETDATE()), DATEADD(month,6,DATEADD(month,-1,GETDATE())), 'active', 1, DATEADD(month,-1,GETDATE())),
(7, 2, DATEADD(month,-5,GETDATE()), DATEADD(month,3,DATEADD(month,-5,GETDATE())), 'active', 0, DATEADD(month,-5,GETDATE())),
(8, 4, DATEADD(month,-2,GETDATE()), DATEADD(month,12,DATEADD(month,-2,GETDATE())), 'active', 1, DATEADD(month,-2,GETDATE())),
(9, 1, DATEADD(month,-1,GETDATE()), DATEADD(month,1,DATEADD(month,-1,GETDATE())), 'active', 1, DATEADD(month,-1,GETDATE())),
(10, 3, GETDATE(), DATEADD(month,6,GETDATE()), 'active', 1, GETDATE()),
(11, 5, DATEADD(month,-8,GETDATE()), DATEADD(month,12,DATEADD(month,-8,GETDATE())), 'active', 1, DATEADD(month,-8,GETDATE())),
(12, 2, DATEADD(month,-6,GETDATE()), GETDATE(), 'expired', 0, DATEADD(month,-6,GETDATE())),
(13, 1, DATEADD(month,-9,GETDATE()), GETDATE(), 'expired', 0, DATEADD(month,-9,GETDATE()));
PRINT 'Memberships: ' + CAST(@@ROWCOUNT AS VARCHAR);
GO

-- 4. Payments
INSERT INTO Payments (user_id, plan_id, amount, method, status, transaction_id, created_at) VALUES
(4, 1, 29.99, 'credit_card', 'completed', 'TXN' + CONVERT(VARCHAR, DATEADD(month,-2,GETDATE()), 112) + '-4', DATEADD(month,-2,GETDATE())),
(4, 1, 29.99, 'credit_card', 'completed', 'TXN' + CONVERT(VARCHAR, DATEADD(month,-1,GETDATE()), 112) + '-4', DATEADD(month,-1,GETDATE())),
(5, 2, 59.99, 'bank_transfer', 'completed', 'TXN' + CONVERT(VARCHAR, DATEADD(month,-3,GETDATE()), 112) + '-5', DATEADD(month,-3,GETDATE())),
(6, 3, 99.99, 'credit_card', 'completed', 'TXN' + CONVERT(VARCHAR, DATEADD(month,-1,GETDATE()), 112) + '-6', DATEADD(month,-1,GETDATE())),
(7, 2, 59.99, 'momo', 'completed', 'TXN' + CONVERT(VARCHAR, DATEADD(month,-5,GETDATE()), 112) + '-7', DATEADD(month,-5,GETDATE())),
(8, 4, 299.99, 'credit_card', 'completed', 'TXN' + CONVERT(VARCHAR, DATEADD(month,-2,GETDATE()), 112) + '-8', DATEADD(month,-2,GETDATE())),
(9, 1, 29.99, 'bank_transfer', 'completed', 'TXN' + CONVERT(VARCHAR, DATEADD(month,-1,GETDATE()), 112) + '-9', DATEADD(month,-1,GETDATE())),
(10, 3, 99.99, 'credit_card', 'completed', 'TXN' + CONVERT(VARCHAR, GETDATE(), 112) + '-10', GETDATE()),
(11, 5, 599.99, 'credit_card', 'completed', 'TXN' + CONVERT(VARCHAR, DATEADD(month,-8,GETDATE()), 112) + '-11', DATEADD(month,-8,GETDATE())),
(12, 2, 59.99, 'momo', 'completed', 'TXN' + CONVERT(VARCHAR, DATEADD(month,-6,GETDATE()), 112) + '-12', DATEADD(month,-6,GETDATE())),
(13, 1, 29.99, 'bank_transfer', 'failed', 'TXN' + CONVERT(VARCHAR, DATEADD(month,-9,GETDATE()), 112) + '-13', DATEADD(month,-9,GETDATE()));
PRINT 'Payments: ' + CAST(@@ROWCOUNT AS VARCHAR);
GO

-- 5. Invoices
INSERT INTO Invoices (invoice_number, user_id, payment_id, amount, tax, discount, total, created_at)
SELECT
  'GYM-' + CONVERT(VARCHAR, p.created_at, 112) + '-' + RIGHT('00000' + CAST(ROW_NUMBER() OVER(ORDER BY p.id) AS VARCHAR), 5),
  p.user_id, p.id, p.amount, p.amount * 0.08,
  CASE WHEN p.user_id % 2 = 0 THEN p.amount * 0.05 ELSE 0 END,
  p.amount + p.amount * 0.08 - CASE WHEN p.user_id % 2 = 0 THEN p.amount * 0.05 ELSE 0 END,
  p.created_at
FROM Payments p WHERE p.status = 'completed';
PRINT 'Invoices: ' + CAST(@@ROWCOUNT AS VARCHAR);
GO

-- 6. ReferralCodes
INSERT INTO ReferralCodes (user_id, code, status, created_at) VALUES
(4, 'GETFIT01', 'active', DATEADD(month,-6,GETDATE())),
(5, 'FITFAM02', 'active', DATEADD(month,-5,GETDATE())),
(6, 'GYMPAL03', 'active', DATEADD(month,-4,GETDATE())),
(7, 'STRONG04', 'active', DATEADD(month,-8,GETDATE())),
(8, 'POWER05', 'active', DATEADD(month,-3,GETDATE()));
PRINT 'ReferralCodes: ' + CAST(@@ROWCOUNT AS VARCHAR);
GO

-- 7. ReferralTransactions
INSERT INTO ReferralTransactions (referrer_id, referred_id, commission_amount, transaction_type, status, created_at) VALUES
(4, 7, 29.99, 'purchase', 'confirmed', DATEADD(month,-5,GETDATE())),
(5, 8, 59.99, 'purchase', 'confirmed', DATEADD(month,-4,GETDATE())),
(4, 9, 29.99, 'purchase', 'confirmed', DATEADD(month,-3,GETDATE())),
(6, 10, 99.99, 'purchase', 'confirmed', DATEADD(month,-2,GETDATE())),
(5, 12, 59.99, 'purchase', 'confirmed', DATEADD(month,-1,GETDATE())),
(7, 13, 29.99, 'purchase', 'pending', DATEADD(day,-10,GETDATE()));
PRINT 'ReferralTransactions: ' + CAST(@@ROWCOUNT AS VARCHAR);
GO

-- 8. Affiliates
INSERT INTO Affiliates (user_id, tier, commission_rate, total_earned, total_paid, status, approved_at, created_at) VALUES
(4, 'gold', 15.00, 150.00, 100.00, 'approved', DATEADD(month,-5,GETDATE()), DATEADD(month,-6,GETDATE())),
(5, 'silver', 12.00, 80.00, 40.00, 'approved', DATEADD(month,-4,GETDATE()), DATEADD(month,-5,GETDATE())),
(6, 'bronze', 10.00, 30.00, 0.00, 'approved', DATEADD(month,-3,GETDATE()), DATEADD(month,-4,GETDATE())),
(7, 'bronze', 10.00, 15.00, 0.00, 'pending', NULL, DATEADD(month,-2,GETDATE()));
PRINT 'Affiliates: ' + CAST(@@ROWCOUNT AS VARCHAR);
GO

-- 9. AffiliatePayouts
INSERT INTO AffiliatePayouts (affiliate_id, amount, method, status, processed_at, created_at)
SELECT a.id, p.amt, p.method, p.sts, p.prcd, p.crt
FROM (VALUES
  (4, 50.00, 'bank_transfer', 'completed', DATEADD(month,-3,GETDATE()), DATEADD(month,-3,GETDATE())),
  (4, 50.00, 'bank_transfer', 'completed', DATEADD(month,-1,GETDATE()), DATEADD(month,-1,GETDATE())),
  (5, 40.00, 'momo', 'completed', DATEADD(month,-1,GETDATE()), DATEADD(month,-1,GETDATE())),
  (4, 100.00, 'bank_transfer', 'processing', NULL, DATEADD(day,-5,GETDATE()))
) p(uid, amt, method, sts, prcd, crt)
JOIN Affiliates a ON a.user_id = p.uid;
PRINT 'AffiliatePayouts: ' + CAST(@@ROWCOUNT AS VARCHAR);
GO

-- 10. Coupons
INSERT INTO Coupons (code, type, value, min_purchase, start_date, end_date, usage_limit, user_limit, applicable_plans, is_active, created_at) VALUES
('WELCOME10', 'first_purchase', 10.00, 0, DATEADD(month,-6,GETDATE()), DATEADD(month,6,GETDATE()), 100, 1, '[1,2]', 1, GETDATE()),
('SUMMER20', 'percentage', 20.00, 50, DATEADD(month,-2,GETDATE()), DATEADD(month,1,GETDATE()), 50, 1, '[2,3]', 1, DATEADD(month,-2,GETDATE())),
('FREEMONTH', 'free_trial', 29.99, 0, DATEADD(month,-1,GETDATE()), DATEADD(month,2,GETDATE()), 20, 1, '[1]', 1, DATEADD(month,-1,GETDATE())),
('VIP50', 'flash_sale', 50.00, 100, DATEADD(day,-5,GETDATE()), DATEADD(day,5,GETDATE()), 10, 1, '[3]', 1, DATEADD(day,-5,GETDATE())),
('LOYALTY15', 'referral', 15.00, 0, DATEADD(month,-3,GETDATE()), DATEADD(month,3,GETDATE()), 200, 1, '[1,2,3]', 1, DATEADD(month,-3,GETDATE())),
('FLASH10', 'flash_sale', 10.00, 30, DATEADD(day,-10,GETDATE()), DATEADD(day,2,GETDATE()), 30, 1, '[1,2]', 1, DATEADD(day,-10,GETDATE()));
PRINT 'Coupons: ' + CAST(@@ROWCOUNT AS VARCHAR);
GO

-- 11. CouponUsages
INSERT INTO CouponUsages (coupon_id, user_id, discount_amount, used_at)
SELECT c.id, p.user_id,
  CASE WHEN c.type = 'percentage' THEN p.amount * c.value / 100 ELSE c.value END,
  p.created_at
FROM (VALUES (1,4),(2,5),(3,6),(4,8),(5,9)) cu(cidx, uid)
JOIN Coupons c ON c.id = cu.cidx
JOIN Users u ON u.id = cu.uid
JOIN Payments p ON p.user_id = u.id AND p.status = 'completed';
PRINT 'CouponUsages: ' + CAST(@@ROWCOUNT AS VARCHAR);
GO

-- 12. Points
INSERT INTO Points (user_id, balance, lifetime_earned, lifetime_spent, created_at) VALUES
(4, 500, 1500, 1000, DATEADD(month,-6,GETDATE())),
(5, 300, 800, 500, DATEADD(month,-5,GETDATE())),
(6, 200, 600, 400, DATEADD(month,-4,GETDATE())),
(7, 100, 300, 200, DATEADD(month,-3,GETDATE())),
(8, 150, 400, 250, DATEADD(month,-2,GETDATE())),
(9, 50, 150, 100, DATEADD(month,-1,GETDATE())),
(10, 80, 80, 0, GETDATE());
PRINT 'Points: ' + CAST(@@ROWCOUNT AS VARCHAR);
GO

-- 13. PointTransactions
INSERT INTO PointTransactions (user_id, type, points, source, description, created_at) VALUES
(4, 'earn', 100, 'login', 'Daily login bonus', DATEADD(day,-30,GETDATE())),
(4, 'earn', 200, 'workout', 'Completed 10 workouts', DATEADD(day,-25,GETDATE())),
(4, 'earn', 150, 'purchase', 'Premium membership purchase', DATEADD(day,-20,GETDATE())),
(4, 'spend', 100, 'redeem', 'Redeemed for PT session', DATEADD(day,-15,GETDATE())),
(5, 'earn', 80, 'login', 'Daily login bonus', DATEADD(day,-28,GETDATE())),
(5, 'earn', 120, 'workout', 'Completed 5 workouts', DATEADD(day,-20,GETDATE())),
(5, 'spend', 50, 'redeem', 'Redeemed water bottle', DATEADD(day,-12,GETDATE())),
(6, 'earn', 60, 'login', 'Daily login bonus', DATEADD(day,-20,GETDATE())),
(6, 'earn', 100, 'referral', 'Referred member10', DATEADD(day,-15,GETDATE())),
(7, 'earn', 40, 'login', 'Daily login bonus', DATEADD(day,-10,GETDATE())),
(8, 'earn', 50, 'purchase', 'Membership purchase bonus', DATEADD(day,-5,GETDATE())),
(9, 'earn', 30, 'login', 'Daily login bonus', GETDATE());
PRINT 'PointTransactions: ' + CAST(@@ROWCOUNT AS VARCHAR);
GO

-- 14. RewardsCatalog
INSERT INTO RewardsCatalog (name, description, points_cost, stock, category, is_active) VALUES
('Free PT Session', '1-hour personal training session', 500, 20, 'training', 1),
('Gymer Water Bottle', 'Premium stainless steel bottle', 200, 50, 'merchandise', 1),
('Guest Pass', 'Bring a friend for free (1 day)', 150, 100, 'access', 1),
('Nutrition Consultation', '30-min nutrition consultation', 350, 15, 'training', 1),
('Gymer T-Shirt', 'Exclusive Gymer t-shirt', 250, 30, 'merchandise', 1),
('Sauna Upgrade', '1 month sauna access upgrade', 400, 25, 'upgrade', 1);
PRINT 'RewardsCatalog: ' + CAST(@@ROWCOUNT AS VARCHAR);
GO

-- 15. RewardRedemptions
INSERT INTO RewardRedemptions (user_id, reward_id, points_spent, status, created_at) VALUES
(4, 1, 500, 'fulfilled', DATEADD(day,-15,GETDATE())),
(4, 2, 200, 'fulfilled', DATEADD(day,-20,GETDATE())),
(5, 2, 200, 'fulfilled', DATEADD(day,-12,GETDATE())),
(6, 3, 150, 'pending', DATEADD(day,-2,GETDATE())),
(8, 4, 350, 'pending', GETDATE());
PRINT 'RewardRedemptions: ' + CAST(@@ROWCOUNT AS VARCHAR);
GO

-- 16. Workouts
INSERT INTO Workouts (name, description, coach_id, plan_type, difficulty, duration_minutes, is_active, created_at) VALUES
('Full Body Blast', 'Complete full body workout', 2, 'strength', 'intermediate', 45, 1, DATEADD(month,-3,GETDATE())),
('HIIT Cardio', 'High intensity interval training', 2, 'cardio', 'advanced', 30, 1, DATEADD(month,-3,GETDATE())),
('Yoga Flow', 'Beginner yoga session', 3, 'flexibility', 'beginner', 60, 1, DATEADD(month,-2,GETDATE())),
('Upper Body', 'Upper body strength', 2, 'strength', 'intermediate', 40, 1, DATEADD(month,-2,GETDATE())),
('Core Crusher', 'Ab-focused workout', 3, 'strength', 'intermediate', 25, 1, DATEADD(month,-1,GETDATE()));
PRINT 'Workouts: ' + CAST(@@ROWCOUNT AS VARCHAR);
GO

-- 17. WorkoutExercises
INSERT INTO WorkoutExercises (workout_id, name, sets, reps, weight, duration_seconds, rest_seconds, sort_order) VALUES
(1, 'Bench Press', 4, 10, 60.0, NULL, 60, 1),
(1, 'Squats', 4, 12, 80.0, NULL, 60, 2),
(1, 'Deadlifts', 3, 8, 100.0, NULL, 90, 3),
(1, 'Pull-ups', 3, 8, NULL, NULL, 60, 4),
(2, 'Burpees', 3, 15, NULL, 60, 30, 1),
(2, 'Mountain Climbers', 3, 20, NULL, 45, 20, 2),
(2, 'Jump Squats', 3, 12, NULL, 45, 30, 3),
(3, 'Downward Dog', NULL, NULL, NULL, 90, 15, 1),
(3, 'Warrior Pose', NULL, NULL, NULL, 120, 20, 2),
(4, 'Shoulder Press', 4, 10, 40.0, NULL, 60, 1),
(4, 'Bicep Curls', 3, 12, 20.0, NULL, 45, 2),
(5, 'Planks', 3, 1, NULL, 60, 30, 1),
(5, 'Russian Twists', 3, 20, 10.0, NULL, 30, 2);
PRINT 'WorkoutExercises: ' + CAST(@@ROWCOUNT AS VARCHAR);
GO

-- 18. WorkoutSessions
INSERT INTO WorkoutSessions (user_id, workout_id, started_at, completed_at, status) VALUES
(4, 1, DATEADD(day,-3,GETDATE()), DATEADD(minute,45,DATEADD(day,-3,GETDATE())), 'completed'),
(4, 2, DATEADD(day,-5,GETDATE()), DATEADD(minute,30,DATEADD(day,-5,GETDATE())), 'completed'),
(4, 4, DATEADD(day,-7,GETDATE()), DATEADD(minute,40,DATEADD(day,-7,GETDATE())), 'completed'),
(5, 1, DATEADD(day,-2,GETDATE()), DATEADD(minute,45,DATEADD(day,-2,GETDATE())), 'completed'),
(5, 3, DATEADD(day,-4,GETDATE()), DATEADD(minute,60,DATEADD(day,-4,GETDATE())), 'completed'),
(6, 2, DATEADD(day,-1,GETDATE()), DATEADD(minute,30,DATEADD(day,-1,GETDATE())), 'completed'),
(7, 1, DATEADD(day,-6,GETDATE()), DATEADD(minute,45,DATEADD(day,-6,GETDATE())), 'completed'),
(8, 2, DATEADD(day,-3,GETDATE()), DATEADD(minute,30,DATEADD(day,-3,GETDATE())), 'completed'),
(9, 1, DATEADD(day,-4,GETDATE()), DATEADD(minute,45,DATEADD(day,-4,GETDATE())), 'completed'),
(10, 3, DATEADD(day,-8,GETDATE()), DATEADD(minute,60,DATEADD(day,-8,GETDATE())), 'completed');
PRINT 'WorkoutSessions: ' + CAST(@@ROWCOUNT AS VARCHAR);
GO

-- 19. NutritionPlans
INSERT INTO NutritionPlans (user_id, coach_id, name, calories_target, protein_target, carbs_target, fat_target, start_date, end_date, is_active, created_at) VALUES
(4, 2, 'Muscle Building', 2800, 180, 300, 70, DATEADD(month,-1,GETDATE()), DATEADD(month,2,GETDATE()), 1, DATEADD(month,-1,GETDATE())),
(5, 2, 'Weight Loss', 1800, 120, 150, 50, DATEADD(month,-1,GETDATE()), DATEADD(month,2,GETDATE()), 1, DATEADD(month,-1,GETDATE())),
(6, 3, 'General Fitness', 2200, 140, 220, 60, DATEADD(day,-15,GETDATE()), DATEADD(month,1,GETDATE()), 1, DATEADD(day,-15,GETDATE())),
(7, NULL, 'Maintenance', 2000, 130, 200, 55, DATEADD(month,-2,GETDATE()), DATEADD(day,-1,GETDATE()), 0, DATEADD(month,-2,GETDATE()));
PRINT 'NutritionPlans: ' + CAST(@@ROWCOUNT AS VARCHAR);
GO

-- 20. NutritionEntries
INSERT INTO NutritionEntries (user_id, plan_id, meal_name, food_name, calories, protein, carbs, fat, logged_at) VALUES
(4, 1, 'Breakfast', 'Oatmeal with eggs', 450, 30, 50, 12, DATEADD(day,-1,GETDATE())),
(4, 1, 'Lunch', 'Chicken breast with rice', 650, 50, 60, 15, DATEADD(day,-1,GETDATE())),
(4, 1, 'Dinner', 'Salmon with vegetables', 500, 40, 20, 18, DATEADD(day,-1,GETDATE())),
(5, 2, 'Breakfast', 'Smoothie bowl', 350, 20, 45, 10, DATEADD(day,-1,GETDATE())),
(5, 2, 'Lunch', 'Grilled fish with salad', 400, 35, 15, 14, DATEADD(day,-1,GETDATE())),
(6, 3, 'Breakfast', 'Eggs and toast', 380, 25, 30, 16, DATEADD(day,-1,GETDATE())),
(6, 3, 'Lunch', 'Beef stir fry', 550, 40, 35, 22, DATEADD(day,-1,GETDATE()));
PRINT 'NutritionEntries: ' + CAST(@@ROWCOUNT AS VARCHAR);
GO

-- 21. Notifications
INSERT INTO Notifications (user_id, title, message, type, is_read, created_at) VALUES
(4, 'Welcome Back!', 'Your membership is active. Time to hit the gym!', 'system', 1, DATEADD(day,-5,GETDATE())),
(4, 'Workout Reminder', 'You have a scheduled session today at 5PM.', 'reminder', 0, DATEADD(hour,-3,GETDATE())),
(5, 'Payment Successful', 'Your Premium plan payment was processed.', 'payment', 1, DATEADD(day,-10,GETDATE())),
(5, 'Points Earned', 'You earned 80 points from today''s workout!', 'points', 1, DATEADD(day,-2,GETDATE())),
(6, 'New Class Available', 'HIIT Cardio class added at 6AM tomorrow.', 'promo', 0, DATEADD(day,-1,GETDATE())),
(7, 'Referral Bonus', 'Your friend joined! You earned 100 referral points.', 'reward', 0, DATEADD(day,-3,GETDATE())),
(8, 'Membership Expiring', 'Your plan expires in 7 days. Renew now!', 'alert', 0, DATEADD(day,-1,GETDATE())),
(9, 'Welcome!', 'Thank you for joining Gymer!', 'system', 1, DATEADD(day,-30,GETDATE()));
PRINT 'Notifications: ' + CAST(@@ROWCOUNT AS VARCHAR);
GO

-- 22. Tickets
INSERT INTO Tickets (user_id, subject, category, priority, status, assigned_to, created_at) VALUES
(4, 'Equipment maintenance request', 'maintenance', 'medium', 'open', 2, DATEADD(day,-2,GETDATE())),
(5, 'Billing inquiry', 'billing', 'low', 'resolved', NULL, DATEADD(day,-5,GETDATE())),
(6, 'Personal training session', 'training', 'high', 'open', 3, DATEADD(day,-1,GETDATE())),
(7, 'Locker issue', 'facility', 'low', 'pending', NULL, DATEADD(day,-3,GETDATE())),
(8, 'Membership cancellation', 'billing', 'urgent', 'open', NULL, DATEADD(day,-1,GETDATE())),
(4, 'Class schedule question', 'general', 'low', 'closed', NULL, DATEADD(day,-10,GETDATE()));
PRINT 'Tickets: ' + CAST(@@ROWCOUNT AS VARCHAR);
GO

-- 23. TicketMessages
INSERT INTO TicketMessages (ticket_id, sender_id, message, is_internal, created_at) VALUES
(1, 4, 'The treadmill #3 is making a strange noise when running above 10km/h.', 0, DATEADD(day,-2,GETDATE())),
(1, 2, 'I will check it tomorrow morning. Thanks for reporting.', 1, DATEADD(day,-2,GETDATE())),
(2, 5, 'I was charged twice for this month. Please check.', 0, DATEADD(day,-5,GETDATE())),
(2, 5, 'Refund processed. Please allow 3-5 business days.', 0, DATEADD(day,-4,GETDATE())),
(3, 6, 'I want to schedule extra PT sessions for next week.', 0, DATEADD(day,-1,GETDATE())),
(5, 8, 'Please cancel my membership effective immediately.', 0, DATEADD(day,-1,GETDATE())),
(6, 4, 'What time is the Saturday yoga class?', 0, DATEADD(day,-10,GETDATE())),
(6, 4, 'Yoga is at 8AM every Saturday in Studio B.', 0, DATEADD(day,-10,GETDATE()));
PRINT 'TicketMessages: ' + CAST(@@ROWCOUNT AS VARCHAR);
GO

-- 24. CRMCustomers
INSERT INTO CRMCustomers (user_id, tags, last_contact_at, assigned_coach_id, lifetime_value, risk_score, created_at) VALUES
(4, '[vip,regular,referral-source]', DATEADD(day,-1,GETDATE()), 2, 500.00, 10, DATEADD(month,-6,GETDATE())),
(5, '[regular,new]', DATEADD(day,-3,GETDATE()), 2, 300.00, 20, DATEADD(month,-5,GETDATE())),
(6, '[vip,high-risk]', DATEADD(day,-2,GETDATE()), 3, 250.00, 70, DATEADD(month,-4,GETDATE())),
(7, '[referral]', DATEADD(day,-5,GETDATE()), NULL, 100.00, 40, DATEADD(month,-3,GETDATE())),
(8, '[regular]', GETDATE(), NULL, 200.00, 15, DATEADD(month,-2,GETDATE())),
(9, '[new]', DATEADD(day,-1,GETDATE()), NULL, 50.00, 5, DATEADD(month,-1,GETDATE())),
(10, '[at-risk,inactive]', DATEADD(day,-7,GETDATE()), 3, 80.00, 85, DATEADD(day,-30,GETDATE())),
(11, '[loyal]', DATEADD(day,-10,GETDATE()), 2, 150.00, 10, DATEADD(month,-9,GETDATE())),
(12, '[regular]', DATEADD(day,-4,GETDATE()), NULL, 120.00, 30, DATEADD(month,-7,GETDATE())),
(13, '[at-risk]', DATEADD(day,-15,GETDATE()), NULL, 30.00, 90, DATEADD(month,-10,GETDATE()));
PRINT 'CRMCustomers: ' + CAST(@@ROWCOUNT AS VARCHAR);
GO

-- 25. CRMNotes
INSERT INTO CRMNotes (customer_id, author_id, content, type, created_at) VALUES
(1, 1, 'Member requested early morning hours. Follow up with manager.', 'follow_up', DATEADD(day,-5,GETDATE())),
(1, 2, 'Completed PT assessment. Recommended advanced program.', 'coach_note', DATEADD(day,-2,GETDATE())),
(3, 1, 'Multiple complaints about equipment. Needs attention.', 'note', DATEADD(day,-3,GETDATE())),
(3, 3, 'Showing improvement in form. Keep encouraging.', 'coach_note', DATEADD(day,-1,GETDATE())),
(7, 1, 'Has not visited in 2 weeks. Send re-engagement offer.', 'follow_up', DATEADD(day,-5,GETDATE()));
PRINT 'CRMNotes: ' + CAST(@@ROWCOUNT AS VARCHAR);
GO

-- 26. CRMTasks
INSERT INTO CRMTasks (customer_id, assigned_to, title, description, due_date, status, created_at) VALUES
(1, 2, 'Follow up assessment', 'Schedule next PT assessment', DATEADD(day,3,GETDATE()), 'pending', DATEADD(day,-2,GETDATE())),
(3, 3, 'Retention call', 'Call to discuss concerns about facilities', DATEADD(day,1,GETDATE()), 'pending', DATEADD(day,-3,GETDATE())),
(7, 3, 'Send re-engagement email', 'Send personalized offer to inactive member', DATEADD(day,-1,GETDATE()), 'completed', DATEADD(day,-3,GETDATE())),
(10, 2, 'Risk intervention', 'Immediate outreach needed - high risk score', GETDATE(), 'in_progress', DATEADD(day,-1,GETDATE()));
PRINT 'CRMTasks: ' + CAST(@@ROWCOUNT AS VARCHAR);
GO

-- 27. AuditLogs
INSERT INTO AuditLogs (user_id, action, entity_type, entity_id, old_value, new_value, ip, timestamp) VALUES
(1, 'user.login', 'User', 1, NULL, '{"ip":"192.168.1.10"}', '192.168.1.10', DATEADD(day,-1,GETDATE())),
(1, 'membership.create', 'Membership', 1, NULL, '{"plan":"Premium","price":59.99}', '192.168.1.10', DATEADD(month,-3,GETDATE())),
(5, 'user.register', 'User', 2, NULL, '{"email":"member2@gymer.com"}', '10.0.0.5', DATEADD(month,-5,GETDATE())),
(1, 'coupon.create', 'Coupon', 1, NULL, '{"code":"WELCOME10","value":10}', '192.168.1.10', DATEADD(month,-6,GETDATE())),
(1, 'payment.process', 'Payment', 1, NULL, '{"amount":59.99,"method":"credit_card"}', '192.168.1.10', DATEADD(month,-3,GETDATE())),
(6, 'ticket.create', 'Ticket', 1, NULL, '{"subject":"Equipment maintenance"}', '10.0.0.15', DATEADD(day,-2,GETDATE())),
(1, 'user.update', 'User', 8, '{"is_active":false}', '{"is_active":true}', '192.168.1.10', DATEADD(month,-1,GETDATE())),
(10, 'workout.complete', 'WorkoutSessions', 1, NULL, '{"workout":"Full Body","duration":45}', '10.0.0.20', DATEADD(day,-3,GETDATE())),
(5, 'point.earn', 'PointTransactions', 1, NULL, '{"points":80,"source":"workout"}', '10.0.0.5', DATEADD(day,-2,GETDATE())),
(1, 'backup.create', 'BackupLogs', 1, NULL, '{"type":"daily","status":"completed"}', '192.168.1.10', DATEADD(day,-1,GETDATE()));
PRINT 'AuditLogs: ' + CAST(@@ROWCOUNT AS VARCHAR);
GO

-- 28. BackupLogs
INSERT INTO BackupLogs (type, status, file_path, file_size, duration_seconds, verified, created_by, created_at) VALUES
('daily', 'completed', 'D:\backups\gymer_20260623.bak', 157286400, 45, 1, 1, DATEADD(day,-1,GETDATE())),
('daily', 'completed', 'D:\backups\gymer_20260622.bak', 157286400, 42, 1, 1, DATEADD(day,-2,GETDATE())),
('weekly', 'completed', 'D:\backups\gymer_weekly_20260620.bak', 524288000, 180, 1, 1, DATEADD(day,-4,GETDATE())),
('daily', 'completed', 'D:\backups\gymer_20260619.bak', 157286400, 44, 1, 1, DATEADD(day,-5,GETDATE())),
('daily', 'running', 'D:\backups\gymer_current.bak', NULL, NULL, 0, 1, GETDATE());
PRINT 'BackupLogs: ' + CAST(@@ROWCOUNT AS VARCHAR);
GO

-- 29. AnalyticsDaily (30 ngày gần nhất)
WITH dates AS (
  SELECT CAST(DATEADD(day,-n,GETDATE()) AS DATE) dt, n
  FROM (VALUES(0),(1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12),(13),(14),(15),
              (16),(17),(18),(19),(20),(21),(22),(23),(24),(25),(26),(27),(28),(29)) nums(n)
)
INSERT INTO AnalyticsDaily (date, dau, new_users, new_memberships, revenue, workouts_completed, tickets_created, coupons_used, points_earned, points_redeemed)
SELECT
  dt,
  3 + CAST(ABS(CHECKSUM(NEWID())) % 7 AS INT),
  CASE WHEN n % 4 = 0 THEN 1 ELSE 0 END,
  CASE WHEN n % 3 = 0 THEN 1 ELSE 0 END,
  50.00 + CAST((ABS(CHECKSUM(NEWID())) % 5000) AS DECIMAL(12,2)) / 100.0,
  CAST(ABS(CHECKSUM(NEWID())) % 5 AS INT),
  CAST(ABS(CHECKSUM(NEWID())) % 2 AS INT),
  CAST(ABS(CHECKSUM(NEWID())) % 3 AS INT),
  CAST(ABS(CHECKSUM(NEWID())) % 200 AS INT),
  CAST(ABS(CHECKSUM(NEWID())) % 50 AS INT)
FROM dates d;
PRINT 'AnalyticsDaily: ' + CAST(@@ROWCOUNT AS VARCHAR);
GO

-- 30. AnalyticsRetention
INSERT INTO AnalyticsRetention (cohort_date, day_1, day_7, day_14, day_30, day_60, day_90, total_users) VALUES
(DATEADD(month,-1,GETDATE()), 80, 60, 45, 30, 20, 15, 50),
(DATEADD(month,-2,GETDATE()), 75, 55, 40, 28, 18, 12, 45),
(DATEADD(month,-3,GETDATE()), 85, 65, 50, 35, 25, 18, 60),
(DATEADD(month,-4,GETDATE()), 70, 50, 35, 25, 15, 10, 40),
(DATEADD(month,-5,GETDATE()), 90, 70, 55, 40, 30, 22, 55),
(DATEADD(month,-6,GETDATE()), 78, 58, 42, 30, 20, 14, 35);
PRINT 'AnalyticsRetention: ' + CAST(@@ROWCOUNT AS VARCHAR);
GO

-- 31. Promotions
INSERT INTO Promotions (name, type, config, start_date, end_date, priority, is_active, created_at) VALUES
('Summer Sale 2026', 'discount', '{"discount_percent":20,"applicable_plans":[2,3]}', DATEADD(month,-1,GETDATE()), DATEADD(month,1,GETDATE()), 1, 1, DATEADD(month,-1,GETDATE())),
('New Year Fitness', 'referral', '{"bonus_points":200,"commission_boost":5}', DATEADD(month,-3,GETDATE()), DATEADD(month,3,GETDATE()), 0, 1, DATEADD(month,-3,GETDATE())),
('Flash Friday', 'flash_sale', '{"discount_percent":30,"duration_hours":48,"max_redemptions":10}', DATEADD(day,-7,GETDATE()), DATEADD(day,7,GETDATE()), 2, 1, DATEADD(day,-7,GETDATE()));
PRINT 'Promotions: ' + CAST(@@ROWCOUNT AS VARCHAR);
GO

-- ============================================
PRINT '';
PRINT '========================================';
PRINT '✅ GYMER DATABASE READY';
PRINT '   Tables: 34 | Data: ~250 rows';
PRINT '   Admin: admin@gymer.com / admin123';
PRINT '========================================';
GO
