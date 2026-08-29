// import React, { useState } from 'react';
// import { broadcastAnnouncement } from '../../api/admin'; 

// const AdminAnnouncements = () => {
//     const [formData, setFormData] = useState({
//         title: '',
//         message: '',
//         target_audience: 'ALL',
//         is_urgent: false
//     });
    
//     const [loading, setLoading] = useState(false);
//     const [statusInfo, setStatusInfo] = useState({ type: '', msg: '' });

//     const handleChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setFormData({
//             ...formData,
//             [name]: type === 'checkbox' ? checked : value
//         });
//         setStatusInfo({ type: '', msg: '' });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setStatusInfo({ type: '', msg: '' });

//         try {
//             await broadcastAnnouncement(formData);
//             setStatusInfo({ type: 'success', msg: 'Announcement broadcasted successfully!' });
//             setFormData({ title: '', message: '', target_audience: 'ALL', is_urgent: false });
            
//             setTimeout(() => setStatusInfo({ type: '', msg: '' }), 4000);
//         } catch (error) {
//             setStatusInfo({ type: 'error', msg: error.response?.data?.error || 'Failed to broadcast announcement.' });
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="max-w-3xl p-8 mx-auto mt-12 border shadow-2xl bg-slate-900 border-slate-800 rounded-3xl animate-fade-in">
//             <div className="mb-8">
//                 <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
//                     Broadcast Announcement
//                 </h2>
//                 <p className="mt-2 text-sm text-slate-400">
//                     Send instant alerts to residents and staff. This will appear directly in their notification bells.
//                 </p>
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-6">
                
//                 {statusInfo.msg && (
//                     <div className={`p-4 rounded-xl border font-medium ${statusInfo.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
//                         {statusInfo.msg}
//                     </div>
//                 )}

//                 <div>
//                     <label className="block mb-2 text-sm font-bold tracking-wide text-slate-400 uppercase">Title / Subject</label>
//                     <input 
//                         type="text" 
//                         name="title" 
//                         required 
//                         value={formData.title} 
//                         onChange={handleChange} 
//                         placeholder="e.g. Water Supply Interruption" 
//                         className="w-full p-4 transition-colors border outline-none bg-slate-800 border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500" 
//                     />
//                 </div>

//                 <div>
//                     <label className="block mb-2 text-sm font-bold tracking-wide text-slate-400 uppercase">Message</label>
//                     <textarea 
//                         name="message" 
//                         required 
//                         rows="4"
//                         value={formData.message} 
//                         onChange={handleChange} 
//                         placeholder="Type your detailed announcement here..." 
//                         className="w-full p-4 transition-colors border outline-none resize-none bg-slate-800 border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500" 
//                     />
//                 </div>

//                 <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                     <div>
//                         <label className="block mb-2 text-sm font-bold tracking-wide text-slate-400 uppercase">Target Audience</label>
//                         <select 
//                             name="target_audience" 
//                             value={formData.target_audience} 
//                             onChange={handleChange} 
//                             className="w-full p-4 transition-colors border outline-none cursor-pointer bg-slate-800 border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
//                         >
//                             <option value="ALL">Everyone (Residents & Staff)</option>
//                             <option value="RESIDENT">Residents Only</option>
//                             <option value="STAFF">Staff Only</option>
//                         </select>
//                     </div>

//                     <div className="flex items-center mt-8">
//                         <label className="relative flex items-center cursor-pointer">
//                             <input 
//                                 type="checkbox" 
//                                 name="is_urgent"
//                                 checked={formData.is_urgent}
//                                 onChange={handleChange}
//                                 className="sr-only peer" 
//                             />
//                             <div className="w-14 h-7 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-rose-500"></div>
//                             <span className="ml-3 text-sm font-bold tracking-wide uppercase text-slate-300">Mark as Urgent</span>
//                         </label>
//                     </div>
//                 </div>

//                 <div className="pt-6 border-t border-slate-800">
//                     <button 
//                         type="submit" 
//                         disabled={loading} 
//                         className="w-full py-4 font-black tracking-widest text-white uppercase transition-all duration-300 transform rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
//                     >
//                         {loading ? 'Broadcasting...' : 'Send Broadcast'}
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default AdminAnnouncements;

import React, { useState } from 'react';
import { broadcastAnnouncement } from '../../api/admin'; 

