import axiosClient from './axiosClient';
import axios from 'axios';

// tạo instance khác để dùng cho refresh token,
// vì refreshToken dùng trong chính instance chính ko tự gọi được
const axiosRefresh = axios.create({
    baseURL: 'http://10.0.2.2:8083', // URL chạy trên simulator
    headers: { 'Content-Type': 'application/json' },
});

const authService = {
    login: (email: string, password: string) => {
        return axiosClient.post('/api/v1/auth/signin', { email, password });
    },
    register: (fullName: string, email: string, password: string, passwordConfirm: string) => {
        return axiosClient.post('/api/v1/auth/signup', { fullName, email, password, passwordConfirm });
    },
    verify(code: string, userId: string) {
        return axiosClient.post(`/api/v1/auth/signup/${userId}`, { code });
    },
    getVerify(email: string) {
        return axiosClient.post('/api/v1/auth/get-verify', { email });
    },
    resetPassword(password: string, comfirmPassword: string, resetPasswordCode: string, userId: string) {
        return axiosClient.patch(`/api/v1/auth/renew-password/${userId}`, {
            password,
            comfirmPassword,
            resetPasswordCode,
        });
    },
    refreshToken(token: string) {
        return axiosRefresh.post('/api/v1/auth/refresh', { token });
    },
    signout(signoutRequest: { token: string; refreshToken: string }) {
        const url = '/api/v1/signout';
        return axiosClient.post(url, signoutRequest);
    },
};

export default authService;
