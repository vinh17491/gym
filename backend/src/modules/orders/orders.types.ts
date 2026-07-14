export interface PaymentNotificationInput { paymentReference?:string }
export interface PaymentNotificationResult { orderId:number; orderNumber:string; paymentStatus:'PENDING'; paymentProvider:'BANK_TRANSFER'; emailSent:boolean }
export interface AdminPaymentStatusInput { status:'PAID'|'FAILED'|'UNPAID'; note?:string }
export interface AdminPaymentStatusResult { orderId:number; orderNumber:string; previousPaymentStatus:string; paymentStatus:'PAID'|'FAILED'|'UNPAID'; emailSent:boolean }
export interface BankTransferPublicConfig { bankName:string|null; accountName:string|null; accountNumber:string|null; qrImageUrl:string|null; transferContent:string }
export interface CustomerOrderItem { id:number; productId:number; variantId:number; productName:string; variantName:string; sku:string; quantity:number; unitPrice:number; lineTotal:number }
export interface CustomerOrderDetail { id:number; orderNumber:string; userId:number; orderStatus:string; paymentStatus:string; paymentProvider:string|null; paymentReference:string|null; subtotal:number; discountAmount:number; shippingAmount:number; taxAmount:number; totalAmount:number; currency:string; createdAt:Date; updatedAt:Date; customerName:string; customerEmail:string; customerPhone:string|null; addressLine1:string|null; addressLine2:string|null; city:string|null; state:string|null; postalCode:string|null; country:string|null; items:CustomerOrderItem[]; bankTransfer?:BankTransferPublicConfig }
export interface CreateOrderItemInput { variantId:number; quantity:number }
export interface CreateOrderInput { customerName:string; customerPhone:string; shippingAddressLine1:string; shippingAddressLine2?:string; shippingCity:string; shippingState?:string; shippingPostalCode?:string; shippingCountry:string; items:CreateOrderItemInput[] }
export interface OrderPricing { subtotal:number; discountAmount:number; shippingAmount:number; taxAmount:number; totalAmount:number; currency:string }
export interface CreateOrderResult { id:number; orderNumber:string; orderStatus:'PENDING'; paymentStatus:'UNPAID'; paymentProvider:'BANK_TRANSFER'; subtotal:number; totalAmount:number; currency:string; itemCount:number; createdAt:Date }
export interface OrderCreationRow { variantId:number; productId:number; productName:string; variantName:string; sku:string; price:number; salePrice:number|null; onHand:number; reserved:number }
