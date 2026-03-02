import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axios'; 
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {

            const response = await axiosInstance.post('/auth/login/', {
                email: email,
                password: password
            });

            const data = response.data;

            localStorage.setItem('user', JSON.stringify({
                role: data.role,
                email: data.email_id,
                user_id: data.user_id
            }));

            if (data.role === 'SUPER_ADMIN') {
                navigate('/super-admin/create-community');
            } 
            else if (data.role === 'ADMIN') {
                navigate('/admin/dashboard');
            } 
            else if (data.role === 'RESIDENT') {
            navigate('/resident/dashboard'); 
            } 
            else if (data.role === 'STAFF') {
                navigate('/staff/dashboard');    
            } 
            else {
                navigate('/profile');
            }
            

        } catch (err) {
            if (err.response && err.response.data) {
                const errorData = err.response.data;
                if (errorData.non_field_errors) {
                    setError(errorData.non_field_errors[0]);
                } else {
                    setError("Invalid email or password.");
                }
            } else {
                setError("Unable to connect to the server.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-800">ApartCare Login</h2>
                
                {error && (
                    <div className="p-3 text-sm text-red-700 bg-red-100 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Email Address</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;