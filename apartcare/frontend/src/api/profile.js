import axiosInstance from './axios';

export const getProfile = async () => {
    const response = await axiosInstance.get('/auth/profile/');
    return response.data;
};

export const updateProfile = async (data) => {
    const response = await axiosInstance.patch('/auth/profile/', data);
    return response.data;
};

export const changePassword = async (passwordPayload) => {
    const response = await axiosInstance.post('/auth/change-password/', passwordPayload);
    return response.data;
};