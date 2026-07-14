export type OrderStatus = 'PENDING'|'CONFIRMED'|'PROCESSING'|'SHIPPED'|'DELIVERED'|'CANCELLED';
export type PaymentStatus = 'UNPAID'|'PENDING'|'PAID'|'FAILED'|'PARTIALLY_REFUNDED'|'REFUNDED';
export type OrderSortField = 'order_number'|'customer_name'|'total_amount'|'order_status'|'payment_status'|'created_at'|'updated_at';
export interface AdminOrderFilters { search:string; orderStatus:OrderStatus|''; paymentStatus:PaymentStatus|''; userId:string; dateFrom:string; dateTo:string; sortBy:OrderSortField; sortOrder:'asc'|'desc'; page:number; limit:10|20|50|100 }
export interface AdminOrderListItem { id:number; orderNumber:string; userId:number; customerName:string; customerEmail:string; customerPhone:string|null; itemCount:number; subtotal:number; discountAmount:number; shippingAmount:number; taxAmount:number; totalAmount:number; currency:string; orderStatus:OrderStatus; paymentStatus:PaymentStatus; paymentProvider:string|null; createdAt:string; updatedAt:string }
export interface AdminOrderItem { id:number; productId:number; variantId:number; productName:string; variantName:string; sku:string; quantity:number; unitPrice:number; lineTotal:number; createdAt:string }
export interface OrderStatusHistoryItem { id:number; previousStatus:OrderStatus|null; newStatus:OrderStatus; changedBy:number|null; changedByName:string|null; changedByEmail:string|null; note:string|null; createdAt:string }
export interface AdminOrderDetail { id:number; orderNumber:string; userId:number; orderStatus:OrderStatus; paymentStatus:PaymentStatus; subtotal:number; discountAmount:number; shippingAmount:number; taxAmount:number; totalAmount:number; currency:string; createdAt:string; updatedAt:string; customer:{name:string;email:string;phone:string|null}; shipping:{addressLine1:string|null;addressLine2:string|null;city:string|null;state:string|null;postalCode:string|null;country:string|null}; payment:{provider:string|null;reference:string|null;stripeCheckoutSessionId:string|null;stripePaymentIntentId:string|null}; items:AdminOrderItem[]; statusHistory:OrderStatusHistoryItem[] }
export interface AdminOrderListResponse { items:AdminOrderListItem[]; page:number; limit:number; total:number; totalPages:number }
export interface UpdateOrderStatusInput { status:OrderStatus; note?:string }
export interface PaymentNotificationInput { paymentReference?:string }
export interface PaymentNotificationResult { orderId:number; orderNumber:string; paymentStatus:'PENDING'; paymentProvider:'BANK_TRANSFER'; emailSent:boolean }
export interface AdminPaymentStatusInput { status:'PAID'|'FAILED'|'UNPAID'; note?:string }
export interface AdminPaymentStatusResult { orderId:number; orderNumber:string; previousPaymentStatus:PaymentStatus; paymentStatus:'PAID'|'FAILED'|'UNPAID'; emailSent:boolean }
export interface BankTransferDisplayConfig { bankName:string; accountName:string; accountNumber:string; qrImageUrl:string }
