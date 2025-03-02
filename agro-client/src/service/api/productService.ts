import axiosClient from './axiosClient';

interface ProductParams {
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: 'asc' | 'desc'; // Chỉ chấp nhận 'asc' hoặc 'desc'
}

const productService = {
    getAllActive(params?: ProductParams) {
        const url = '/api/public/products/all-active';
        return axiosClient.get(url, { params: params || {} });
    },
    getById(id: number) {
        const url = `/api/public/products/${id}`;
        return axiosClient.get(url);
    },
};

export default productService;
