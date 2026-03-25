import axiosInstance from './axios';

export const getResidentDashboard = async () => {
    const response = await axiosInstance.get('/resident/dashboard/');
    return response.data;
};

export const getStaffDashboard = async () => {
    const response = await axiosInstance.get('/staff/dashboard/');
    return response.data;
};


export const getIssues = async () => {
    const response = await axiosInstance.get('/issues/');
    return response.data;
};

export const createIssue = async (formData) => {
    const response = await axiosInstance.post('/issues/', formData, {
       
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const updateIssue = async (issueId, updateData) => {
    const response = await axiosInstance.patch(`/issues/${issueId}/`, updateData);
    return response.data;
};