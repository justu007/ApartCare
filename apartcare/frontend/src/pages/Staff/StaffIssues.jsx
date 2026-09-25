// import React, { useEffect, useState, useRef } from 'react';
// import { getIssues, updateIssue } from '../../api/user'; 
// import axiosInstance from '../../api/axios'; 
// import { useSelector } from 'react-redux';

// const StaffIssues = () => {
//     const { user } = useSelector((state) => state.auth);

//     const [issues, setIssues] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');

//     const [currentPage, setCurrentPage] = useState(1);
//     const [totalPages, setTotalPages] = useState(1);
//     const [selectedIssue, setSelectedIssue] = useState(null);
//     const [updatingId, setUpdatingId] = useState(null);
//     const [updateMessage, setUpdateMessage] = useState('');
//     const [updateError, setUpdateError] = useState('');
//     const [popup, setPopup] = useState({ isOpen: false, status: '', message: '' });

//     const [activeTab, setActiveTab] = useState('DETAILS');
//     const [chatMessages, setChatMessages] = useState([]);
//     const [newMessage, setNewMessage] = useState('');

//     const wsRef = useRef(null);
//     const chatEndRef = useRef(null);

//     useEffect(() => {
//         fetchIssues(currentPage);
//     }, [currentPage]);

//     const fetchIssues = async (page = 1) => {
//         setLoading(true);
//         try {
//             const data = await getIssues(page);
//             const fetchedIssues = data.data ? data.data : (Array.isArray(data) ? data : []);
//             setIssues(Array.isArray(fetchedIssues) ? fetchedIssues : []);
//             if (data.count) setTotalPages(Math.ceil(data.count / 10));
//         } catch (err) {
//             console.error(err);
//             setError('Failed to load your assigned tasks.');
//             setPopup({
//                 isOpen: true,
//                 status: 'error',
//                 message: err.response?.data?.error || err.response?.data?.detail || 'Failed to load your assigned tasks.'
//             });
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         if (chatEndRef.current) {
//             chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
//         }
//     }, [chatMessages, activeTab]);

//     useEffect(() => {
//         if (selectedIssue && activeTab === 'CHAT') {
//             const fetchChatHistory = async () => {
//                 try {
//                     const res = await axiosInstance.get(`/chat/issue/${selectedIssue.id}/history/`);
//                     const historyData = Array.isArray(res.data) ? res.data : (res.data.results || []);
//                     setChatMessages(historyData);
//                 } catch (err) {
//                     console.error("Failed to load chat history", err);
//                 }
//             };
//             fetchChatHistory();

//             const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
//             const wsHost = window.location.host; 
//             const ws = new WebSocket(`${wsProtocol}${wsHost}/ws/chat/issue/${selectedIssue.id}/`);

//             ws.onopen = () => console.log("🟢 Staff Issue Chat Connected!");
//             ws.onmessage = (event) => {
//                 const data = JSON.parse(event.data);
//                 setChatMessages((prev) => [...(Array.isArray(prev) ? prev : []), data]);
//             };
//             ws.onclose = () => console.log("🔴 Staff Issue Chat Disconnected");
//             wsRef.current = ws;

//             return () => {
//                 if (wsRef.current) wsRef.current.close();
//             };
//         }
//     }, [selectedIssue, activeTab]);

//     const sendMessage = (e) => {
//         e.preventDefault();
//         if (newMessage.trim() && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
//             wsRef.current.send(JSON.stringify({ message: newMessage }));
//             setNewMessage('');
//         }
//     };

//     const handleUpdateStatus = async (e) => {
//         e.preventDefault();
//         setUpdatingId(selectedIssue.id);
//         setUpdateMessage(''); 
//         setUpdateError('');

//         try {
//             const formBox = new FormData();
//             formBox.append('status', selectedIssue.status);

//             await updateIssue(selectedIssue.id, formBox);
//             await fetchIssues(currentPage);

//             setUpdateMessage("Task status updated successfully!");
//             setPopup({
//                 isOpen: true,
//                 status: 'success',
//                 message: 'Task status updated successfully!'
//             });
//             setTimeout(() => closeModal(), 1500);
//         } catch (err) {
//             const errorMsg = err.response?.data?.error || err.response?.data?.detail || "Failed to update status.";
//             setUpdateError(errorMsg);
//             setPopup({
//                 isOpen: true,
//                 status: 'error',
//                 message: errorMsg
//             });
//         } finally {
//             setUpdatingId(null);
//         }
//     };

//     const handleModalChange = (field, value) => {
//         setSelectedIssue({ ...selectedIssue, [field]: value });
//     };

//     const openModal = (issue) => {
//         setSelectedIssue({ ...issue });
//         setUpdateError('');
//         setUpdateMessage('');
//         setActiveTab('DETAILS');
//         setChatMessages([]);
//     };

//     const closeModal = () => {
//         setSelectedIssue(null);
//         setActiveTab('DETAILS');
//         setChatMessages([]);
//     };

//     if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-xl font-bold text-slate-500 animate-pulse font-mono">LOADING FIELD SYSTEM TASKS...</div>;

//     return (
//         <div className="w-full max-w-full px-6 lg:px-12 mx-auto space-y-6 animate-fade-in">
//             <div>
//                 <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-300">
//                     My Assigned Tasks
//                 </h1>
//                 <p className="mt-1 text-xs text-slate-400 font-mono">Real-time troubleshooting field logs dispatcher console.</p>
//             </div>

//             {error && <div className="p-4 border rounded-xl text-rose-400 bg-rose-500/10 border-rose-500/20">{error}</div>}

//             {/* COMPREHENSIVE GLASS DATA TABLE SHELL */}
//             <div className="overflow-hidden border border-slate-800/90 shadow-2xl bg-slate-900/20 rounded-2xl backdrop-blur-md">
//                 <div className="overflow-x-auto">
//                     <table className="w-full text-left border-collapse">
//                         <thead>
//                             <tr className="text-[11px] tracking-widest uppercase border-b text-slate-400 border-slate-800/80 bg-slate-900/80 font-black">
//                                 <th className="p-5">Task Details</th>
//                                 <th className="p-5">Location Reference</th>
//                                 <th className="p-5">Priority Level</th>
//                                 <th className="p-5">Execution Status</th>
//                                 <th className="p-5 text-right">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-800/40 text-sm">
//                             {issues.length === 0 ? (
//                                 <tr><td colSpan={5} className="p-12 text-center text-slate-500 italic font-mono">Zero outstanding maintenance items assigned to your profile token.</td></tr>
//                             ) : (
//                                 issues.map((issue) => (
//                                     <tr key={issue.id} className="transition-colors hover:bg-slate-800/30">
//                                         <td className="p-5">
//                                             <span className="font-bold text-slate-200 text-base block">{issue.title}</span>
//                                             <span className="text-xs text-slate-500 mt-0.5 font-mono block uppercase">{issue.category}</span>
//                                         </td>
//                                         <td className="p-5 text-slate-300 font-medium">
//                                             🏢 Block {issue.creator_block || '?'} — Flat {issue.creator_flat || '?'}
//                                         </td>
//                                         <td className="p-5">
//                                             <span className={`px-2.5 py-0.5 text-[10px] font-black tracking-widest uppercase rounded border 
//                                                 ${issue.priority === 'Urgent' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]' : 
//                                                   issue.priority === 'High' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 
//                                                   'text-slate-400 bg-slate-500/10 border-slate-500/20'}`}>
//                                                 {issue.priority}
//                                             </span>
//                                         </td>
//                                         <td className="p-5">
//                                             <span className={`px-2.5 py-0.5 text-[10px] font-black tracking-widest uppercase rounded border 
//                                                 ${issue.status === 'Resolved' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 
//                                                   issue.status === 'In-Progress' ? 'text-purple-400 bg-purple-500/10 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]' : 
//                                                   'text-blue-400 bg-blue-500/10 border-blue-500/20'}`}>
//                                                 {issue.status}
//                                             </span>
//                                         </td>
//                                         <td className="p-5 text-right">
//                                             <button 
//                                                 onClick={() => openModal(issue)}
//                                                 className="px-4 py-1.5 text-xs font-black tracking-wider uppercase transition-colors border rounded-xl text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
//                                             >
//                                                 Manage Job
//                                             </button>
//                                         </td>
//                                     </tr>
//                                 ))
//                             )}
//                         </tbody>
//                     </table>
//                 </div>

//                 {/* Master Pagination footer bar layout */}
//                 {!loading && totalPages > 1 && (
//                     <div className="flex items-center justify-between p-5 border-t bg-slate-950/40 border-slate-800/80">
//                         <span className="text-xs text-slate-400 font-mono">Displaying log window <span className="font-bold text-slate-200">{currentPage}</span> of {totalPages}</span>
//                         <div className="flex gap-2">
//                             <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-4 py-1.5 text-xs font-bold transition-all border rounded-lg text-slate-300 border-slate-700 bg-slate-800/40 hover:bg-slate-700 disabled:opacity-20 disabled:cursor-not-allowed">← Prev</button>
//                             <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-1.5 text-xs font-bold transition-all border rounded-lg text-slate-300 border-slate-700 bg-slate-800/40 hover:bg-slate-700 disabled:opacity-20 disabled:cursor-not-allowed">Next →</button>
//                         </div>
//                     </div>
//                 )}
//             </div>

//             {/* --- PREMIUM DUAL-TAB MONITOR SPLIT CONSOLE MODAL OVERLAY --- */}
//             {selectedIssue && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
//                     <div className="flex flex-col w-full max-w-5xl h-[85vh] border shadow-2xl bg-slate-900 border-slate-800 rounded-3xl overflow-hidden">

//                         {/* Header metadata row */}
//                         <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/40 shrink-0">
//                             <div>
//                                 <span className="text-[10px] font-mono tracking-widest text-slate-500 block uppercase">Operational Node Registry: #{selectedIssue.id}</span>
//                                 <h2 className="text-xl font-black text-slate-100 mt-1">{selectedIssue.title}</h2>
//                             </div>
//                             <button onClick={closeModal} className="p-2 text-slate-400 hover:text-rose-400 transition-colors bg-slate-800/80 rounded-full border border-slate-700">
//                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
//                             </button>
//                         </div>

//                         {/* TAB NAV MATRIX ROW BAR */}
//                         <div className="flex border-b border-slate-800/80 bg-slate-950/20 shrink-0">
//                             <button onClick={() => setActiveTab('DETAILS')} className={`flex-1 py-3 text-xs font-black tracking-widest uppercase transition-all ${activeTab === 'DETAILS' ? 'text-amber-400 border-b-2 border-amber-500 bg-amber-500/5' : 'text-slate-500 hover:text-slate-300'}`}>📋 Overview & Status</button>
//                             <button onClick={() => setActiveTab('CHAT')} className={`flex-1 py-3 text-xs font-black tracking-widest uppercase transition-all ${activeTab === 'CHAT' ? 'text-amber-400 border-b-2 border-amber-500 bg-amber-500/5' : 'text-slate-500 hover:text-slate-300'}`}>💬 Resident Discussion</button>
//                         </div>

//                         {/* Dynamic view tracking zone viewport area */}
//                         <div className="flex-1 overflow-y-auto custom-scrollbar">

//                             {activeTab === 'DETAILS' && (
//                                 <div className="grid grid-cols-1 md:grid-cols-2 min-h-full divide-y md:divide-y-0 md:divide-x divide-slate-800/80">
//                                     <div className="p-6 space-y-6 bg-slate-950/10">
//                                         <div>
//                                             <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Complainant Contact Node</h4>
//                                             <div className="p-4 border border-slate-800 bg-slate-950/40 rounded-xl">
//                                                 <p className="font-bold text-slate-200 text-base">{selectedIssue.creator_name || 'Anonymous Resident'}</p>
//                                                 <p className="text-xs text-slate-400 mt-1 font-mono">📍 Block {selectedIssue.creator_block || '?'} — Unit Flat {selectedIssue.creator_flat || '?'}</p>
//                                                 <p className="text-xs text-slate-500 mt-2 font-mono">📞 {selectedIssue.creator_phone || 'Protected Endpoint'}</p>
//                                             </div>
//                                         </div>
//                                         <div>
//                                             <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Structural Diagnosis Content</h4>
//                                             <div className="p-4 border border-slate-800 bg-slate-950/40 rounded-xl text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">{selectedIssue.description}</div>
//                                         </div>
//                                         {selectedIssue.uploaded_images?.length > 0 && (
//                                             <div>
//                                                 <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Diagnostic Photo Attachments</h4>
//                                                 <div className="grid grid-cols-3 gap-2">
//                                                     {selectedIssue.uploaded_images.map((img, i) => (
//                                                         <a key={i} href={img.image} target="_blank" rel="noopener noreferrer" className="block border border-slate-800 rounded-lg overflow-hidden group">
//                                                             <img src={img.image} alt="Diagnosis attachment link row" className="object-cover w-full h-20 group-hover:scale-105 transition-transform" />
//                                                         </a>
//                                                     ))}
//                                                 </div>
//                                             </div>
//                                         )}
//                                     </div>

//                                     <div className="p-6 bg-slate-900/20">
//                                         <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-3">Triage Execution Panel</h4>
//                                         {updateMessage && <div className="p-3 mb-4 text-xs font-bold border rounded-xl text-emerald-400 bg-emerald-500/10 border-emerald-500/20">{updateMessage}</div>}
//                                         {updateError && <div className="p-3 mb-4 text-xs font-bold border rounded-xl text-rose-400 bg-rose-500/10 border-rose-500/20">{updateError}</div>}

//                                         <form onSubmit={handleUpdateStatus} className="space-y-4">
//                                             <div>
//                                                 <label className="block text-[10px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">Modify Lifecycle Status</label>
//                                                 <select value={selectedIssue.status} onChange={(e) => handleModalChange('status', e.target.value)} className="w-full p-3 text-xs font-bold border outline-none bg-slate-950 border-slate-800 text-slate-200 rounded-xl focus:border-emerald-500 cursor-pointer">
//                                                     <option value="Assigned" className="text-blue-400">Assigned (Awaiting Action)</option>
//                                                     <option value="In-Progress" className="text-purple-400">In-Progress (Active Troubleshooting)</option>
//                                                     <option value="Resolved" className="text-emerald-400">Resolved (Execution Concluded)</option>
//                                                 </select>
//                                             </div>
//                                             <button type="submit" disabled={updatingId === selectedIssue.id} className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 font-bold uppercase tracking-wider text-white text-xs rounded-xl shadow-lg transition-all disabled:opacity-30">
//                                                 {updatingId === selectedIssue.id ? 'Synchronizing State...' : 'Save Lifecycle Status'}
//                                             </button>
//                                         </form>
//                                     </div>
//                                 </div>
//                             )}

//                             {activeTab === 'CHAT' && (
//                                 <div className="flex flex-col h-[520px]">
//                                     <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/30 custom-scrollbar flex flex-col">
//                                         {chatMessages.length === 0 ? (
//                                             <div className="my-auto text-center text-xs italic text-slate-600 font-mono">No telemetry conversations logged for this ticket endpoint.</div>
//                                         ) : (
//                                             chatMessages.map((msg, index) => {
//                                                 const isMe = msg.sender_role === 'STAFF' || msg.sender_name === user?.name;
//                                                 return (
//                                                     <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-full`}>
//                                                         <span className="text-[9px] font-bold text-slate-500 mb-1 px-1">{isMe ? 'You (Staff)' : `${msg.sender_name} (${msg.sender_role})`}</span>
//                                                         <div className={`p-3 rounded-2xl text-xs max-w-[80%] break-words leading-relaxed shadow-md ${isMe ? 'bg-amber-600 text-slate-950 font-bold rounded-tr-none' : 'bg-slate-800 border border-slate-700/60 text-slate-200 rounded-tl-none'}`}>{msg.message}</div>
//                                                         <span className="text-[8px] font-mono text-slate-600 mt-1 px-1">{msg.timestamp || 'Just now'}</span>
//                                                     </div>
//                                                 );
//                                             })
//                                         )}
//                                         <div ref={chatEndRef} />
//                                     </div>
//                                     <form onSubmit={sendMessage} className="p-4 border-t border-slate-800 bg-slate-950/60 shrink-0 flex gap-2">
//                                         <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a direct operational message to the resident account..." className="flex-1 px-4 h-11 text-xs border outline-none bg-slate-900 text-slate-200 border-slate-800 rounded-xl focus:border-amber-500 placeholder-slate-600" />
//                                         <button type="submit" disabled={!newMessage.trim()} className="px-5 h-11 bg-amber-500 text-slate-950 font-black tracking-wider uppercase text-xs rounded-xl hover:bg-amber-400 transition-colors disabled:opacity-20 shrink-0">Send Packet</button>
//                                     </form>
//                                 </div>
//                             )}

//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* 🎯 UNIVERSAL NOTIFICATION POPUP MODAL */}
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
// };

// export default StaffIssues;

import React, { useEffect, useState, useRef } from 'react';
import { getIssues, updateIssue } from '../../api/user'; 
import axiosInstance from '../../api/axios'; 
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

const StaffIssues = () => {
    const { user } = useSelector((state) => state.auth);
    const location = useLocation();

    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [updateMessage, setUpdateMessage] = useState('');
    const [updateError, setUpdateError] = useState('');
    const [popup, setPopup] = useState({ isOpen: false, status: '', message: '' });

    const [activeTab, setActiveTab] = useState('DETAILS');
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    const chatWsRef = useRef(null);
    const chatEndRef = useRef(null);

    // Refetch on page change or notification navigation
    useEffect(() => {
        fetchIssues(currentPage);
    }, [currentPage, location.key, location.state?.refreshAt]);

    // 🎯 Persistent Notification Socket for Live Table Sync
    useEffect(() => {
        if (!user?.id) return;

        const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
        const wsHost = window.location.host;
        const syncSocket = new WebSocket(`${wsProtocol}${wsHost}/ws/notification/${user.id}/`);

        syncSocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.event_type === "ISSUE_STATUS_UPDATED" && data.issue) {
                    setIssues((prev) =>
                        prev.map((item) =>
                            item.id === data.issue.id
                                ? { ...item, status: data.issue.status, priority: data.issue.priority }
                                : item
                        )
                    );
                    setSelectedIssue((prev) =>
                        prev && prev.id === data.issue.id
                            ? { ...prev, status: data.issue.status, priority: data.issue.priority }
                            : prev
                    );
                } else if (data.title && (data.title.includes("Issue") || data.title.includes("Assigned"))) {
                    fetchIssues(currentPage);
                }
            } catch (err) {
                console.error("Staff socket packet parse error:", err);
            }
        };

        return () => syncSocket.close();
    }, [user?.id, currentPage]);

    const fetchIssues = async (page = 1) => {
        setLoading(true);
        try {
            const data = await getIssues(page);
            const fetchedIssues = data.data ? data.data : (Array.isArray(data.results) ? data.results : (Array.isArray(data) ? data : []));
            setIssues(Array.isArray(fetchedIssues) ? fetchedIssues : []);
            if (data.count) setTotalPages(Math.ceil(data.count / 10));
        } catch (err) {
            console.error(err);
            setError('Failed to load your assigned tasks.');
            setPopup({
                isOpen: true,
                status: 'error',
                message: err.response?.data?.error || err.response?.data?.detail || 'Failed to load your assigned tasks.'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages, activeTab]);

    // Chat modal WebSocket
    useEffect(() => {
        if (selectedIssue && activeTab === 'CHAT') {
            const fetchChatHistory = async () => {
                try {
                    const res = await axiosInstance.get(`/chat/issue/${selectedIssue.id}/history/`);
                    const historyData = Array.isArray(res.data) ? res.data : (res.data.results || []);
                    setChatMessages(historyData);
                } catch (err) {
                    console.error("Failed to load chat history", err);
                }
            };
            fetchChatHistory();

            const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
            const wsHost = window.location.host; 
            const ws = new WebSocket(`${wsProtocol}${wsHost}/ws/chat/issue/${selectedIssue.id}/`);

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.message) {
                    setChatMessages((prev) => [...(Array.isArray(prev) ? prev : []), data]);
                }
            };
            chatWsRef.current = ws;

            return () => {
                if (chatWsRef.current) chatWsRef.current.close();
            };
        }
    }, [selectedIssue, activeTab]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() && chatWsRef.current && chatWsRef.current.readyState === WebSocket.OPEN) {
            chatWsRef.current.send(JSON.stringify({ message: newMessage }));
            setNewMessage('');
        }
    };

    const handleUpdateStatus = async (e) => {
        e.preventDefault();
        setUpdatingId(selectedIssue.id);
        setUpdateMessage(''); 
        setUpdateError('');

        try {
            const formBox = new FormData();
            formBox.append('status', selectedIssue.status);

            await updateIssue(selectedIssue.id, formBox);
            await fetchIssues(currentPage);

            setUpdateMessage("Task status updated successfully!");
            setPopup({
                isOpen: true,
                status: 'success',
                message: 'Task status updated successfully!'
            });
            setTimeout(() => closeModal(), 1500);
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.response?.data?.detail || "Failed to update status.";
            setUpdateError(errorMsg);
            setPopup({
                isOpen: true,
                status: 'error',
                message: errorMsg
            });
        } finally {
            setUpdatingId(null);
        }
    };

    const handleModalChange = (field, value) => {
        setSelectedIssue({ ...selectedIssue, [field]: value });
    };

    const openModal = (issue) => {
        setSelectedIssue({ ...issue });
        setUpdateError('');
        setUpdateMessage('');
        setActiveTab('DETAILS');
        setChatMessages([]);
    };

    const closeModal = () => {
        setSelectedIssue(null);
        setActiveTab('DETAILS');
        setChatMessages([]);
        if (chatWsRef.current) chatWsRef.current.close();
    };

    if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-xl font-bold text-slate-500 animate-pulse font-mono">LOADING FIELD SYSTEM TASKS...</div>;

    return (
        <div className="w-full max-w-full px-6 lg:px-12 mx-auto space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-300">
                    My Assigned Tasks
                </h1>
                <p className="mt-1 text-xs text-slate-400 font-mono">Real-time troubleshooting field logs dispatcher console.</p>
            </div>

            {error && <div className="p-4 border rounded-xl text-rose-400 bg-rose-500/10 border-rose-500/20">{error}</div>}

            <div className="overflow-hidden border border-slate-800/90 shadow-2xl bg-slate-900/20 rounded-2xl backdrop-blur-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[11px] tracking-widest uppercase border-b text-slate-400 border-slate-800/80 bg-slate-900/80 font-black">
                                <th className="p-5">Task Details</th>
                                <th className="p-5">Location Reference</th>
                                <th className="p-5">Priority Level</th>
                                <th className="p-5">Execution Status</th>
                                <th className="p-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40 text-sm">
                            {issues.length === 0 ? (
                                <tr><td colSpan={5} className="p-12 text-center text-slate-500 italic font-mono">Zero outstanding maintenance items assigned to your profile token.</td></tr>
                            ) : (
                                issues.map((issue) => (
                                    <tr key={issue.id} className="transition-colors hover:bg-slate-800/30">
                                        <td className="p-5">
                                            <span className="font-bold text-slate-200 text-base block">{issue.title}</span>
                                            <span className="text-xs text-slate-500 mt-0.5 font-mono block uppercase">{issue.category}</span>
                                        </td>
                                        <td className="p-5 text-slate-300 font-medium">
                                            🏢 Block {issue.creator_block || '?'} — Flat {issue.creator_flat || '?'}
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-2.5 py-0.5 text-[10px] font-black tracking-widest uppercase rounded border 
                                                ${issue.priority === 'Urgent' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]' : 
                                                  issue.priority === 'High' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 
                                                  'text-slate-400 bg-slate-500/10 border-slate-500/20'}`}>
                                                {issue.priority}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-2.5 py-0.5 text-[10px] font-black tracking-widest uppercase rounded border 
                                                ${issue.status === 'Resolved' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 
                                                  issue.status === 'In-Progress' ? 'text-purple-400 bg-purple-500/10 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]' : 
                                                  'text-blue-400 bg-blue-500/10 border-blue-500/20'}`}>
                                                {issue.status}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right">
                                            <button 
                                                onClick={() => openModal(issue)}
                                                className="px-4 py-1.5 text-xs font-black tracking-wider uppercase transition-colors border rounded-xl text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                                            >
                                                Manage Job
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between p-5 border-t bg-slate-950/40 border-slate-800/80">
                        <span className="text-xs text-slate-400 font-mono">Displaying log window <span className="font-bold text-slate-200">{currentPage}</span> of {totalPages}</span>
                        <div className="flex gap-2">
                            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-4 py-1.5 text-xs font-bold transition-all border rounded-lg text-slate-300 border-slate-700 bg-slate-800/40 hover:bg-slate-700 disabled:opacity-20 disabled:cursor-not-allowed">← Prev</button>
                            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-1.5 text-xs font-bold transition-all border rounded-lg text-slate-300 border-slate-700 bg-slate-800/40 hover:bg-slate-700 disabled:opacity-20 disabled:cursor-not-allowed">Next →</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {selectedIssue && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="flex flex-col w-full max-w-5xl h-[85vh] border shadow-2xl bg-slate-900 border-slate-800 rounded-3xl overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/40 shrink-0">
                            <div>
                                <span className="text-[10px] font-mono tracking-widest text-slate-500 block uppercase">Operational Node Registry: #{selectedIssue.id}</span>
                                <h2 className="text-xl font-black text-slate-100 mt-1">{selectedIssue.title}</h2>
                            </div>
                            <button onClick={closeModal} className="p-2 text-slate-400 hover:text-rose-400 transition-colors bg-slate-800/80 rounded-full border border-slate-700">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <div className="flex border-b border-slate-800/80 bg-slate-950/20 shrink-0">
                            <button onClick={() => setActiveTab('DETAILS')} className={`flex-1 py-3 text-xs font-black tracking-widest uppercase transition-all ${activeTab === 'DETAILS' ? 'text-amber-400 border-b-2 border-amber-500 bg-amber-500/5' : 'text-slate-500 hover:text-slate-300'}`}>📋 Overview & Status</button>
                            <button onClick={() => setActiveTab('CHAT')} className={`flex-1 py-3 text-xs font-black tracking-widest uppercase transition-all ${activeTab === 'CHAT' ? 'text-amber-400 border-b-2 border-amber-500 bg-amber-500/5' : 'text-slate-500 hover:text-slate-300'}`}>💬 Resident Discussion</button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {activeTab === 'DETAILS' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 min-h-full divide-y md:divide-y-0 md:divide-x divide-slate-800/80">
                                    <div className="p-6 space-y-6 bg-slate-950/10">
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Complainant Contact Node</h4>
                                            <div className="p-4 border border-slate-800 bg-slate-950/40 rounded-xl">
                                                <p className="font-bold text-slate-200 text-base">{selectedIssue.creator_name || 'Anonymous Resident'}</p>
                                                <p className="text-xs text-slate-400 mt-1 font-mono">📍 Block {selectedIssue.creator_block || '?'} — Unit Flat {selectedIssue.creator_flat || '?'}</p>
                                                <p className="text-xs text-slate-500 mt-2 font-mono">📞 {selectedIssue.creator_phone || 'Protected Endpoint'}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Structural Diagnosis Content</h4>
                                            <div className="p-4 border border-slate-800 bg-slate-950/40 rounded-xl text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">{selectedIssue.description}</div>
                                        </div>
                                        {selectedIssue.uploaded_images?.length > 0 && (
                                            <div>
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Diagnostic Photo Attachments</h4>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {selectedIssue.uploaded_images.map((img, i) => (
                                                        <a key={i} href={img.image} target="_blank" rel="noopener noreferrer" className="block border border-slate-800 rounded-lg overflow-hidden group">
                                                            <img src={img.image} alt="Diagnosis attachment" className="object-cover w-full h-20 group-hover:scale-105 transition-transform" />
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6 bg-slate-900/20">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-3">Triage Execution Panel</h4>
                                        {updateMessage && <div className="p-3 mb-4 text-xs font-bold border rounded-xl text-emerald-400 bg-emerald-500/10 border-emerald-500/20">{updateMessage}</div>}
                                        {updateError && <div className="p-3 mb-4 text-xs font-bold border rounded-xl text-rose-400 bg-rose-500/10 border-rose-500/20">{updateError}</div>}

                                        <form onSubmit={handleUpdateStatus} className="space-y-4">
                                            <div>
                                                <label className="block text-[10px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">Modify Lifecycle Status</label>
                                                <select value={selectedIssue.status} onChange={(e) => handleModalChange('status', e.target.value)} className="w-full p-3 text-xs font-bold border outline-none bg-slate-950 border-slate-800 text-slate-200 rounded-xl focus:border-emerald-500 cursor-pointer">
                                                    <option value="Assigned" className="text-blue-400">Assigned (Awaiting Action)</option>
                                                    <option value="In-Progress" className="text-purple-400">In-Progress (Active Troubleshooting)</option>
                                                    <option value="Resolved" className="text-emerald-400">Resolved (Execution Concluded)</option>
                                                </select>
                                            </div>
                                            <button type="submit" disabled={updatingId === selectedIssue.id} className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 font-bold uppercase tracking-wider text-white text-xs rounded-xl shadow-lg transition-all disabled:opacity-30">
                                                {updatingId === selectedIssue.id ? 'Synchronizing State...' : 'Save Lifecycle Status'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'CHAT' && (
                                <div className="flex flex-col h-[520px]">
                                    <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/30 custom-scrollbar flex flex-col">
                                        {chatMessages.length === 0 ? (
                                            <div className="my-auto text-center text-xs italic text-slate-600 font-mono">No telemetry conversations logged for this ticket endpoint.</div>
                                        ) : (
                                            chatMessages.map((msg, index) => {
                                                const isMe = msg.sender_role === 'STAFF' || msg.sender_name === user?.name;
                                                return (
                                                    <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-full`}>
                                                        <span className="text-[9px] font-bold text-slate-500 mb-1 px-1">{isMe ? 'You (Staff)' : `${msg.sender_name} (${msg.sender_role})`}</span>
                                                        <div className={`p-3 rounded-2xl text-xs max-w-[80%] break-words leading-relaxed shadow-md ${isMe ? 'bg-amber-600 text-slate-950 font-bold rounded-tr-none' : 'bg-slate-800 border border-slate-700/60 text-slate-200 rounded-tl-none'}`}>{msg.message}</div>
                                                        <span className="text-[8px] font-mono text-slate-600 mt-1 px-1">{msg.timestamp || 'Just now'}</span>
                                                    </div>
                                                );
                                            })
                                        )}
                                        <div ref={chatEndRef} />
                                    </div>
                                    <form onSubmit={sendMessage} className="p-4 border-t border-slate-800 bg-slate-950/60 shrink-0 flex gap-2">
                                        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a direct operational message to the resident account..." className="flex-1 px-4 h-11 text-xs border outline-none bg-slate-900 text-slate-200 border-slate-800 rounded-xl focus:border-amber-500 placeholder-slate-600" />
                                        <button type="submit" disabled={!newMessage.trim()} className="px-5 h-11 bg-amber-500 text-slate-950 font-black tracking-wider uppercase text-xs rounded-xl hover:bg-amber-400 transition-colors disabled:opacity-20 shrink-0">Send Packet</button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Popup */}
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

export default StaffIssues;