import { z } from 'zod';
export const createTicketSchema = z.object({ subject: z.string().min(1).max(200), description: z.string().min(1), category: z.string().default('general'), priority: z.enum(['low','medium','high','urgent']).default('medium') });
export const replyTicketSchema = z.object({ message: z.string().min(1), is_internal: z.boolean().default(false) });
