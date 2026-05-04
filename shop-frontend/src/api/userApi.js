import axiosInstance from './axios';

// ========== Admin ==========
export const getAllUsers = () => {
  return axiosInstance.get('/api/users');
};

export const resetUserPassword = (userId, newPassword) => {
  return axiosInstance.patch('/api/users/' + userId + '/reset-password', { newPassword });
};

// ========== 我的預設收件資訊 ==========
export const getMyDefaultRecipientApi = () => {
  return axiosInstance.get('/api/users/me/default-recipient');
};

export const updateMyDefaultRecipientApi = (data) => {
  return axiosInstance.put('/api/users/me/default-recipient', data);
};
