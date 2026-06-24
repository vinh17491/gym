import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';

export function auditLog(action: string, entityType: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const origJson = res.json.bind(res);
    res.json = function (body: any) {
      if (req.user && res.statusCode < 400) {
        query(`INSERT INTO AuditLogs (user_id,action,entity_type,entity_id,new_value,ip,device) VALUES (@userId,@action,@et,@eid,@nv,@ip,@dev)`, {
          userId: req.user.userId, action, entityType, entityId: req.params.id || body?.data?.id || 0,
          newValue: JSON.stringify(body?.data || {}), ip: req.ip || '', device: req.headers['user-agent'] || '',
        }).catch(() => {});
      }
      return origJson(body);
    };
    next();
  };
}
