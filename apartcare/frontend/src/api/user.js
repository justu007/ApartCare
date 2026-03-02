import axiosInstance from './axios';

export const getResidentDashboard = async () => {
    const response = await axiosInstance.get('/resident/dashboard/');
    return response.data;
};

export const getStaffDashboard = async () => {
    const response = await axiosInstance.get('/staff/dashboard/');
    return response.data;
};