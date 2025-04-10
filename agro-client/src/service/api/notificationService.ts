import axiosClient from './axiosClient';

const notificationService = {
  getAllByUser() {
    const url = '/api/notifications/me';
    return axiosClient.get(url);
  },

  markAsRead(notificationId: number) {
    const url = `/api/notifications/read/${notificationId}`;
    return axiosClient.patch(url);
  },
};

export default notificationService;
