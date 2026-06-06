import axiosInstance from './axios';

export const createCommunityAdmin = async (communityData) => {
    const response = await axiosInstance.post('/webapp/create-community/', communityData);
    return response.data; 
};


export const getCommunities = async () => {
  const response = await axiosInstance.get("/webapp/get-communities/");
  return response.data;
};


export const updateCommunity = (id, data) => {
  return axiosInstance.patch(`/webapp/update-community/${id}/`, data);
};


export const deactivateCommunity = (id) => {
  return axiosInstance.delete(`/webapp/deactivate-community/${id}/`);
};


export const reactivateCommunity = (id) => {
  return axiosInstance.patch(`/webapp/reactivate-community/${id}/`);
};


export const getSuperAdminAnalytics = async () => {
  const response = await axiosInstance.get('/webapp/superadmin-analytics/');
  return response.data;
};


export const getSaaSRates = async () => {
    const response = await axiosInstance.get('/webapp/saas-rates/');
    return response.data;
};


export const updateSaaSRates = async (rateData) => {
    const response = await axiosInstance.post('/webapp/saas-rates/', rateData);
    return response.data;
};


export const getSuperAdminAnnouncements = async () => {
    const res = await axiosInstance.get('/webapp/superadmin-announcements/');
    return res.data;
};

export const createSuperAdminAnnouncement = async (payload) => {
    const res = await axiosInstance.post('/webapp/superadmin-announcements/', payload);
    return res.data;
};

export const getSuperAdminNotifications = async () => {
    const res = await axiosInstance.get('/webapp/superadmin-notifications/');
    return res.data;
};

export const dismissSuperAdminNotification = async (id) => {
    const res = await axiosInstance.post('/webapp/superadmin-notifications/', { id });
    return res.data;
};

