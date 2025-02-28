import axiosClient from './axiosClient';

const profileService = {
    getAllActive() {
        const url = '/api/user/my-profile';
        return axiosClient.get(url);
    },

    updateProfile(formData: FormData) {
        const url = '/api/user/update-profile';
        return axiosClient.put(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};

export default profileService;
