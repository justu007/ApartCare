

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { editUser, editStaff } from '../../features/users/userSlice'; 

const EditStaff = () => {

    const { id } = useParams(); 
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const [popup, setPopup] = useState({ isOpen: false, status: '', message: '' });
    const userToEdit = location.state?.userToEdit;
    const returnTab = location.state?.returnTab || 'staff';
    const returnPage = location.state?.returnPage || 1;

    const [name, setName] = useState(userToEdit?.name || '');
    const [email, setEmail] = useState(userToEdit?.email || '');
    const [phone, setPhone] = useState(userToEdit?.phone || '');
    const [designation, setDesignation] = useState(userToEdit?.designation || '');
    const [salary, setSalary] = useState(userToEdit?.monthly_salary || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // 🎯 NEW: Local state container for the inline layout notification
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => { 
        if (!userToEdit) navigate('/admin/directory'); 
    }, [userToEdit, navigate]);

    // const handleSubmit = async (e) => {
    //     e.preventDefault(); 
    //     setLoading(true); 
    //     setError('');
    //     setSuccessMessage('');
        
    //     try {
    //         await dispatch(editUser({ id: id, data: { name, email, phone } })).unwrap();
    //         await dispatch(editStaff({ id: id, data: { designation, monthly_salary: salary } })).unwrap();
            
    //         // 🎯 REPLACED ALERT: Render beautiful success banner inline
    //         setSuccessMessage("🎉 Staff member profiles Updated Successfully!.....");
            
    //         // Wait 2 seconds to let the administrator view the completion status window
    //         setTimeout(() => {
    //             navigate('/admin/directory', { state: { activeTab: returnTab, currentPage: returnPage } });
    //         }, 2000);
            
    //     } catch (err) {
    //         console.error("Failed to update:", err);
    //         setError("Failed to update user parameters. Check server sync connections and retry.");
    //         setPopup({
    //             isOpen: true,
    //             status: 'error',
    //             message: errorMsg
    //         });
    //     } finally { 
    //         setLoading(false); 
    //     }
    // };
    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setLoading(true); 
        setError('');
        setSuccessMessage('');

        // 1. Sanitize input values
        const cleanPhone = phone ? String(phone).replace(/\D/g, '') : '';
        const trimmedName = name.trim();
        const trimmedEmail = email.trim();
        const trimmedDesignation = designation ? designation.trim() : '';
        const parsedSalary = salary ? Number(salary) : 0;

        if (cleanPhone) {
            if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
                setLoading(false);
                setError("Phone number must be exactly 10 digits and start with 6, 7, 8, or 9.");
                return;
            }
        }

        // 3. Frontend Salary Validation
        if (parsedSalary < 0) {
            setLoading(false);
            const msg = "Monthly salary cannot be negative.";
            setError(msg);
            setPopup({ isOpen: true, status: 'error', message: msg });
            return;
        }
        
        try {
            // Update Base User credentials
            await dispatch(editUser({ 
                id: id, 
                data: { 
                    name: trimmedName, 
                    email: trimmedEmail, 
                    phone: cleanPhone 
                } 
            })).unwrap();

            // Update Staff-specific credentials
            await dispatch(editStaff({ 
                id: id, 
                data: { 
                    designation: trimmedDesignation, 
                    monthly_salary: parsedSalary 
                } 
            })).unwrap();
            
            // Render inline success banner
            setSuccessMessage("🎉 Staff member profile updated successfully!");
            
            setTimeout(() => {
                navigate('/admin/directory', { state: { activeTab: returnTab, currentPage: returnPage } });
            }, 1500);
            
        } catch (err) {
            console.error("Failed to update staff member:", err);

            // Handle unwrapped Redux payload (err) vs raw Axios error (err.response?.data)
            const errorData = err?.response?.data || err;
            let resolvedError = "Failed to update staff profile. Please verify your inputs.";

            if (typeof errorData === 'string') {
                resolvedError = errorData;
            } else if (errorData && typeof errorData === 'object') {
                const targetField = 
                    errorData.phone ||
                    errorData.email ||
                    errorData.name ||
                    errorData.designation ||
                    errorData.monthly_salary ||
                    errorData.non_field_errors ||
                    errorData.detail ||
                    errorData.error;

                if (Array.isArray(targetField)) {
                    resolvedError = targetField[0];
                } else if (typeof targetField === 'string') {
                    resolvedError = targetField;
                } else {
                    const firstKey = Object.keys(errorData)[0];
                    if (firstKey) {
                        const val = errorData[firstKey];
                        resolvedError = Array.isArray(val) ? val[0] : String(val);
                    }
                }
            }

            setError(resolvedError);
            setPopup({
                isOpen: true,
                status: 'error',
                message: resolvedError
            });
        } finally { 
            setLoading(false); 
        }
    };

    if (!userToEdit) return <div className="p-8 text-center text-slate-400">Loading node references...</div>;

    return (
        <div className="relative max-w-2xl p-8 mx-auto mt-10 overflow-hidden border shadow-2xl bg-slate-900 border-slate-800 rounded-2xl">
            {/* Background cyberglow accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] pointer-events-none"></div>
            
            <h2 className="mb-6 text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                Edit Staff Member
            </h2>
            
            {/* 🎯 BEAUTIFUL INLINE ERROR NOTIFICATION WINDOW */}
            {error && (
                <div className="p-4 mb-5 text-sm font-semibold border rounded-xl bg-rose-500/10 border-rose-500/20 text-rose-300 shadow-xl shadow-rose-950/20 transform animate-fade-in">
                    <div className="flex items-center gap-3">
                        <span className="text-lg">❌</span>
                        <p>{error}</p>
                    </div>
                </div>
            )}

            {/* 🎯 BEAUTIFUL INLINE SUCCESS NOTIFICATION WINDOW */}
            {successMessage && (
                <div className="p-4 mb-5 text-sm font-semibold border rounded-xl bg-emerald-500/10 border-emerald-500/20 text-emerald-300 shadow-xl shadow-emerald-950/20 transform animate-fade-in">
                    <div className="flex items-center gap-3">
                        <span className="text-lg">✅</span>
                        <p>{successMessage}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="relative z-10 space-y-5" autoComplete="off">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block mb-1.5 text-sm font-medium text-slate-300">Full Name</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                            disabled={loading || successMessage}
                            className="w-full p-3 transition-all duration-200 border outline-none bg-slate-800/40 border-slate-700 text-slate-100 rounded-xl focus:bg-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-40" 
                        />
                    </div>
                    <div>
                        <label className="block mb-1.5 text-sm font-medium text-slate-300">Phone</label>
                        <input 
                            type="text" 
                            value={phone} 
                            onChange={(e) => setPhone(e.target.value)} 
                            required 
                            disabled={loading || successMessage}
                            className="w-full p-3 transition-all duration-200 border outline-none bg-slate-800/40 border-slate-700 text-slate-100 rounded-xl focus:bg-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-40" 
                        />
                    </div>
                </div>
                
                <div>
                    <label className="block mb-1.5 text-sm font-medium text-slate-300">Email Address</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        disabled={loading || successMessage}
                        className="w-full p-3 transition-all duration-200 border outline-none bg-slate-800/40 border-slate-700 text-slate-100 rounded-xl focus:bg-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-40" 
                    />
                </div>

                <hr className="my-6 border-slate-800/80" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block mb-1.5 text-sm font-medium text-slate-300">Designation</label>
                        <input 
                            type="text" 
                            value={designation} 
                            onChange={(e) => setDesignation(e.target.value)} 
                            required 
                            disabled={loading || successMessage}
                            className="w-full p-3 transition-all duration-200 border outline-none bg-slate-800/40 border-slate-700 text-slate-100 rounded-xl focus:bg-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-40" 
                        />
                    </div>
                    <div>
                        <label className="block mb-1.5 text-sm font-medium text-slate-300">Monthly Salary (₹)</label>
                        <input 
                            type="number" 
                            value={salary} 
                            onChange={(e) => setSalary(e.target.value)} 
                            required 
                            disabled={loading || successMessage}
                            className="w-full p-3 transition-all duration-200 border outline-none bg-slate-800/40 border-slate-700 text-slate-100 rounded-xl focus:bg-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-40" 
                        />
                    </div>
                </div>

                {/* Form Button Actions Area */}
                <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-slate-800">
                    <button 
                        type="button" 
                        disabled={loading || successMessage}
                        onClick={() => navigate('/admin/directory', { state: { activeTab: returnTab, currentPage: returnPage } })} 
                        className="px-5 py-2.5 text-sm font-bold transition-all duration-300 border rounded-xl text-slate-300 border-slate-700 bg-slate-800/30 hover:bg-slate-800 hover:text-white disabled:opacity-30"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={loading || successMessage} 
                        className="px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 transform rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 disabled:opacity-50"
                    >
                        {loading ? 'Saving Parameters...' : successMessage ? 'Saved!' : 'Save Changes'}
                    </button>
                </div>
            </form>
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
};

export default EditStaff;