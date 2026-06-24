import { Request, Response, NextFunction } from 'express';
import { query } from '../../config/database';
import { sendSuccess } from '../../utils/response';

export async function getDashboard(req: Request, _res: Response, next: NextFunction) {
  try {
    const [assigned, active, earnings] = await Promise.all([
      query("SELECT COUNT(*) as total FROM CRMCustomers WHERE assigned_coach_id=@uid", { uid: req.user!.userId }),
      query("SELECT COUNT(DISTINCT c.user_id) as total FROM WorkoutSessions ws JOIN CRMCustomers c ON ws.user_id=c.user_id WHERE c.assigned_coach_id=@uid AND ws.started_at>=DATEADD(day,-30,GETDATE())", { uid: req.user!.userId }),
      query("SELECT ISNULL(SUM(commission_amount),0) as total FROM ReferralTransactions WHERE referrer_id=@uid AND status IN ('confirmed','paid')", { uid: req.user!.userId }),
    ]);
    sendSuccess(_res, { assignedMembers: assigned.recordset[0].total, activeMembers: active.recordset[0].total, monthlyEarnings: earnings.recordset[0].total, });
  } catch (err) { next(err); }
}

export async function getMemberGrowth(req: Request, _res: Response, next: NextFunction) {
  try {
    const r = await query("SELECT CAST(u.created_at AS DATE) as date, COUNT(*) as new_members FROM Users u JOIN CRMCustomers c ON u.id=c.user_id WHERE c.assigned_coach_id=@uid GROUP BY CAST(u.created_at AS DATE) ORDER BY date", { uid: req.user!.userId });
    sendSuccess(_res, r.recordset);
  } catch (err) { next(err); }
}

export async function getMonthlyStatement(_req: Request, _res: Response, next: NextFunction) {
  try {
    const r = await query("SELECT rt.*, u.name as referred_name FROM ReferralTransactions rt JOIN Users u ON rt.referred_id=u.id WHERE rt.referrer_id=@uid AND MONTH(rt.created_at)=MONTH(GETDATE()) AND YEAR(rt.created_at)=YEAR(GETDATE()) ORDER BY rt.created_at", { uid: _req.user!.userId });
    sendSuccess(_res, r.recordset);
  } catch (err) { next(err); }
}
