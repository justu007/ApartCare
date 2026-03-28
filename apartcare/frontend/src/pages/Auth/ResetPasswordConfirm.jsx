// import React, { useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';

// const ResetPasswordConfirm = () => {
//     const { uid, token } = useParams();
//     const navigate = useNavigate();

//     const [newPassword, setNewPassword] = useState('');
//     const [confirmPassword, setConfirmPassword] = useState('');
//     const [message, setMessage] = useState('');
//     const [error, setError] = useState('');
//     const [loading, setLoading] = useState(false);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setMessage('');
//         setError('');

//         if (newPassword !== confirmPassword) {
//             return setError("Passwords do not match!");
//         }
//         if (newPassword.length < 8) {
//             return setError("Password must be at least 8 characters long.");
//         }

//         setLoading(true);
//         try {
            
//             await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/reset-password/`, {
//                 uid: uid,
//                 token: token,
//                 new_password: newPassword
//             });

//             setMessage("Password reset successfully! Redirecting to login...");
            
//             setTimeout(() => {
//                 navigate('/'); 
//             }, 2000);

//         } catch (err) {
//             setError(err.response?.data?.error || "Failed to reset password. The link may be expired.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="flex items-center justify-center min-h-screen bg-gray-100">
//             <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
//                 <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">Set New Password</h2>
                
//                 {message && <div className="p-3 mb-4 text-green-700 bg-green-100 rounded">{message}</div>}
//                 {error && <div className="p-3 mb-4 text-red-700 bg-red-100 rounded">{error}</div>}

//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">New Password</label>
//                         <input 
//                             type="password" 
//                             value={newPassword} 
//                             onChange={(e) => setNewPassword(e.target.value)} 
//                             required 
//                             className="w-full p-2 mt-1 border rounded focus:ring-2 focus:ring-blue-500" 
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
//                         <input 
//                             type="password" 
//                             value={confirmPassword} 
//                             onChange={(e) => setConfirmPassword(e.target.value)} 
//                             required 
//                             className="w-full p-2 mt-1 border rounded focus:ring-2 focus:ring-blue-500" 
//                         />
//                     </div>
//                     <button 
//                         type="submit" 
//                         disabled={loading}
//                         className="w-full py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
//                     >
//                         {loading ? 'Saving...' : 'Reset Password'}
//                     </button>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default ResetPasswordConfirm;

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
        setMessage(''); setError('');

        if (newPassword !== confirmPassword) return setError("Passwords do not match!");
        if (newPassword.length < 8) return setError("Password must be at least 8 characters long.");

        setLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/reset-password/`, {
                uid: uid, token: token, new_password: newPassword
            });
            setMessage("Password reset successfully! Redirecting to login...");
            setTimeout(() => { navigate('/'); }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to reset password. The link may be expired.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center w-full min-h-[85vh]">
            <div className="relative w-full max-w-md p-8 overflow-hidden transition-all duration-300 border shadow-2xl bg-slate-900 border-slate-800 shadow-black/50 rounded-2xl">
                {/* Subtle Inner Glow */}
                <div className="absolute top-0 left-1/2 w-full h-1/2 bg-cyan-500/10 -translate-x-1/2 blur-[80px] pointer-events-none"></div>

                <div className="relative z-10">
                    <h2 className="mb-6 text-2xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Set New Password</h2>
                    
                    {message && <div className="p-3 mb-5 text-sm border rounded-lg text-emerald-300 bg-emerald-500/10 border-emerald-500/20">{message}</div>}
                    {error && <div className="p-3 mb-5 text-sm border rounded-lg text-rose-300 bg-rose-500/10 border-rose-500/20">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block mb-1.5 text-sm font-medium text-slate-300">New Password</label>
                            <input 
                                type="password" 
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)} 
                                required 
                                className="w-full p-3 transition-all duration-200 border outline-none bg-slate-800/50 border-slate-700 text-slate-100 rounded-xl focus:bg-slate-800 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block mb-1.5 text-sm font-medium text-slate-300">Confirm Password</label>
                            <input 
                                type="password" 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                required 
                                className="w-full p-3 transition-all duration-200 border outline-none bg-slate-800/50 border-slate-700 text-slate-100 rounded-xl focus:bg-slate-800 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-3 mt-2 font-bold text-white transition-all duration-300 transform rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:-translate-y-0.5 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Reset Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordConfirm;