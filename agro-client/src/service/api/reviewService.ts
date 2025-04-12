import axiosClient from './axiosClient';

const reviewService = {
    getAllActive() {
        const url = '/api/review/get-all-active/2';
        return axiosClient.get(url);
    },
    getAllReviewByProductId(id: number) {
        const url = `/api/public/review/get-all-active/${id}`;
        return axiosClient.get(url);
    },
    createReview(productId: number, reviewData: { star: number; comment: string }) {
        const url = `/api/review/product/${productId}`;
        return axiosClient.post(url, reviewData);
    },
};

export default reviewService;
