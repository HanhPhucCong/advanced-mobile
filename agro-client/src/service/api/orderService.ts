import axiosClient from './axiosClient';

const orderService = {
    getMyOrder() {
        const url = '/api/order/my-orders';
        return axiosClient.get(url);
    },
    getOrderById(id: number){
        const url = `/api/order/${id}`;
        return axiosClient.get(url);
    }

};

export default orderService;
