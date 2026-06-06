
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate, useLocation } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import { editUser, editStaff } from '../../features/users/userSlice'; 

// const EditStaff = () => {
//     const { id } = useParams(); 
//     const navigate = useNavigate();
//     const dispatch = useDispatch();
//     const location = useLocation();
    
//     const userToEdit = location.state?.userToEdit;
//     const returnTab = location.state?.returnTab || 'staff';
//     const returnPage = location.state?.returnPage || 1;

//     const [name, setName] = useState(userToEdit?.name || '');
//     const [email, setEmail] = useState(userToEdit?.email || '');
//     const [phone, setPhone] = useState(userToEdit?.phone || '');
//     const [designation, setDesignation] = useState(userToEdit?.designation || '');
//     const [salary, setSalary] = useState(userToEdit?.monthly_salary || '');
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');

//     useEffect(() => { if (!userToEdit) navigate('/admin/directory'); }, [userToEdit, navigate]);

//     const handleSubmit = async (e) => {
//         e.preventDefault(); setLoading(true); setError('');
//         try {
//             await dispatch(editUser({ id: id, data: { name, email, phone } })).unwrap();
//             await dispatch(editStaff({ id: id, data: { designation, monthly_salary: salary } })).unwrap();
//             alert("Staff updated successfully!");
//             navigate('/admin/directory', { state: { activeTab: returnTab, currentPage: returnPage } });
//         } catch (err) {
//             console.error("Failed to update:", err);
//             setError("Failed to update user. Please try again.");
//         } finally { setLoading(false); }
//     };

//     if (!userToEdit) return <div className="p-8 text-center text-slate-400">Loading...</div>;

//     return (
//         <div className="relative max-w-2xl p-8 mx-auto mt-10 overflow-hidden transition-all duration-300 border shadow-2xl bg-slate-900 border-slate-800 rounded-2xl">
//             <h2 className="mb-6 text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Edit Staff Member</h2>
//             {error && <div className="p-3 mb-5 text-sm border rounded-lg text-rose-300 bg-rose-500/10 border-rose-500/20">{error}</div>}

//             <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
//                 <div className="grid grid-cols-2 gap-5">
//                     <div>
//                         <label className="block mb-1.5 text-sm font-medium text-slate-300">Full Name</label>
//                         <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-3 transition-all duration-200 border outline-none bg-slate-800/50 border-slate-700 text-slate-100 rounded-xl focus:bg-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
//                     </div>
//                     <div>
//                         <label className="block mb-1.5 text-sm font-medium text-slate-300">Phone</label>
//                         <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full p-3 transition-all duration-200 border outline-none bg-slate-800/50 border-slate-700 text-slate-100 rounded-xl focus:bg-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
//                     </div>
//                 </div>
//                 <div>
//                     <label className="block mb-1.5 text-sm font-medium text-slate-300">Email Address</label>
//                     <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-3 transition-all duration-200 border outline-none bg-slate-800/50 border-slate-700 text-slate-100 rounded-xl focus:bg-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
//                 </div>

//                 <hr className="my-6 border-slate-800" />

//                 <div className="grid grid-cols-2 gap-5">
//                     <div>
//                         <label className="block mb-1.5 text-sm font-medium text-slate-300">Designation</label>
//                         <input type="text" value={designation} onChange={(e) => setDesignation(e.target.value)} required className="w-full p-3 transition-all duration-200 border outline-none bg-slate-800/50 border-slate-700 text-slate-100 rounded-xl focus:bg-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
//                     </div>
//                     <div>
//                         <label className="block mb-1.5 text-sm font-medium text-slate-300">Monthly Salary (₹)</label>
//                         <input type="number" value={salary} onChange={(e) => setSalary(e.target.value)} required className="w-full p-3 transition-all duration-200 border outline-none bg-slate-800/50 border-slate-700 text-slate-100 rounded-xl focus:bg-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
//                     </div>
//                 </div>

//                 <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-slate-800">
//                     <button type="button" onClick={() => navigate('/admin/directory', { state: { activeTab: returnTab, currentPage: returnPage } })} className="px-5 py-2.5 text-sm font-bold transition-all duration-300 border rounded-xl text-slate-300 border-slate-700 bg-slate-800/50 hover:bg-slate-700 hover:text-white">Cancel</button>
//                     <button type="submit" disabled={loading} className="px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 transform rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:-translate-y-0.5 disabled:opacity-50">
//                         {loading ? 'Saving...' : 'Save Changes'}
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default EditStaff;
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { editUser, editStaff } from '../../features/users/userSlice'; 

const EditStaff = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    
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

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setLoading(true); 
        setError('');
        setSuccessMessage('');
        
        try {
            await dispatch(editUser({ id: id, data: { name, email, phone } })).unwrap();
            await dispatch(editStaff({ id: id, data: { designation, monthly_salary: salary } })).unwrap();
            
            // 🎯 REPLACED ALERT: Render beautiful success banner inline
            setSuccessMessage("🎉 Staff member profiles Updated Successfully!.....");
            
            // Wait 2 seconds to let the administrator view the completion status window
            setTimeout(() => {
                navigate('/admin/directory', { state: { activeTab: returnTab, currentPage: returnPage } });
            }, 2000);
            
        } catch (err) {
            console.error("Failed to update:", err);
            setError("Failed to update user parameters. Check server sync connections and retry.");
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
        </div>
    );
};

export default EditStaff;