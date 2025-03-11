import axiosClient from './axiosClient';

interface CheckoutRequest {
    lineItemIds: string;
    shippingAddress: string;
    note: string;
}

const orderService = {
    getMyOrder() {
        const url = '/api/order/my-orders';
        return axiosClient.get(url);
    },
    getOrderById(id: number){
        const url = `/api/order/${id}`;
        return axiosClient.get(url);
    },
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
