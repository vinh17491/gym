import { z } from 'zod';

export const orderStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;
export const paymentStatuses = ['UNPAID', 'PENDING', 'PAID', 'FAILED', 'PARTIALLY_REFUNDED', 'REFUNDED'] as const;
const positiveId = z.coerce.number().int().safe().positive();

export const orderIdParam = z.object({ orderId: positiveId });
export const orderListQuery = z.object({
  search: z.string().trim().min(1).max(255).optional(),
  orderStatus: z.enum(orderStatuses).optional(),
  paymentStatus: z.enum(paymentStatuses).optional(),
  userId: positiveId.optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  sortBy: z.enum(['order_number', 'customer_name', 'total_amount', 'order_status', 'payment_status', 'created_at', 'updated_at']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().refine(value => [10, 20, 50, 100].includes(value), 'limit must be 10, 20, 50, or 100').default(20),
}).superRefine((value, context) => { if (value.dateFrom && value.dateTo && value.dateFrom > value.dateTo) context.addIssue({ code: z.ZodIssueCode.custom, path: ['dateTo'], message: 'dateTo must be on or after dateFrom' }); });
export const updateOrderStatus = z.object({ status: z.enum(orderStatuses), note: z.string().trim().min(1).max(500).optional() }).strict();
