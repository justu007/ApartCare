import axiosInstance from './axios';

export const createCommunityAdmin = async (communityData) => {

    const response = await axiosInstance.post('/webapp/create-community/', communityData);
    return response.data; 
};