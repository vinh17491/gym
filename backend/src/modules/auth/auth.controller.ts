import { Request, Response, NextFunction } from 'express';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { config } from '../../config/config';
import { query } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { sendSuccess } from '../../utils/response';
import { UserRole } from '../../types';

function generateReferralCode(name: string): string {
  return (name.slice(0, 4).toUpperCase() + crypto.randomBytes(3).toString('hex')).slice(0, 10);
}

function generateTokens(payload: { userId: number; email: string; role: UserRole }) {
  const accessToken = jwt.sign(payload, config.jwt.accessSecret, { expiresIn: config.jwt.accessExpires as any });
  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpires as any });
  return { accessToken, refreshToken };
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, name, phone, referral_code } = req.body;
    const existing = await query('SELECT id FROM Users WHERE email=@email', { email });
    if (existing.recordset.length > 0) throw new AppError(409, 'Email already registered');

    const hashed = await bcrypt.hash(password, 12);
    const refCode = generateReferralCode(name);

    // For testing, create users with member role by default
    const userRole = 'member'; // Set default role to member for easier testing

    const result = await query(
      `INSERT INTO Users (email, password, name, phone, role, referral_code, is_active, email_verified)
       OUTPUT INSERTED.id, INSERTED.email, INSERTED.name, INSERTED.role, INSERTED.referral_code
       VALUES (@email, @password, @name, @phone, @role, @refCode, 1, 0)`,
      { email, password: hashed, name, phone: phone || null, role: userRole, refCode }
    );
    const user = result.recordset[0];

    // Process referral if code provided
    if (referral_code) {
      const referrer = await query('SELECT id FROM Users WHERE referral_code=@code', { code: referral_code });
      if (referrer.recordset.length > 0) {
        await query(`INSERT INTO ReferralTransactions (referrer_id, referred_id, commission_amount, transaction_type, created_at)
          VALUES (@refId, @newId, 0, 'registration', GETDATE())`, { refId: referrer.recordset[0].id, newId: user.id });
        await query(`UPDATE Users SET referred_by=@refId WHERE id=@newId`, { refId: referrer.recordset[0].id, newId: user.id });
      }
    }

    const tokens = generateTokens({ userId: user.id, email: user.email, role: user.role as UserRole });
    sendSuccess(res, { user: { id: user.id, email: user.email, name: user.name, role: user.role, referral_code: user.referral_code }, ...tokens }, 'Registered', 201);
  } catch (err) { next(err); }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const result = await query('SELECT * FROM Users WHERE email=@email AND is_active=1', { email });
    if (result.recordset.length === 0) throw new AppError(401, 'Invalid credentials');

    const user = result.recordset[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError(401, 'Invalid credentials');

    await query('UPDATE Users SET last_login_at=GETDATE() WHERE id=@id', { id: user.id });
    const tokens = generateTokens({ userId: user.id, email: user.email, role: user.role });
    sendSuccess(res, { user: { id: user.id, email: user.email, name: user.name, role: user.role }, ...tokens }, 'Login successful');
  } catch (err) { next(err); }
}

export async function logout(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, null, 'Logged out'); } catch (err) { next(err); }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await query('SELECT id,email,name,phone,role,referral_code,avatar_url,is_active,created_at FROM Users WHERE id=@id', { id: req.user!.userId });
    if (result.recordset.length === 0) throw new AppError(404, 'User not found');
    sendSuccess(res, result.recordset[0]);
  } catch (err) { next(err); }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken: token } = req.body;
    if (!token) throw new AppError(400, 'Refresh token required');
    const decoded = jwt.verify(token, config.jwt.refreshSecret) as { userId: number; email: string; role: UserRole };
    const tokens = generateTokens({ userId: decoded.userId, email: decoded.email, role: decoded.role });
    sendSuccess(res, tokens);
  } catch (err) { next(err); }
}
