// import React, { useEffect, useState } from 'react';
// import { getSuperAdminAnnouncements, createSuperAdminAnnouncement } from '../api/superadmin';

// const SuperAdminAnnouncements = () => {
//     const [history, setHistory] = useState([]);
//     const [title, setTitle] = useState('');
//     const [content, setContent] = useState('');
//     const [loading, setLoading] = useState(true);
//     const [dispatching, setDispatching] = useState(false);
//     const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

//     const reloadLogs = async () => {
//         try {
//             const logs = await getSuperAdminAnnouncements();
//             setHistory(logs);
//         } catch (e) { console.error(e); }
//         finally { setLoading(false); }
//     };

//     useEffect(() => { reloadLogs(); }, []);

//     const handleBroadcastSubmit = async (e) => {
//         e.preventDefault();
//         setDispatching(true);
//         setStatusMsg({ type: '', text: '' });

//         try {
//             const response = await createSuperAdminAnnouncement({ title, content });
//             setStatusMsg({ type: 'success', text: response.message });
//             setTitle('');
//             setContent('');
//             reloadLogs();
//         } catch (err) {
//             setStatusMsg({ type: 'error', text: "Failed to dispatch notification vector targets." });
//         } finally {
//             setDispatching(false);
//         }
//     };

//     return (
//         <div className="max-w-5xl mx-auto p-18 mt-12 text-slate-200 grid grid-cols-1 lg:grid-cols-3 gap-8">
            
//             {/* COLUMN 1: FORM INPUT BROADCASTER ENGINE */}
//             <div className="lg:col-span-1">
//                 <div className="p-6 border bg-slate-900 border-slate-800 rounded-2xl sticky top-24">
//                     <h2 className="text-xl font-black text-white mb-1">Broadcast To System Admins</h2>
//                     <p className="text-xs text-slate-400 mb-6">Pushes internal notices to building managers and triggers an instant transactional email dispatch cascade.</p>

//                     {statusMsg.text && (
//                         <div className={`p-3 mb-4 rounded-xl text-xs font-bold border ${statusMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
//                             {statusMsg.text}
//                         </div>
//                     )}

//                     <form onSubmit={handleBroadcastSubmit} className="space-y-4">
//                         <div>
//                             <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Notification Title</label>
//                             <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Maintenance Window, Policy Updates..." className="w-full p-2.5 text-sm bg-slate-800 border border-slate-700 text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-purple-500" />
//                         </div>
//                         <div>
//                             <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Message Content Paragraph</label>
//                             <textarea rows="5" value={content} onChange={e => setContent(e.target.value)} required placeholder="Type the structural announcement content information here..." className="w-full p-2.5 text-sm bg-slate-800 border border-slate-700 text-slate-100 rounded-lg outline-none resize-none focus:ring-2 focus:ring-purple-500"></textarea>
//                         </div>
//                         <button type="submit" disabled={dispatching} className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90 transition-opacity font-bold rounded-xl text-white text-sm shadow-md">
//                             {dispatching ? "Blasting Email Servers..." : "📢 Publish & Email Blast"}
//                         </button>
//                     </form>
//                 </div>
//             </div>

//             {/* COLUMN 2 & 3: HISTORICAL ALERTS ARCHIVE TIMELINE */}
//             <div className="lg:col-span-2 space-y-4">
//                 <h3 className="text-lg font-black text-white">Broadcast Transmission History Log</h3>
                
//                 {loading ? (
//                     <div className="p-10 text-center text-slate-500 animate-pulse font-medium">Reading historical notice chains...</div>
//                 ) : history.length === 0 ? (
//                     <div className="p-10 text-center border border-dashed border-slate-800 text-slate-500 rounded-xl italic">No network-wide announcements dispatched yet.</div>
//                 ) : (
//                     <div className="space-y-3">
//                         {history.map(item => (
//                             <div key={item.id} className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl transition-all hover:border-slate-700/80">
//                                 <div className="flex justify-between items-start gap-4">
//                                     <h4 className="font-bold text-slate-200 text-base">{item.title}</h4>
//                                     <span className="text-[10px] font-mono font-medium text-slate-500 whitespace-nowrap bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{item.created_at}</span>
//                                 </div>
//                                 <p className="text-xs text-slate-400 mt-2 leading-relaxed whitespace-pre-wrap">{item.content}</p>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default SuperAdminAnnouncements;

