export type PaymentStatus='UNPAID'|'PENDING'|'PAID'|'FAILED'|'PARTIALLY_REFUNDED'|'REFUNDED';
export interface CustomerOrderItem { id:number; productId:number; variantId:number; productName:string; variantName:string; sku:string; quantity:number; unitPrice:number; lineTotal:number }
export interface BankTransferPublicConfig { bankName:string|null; accountName:string|null; accountNumber:string|null; qrImageUrl:string|null; transferContent:string }
export interface CustomerOrderDetail { id:number; orderNumber:string; userId:number; orderStatus:string; paymentStatus:PaymentStatus; paymentProvider:string|null; paymentReference:string|null; subtotal:number; discountAmount:number; shippingAmount:number; taxAmount:number; totalAmount:number; currency:string; createdAt:string; updatedAt:string; customerName:string; customerEmail:string; customerPhone:string|null; addressLine1:string|null; addressLine2:string|null; city:string|null; state:string|null; postalCode:string|null; country:string|null; items:CustomerOrderItem[]; bankTransfer?:BankTransferPublicConfig }
export interface PaymentNotificationInput { paymentReference?:string }
export interface PaymentNotificationResult { orderId:number; orderNumber:string; paymentStatus:'PENDING'; paymentProvider:'BANK_TRANSFER'; emailSent:boolean }
export interface CreateOrderItemInput { variantId:number; quantity:number }
export interface CreateOrderInput { customerName:string; customerPhone:string; shippingAddressLine1:string; shippingAddressLine2?:string; shippingCity:string; shippingState?:string; shippingPostalCode?:string; shippingCountry:string; items:CreateOrderItemInput[] }
export interface CreateOrderResult { id:number; orderNumber:string; orderStatus:string; paymentStatus:string; paymentProvider:string; subtotal:number; totalAmount:number; currency:string; itemCount:number; createdAt:string }
export interface CheckoutFormValues { customerName:string; customerPhone:string; addressLine1:string; addressLine2:string; city:string; state:string; postalCode:string; country:string }
export type CheckoutFormErrors = Partial<Record<keyof CheckoutFormValues | 'items', string>>;
