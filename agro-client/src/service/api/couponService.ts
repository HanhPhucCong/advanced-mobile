import axiosClient from './axiosClient';

interface CouponRequest {
    coinAmount: number;
}

const couponService = {
    create(request: CouponRequest) {
        const url = '/api/coupon/create';
        return axiosClient.post(url, request);
    },
    myCoupons() {
        const url = '/api/coupon/my-coupons';
        return axiosClient.get(url);
    },
    getById(id: number) {
        const url = `/api/coupon/${id}`;
        return axiosClient.get(url);
    },
};

export default couponService;
