import React, { useEffect, useState } from 'react';
import { getSuperAdminAnnouncements, createSuperAdminAnnouncement } from '../api/superadmin';

const SuperAdminAnnouncements = () => {
    const [history, setHistory] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [dispatching, setDispatching] = useState(false);
    const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

    const reloadLogs = async () => {
        try {
            const logs = await getSuperAdminAnnouncements();
            setHistory(logs);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { reloadLogs(); }, []);

    const handleBroadcastSubmit = async (e) => {
        e.preventDefault();
        setDispatching(true);
        setStatusMsg({ type: '', text: '' });

        try {
            const response = await createSuperAdminAnnouncement({ title, content });
            setStatusMsg({ type: 'success', text: response.message });
            setTitle('');
            setContent('');
            reloadLogs();
        } catch (err) {
            setStatusMsg({ type: 'error', text: "Failed to dispatch notification vector targets." });
        } finally {
            setDispatching(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 mt-8 text-slate-200 grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* COLUMN 1: FORM INPUT BROADCASTER ENGINE */}
            <div className="lg:col-span-1">
                <div className="p-6 border bg-slate-900 border-slate-800 rounded-2xl sticky top-24">
                    <h2 className="text-xl font-black text-white mb-1">Broadcast To System Admins</h2>
                    <p className="text-xs text-slate-400 mb-6">Pushes internal notices to building managers and triggers an instant transactional email dispatch cascade.</p>

                    {statusMsg.text && (
                        <div className={`p-3 mb-4 rounded-xl text-xs font-bold border ${statusMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                            {statusMsg.text}
                        </div>
                    )}

                    <form onSubmit={handleBroadcastSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Notification Title</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Maintenance Window, Policy Updates..." className="w-full p-2.5 text-sm bg-slate-800 border border-slate-700 text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Message Content Paragraph</label>
                            <textarea rows="5" value={content} onChange={e => setContent(e.target.value)} required placeholder="Type the structural announcement content information here..." className="w-full p-2.5 text-sm bg-slate-800 border border-slate-700 text-slate-100 rounded-lg outline-none resize-none focus:ring-2 focus:ring-purple-500"></textarea>
                        </div>
                        <button type="submit" disabled={dispatching} className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90 transition-opacity font-bold rounded-xl text-white text-sm shadow-md">
                            {dispatching ? "Blasting Email Servers..." : "📢 Publish & Email Blast"}
                        </button>
                    </form>
                </div>
            </div>

            {/* COLUMN 2 & 3: HISTORICAL ALERTS ARCHIVE TIMELINE */}
            <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-black text-white">Broadcast Transmission History Log</h3>
                
                {loading ? (
                    <div className="p-10 text-center text-slate-500 animate-pulse font-medium">Reading historical notice chains...</div>
                ) : history.length === 0 ? (
                    <div className="p-10 text-center border border-dashed border-slate-800 text-slate-500 rounded-xl italic">No network-wide announcements dispatched yet.</div>
                ) : (
                    <div className="space-y-3">
                        {history.map(item => (
                            <div key={item.id} className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl transition-all hover:border-slate-700/80">
                                <div className="flex justify-between items-start gap-4">
                                    <h4 className="font-bold text-slate-200 text-base">{item.title}</h4>
                                    <span className="text-[10px] font-mono font-medium text-slate-500 whitespace-nowrap bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{item.created_at}</span>
                                </div>
                                <p className="text-xs text-slate-400 mt-2 leading-relaxed whitespace-pre-wrap">{item.content}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuperAdminAnnouncements;