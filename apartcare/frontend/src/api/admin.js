import axiosInstance from './axios';

export const getAdminDashboard = async () => {
    const response = await axiosInstance.get('/admin/dashboard/');
    return response.data;
};

export const getResidents = async (page = 1, limit = 10) => {
    const response = await axiosInstance.get(`/admin/residents?page=${page}&limit=${limit}`);
    return response.data;
};

export const getStaff = async (page = 1, limit = 10) => {
    const response = await axiosInstance.get(`/admin/staffs?page=${page}&limit=${limit}`);
    return response.data;
};

export const addUser = async (userData) => {
    const response = await axiosInstance.post('/auth/admin/create-user/', userData);
    return response.data;
};

export const getCommunityDetails = async () => {
    const response = await axiosInstance.get('/admin/community-details/');
    return response.data;
};

export const addBlock = async (blockData) => {
    const response = await axiosInstance.post('/apartment/create-block/', blockData);
    return response.data;
};

export const addFlat = async (flatData) => {
    const response = await axiosInstance.post('/apartment/create-flat/', flatData);
    return response.data;
};


export const updateUser = (id, data) => {
  return axiosInstance.put(`/admin/user/${id}/update/`, data);
};

export const updateStaff = (id, data) => {
  return axiosInstance.put(`/admin/staffs/${id}/update/`, data);
};

export const updateResident = (id, data) => {
  return axiosInstance.put(`/admin/residents/${id}/update/`, data);
};

export const deleteUser = (id) => {
  return axiosInstance.delete(`/auth/delete/${id}/`);
};

export const reactivateUser = (id) => {
  return axiosInstance.patch(`/auth/reactivate/${id}/`);
};

