
// import { useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { loginUser, fetchProfile } from "../../features/auth/authSlice";
// import { useNavigate } from "react-router-dom";
// import axios from 'axios';

// function Login() {
//     const [popup, setPopup] = useState({ isOpen: false, status: '', message: '' });
//     const dispatch = useDispatch();
//     const navigate = useNavigate();
//     const { loading, error } = useSelector((state) => state.auth);

//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [showForgotForm, setShowForgotForm] = useState(false);
//     const [resetEmail, setResetEmail] = useState('');
//     const [resetMessage, setResetMessage] = useState('');
//     const [isResetting, setIsResetting] = useState(false);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             await dispatch(loginUser({ email, password })).unwrap();
//             const profileData = await dispatch(fetchProfile()).unwrap();
//             const userRole = profileData.role;

//             if (userRole === 'SUPER_ADMIN') navigate('/super-admin/Dashboard');
//             else if (userRole === 'ADMIN') navigate('/admin/dashboard');
//             else if (userRole === 'RESIDENT') navigate('/resident/dashboard');
//             else if (userRole === 'STAFF') navigate('/staff/dashboard');
//             else navigate('/profile');
//         } catch (err) {
//             console.error("Login failed:", err);
//             setPopup({
//                 isOpen: true,
//                 status: 'error',
//                 message: err.response?.data?.error || err.response?.data?.detail || 'Login failed'
//             });
//         }
//     };

//     const handleForgotPassword = async (e) => {
//         e.preventDefault();
//         setIsResetting(true);
//         setResetMessage('');
//         try {
//             const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/forgot-password/`, { email: resetEmail });
//             setResetMessage(response.data.message);
//         } catch (error) {
//             setResetMessage("Something went wrong. Please try again.");
//             setPopup({
//                 isOpen: true,
//                 status: 'error',
//                 message: err.response?.data?.error || err.response?.data?.detail || 'Login failed'
//             });
//         } finally {
//             setIsResetting(false);
//         }
//     };

//     return (
//         <div className="flex items-center justify-center w-full min-h-[85vh]">
//             <div className="relative w-full max-w-md p-8 overflow-hidden transition-all duration-300 border shadow-2xl bg-slate-900 border-slate-800 shadow-black/50 rounded-2xl">
                
//                 {/* Subtle Inner Glow */}
//                 <div className="absolute top-0 left-1/2 w-full h-1/2 bg-cyan-500/10 -translate-x-1/2 blur-[80px] pointer-events-none"></div>

//                 <div className="relative z-10">
//                     {showForgotForm ? (
//                         <div>
//                             <h2 className="mb-2 text-2xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Reset Password</h2>
//                             <p className="mb-6 text-sm text-center text-slate-400">Enter your email address and we will send you a link to reset your password.</p>
                            
//                             {resetMessage && (
//                                 <div className="p-3 mb-5 text-sm border rounded-lg text-emerald-300 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
//                                     {resetMessage}
//                                 </div>
//                             )}

//                             <form onSubmit={handleForgotPassword} className="space-y-5">
//                                 <input 
//                                     type="email" 
//                                     placeholder="Enter your email" 
//                                     value={resetEmail}
//                                     onChange={(e) => setResetEmail(e.target.value)}
//                                     required
//                                     className="w-full p-3 transition-all duration-200 border outline-none bg-slate-800/50 border-slate-700 text-slate-100 rounded-xl focus:bg-slate-800 focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-slate-500"
//                                 />
//                                 <button 
//                                     type="submit" 
//                                     disabled={isResetting}
//                                     className="w-full py-3 font-bold text-white transition-all duration-300 transform rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:-translate-y-0.5 disabled:opacity-50"
//                                 >
//                                     {isResetting ? 'Sending...' : 'Send Reset Link'}
//                                 </button>
//                             </form>

//                             <div className="mt-6 text-center">
//                                 <button 
//                                     onClick={() => { setShowForgotForm(false); setResetMessage(''); }} 
//                                     className="text-sm transition-colors text-cyan-400 hover:text-cyan-300 hover:underline"
//                                 >
//                                     Back to Login
//                                 </button>
//                             </div>
//                         </div>
//                     ) : (
//                         <div>
//                             <h2 className="mb-6 text-3xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">ApartCare</h2>
                            
//                             {error && <div className="p-3 mb-5 text-sm border rounded-lg text-rose-300 bg-rose-500/10 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]">{error}</div>}
                        
