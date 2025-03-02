import axiosClient from './axiosClient';

const cartService = {
    addToCart(productId: number) {
        const url = `/api/cart/increment/${productId}`;
        return axiosClient.put(url);
    },
    decrease(productId: number) {
        const url = `/api/cart/decrement/${productId}`;
        return axiosClient.put(url);
    },
    updateQuantity(productId: number, quantity: number) {
        const url = `/api/cart/update/${productId}/${quantity}`;
        return axiosClient.put(url);
    },
    removeFromCart(lineItemId: number) {
        const url = `/api/cart/remove/${lineItemId}`;
        return axiosClient.put(url);
    },
    myCart() {
        const url = '/api/cart/my-cart';
        return axiosClient.get(url);
    },
    clearAll() {
        const url = '/api/cart/clear';
        return axiosClient.delete(url);
    },
};

export default cartService;
