import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPasswordConfirm = () => {
    const { uid, token } = useParams();
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (newPassword !== confirmPassword) {
            return setError("Passwords do not match!");
        }
        if (newPassword.length < 8) {
            return setError("Password must be at least 8 characters long.");
        }

        setLoading(true);
        try {
            
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/reset-password/`, {
                uid: uid,
                token: token,
                new_password: newPassword
            });

            setMessage("Password reset successfully! Redirecting to login...");
            
            setTimeout(() => {
                navigate('/'); 
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.error || "Failed to reset password. The link may be expired.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
                <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">Set New Password</h2>
                
                {message && <div className="p-3 mb-4 text-green-700 bg-green-100 rounded">{message}</div>}
                {error && <div className="p-3 mb-4 text-red-700 bg-red-100 rounded">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">New Password</label>
                        <input 
                            type="password" 
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} 
                            required 
                            className="w-full p-2 mt-1 border rounded focus:ring-2 focus:ring-blue-500" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <input 
                            type="password" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            required 
                            className="w-full p-2 mt-1 border rounded focus:ring-2 focus:ring-blue-500" 
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordConfirm;