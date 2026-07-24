import { User } from '../types';
export type Role=User['role'];
export const roleHome=(role:Role)=>role==='admin'?'/admin':role==='coach'?'/coach':'/dashboard';
export const routeRoles:Record<string,Role[]>= {
  '/dashboard':['member','coach','admin'],'/members':['coach','admin'],'/crm':['coach','admin'],'/referral':['member'],'/coupons':['admin'],'/loyalty':['member'],'/tickets':['member','coach','admin'],'/invoices':['member','admin'],'/settings':['member','coach','admin'],'/booking':['member','coach','admin'],'/profile':['member','coach','admin'],'/orders':['member'],'/checkout':['member'],'/video':['coach','admin'],'/coach':['coach'],'/workouts':['member'],'/progress':['member','coach','admin'],
};
export const canAccess=(role:Role,path:string)=>path.startsWith('/admin')?role==='admin':(routeRoles[path]||routeRoles[Object.keys(routeRoles).find(key=>path.startsWith(`${key}/`))||'']||[]).includes(role);
