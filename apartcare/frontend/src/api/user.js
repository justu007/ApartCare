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

export const updateIssue = async (issueId, updateData) => {
    const response = await axiosInstance.patch(`/issues/${issueId}/`, updateData,{
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
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

export const payBillMock = async (billId) => {
    const response = await axiosInstance.post('bills/resident/bills/pay/', {
        bill_id: billId
    });
    return response.data;
};

export const getResidentBills = async () => {

    const response = await axiosInstance.get('bills/resident/bills/'); 
    return response.data;
}

export const createRazorpayOrder = async (billId) => {
    const response = await axiosInstance.post('bills/resident/bills/create-order/', { bill_id: billId });
    return response.data;
};

export const verifyRazorpayPayment = async (paymentData) => {
    const response = await axiosInstance.post('bills/resident/bills/verify-payment/', paymentData);
    return response.data;
};

export const getStaffSalaries = async () => {
    const response = await axiosInstance.get('/salary/view_salaries/');
    return response.data;
};


