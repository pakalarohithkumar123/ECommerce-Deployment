import axios from "axios";

const API_URL = "http://localhost:8081/api";

export interface OrderItemRequest {
    productId: number;
    quantity: number;
}

export interface OrderResponse {
    orderId: number;
    userId: number;
    orderDate: string;
    status: string;
    totalAmount: number;
}

export interface PaymentResponse {
    keyId: string;
    amount: number;
    currency: string;
    razorpayOrderId: string;
}

export interface PaymentVerificationRequest {
    orderId: number;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
}

export const createOrder = async (
    items: OrderItemRequest[]
): Promise<OrderResponse> => {

    const response = await axios.post(
        `${API_URL}/orders`,
        {
            items: items
        }
    );

    return response.data;
};

export const createPayment = async (
    orderId: number
): Promise<PaymentResponse> => {

    const response = await axios.post(
        `${API_URL}/payments/create`,
        {
            orderId: orderId
        }
    );

    return response.data;
};

export const verifyPayment = async (
    data: PaymentVerificationRequest
) => {

    const response = await axios.post(
        `${API_URL}/payments/verify`,
        data
    );

    return response.data;
};