import React, { useState, useEffect } from 'react';
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
        } catch (e) { 
            console.error(e); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { reloadLogs(); }, []);

    const handleBroadcastSubmit = async (e) => {
        e.preventDefault();
        setDispatching(true);
        setStatusMsg({ type: '', text: '' });

        try {
            const response = await createSuperAdminAnnouncement({ title, content });
            setStatusMsg({ type: 'success', text: response.message || "Broadcast packet deployed successfully." });
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
        /* 🎯 ULTRA-WIDE HORIZONTAL MATRIX CONTAINER */
        <div className="w-full max-w-full px-6 lg:px-12 mx-auto space-y-6 animate-fade-in pb-12">
            
            {/* Header Module Meta Info Section */}
            <div className="border-b border-slate-800 pb-5">
                <h1 className="text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400 tracking-tight">
                    Global System Broadcasts
                </h1>
                <p className="mt-1 text-xs text-slate-400 font-mono">
                    Deploy platform-wide notices to building managers and trigger immediate automated communication cascades.
                </p>
            </div>

            {/* TWO-COLUMN BALANCE LAYOUT ENGINE */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start w-full">
                
                {/* LEFT COLUMN: FORM INPUT BROADCASTER ENGINE (Takes 4 Columns) */}
                <div className="xl:col-span-4 bg-slate-900/40 border border-slate-800/90 p-6 rounded-2xl shadow-xl backdrop-blur-md relative overflow-hidden xl:sticky xl:top-20">
                    {/* Corner Accent Glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-[50px] pointer-events-none"></div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-600"></div>

                    <h2 className="text-lg font-black text-slate-100 mb-1">Broadcast Engine Run</h2>
                    <p className="text-[11px] text-slate-400 font-sans leading-relaxed mb-6">
                        Pushes internal alert notices directly to all tenant building administrative consoles.
                    </p>

                    {statusMsg.text && (
                        <div className={`p-4 mb-5 rounded-xl border text-xs font-mono font-bold shadow-md transform animate-fade-in ${
                            statusMsg.type === 'success' 
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        }`}>
                            {statusMsg.type === 'success' ? '🚀 DISPATCH DISPATCH OK: ' : '❌ ENGINE EXCEPTION: '} {statusMsg.text}
                        </div>
                    )}

                    <form onSubmit={handleBroadcastSubmit} className="space-y-4" autoComplete="off">
                        <div>
                            <label className="block text-[10px] font-black tracking-widest text-slate-500 uppercase mb-1.5">Notification Title</label>
                            <input 
                                type="text" 
                                value={title} 
                                onChange={e => setTitle(e.target.value)} 
                                required 
                                disabled={dispatching}
                                placeholder="e.g. Critical AWS Infrastructure Maintenance" 
                                className="w-full p-3 text-xs font-semibold border outline-none bg-slate-950/40 border-slate-800 text-slate-200 rounded-xl focus:border-purple-500 focus:bg-slate-950/90 transition-all disabled:opacity-40" 
                            />
                        </div>
                        
                        <div>
                            <label className="block text-[10px] font-black tracking-widest text-slate-500 uppercase mb-1.5">Bulletin Content Paragraph</label>
                            <textarea 
                                rows="6" 
                                value={content} 
                                onChange={e => setContent(e.target.value)} 
                                required 
                                disabled={dispatching}
                                placeholder="Type the extensive notification layout text data details here..." 
                                className="w-full p-3 text-xs border outline-none resize-none bg-slate-950/40 border-slate-800 text-slate-200 rounded-xl focus:border-purple-500 focus:bg-slate-950/90 transition-all font-sans leading-relaxed custom-scrollbar disabled:opacity-40"
                            />
                        </div>

                        <div className="pt-2">
                            <button 
                                type="submit" 
                                disabled={dispatching} 
                                className="w-full py-3 bg-gradient-to-r from-purple-500 via-pink-600 to-indigo-500 hover:opacity-95 font-black tracking-widest uppercase rounded-xl text-white text-[11px] shadow-lg shadow-purple-950/40 transition-all transform active:scale-[0.99] disabled:opacity-30"
                            >
                                {dispatching ? "Blasting Telemetry Servers..." : "📢 Publish & Email Blast"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* RIGHT COLUMN: HISTORICAL ALERTS ARCHIVE TIMELINE (Takes 8 Columns) */}
                <div className="xl:col-span-8 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 pl-1">Broadcast Transmission History Log</h3>
                    
                    {loading ? (
                        <div className="p-12 text-center text-slate-500 font-mono text-xs animate-pulse">Reading historical notice chains from network registries...</div>
                    ) : history.length === 0 ? (
                        <div className="p-12 text-center border border-dashed border-slate-800 bg-slate-900/10 rounded-2xl text-slate-500 font-sans italic text-sm">
                            No network-wide announcements dispatched yet over active framework link.
                        </div>
                    ) : (
                        /* Balanced Vertical Stack Area */
                        <div className="space-y-4 max-h-[640px] overflow-y-auto pr-2 custom-scrollbar">
                            {history.map(item => (
                                <div key={item.id} className="p-5 bg-slate-900/20 border border-slate-800/80 rounded-2xl shadow-xl hover:border-slate-700/80 transition-all relative group overflow-hidden">
                                    <div className="absolute top-0 left-0 h-full w-0.5 bg-purple-500/40 group-hover:bg-purple-500 transition-colors"></div>
                                    
                                    <div className="flex justify-between items-start gap-4 pb-2 border-b border-slate-800/40">
                                        <h4 className="font-bold text-slate-100 text-base tracking-wide group-hover:text-purple-400 transition-colors">{item.title}</h4>
                                        <span className="text-[9px] font-mono font-bold text-slate-500 whitespace-nowrap bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800 shadow-sm">
                                            ⏱️ {item.created_at}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-3 leading-relaxed whitespace-pre-wrap font-sans font-medium">{item.content}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default SuperAdminAnnouncements;