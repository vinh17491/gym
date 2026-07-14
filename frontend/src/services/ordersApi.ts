import api from '../api/axios';
import type { CustomerOrderDetail,PaymentNotificationInput,PaymentNotificationResult,CreateOrderInput,CreateOrderResult } from '../types/orders';
interface ApiResponse<T>{success:boolean;data:T;message?:string}
export const ordersApi={
 getCustomerOrder:(orderId:number)=>api.get<ApiResponse<CustomerOrderDetail>>(`/orders/${orderId}`),
 notifyOrderPayment:(orderId:number,payload:PaymentNotificationInput)=>api.post<ApiResponse<PaymentNotificationResult>>(`/orders/${orderId}/payment-notification`,payload),
 createOrder:(payload:CreateOrderInput)=>api.post<ApiResponse<CreateOrderResult>>('/orders',payload),
};
