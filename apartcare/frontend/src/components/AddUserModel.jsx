// import React, { useState } from 'react';
// import { addUser } from '../api/admin';

// const AddUserModal = ({ isOpen, onClose, activeTab, onUserAdded }) => {
//     const role = activeTab === 'residents' ? 'RESIDENT' : 'STAFF';
    
//     const [formData, setFormData] = useState({
//         name: '',
//         email: '',
//         phone: '',
//         password: '' 
//     });

//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');

//     if (!isOpen) return null;

//     const handleChange = (e) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//         setError('');
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setError('');

//         try {
//             const payload = {
//                 ...formData,
//                 role: role
//             };
            
//             await addUser(payload);
            
//             onUserAdded(); 
//             onClose();     
//         } catch (err) {

//             if (err.response && err.response.data) {
//                 const errorData = err.response.data;

//                 const firstErrorKey = Object.keys(errorData)[0];
//                 setError(`${firstErrorKey}: ${errorData[firstErrorKey][0]}`);
//             } else {
//                 setError('Failed to create user. Please try again.');
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//             <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
//                 <div className="flex items-center justify-between pb-3 mb-4 border-b">
//                     <h2 className="text-xl font-bold text-gray-800">
//                         Add New {role === 'RESIDENT' ? 'Resident' : 'Staff'}
//                     </h2>
//                     <button onClick={onClose} className="text-2xl font-bold text-gray-500 hover:text-red-500">
//                         &times;
//                     </button>
//                 </div>

//                 {error && (
//                     <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded">
//                         {error}
//                     </div>
//                 )}

//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     <div>
//                         <label className="block mb-1 text-sm font-medium text-gray-700">Full Name</label>
//                         <input 
//                             type="text" 
//                             name="name" 
//                             value={formData.name}
//                             onChange={handleChange} 
//                             required 
//                             className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
//                         />
//                     </div>
                    
//                     <div>
//                         <label className="block mb-1 text-sm font-medium text-gray-700">Email Address</label>
//                         <input 
//                             type="email" 
//                             name="email" 
//                             value={formData.email}
//                             onChange={handleChange} 
//                             required 
//                             className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
//                         />
//                     </div>
                    
//                     <div>
//                         <label className="block mb-1 text-sm font-medium text-gray-700">Phone Number</label>
//                         <input 
//                             type="text" 
//                             name="phone" 
//                             value={formData.phone}
//                             onChange={handleChange} 
//                             required 
//                             className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
//                         />
//                     </div>

//                     <div>
//                         <label className="block mb-1 text-sm font-medium text-gray-700">Initial Password</label>
//                         <input 
//                             type="password" 
//                             name="password" 
//                             value={formData.password}
//                             onChange={handleChange} 
//                             required 
//                             className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
//                         />
//                     </div>

//                     <div className="flex justify-end gap-3 pt-4 mt-6 border-t">
//                         <button 
//                             type="button" 
//                             onClick={onClose} 
//                             className="px-4 py-2 font-medium text-gray-700 transition bg-gray-100 rounded hover:bg-gray-200"
//                         >
//                             Cancel
//                         </button>
//                         <button 
//                             type="submit" 
//                             disabled={loading} 
//                             className="px-4 py-2 font-medium text-white transition bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
//                         >
//                             {loading ? 'Creating...' : 'Create Account'}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default AddUserModal;

import React, { useState } from 'react';
import { addUser } from '../api/admin';

