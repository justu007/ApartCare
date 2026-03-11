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