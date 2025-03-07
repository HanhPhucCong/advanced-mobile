import axiosClient from './axiosClient';

interface CheckoutRequest {
    lineItemIds: string;
    shippingAddress: string;
    note: string;
}

const orderService = {
    checkoutByCOD(checkoutRequest: CheckoutRequest) {
        const url = '/api/order/checkout-by-cod';
        return axiosClient.post(url, checkoutRequest);
    },
    checkoutByVnpay(checkoutRequest: CheckoutRequest) {
        const url = '/api/payment/create-payment';
        return axiosClient.post(url, checkoutRequest);
    },
};

export default orderService;
