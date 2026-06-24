import { Response } from 'express';

export function sendSuccess(res: Response, data: any = null, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}

export function sendError(res: Response, message = 'Internal Server Error', statusCode = 500, errors?: any) {
  return res.status(statusCode).json({ success: false, message, errors });
}

export function sendPaginated(res: Response, data: any[], total: number, page: number, limit: number) {
  return res.status(200).json({
    success: true, data,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
}