//                             <form onSubmit={handleSubmit} className="space-y-5">
//                                 <div>
//                                     <label className="block mb-1.5 text-sm font-medium text-slate-300">Email</label>
//                                     <input 
//                                         type="email" 
//                                         value={email} 
//                                         onChange={(e) => setEmail(e.target.value)} 
//                                         required 
//                                         className="w-full p-3 transition-all duration-200 border outline-none bg-slate-800/50 border-slate-700 text-slate-100 rounded-xl focus:bg-slate-800 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block mb-1.5 text-sm font-medium text-slate-300">Password</label>
//                                     <input 
//                                         type="password" 
//                                         value={password} 
//                                         onChange={(e) => setPassword(e.target.value)} 
//                                         required 
//                                         className="w-full p-3 transition-all duration-200 border outline-none bg-slate-800/50 border-slate-700 text-slate-100 rounded-xl focus:bg-slate-800 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
//                                     />
//                                 </div>
//                                 <button 
//                                     type="submit" 
//                                     disabled={loading} 
//                                     className="w-full py-3 mt-2 font-bold text-white transition-all duration-300 transform rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:-translate-y-0.5 disabled:opacity-50"
//                                 >
//                                     {loading ? 'Logging in...' : 'Login'}
//                                 </button>
//                             </form>
                            
//                             <div className="mt-6 text-center">
//                                 <button 
//                                     type="button"
//                                     onClick={() => setShowForgotForm(true)} 
//                                     className="text-sm transition-colors text-slate-400 hover:text-cyan-400 hover:underline"
//                                 >
//                                     Forgot Password?
//                                 </button>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>
//             {popup.isOpen && (
//                 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
//                     <div className={`relative w-full max-w-sm p-8 text-center transition-all transform border shadow-2xl rounded-3xl bg-slate-900 ${popup.status === 'success' ? 'border-emerald-500/30 shadow-emerald-900/20' : 'border-rose-500/30 shadow-rose-900/20'}`}>
//                         <div className={`flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full border-4 ${popup.status === 'success' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-rose-500/10 border-rose-500 text-rose-400'}`}>
//                             {popup.status === 'success' ? (
//                                 <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
//                                 </svg>
//                             ) : (
//                                 <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
//                                 </svg>
//                             )}
//                         </div>
//                         <h3 className={`text-2xl font-black mb-2 ${popup.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
//                             {popup.status === 'success' ? 'Success!' : 'Oops!'}
//                         </h3>
//                         <p className="mb-8 text-sm leading-relaxed text-slate-300">{popup.message}</p>
//                         <button 
//                             onClick={() => setPopup({ isOpen: false, status: '', message: '' })} 
//                             className={`w-full py-3.5 font-bold tracking-widest uppercase transition-all duration-300 transform rounded-xl border border-transparent hover:-translate-y-0.5 ${popup.status === 'success' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-slate-900 hover:shadow-[0_0_20px_rgba(52,211,153,0.4)]' : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white hover:shadow-[0_0_20px_rgba(244,63,94,0.4)]'}`}
//                         >
//                             {popup.status === 'success' ? 'Awesome' : 'Close'}
//                         </button>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

// export default Login;
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, fetchProfile } from "../../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

function Login() {
    const [popup, setPopup] = useState({ isOpen: false, status: '', message: '' });
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // 🎯 1. Grab `user` from Redux auth state
    const { loading, error, user } = useSelector((state) => state.auth);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showForgotForm, setShowForgotForm] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetMessage, setResetMessage] = useState('');
    const [isResetting, setIsResetting] = useState(false);

    // 🎯 2. Helper function to route any user to their correct dashboard
    const redirectToDashboard = (role) => {
        if (role === 'SUPER_ADMIN') navigate('/super-admin/Dashboard', { replace: true });
        else if (role === 'ADMIN') navigate('/admin/dashboard', { replace: true });
        else if (role === 'RESIDENT') navigate('/resident/dashboard', { replace: true });
        else if (role === 'STAFF') navigate('/staff/dashboard', { replace: true });
        else navigate('/profile', { replace: true });
    };

    // 🎯 3. IF USER IS ALREADY LOGGED IN: Redirect immediately!
    useEffect(() => {
        if (user && user.role) {
            redirectToDashboard(user.role);
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await dispatch(loginUser({ email, password })).unwrap();
            const profileData = await dispatch(fetchProfile()).unwrap();
            redirectToDashboard(profileData.role);
        } catch (err) {
            console.error("Login failed:", err);
            setPopup({
                isOpen: true,
                status: 'error',
                message: err.response?.data?.error || err.response?.data?.detail || 'Login failed'
            });
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setIsResetting(true);
        setResetMessage('');
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/forgot-password/`, { email: resetEmail });
            setResetMessage(response.data.message);
        } catch (error) {
            setResetMessage("Something went wrong. Please try again.");
            setPopup({
                isOpen: true,
                status: 'error',
                message: error.response?.data?.error || error.response?.data?.detail || 'Request failed'
            });
        } finally {
            setIsResetting(false);
        }
    };

    // 🎯 4. If user is already authenticated, don't flash the form while redirecting
    if (user) {
        return null;
    }

    return (
        <div className="flex items-center justify-center w-full min-h-[85vh]">
            <div className="relative w-full max-w-md p-8 overflow-hidden transition-all duration-300 border shadow-2xl bg-slate-900 border-slate-800 shadow-black/50 rounded-2xl">
                
                {/* Subtle Inner Glow */}
                <div className="absolute top-0 left-1/2 w-full h-1/2 bg-cyan-500/10 -translate-x-1/2 blur-[80px] pointer-events-none"></div>

                <div className="relative z-10">
                    {showForgotForm ? (
                        <div>
                            <h2 className="mb-2 text-2xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Reset Password</h2>
                            <p className="mb-6 text-sm text-center text-slate-400">Enter your email address and we will send you a link to reset your password.</p>
                            
                            {resetMessage && (
                                <div className="p-3 mb-5 text-sm border rounded-lg text-emerald-300 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                    {resetMessage}
                                </div>
                            )}

                            <form onSubmit={handleForgotPassword} className="space-y-5">
                                <input 
                                    type="email" 
                                    placeholder="Enter your email" 
                                    value={resetEmail} 
                                    onChange={(e) => setResetEmail(e.target.value)} 
                                    required 
                                    className="w-full p-3 transition-all duration-200 border outline-none bg-slate-800/50 border-slate-700 text-slate-100 rounded-xl focus:bg-slate-800 focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-slate-500"
                                />
                                <button 
                                    type="submit" 
                                    disabled={isResetting} 
                                    className="w-full py-3 font-bold text-white transition-all duration-300 transform rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:-translate-y-0.5 disabled:opacity-50"
                                >
                                    {isResetting ? 'Sending...' : 'Send Reset Link'}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <button 
                                    onClick={() => { setShowForgotForm(false); setResetMessage(''); }} 
                                    className="text-sm transition-colors text-cyan-400 hover:text-cyan-300 hover:underline"
                                >
                                    Back to Login
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h2 className="mb-6 text-3xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">ApartCare</h2>
                            
                            {error && <div className="p-3 mb-5 text-sm border rounded-lg text-rose-300 bg-rose-500/10 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]">{error}</div>}
                        
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block mb-1.5 text-sm font-medium text-slate-300">Email</label>
                                    <input 
                                        type="email" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        required 
                                        className="w-full p-3 transition-all duration-200 border outline-none bg-slate-800/50 border-slate-700 text-slate-100 rounded-xl focus:bg-slate-800 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1.5 text-sm font-medium text-slate-300">Password</label>
                                    <input 
                                        type="password" 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        required 
                                        className="w-full p-3 transition-all duration-200 border outline-none bg-slate-800/50 border-slate-700 text-slate-100 rounded-xl focus:bg-slate-800 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={loading} 
                                    className="w-full py-3 mt-2 font-bold text-white transition-all duration-300 transform rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:-translate-y-0.5 disabled:opacity-50"
                                >
                                    {loading ? 'Logging in...' : 'Login'}
                                </button>
                            </form>
                            
                            <div className="mt-6 text-center">
                                <button 
                                    type="button"
                                    onClick={() => setShowForgotForm(true)} 
                                    className="text-sm transition-colors text-slate-400 hover:text-cyan-400 hover:underline"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {popup.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                    <div className={`relative w-full max-w-sm p-8 text-center transition-all transform border shadow-2xl rounded-3xl bg-slate-900 ${popup.status === 'success' ? 'border-emerald-500/30 shadow-emerald-900/20' : 'border-rose-500/30 shadow-rose-900/20'}`}>
                        <div className={`flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full border-4 ${popup.status === 'success' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-rose-500/10 border-rose-500 text-rose-400'}`}>
                            {popup.status === 'success' ? (
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </div>
                        <h3 className={`text-2xl font-black mb-2 ${popup.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {popup.status === 'success' ? 'Success!' : 'Oops!'}
                        </h3>
                        <p className="mb-8 text-sm leading-relaxed text-slate-300">{popup.message}</p>
                        <button 
                            onClick={() => setPopup({ isOpen: false, status: '', message: '' })} 
                            className={`w-full py-3.5 font-bold tracking-widest uppercase transition-all duration-300 transform rounded-xl border border-transparent hover:-translate-y-0.5 ${popup.status === 'success' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-slate-900 hover:shadow-[0_0_20px_rgba(52,211,153,0.4)]' : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white hover:shadow-[0_0_20px_rgba(244,63,94,0.4)]'}`}
                        >
                            {popup.status === 'success' ? 'Awesome' : 'Close'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Login;