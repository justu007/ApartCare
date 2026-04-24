import axiosInstance from './axios'; 

export const getCommunityHalls = async () => {
    const response = await axiosInstance.get('/hall/manage-venues/');
    return response.data;
};


export const createCommunityHall = async (hallData) => {
    const response = await axiosInstance.post('/hall/manage-venues/', hallData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};


export const updateCommunityHall = async (hallId, hallData) => {
    const response = await axiosInstance.put(`/hall/manage-venues/${hallId}/`, hallData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const getHallAvailability = async (hallId, month, year) => {
    const response = await axiosInstance.get(`/hall/availability/?hall_id=${hallId}&month=${month}&year=${year}`);
    return response.data;
};


export const getResidentBookings = async () => {
    const response = await axiosInstance.get('/hall/resident/bookings/');
    return response.data;
};


export const createResidentBooking = async (bookingData) => {
    const response = await axiosInstance.post('/hall/resident/bookings/', bookingData);
    return response.data;
};


export const getAllHallBookings = async () => {
    const response = await axiosInstance.get('/hall/bookings/manage/');
    return response.data;
};

export const updateBookingStatus = async (bookingId, status, adminRemarks = '') => {
    const response = await axiosInstance.put('/hall/bookings/manage/', {
        booking_id: bookingId,
        status: status,
        admin_remarks: adminRemarks
    });
    return response.data;
};

export const initiateHallPayment = async (bookingId) => {
    const response = await axiosInstance.post('/hall/payment/initiate/', { booking_id: bookingId });
    return response.data;
};

export const verifyHallPayment = async (paymentData) => {
    const response = await axiosInstance.post('/hall/payment/verify/', paymentData);
    return response.data;
};