const AdminAnnouncements = () => {
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        target_audience: 'ALL',
        is_urgent: false
    });
    const [loading, setLoading] = useState(false);
    const [statusInfo, setStatusInfo] = useState({ type: '', msg: '' });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
        setStatusInfo({ type: '', msg: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatusInfo({ type: '', msg: '' });

        try {
            await broadcastAnnouncement(formData);
            setStatusInfo({ type: 'success', msg: 'Announcement broadcasted successfully!' });
            setFormData({ title: '', message: '', target_audience: 'ALL', is_urgent: false });
            setTimeout(() => setStatusInfo({ type: '', msg: '' }), 4000);
        } catch (error) {
            setStatusInfo({ type: 'error', msg: error.response?.data?.error || 'Failed to broadcast announcement.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-3xl px-6 lg:px-12 mx-auto animate-fade-in pb-12">
            <div className="p-8 border shadow-2xl bg-slate-900/40 border-slate-800 rounded-3xl backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[120px] pointer-events-none"></div>
                
                <div className="mb-8 border-b border-slate-800/80 pb-5">
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 tracking-tight">
                        Broadcast Announcement
                    </h2>
                    <p className="mt-2 text-xs text-slate-400 font-mono">
                        Deploy real-time push telemetry updates to client notification nodes instantly.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {statusInfo.msg && (
                        <div className={`p-4 rounded-xl border text-xs font-bold font-mono shadow-md ${statusInfo.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                            {statusInfo.type === 'success' ? '🚨 BROADCAST DISPATCH SUCCESS: ' : '❌ ROUTING FAILED: '} {statusInfo.msg}
                        </div>
                    )}

                    <div>
                        <label className="block mb-2 text-[10px] font-black tracking-widest text-slate-500 uppercase">Title / Subject Line</label>
                        <input 
                            type="text" 
                            name="title" 
                            required 
                            value={formData.title} 
                            onChange={handleChange} 
                            placeholder="e.g. Critical Lift Refurbishment Schedule" 
                            className="w-full p-3.5 border outline-none bg-slate-950/40 border-slate-800 text-slate-200 rounded-xl focus:border-cyan-500 focus:bg-slate-950/90 transition-all font-semibold placeholder-slate-700 text-sm" 
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-[10px] font-black tracking-widest text-slate-500 uppercase">Detailed Operational Bulletin Message</label>
                        <textarea 
                            name="message" 
                            required 
                            rows="5"
                            value={formData.message} 
                            onChange={handleChange} 
                            placeholder="Provide extensive layout specs regarding this advisory..." 
                            className="w-full p-3.5 border outline-none resize-none bg-slate-950/40 border-slate-800 text-slate-200 rounded-xl focus:border-cyan-500 focus:bg-slate-950/90 transition-all text-sm placeholder-slate-700 leading-relaxed font-sans custom-scrollbar" 
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-slate-950/20 p-5 rounded-2xl border border-slate-800/60">
                        <div>
                            <label className="block mb-2 text-[10px] font-black tracking-widest text-slate-500 uppercase">Target Audience Scope</label>
                            <select 
                                name="target_audience" 
                                value={formData.target_audience} 
                                onChange={handleChange} 
                                className="w-full p-3 border outline-none cursor-pointer bg-slate-900 border-slate-800 text-slate-200 rounded-xl focus:border-cyan-500 font-bold text-xs uppercase tracking-wider"
                            >
                                <option value="ALL">Everyone (Global Inhabitants)</option>
                                <option value="RESIDENT">Residents Sector Only</option>
                                <option value="STAFF">Maintenance Staff Networks</option>
                            </select>
                        </div>

                        <div className="flex items-center md:justify-end mt-4 md:mt-0">
                            <label className="relative flex items-center cursor-pointer select-none">
                                <input 
                                    type="checkbox" 
                                    name="is_urgent"
                                    checked={formData.is_urgent}
                                    onChange={handleChange}
                                    className="sr-only peer" 
                                />
                                <div className="w-12 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-slate-400 after:rounded-full after:h-[18px] after:w-[18px] after:transition-all peer-checked:bg-rose-600 peer-checked:after:bg-white"></div>
                                <span className="ml-3 text-xs font-black tracking-widest uppercase text-slate-400 peer-checked:text-rose-400 transition-colors">Emergency Triage Alert</span>
                            </label>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800/80">
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="w-full py-3.5 font-black tracking-widest text-slate-950 uppercase text-xs rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 hover:shadow-[0_0_25px_rgba(34,211,238,0.3)] transition-all transform active:scale-[0.99] disabled:opacity-40"
                        >
                            {loading ? 'Dispatched Stream Packet...' : 'Transmit System Broadcast'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminAnnouncements;