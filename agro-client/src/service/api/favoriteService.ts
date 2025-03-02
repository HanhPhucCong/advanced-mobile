import axiosClient from './axiosClient';

const favoriteService = {
    addToFavorite(productId: number) {
        const url = `/api/favorite/add/${productId}`;
        return axiosClient.put(url);
    },
    remove(productId: number) {
        const url = `/api/favorite/remove/${productId}`;
        return axiosClient.put(url);
    },
    myFavorite() {
        const url = `/api/favorite/my-favorite`;
        return axiosClient.get(url);
    },
    clearAll() {
        const url = `/api/favorite/clear`;
        return axiosClient.delete(url);
    },
};

export default favoriteService;
