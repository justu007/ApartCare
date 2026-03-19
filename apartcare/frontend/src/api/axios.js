import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, 
    withCredentials: true, 
    headers: {
        'Content-Type': 'application/json', 
    },
});

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry && !originalRequest.url.includes('refresh')) {
            
            originalRequest._retry = true; 

            try {

                await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh/`, {}, {
                    withCredentials: true 
                }); 

                return axiosInstance(originalRequest);

            } catch (refreshError) {
                console.error("User is not authenticated (Refresh failed).");
                
                localStorage.clear(); 
                

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;