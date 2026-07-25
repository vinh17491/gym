import { Request,Response,NextFunction } from 'express';
import { query } from '../../config/database';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/errorHandler';
import * as bcrypt from 'bcryptjs';

export async function addMemberToCRM(req: Request, res: Response, next: NextFunction) {
  try {
    const coachId = req.user!.userId;
    const { email, name, phone } = req.body;
    if (!email) throw new AppError(400, 'Email is required');
    
    const userResult = await query('SELECT id FROM Users WHERE email = @email', { email });
    if (userResult.recordset.length === 0) {
      throw new AppError(404, 'User with this email not found. They must register first.');
    }
    
    const userId = userResult.recordset[0].id;
    
    // Assign to CRM
    const crmCheck = await query('SELECT id FROM CRMCustomers WHERE user_id = @userId', { userId });
    if (crmCheck.recordset.length === 0) {
      await query(
        `INSERT INTO CRMCustomers (user_id, assigned_coach_id, created_at)
         VALUES (@userId, @coachId, GETDATE())`,
        { userId, coachId }
      );
    } else {
      await query(
        `UPDATE CRMCustomers SET assigned_coach_id = @coachId WHERE user_id = @userId`,
        { userId, coachId }
      );
    }
    
    sendSuccess(res, { user_id: userId, assigned_coach_id: coachId }, 'Member assigned successfully', 201);
  } catch (error) {
    next(error);
  }
}

const scope=(req:Request,alias='c')=>req.user!.role==='coach'?` AND ${alias}.assigned_coach_id=@coachId`:'';
const params=(req:Request,extra:Record<string,unknown>={})=>({...extra,...(req.user!.role==='coach'?{coachId:req.user!.userId}:{})});
async function assertScope(req:Request,id:number){const found=await query(`SELECT c.id FROM CRMCustomers c WHERE c.id=@id${scope(req)}`,params(req,{id}));if(!found.recordset[0])throw new AppError(404,'Customer not found');}

export async function listCustomers(req:Request,res:Response,next:NextFunction){try{const {search,tag,page,limit}=req.query as unknown as {search?:string;tag?:string;page:number;limit:number};let where=` WHERE 1=1${scope(req)}`;const p:Record<string,unknown>=params(req,{offset:(page-1)*limit,limit});if(search){where+=' AND (u.name LIKE @search OR u.email LIKE @search)';p.search=`%${search}%`;}if(tag){where+=' AND c.tags LIKE @tag';p.tag=`%${tag}%`;}const rows=await query(`SELECT c.id,c.user_id,c.tags,c.last_contact_at,c.assigned_coach_id,c.lifetime_value,c.risk_score,c.created_at,u.name,u.email,u.phone,u.created_at joined_at, (SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END FROM Bookings b WHERE b.member_id = c.user_id AND b.coach_id = c.assigned_coach_id) as has_booked_sessions FROM CRMCustomers c JOIN Users u ON u.id=c.user_id${where} ORDER BY u.created_at DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,p);const count=await query(`SELECT COUNT(*) total FROM CRMCustomers c JOIN Users u ON u.id=c.user_id${where}`,p);sendSuccess(res,{items:rows.recordset,page,limit,total:Number(count.recordset[0].total)});}catch(error){next(error);}}
export async function getCustomer(req:Request,res:Response,next:NextFunction){try{const id=Number(req.params.id);const found=await query(`SELECT c.id,c.user_id,c.tags,c.last_contact_at,c.assigned_coach_id,c.lifetime_value,c.risk_score,c.created_at,u.name,u.email,u.phone,u.role,u.avatar_url,u.created_at joined_at FROM CRMCustomers c JOIN Users u ON u.id=c.user_id WHERE c.id=@id${scope(req)}`,params(req,{id}));if(!found.recordset[0])throw new AppError(404,'Customer not found');const notes=await query('SELECT id,customer_id,author_id,content,type,created_at FROM CRMNotes WHERE customer_id=@id ORDER BY created_at DESC',{id});const tasks=await query('SELECT id,customer_id,assigned_to,title,description,due_date,status,created_at FROM CRMTasks WHERE customer_id=@id ORDER BY due_date',{id});sendSuccess(res,{...found.recordset[0],notes:notes.recordset,tasks:tasks.recordset});}catch(error){next(error);}}
export async function addNote(req:Request,res:Response,next:NextFunction){try{const id=Number(req.params.id);await assertScope(req,id);const result=await query('INSERT CRMNotes(customer_id,author_id,content,type) OUTPUT INSERTED.* VALUES(@id,@author,@content,@type)',{id,author:req.user!.userId,content:req.body.content,type:req.body.type||'note'});sendSuccess(res,result.recordset[0],'Note added',201);}catch(error){next(error);}}
export async function createTask(req:Request,res:Response,next:NextFunction){try{const id=Number(req.params.id);await assertScope(req,id);const assigned=req.user!.role==='coach'?req.user!.userId:(req.body.assigned_to||req.user!.userId);const assignee=await query("SELECT id FROM Users WHERE id=@id AND is_active=1 AND role IN('admin','coach')",{id:assigned});if(!assignee.recordset[0])throw new AppError(400,'Invalid task assignee');const result=await query('INSERT CRMTasks(customer_id,assigned_to,title,description,due_date) OUTPUT INSERTED.* VALUES(@id,@assigned,@title,@description,@due)',{id,assigned,title:req.body.title,description:req.body.description||null,due:req.body.due_date});sendSuccess(res,result.recordset[0],'Task created',201);}catch(error){next(error);}}
