import api from './api';

export interface SavedPaymentMethod {
    id: number;
    stripe_customer_id: string;
    stripe_payment_method_id: string;
    card_brand: string | null;
    card_last4: string | null;
    card_exp_month: string | null;
    card_exp_year: string | null;
    is_default: boolean;
    created_at: string;
}

export interface CustomerCharge {
    id: number;
    amount: string;
    stripe_payment_intent_id: string | null;
    status: 'succeeded' | 'failed' | 'processing';
    description: string | null;
    created_at: string;
}

class PaymentService {
    async getPaymentMethods(userId: number): Promise<SavedPaymentMethod[]> {
        const response = await api.get(`/stripe/customers/${userId}/payment-methods`);
        return response.data.data;
    }

    async deletePaymentMethod(pmId: number): Promise<void> {
        await api.delete(`/stripe/payment-methods/${pmId}`);
    }

    async chargeCustomer(userId: number, paymentMethodId: number, amount: number, description?: string, reservationId?: number, formBookingRef?: string): Promise<any> {
        const response = await api.post('/stripe/charge-customer', {
            userId,
            paymentMethodId,
            amount,
            description,
            reservationId,
            formBookingRef
        });
        return response.data;
    }

    async getCustomerCharges(userId: number): Promise<CustomerCharge[]> {
        const response = await api.get(`/stripe/customers/${userId}/charges`);
        return response.data.data;
    }
}

export default new PaymentService();
