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
    getRandomProducts() {
        const url = '/api/public/products/random';
        return axiosClient.get(url);
    },
    searchProductsByName(params: { name: string; page?: number; size?: number }) {
        const { name, page = 0, size = 10 } = params;
        const url = `/api/public/products/search`;
        return axiosClient.get(url, { params: { name, page, size } });
    },
    getProductById(id: number) {
        const url = `/api/public/products/${id}`;
        return axiosClient.get(url);
    },
    getProductByCategory(id: number) {
        const url = `/api/public/products/category/${id}`;
        return axiosClient.get(url);
    },
};

export default productService;
