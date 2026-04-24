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
        <div className="max-w-3xl p-8 mx-auto mt-8 border shadow-2xl bg-slate-900 border-slate-800 rounded-3xl animate-fade-in">
            <div className="mb-8">
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                    Broadcast Announcement
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                    Send instant alerts to residents and staff. This will appear directly in their notification bells.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {statusInfo.msg && (
                    <div className={`p-4 rounded-xl border font-medium ${statusInfo.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                        {statusInfo.msg}
                    </div>
                )}

                <div>
                    <label className="block mb-2 text-sm font-bold tracking-wide text-slate-400 uppercase">Title / Subject</label>
                    <input 
                        type="text" 
                        name="title" 
                        required 
                        value={formData.title} 
                        onChange={handleChange} 
                        placeholder="e.g. Water Supply Interruption" 
                        className="w-full p-4 transition-colors border outline-none bg-slate-800 border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500" 
                    />
                </div>

                <div>
                    <label className="block mb-2 text-sm font-bold tracking-wide text-slate-400 uppercase">Message</label>
                    <textarea 
                        name="message" 
                        required 
                        rows="4"
                        value={formData.message} 
                        onChange={handleChange} 
                        placeholder="Type your detailed announcement here..." 
                        className="w-full p-4 transition-colors border outline-none resize-none bg-slate-800 border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500" 
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <label className="block mb-2 text-sm font-bold tracking-wide text-slate-400 uppercase">Target Audience</label>
                        <select 
                            name="target_audience" 
                            value={formData.target_audience} 
                            onChange={handleChange} 
                            className="w-full p-4 transition-colors border outline-none cursor-pointer bg-slate-800 border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="ALL">Everyone (Residents & Staff)</option>
                            <option value="RESIDENT">Residents Only</option>
                            <option value="STAFF">Staff Only</option>
                        </select>
                    </div>

                    <div className="flex items-center mt-8">
                        <label className="relative flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                name="is_urgent"
                                checked={formData.is_urgent}
                                onChange={handleChange}
                                className="sr-only peer" 
                            />
                            <div className="w-14 h-7 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-rose-500"></div>
                            <span className="ml-3 text-sm font-bold tracking-wide uppercase text-slate-300">Mark as Urgent</span>
                        </label>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-800">
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full py-4 font-black tracking-widest text-white uppercase transition-all duration-300 transform rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                    >
                        {loading ? 'Broadcasting...' : 'Send Broadcast'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminAnnouncements;