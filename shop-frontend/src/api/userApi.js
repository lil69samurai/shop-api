import axiosInstance from './axios';

export const getAllUsers = () => {
  return axiosInstance.get('/api/users');
};

export const resetUserPassword = (userId, newPassword) => {
  return axiosInstance.patch('/api/users/' + userId + '/reset-password', { newPassword });
};
