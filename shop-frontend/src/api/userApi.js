import axiosInstance from './axios';

export const getAllUsers = () => {
  return axiosInstance.get('/api/users');
};