const AddUserModal = ({ isOpen, onClose, activeTab, onUserAdded }) => {
    const role = activeTab === 'residents' ? 'RESIDENT' : 'STAFF';
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '' 
    });

    const [loading, setLoading] = useState(false);

    const[message,setMessage] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                ...formData,
                role: role
            };
            
            await addUser(payload);
            
            onUserAdded(); 
            onClose();     
        } catch (err) {
            if (err.response && err.response.data) {
                const errorData = err.response.data;
                const firstErrorKey = Object.keys(errorData)[0];
                setError(`${firstErrorKey}: ${errorData[firstErrorKey][0]}`);
            } else {
                setError('Failed to create user. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Conditional styling based on the role!
    const themeColor = role === 'RESIDENT' 
        ? 'from-cyan-400 to-blue-500 focus:ring-cyan-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:from-cyan-400 hover:to-blue-500 border-cyan-500' 
        : 'from-amber-400 to-orange-500 focus:ring-amber-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:from-amber-400 hover:to-orange-500 border-amber-500';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <div className="relative w-full max-w-md p-8 overflow-hidden transition-all duration-300 border shadow-2xl bg-slate-900 border-slate-700 rounded-2xl">
                
                {/* Subtle Inner Glow matching the theme */}
                <div className={`absolute top-0 left-1/2 w-full h-1/2 bg-gradient-to-r ${themeColor} opacity-5 -translate-x-1/2 blur-[80px] pointer-events-none`}></div>

                <div className="relative z-10">
                    <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
                        <h2 className={`text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r ${role === 'RESIDENT' ? 'from-cyan-400 to-blue-500' : 'from-amber-400 to-orange-500'}`}>
                            Add New {role === 'RESIDENT' ? 'Resident' : 'Staff'}
                        </h2>
                        <button onClick={onClose} className="p-1.5 transition-colors rounded-full text-slate-400 hover:text-rose-400 bg-slate-800/50 hover:bg-slate-800">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                    {message && (<div className="p-3 mb-5 text-sm border rounded-lg text-emerald-300 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">{message}</div>)}
                    {error && (
                        <div className="p-3 mb-5 text-sm border rounded-lg text-rose-300 bg-rose-500/10 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block mb-1.5 text-sm font-medium text-slate-300">Full Name</label>
                            <input 
                                type="text" 
                                name="name" 
                                value={formData.name}
                                onChange={handleChange} 
                                required 
                                className={`w-full p-3 transition-all duration-200 border outline-none bg-slate-800/50 border-slate-700 text-slate-100 rounded-xl focus:bg-slate-800 focus:ring-2 focus:border-transparent ${role === 'RESIDENT' ? 'focus:ring-cyan-500' : 'focus:ring-amber-500'}`}
                            />
                        </div>
                        
                        <div>
                            <label className="block mb-1.5 text-sm font-medium text-slate-300">Email Address</label>
                            <input 
                                type="email" 
                                name="email" 
                                value={formData.email}
                                onChange={handleChange} 
                                required 
                                className={`w-full p-3 transition-all duration-200 border outline-none bg-slate-800/50 border-slate-700 text-slate-100 rounded-xl focus:bg-slate-800 focus:ring-2 focus:border-transparent ${role === 'RESIDENT' ? 'focus:ring-cyan-500' : 'focus:ring-amber-500'}`}
                            />
                        </div>
                        
                        <div>
                            <label className="block mb-1.5 text-sm font-medium text-slate-300">Phone Number</label>
                            <input 
                                type="text" 
                                name="phone" 
                                value={formData.phone}
                                onChange={handleChange} 
                                required 
                                className={`w-full p-3 transition-all duration-200 border outline-none bg-slate-800/50 border-slate-700 text-slate-100 rounded-xl focus:bg-slate-800 focus:ring-2 focus:border-transparent ${role === 'RESIDENT' ? 'focus:ring-cyan-500' : 'focus:ring-amber-500'}`}
                            />
                        </div>

                        <div>
                            <label className="block mb-1.5 text-sm font-medium text-slate-300">Initial Password</label>
                            <input 
                                type="password" 
                                name="password" 
                                value={formData.password}
                                onChange={handleChange} 
                                required 
                                className={`w-full p-3 transition-all duration-200 border outline-none bg-slate-800/50 border-slate-700 text-slate-100 rounded-xl focus:bg-slate-800 focus:ring-2 focus:border-transparent ${role === 'RESIDENT' ? 'focus:ring-cyan-500' : 'focus:ring-amber-500'}`}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-slate-800">
                            <button 
                                type="button" 
                                onClick={onClose} 
                                className="px-5 py-2.5 text-sm font-bold transition-all duration-300 border rounded-xl text-slate-300 border-slate-700 bg-slate-800/50 hover:bg-slate-700 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={loading} 
                                className={`px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 transform rounded-xl bg-gradient-to-r disabled:opacity-50 disabled:transform-none hover:-translate-y-0.5 ${role === 'RESIDENT' ? 'from-cyan-500 to-blue-600 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:from-cyan-400 hover:to-blue-500' : 'from-amber-500 to-orange-600 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:from-amber-400 hover:to-orange-500'}`}
                            >
                                {loading ? 'Creating...' : 'Create Account'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddUserModal;