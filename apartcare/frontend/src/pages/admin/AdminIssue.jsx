// import React, { useEffect, useState, useRef } from 'react';
// import { getIssues, updateIssue } from '../../api/user'; 
// import { getStaff } from '../../api/admin';
// import axiosInstance from '../../api/axios'; 

// const AdminIssues = () => {
//     const [issues, setIssues] = useState([]);
//     const [staffMembers, setStaffMembers] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [currentPage, setCurrentPage] = useState(1);
//     const [totalPages, setTotalPages] = useState(1);

//     const [selectedIssue, setSelectedIssue] = useState(null);
//     const [updatingId, setUpdatingId] = useState(null);
//     const [error, setError] = useState('');
//     const [message, setMessage] = useState('');
//     const [popup, setPopup] = useState({ isOpen: false, status: '', message: '' });
//     const [activeTab, setActiveTab] = useState('DETAILS');
//     const [chatMessages, setChatMessages] = useState([]);
//     const wsRef = useRef(null);
//     const [newMessage, setNewMessage] = useState("");
//     const messagesEndRef = useRef(null);

//     const sendMessage = (e) => {
//         e.preventDefault();
//         if (newMessage.trim() !== "" && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
//             wsRef.current.send(JSON.stringify({ message: newMessage }));
//             setNewMessage("");
//         }
//     };

//     useEffect(() => {
//         messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     }, [chatMessages]);
    
//     useEffect(() => {
//         fetchData(currentPage);
//     }, [currentPage]);

//     const fetchData = async (page = 1) => {
//         setLoading(true);
//         try {
//             const issuesData = await getIssues(page); 
//             const fetchedIssues = issuesData.results || issuesData.data || issuesData;
//             setIssues(Array.isArray(fetchedIssues) ? fetchedIssues : []);
            
//             const totalItems = issuesData.count || issuesData.total || 0;
//             setTotalPages(totalItems ? Math.ceil(totalItems / 10) : 1);

//             const staffData = await getStaff(1, 100); 
//             setStaffMembers(staffData.results || staffData.data || staffData);
//         } catch (err) {
//             console.error(err);
//             setError('Failed to load issues or staff members.');
//             setPopup({
//                 isOpen: true,
//                 status: 'error',
//                 message: err.response?.data?.error || 'Failed to load issues or staff members.'
//             });
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleUpdate = async (e) => {
//         e.preventDefault();
//         setUpdatingId(selectedIssue.id);
//         setMessage(''); setError('');

//         try {
//             const formBox = new FormData();
//             formBox.append('priority', selectedIssue.priority);
//             formBox.append('status', selectedIssue.status);
//             formBox.append('assigned_staff', selectedIssue.assigned_staff || ''); 

//             await updateIssue(selectedIssue.id, formBox);
//             await fetchData(currentPage);
//             setMessage("Issue updated and assigned successfully!");
//             setTimeout(() => { setMessage(''); closeModal(); }, 1500);
//         } catch (err) {
//             setError(err.response?.data?.detail || "Failed to update issue.");
//             setPopup({
//                 isOpen: true,
//                 status: 'error',
//                 message: err.response?.data?.error || "Failed to update issue."
//             });
//         } finally {
//             setUpdatingId(null);
//         }
//     };

//     useEffect(() => {
//         if (selectedIssue && activeTab === 'CHAT') {
//             const fetchChatHistory = async () => {
//                 try {
//                     const res = await axiosInstance.get(`/chat/issue/${selectedIssue.id}/history/`);
//                     setChatMessages(Array.isArray(res.data) ? res.data : (res.data.results || []));
//                 } catch (err) {
//                     console.error("Failed to load chat history", err);
//                     setPopup({
//                         isOpen: true,
//                         status: 'error',
//                         message: err.response?.data?.error || "Failed to load chat history"
//                  });
//                 }
//             };
//             fetchChatHistory();

//             const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
//             const wsHost = window.location.host; 
//             const ws = new WebSocket(`${wsProtocol}${wsHost}/ws/chat/issue/${selectedIssue.id}/`);
            
//             ws.onopen = () => console.log("🟢 Admin Oversight Chat Connected!");
//             ws.onmessage = (event) => {
//                 const data = JSON.parse(event.data);
//                 setChatMessages((prev) => [...(Array.isArray(prev) ? prev : []), data]);
//                 if (data.event_type === "ISSUE_STATUS_UPDATED" && data.issue) {
//                     setIssues((prevIssues) =>
//                         prevIssues.map((item) =>
//                             item.id === data.issue.id
//                                 ? { ...item, status: data.issue.status }
//                                 : item
//                         )
//                     );
//                 }
//             };
//             ws.onclose = () => console.log("🔴 Admin Chat Disconnected");
//             wsRef.current = ws;

//             return () => { if (wsRef.current) wsRef.current.close(); };
//         }
//     }, [selectedIssue, activeTab]);

//     const handleModalChange = (field, value) => {
//         setSelectedIssue({ ...selectedIssue, [field]: value });
//     };

//     const openModal = (issue) => {
//         setSelectedIssue({ ...issue });
//         setActiveTab('DETAILS'); setError(''); setMessage('');
//     };

//     const closeModal = () => {
//         setSelectedIssue(null); setChatMessages([]); setActiveTab('DETAILS');
//         if (wsRef.current) wsRef.current.close();
//     };

//     if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-base font-bold text-slate-500 font-mono animate-pulse">FETCHING PLATFORM COMPLAINT SYSTEM MATRIX...</div>;

//     return (
//         <div className="w-full max-w-full px-6 lg:px-12 mx-auto space-y-6 animate-fade-in pb-12">
//             <div>
//                 <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 tracking-tight">
//                     Operations Tickets Desk
//                 </h1>
//                 <p className="mt-1 text-xs text-slate-400 font-mono">Moderate resident complaint logs, allocate personnel keys, and monitor triage chat lines.</p>
//             </div>

//             {error && <div className="p-4 text-xs border font-mono rounded-xl text-rose-400 bg-rose-500/10 border-rose-500/20">{error}</div>}

//             <div className="overflow-hidden border border-slate-800 shadow-2xl bg-slate-900/30 rounded-2xl backdrop-blur-md">
//                 <div className="overflow-x-auto">
//                     <table className="w-full text-left border-collapse text-sm">
//                         <thead>
//                             <tr className="text-[11px] tracking-widest uppercase border-b text-slate-400 border-slate-800/80 bg-slate-900/80 font-black">
//                                 <th className="p-5">Complaint Ticket Title</th>
//                                 <th className="p-5">Classification</th>
//                                 <th className="p-5">Originating Resident</th>
//                                 <th className="p-5">Triage Priority</th>
//                                 <th className="p-5">Lifecycle Status</th>
//                                 <th className="p-5 text-right">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-800/40 font-medium">
//                             {issues.length === 0 ? (
//                                 <tr><td colSpan="6" className="p-12 text-center text-slate-500 font-mono italic">No unresolved structural items reported in this community context.</td></tr>
//                             ) : (
//                                 issues.map((issue) => (
//                                     <tr key={issue.id} className="hover:bg-slate-800/20 transition-colors">
//                                         <td className="p-5 font-bold text-slate-200 text-base">{issue.title}</td>
//                                         <td className="p-5 font-mono text-xs text-slate-400 uppercase tracking-wide">{issue.category}</td>
//                                         <td className="p-5">
//                                             <p className="font-bold text-slate-300">{issue.creator_name || 'Tenant'}</p>
//                                             {issue.creator_flat && <span className="text-[10px] font-mono text-slate-500 block mt-0.5">Flat {issue.creator_flat}</span>}
//                                         </td>
//                                         <td className="p-5">
//                                             <span className={`px-2.5 py-0.5 text-[10px] font-black tracking-widest uppercase rounded border inline-block
//                                                 ${issue.priority === 'Urgent' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.1)]' : 
//                                                   issue.priority === 'High' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 
//                                                   'text-slate-400 bg-slate-500/10 border-slate-500/20'}`}>
//                                                 {issue.priority}
//                                             </span>
//                                         </td>
//                                         <td className="p-5">
//                                             <span className={`px-2.5 py-0.5 text-[10px] font-black tracking-widest uppercase rounded border inline-block
//                                                 ${issue.status === 'Resolved' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 
//                                                   issue.status === 'Open' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' : 
//                                                   'text-purple-400 bg-purple-500/10 border-purple-500/20'}`}>
//                                                 {issue.status}
//                                             </span>
//                                         </td>
//                                         <td className="p-5 text-right">
//                                             <button onClick={() => openModal(issue)} className="px-4 py-1.5 text-xs font-black tracking-wider uppercase border border-cyan-500/20 rounded-xl bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-400 transition-colors">Manage</button>
//                                         </td>
//                                     </tr>
//                                 ))
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//                 {!loading && (
//                     <div className="flex justify-between items-center p-5 border-t border-slate-800 bg-slate-950/40">
//                         <span className="text-xs text-slate-500 font-mono">Page {currentPage} of {totalPages}</span>
//                         <div className="flex gap-2">
//                             <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 text-xs font-bold border border-slate-800 bg-slate-950/40 text-slate-300 disabled:opacity-20 rounded-lg">← Prev</button>
//                             <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 text-xs font-bold border border-slate-800 bg-slate-950/40 text-slate-300 disabled:opacity-20 rounded-lg">Next →</button>
//                         </div>
//                     </div>
//                 )}
//             </div>

//             {/* HIGH FIDELITY DETAILED MODAL SPLIT CONSOLE BOX */}
//             {selectedIssue && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
//                     <div className="w-full max-w-5xl h-[85vh] flex flex-col border shadow-2xl bg-slate-900 border-slate-800 rounded-3xl overflow-hidden">
                        
//                         <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-950/40 shrink-0">
//                             <div>
//                                 <span className="text-[10px] font-mono tracking-widest text-slate-500 block uppercase">Ticket Registry Node: #{selectedIssue.id}</span>
//                                 <h2 className="text-xl font-black text-slate-100 mt-1 truncate max-w-xl">{selectedIssue.title}</h2>
//                             </div>
//                             <button onClick={closeModal} className="p-2 text-slate-400 hover:text-rose-400 transition-colors bg-slate-800/80 rounded-full border border-slate-700">
//                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
//                             </button>
//                         </div>

//                         <div className="flex border-b border-slate-800/80 bg-slate-950/20 shrink-0">
//                             <button onClick={() => setActiveTab('DETAILS')} className={`flex-1 py-3 text-xs font-black tracking-widest uppercase border-b-2 transition-all ${activeTab === 'DETAILS' ? 'text-cyan-400 border-cyan-500 bg-cyan-500/5' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>🛠️ Diagnostics & Triage</button>
//                             <button onClick={() => setActiveTab('CHAT')} className={`flex-1 py-3 text-xs font-black tracking-widest uppercase border-b-2 transition-all ${activeTab === 'CHAT' ? 'text-cyan-400 border-cyan-500 bg-cyan-500/5' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>💬 Live Discussion Monitor</button>
//                         </div>

//                         <div className="flex-1 overflow-y-auto custom-scrollbar">
//                             {activeTab === 'DETAILS' && (
//                                 <div className="grid grid-cols-1 md:grid-cols-2 min-h-full divide-y md:divide-y-0 md:divide-x divide-slate-800/80">
//                                     <div className="p-6 space-y-6 bg-slate-950/10">
//                                         <div>
//                                             <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Complainant Registry Data</h4>
//                                             <div className="p-4 border border-slate-800 bg-slate-950/40 rounded-xl text-xs space-y-1 text-slate-300 font-mono">
//                                                 <p className="font-sans text-base font-bold text-slate-100 mb-1">{selectedIssue.creator_name || 'Registry Tenant'}</p>
//                                                 <p>📍 Flat Unit: {selectedIssue.creator_flat || 'N/A'} (Block {selectedIssue.creator_block || '?'})</p>
//                                                 <p>📞 Phone Line: {selectedIssue.creator_phone || 'N/A'}</p>
//                                                 <p>✉️ Mail Endpt: {selectedIssue.creator_email || 'N/A'}</p>
//                                             </div>
//                                         </div>
//                                         <div>
//                                             <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Problem Spec Sheet Description</h4>
//                                             <div className="p-4 border border-slate-800 bg-slate-950/40 rounded-xl text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">{selectedIssue.description}</div>
//                                         </div>
//                                         {selectedIssue.uploaded_images?.length > 0 && (
//                                             <div>
//                                                 <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Attached Diagnostic Photos</h4>
//                                                 <div className="grid grid-cols-3 gap-2">
//                                                     {selectedIssue.uploaded_images.map((img, i) => (
//                                                         <a key={i} href={img.image} target="_blank" rel="noopener noreferrer" className="block border border-slate-800 rounded-lg overflow-hidden hover:border-cyan-500/30 transition-all">
//                                                             <img src={img.image} alt="Ticket attachment" className="object-cover w-full h-20" />
//                                                         </a>
//                                                     ))}
//                                                 </div>
//                                             </div>
//                                         )}
//                                     </div>

//                                     <div className="p-6 bg-slate-900/20 space-y-5">
//                                         <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-3">Triage Allocation Engine</h4>
//                                         {message && <div className="p-3 text-xs border rounded-xl text-emerald-400 bg-emerald-500/10 border-emerald-500/20 font-bold font-mono">{message}</div>}
//                                         {error && <div className="p-3 text-xs border rounded-xl text-rose-400 bg-rose-500/10 border-rose-500/20 font-bold font-mono">{error}</div>}

//                                         <form onSubmit={handleUpdate} className="space-y-4">
//                                             <div>
//                                                 <label className="block text-[10px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">Priority Classification</label>
//                                                 <select value={selectedIssue.priority} onChange={(e) => handleModalChange('priority', e.target.value)} className="w-full p-3 text-xs font-bold border outline-none bg-slate-950 border-slate-800 text-slate-200 rounded-xl focus:border-amber-500 cursor-pointer">
//                                                     <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option><option value="Urgent">Urgent</option>
//                                                 </select>
//                                             </div>
//                                             <div>
//                                                 <label className="block text-[10px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">Lifecycle Operations State</label>
//                                                 <select value={selectedIssue.status} onChange={(e) => handleModalChange('status', e.target.value)} className="w-full p-3 text-xs font-bold border outline-none bg-slate-950 border-slate-800 text-slate-200 rounded-xl focus:border-amber-500 cursor-pointer">
//                                                     <option value="Open">Open</option><option value="Assigned">Assigned</option><option value="In-Progress">In-Progress</option><option value="Resolved">Resolved</option><option value="Closed">Closed</option>
//                                                 </select>
//                                             </div>
//                                             <div>
//                                                 <label className="block text-[10px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">Assign Maintenance Personnel Profile</label>
//                                                 <select value={selectedIssue.assigned_staff || ''} onChange={(e) => handleModalChange('assigned_staff', e.target.value)} className="w-full p-3 text-xs font-bold border outline-none bg-slate-950 border-slate-800 text-slate-200 rounded-xl focus:border-amber-500 cursor-pointer">
//                                                     <option value="">-- Leave Unassigned / System Queue --</option>
//                                                     {staffMembers.map(staff => <option key={staff.id} value={staff.id}>{staff.name} ({staff.designation || 'Technician'})</option>)}
//                                                 </select>
//                                             </div>
//                                             <button type="submit" disabled={updatingId === selectedIssue.id} className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-95 font-bold uppercase tracking-widest text-slate-950 text-xs rounded-xl shadow-lg transition-all disabled:opacity-30 mt-6">
//                                                 {updatingId === selectedIssue.id ? 'Saving Parameters...' : 'Commit Operational Settings'}
//                                             </button>
//                                         </form>
//                                     </div>
//                                 </div>
//                             )}

//                             {activeTab === 'CHAT' && (
//                                 <div className="flex flex-col h-[520px]">
//                                     <div className="p-3 text-center bg-slate-950/40 border-b border-slate-800 shrink-0">
//                                         <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Oversight Monitoring Pipeline Enabled</span>
//                                     </div>
//                                     <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-950/20 custom-scrollbar flex flex-col">
//                                         {chatMessages.length === 0 ? (
//                                             <div className="my-auto text-center text-xs italic text-slate-600 font-mono">No communication stream logs recorded for this ticket link.</div>
//                                         ) : (
//                                             chatMessages.map((msg, index) => {
//                                                 const isMe = msg.sender_role === 'ADMIN';
//                                                 return (
//                                                     <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-full animate-fade-in`}>
//                                                         <span className="text-[9px] font-bold text-slate-500 mb-1 px-1">{isMe ? 'You (Admin)' : `${msg.sender_name} (${msg.sender_role})`}</span>
//                                                         <div className={`p-3 rounded-2xl text-xs max-w-[75%] break-words leading-relaxed shadow-md ${isMe ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'}`}>{msg.message}</div>
//                                                         <span className="text-[8px] font-mono text-slate-600 mt-1 px-1">{msg.timestamp || 'Synced'}</span>
//                                                     </div>
//                                                 );
//                                             })
//                                         )}
//                                         <div ref={messagesEndRef} />
//                                     </div>
//                                     <form onSubmit={sendMessage} className="p-4 border-t border-slate-800 bg-slate-950/60 shrink-0 flex gap-2">
//                                         <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message into the 3-way ticket discussion..." className="flex-1 px-4 h-11 text-xs border outline-none bg-slate-900 text-slate-200 border-slate-800 rounded-xl focus:border-cyan-500 placeholder-slate-600" />
//                                         <button type="submit" disabled={!newMessage.trim()} className="px-5 h-11 bg-cyan-500 text-slate-950 font-black tracking-wider uppercase text-xs rounded-xl hover:bg-cyan-400 transition-colors disabled:opacity-20 shrink-0">Send Packet</button>
//                                     </form>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             )}
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

// export default AdminIssues;
import React, { useEffect, useState, useRef } from 'react';
import { getIssues, updateIssue } from '../../api/user'; 
import { getStaff } from '../../api/admin';
import axiosInstance from '../../api/axios'; 
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

const AdminIssues = () => {
    const { user } = useSelector((state) => state.auth);
    const location = useLocation();

    const [issues, setIssues] = useState([]);
    const [staffMembers, setStaffMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [selectedIssue, setSelectedIssue] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [popup, setPopup] = useState({ isOpen: false, status: '', message: '' });
    const [activeTab, setActiveTab] = useState('DETAILS');
    const [chatMessages, setChatMessages] = useState([]);
    const chatWsRef = useRef(null);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);

    const sendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() !== "" && chatWsRef.current && chatWsRef.current.readyState === WebSocket.OPEN) {
            chatWsRef.current.send(JSON.stringify({ message: newMessage }));
            setNewMessage("");
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);
    
    // Refetch data on page change OR when navigated via notification click
    useEffect(() => {
        fetchData(currentPage);
    }, [currentPage, location.key]);

    // 🎯 Persistent Background Listener for Live Table Updates
    useEffect(() => {
        if (!user?.id) return;

        const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
        const wsHost = window.location.host;
        const syncSocket = new WebSocket(`${wsProtocol}${wsHost}/ws/notification/${user.id}/`);

        syncSocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                // Live Table State Mutation
                if (data.event_type === "ISSUE_STATUS_UPDATED" && data.issue) {
                    setIssues((prev) =>
                        prev.map((item) =>
                            item.id === data.issue.id
                                ? { ...item, status: data.issue.status, priority: data.issue.priority, assigned_staff: data.issue.assigned_staff }
                                : item
                        )
                    );
                    setSelectedIssue((prev) =>
                        prev && prev.id === data.issue.id
                            ? { ...prev, status: data.issue.status, priority: data.issue.priority, assigned_staff: data.issue.assigned_staff }
                            : prev
                    );
                } else if (data.title && data.title.includes("Issue")) {
                    // Refresh table silently when an issue notification arrives
                    fetchData(currentPage);
                }
            } catch (err) {
                console.error("Failed processing sync message:", err);
            }
        };

        return () => syncSocket.close();
    }, [user?.id, currentPage]);

    const fetchData = async (page = 1) => {
        setLoading(true);
        try {
            const issuesData = await getIssues(page); 
            const fetchedIssues = issuesData.results || issuesData.data || issuesData;
            setIssues(Array.isArray(fetchedIssues) ? fetchedIssues : []);
            
            const totalItems = issuesData.count || issuesData.total || 0;
            setTotalPages(totalItems ? Math.ceil(totalItems / 10) : 1);

            const staffData = await getStaff(1, 100); 
            setStaffMembers(staffData.results || staffData.data || staffData);
        } catch (err) {
            console.error(err);
            setError('Failed to load issues or staff members.');
            setPopup({
                isOpen: true,
                status: 'error',
                message: err.response?.data?.error || 'Failed to load issues or staff members.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setUpdatingId(selectedIssue.id);
        setMessage(''); setError('');

        try {
            const formBox = new FormData();
            formBox.append('priority', selectedIssue.priority);
            formBox.append('status', selectedIssue.status);
            formBox.append('assigned_staff', selectedIssue.assigned_staff || ''); 

            await updateIssue(selectedIssue.id, formBox);
            await fetchData(currentPage);
            setMessage("Issue updated and assigned successfully!");
            setTimeout(() => { setMessage(''); closeModal(); }, 1500);
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to update issue.");
            setPopup({
                isOpen: true,
                status: 'error',
                message: err.response?.data?.error || "Failed to update issue."
            });
        } finally {
            setUpdatingId(null);
        }
    };

    // Chat modal WebSocket
    useEffect(() => {
        if (selectedIssue && activeTab === 'CHAT') {
            const fetchChatHistory = async () => {
                try {
                    const res = await axiosInstance.get(`/chat/issue/${selectedIssue.id}/history/`);
                    setChatMessages(Array.isArray(res.data) ? res.data : (res.data.results || []));
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

            return () => { if (chatWsRef.current) chatWsRef.current.close(); };
        }
    }, [selectedIssue, activeTab]);

    const handleModalChange = (field, value) => {
        setSelectedIssue({ ...selectedIssue, [field]: value });
    };

    const openModal = (issue) => {
        setSelectedIssue({ ...issue });
        setActiveTab('DETAILS'); setError(''); setMessage('');
    };

    const closeModal = () => {
        setSelectedIssue(null); setChatMessages([]); setActiveTab('DETAILS');
        if (chatWsRef.current) chatWsRef.current.close();
    };

    if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-base font-bold text-slate-500 font-mono animate-pulse">FETCHING PLATFORM COMPLAINT SYSTEM MATRIX...</div>;

    return (
        <div className="w-full max-w-full px-6 lg:px-12 mx-auto space-y-6 animate-fade-in pb-12">
            <div>
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 tracking-tight">
                    Operations Tickets Desk
                </h1>
                <p className="mt-1 text-xs text-slate-400 font-mono">Moderate resident complaint logs, allocate personnel keys, and monitor triage chat lines.</p>
            </div>

            {error && <div className="p-4 text-xs border font-mono rounded-xl text-rose-400 bg-rose-500/10 border-rose-500/20">{error}</div>}

            <div className="overflow-hidden border border-slate-800 shadow-2xl bg-slate-900/30 rounded-2xl backdrop-blur-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="text-[11px] tracking-widest uppercase border-b text-slate-400 border-slate-800/80 bg-slate-900/80 font-black">
                                <th className="p-5">Complaint Ticket Title</th>
                                <th className="p-5">Classification</th>
                                <th className="p-5">Originating Resident</th>
                                <th className="p-5">Triage Priority</th>
                                <th className="p-5">Lifecycle Status</th>
                                <th className="p-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40 font-medium">
                            {issues.length === 0 ? (
                                <tr><td colSpan="6" className="p-12 text-center text-slate-500 font-mono italic">No unresolved structural items reported in this community context.</td></tr>
                            ) : (
                                issues.map((issue) => (
                                    <tr key={issue.id} className="hover:bg-slate-800/20 transition-colors">
                                        <td className="p-5 font-bold text-slate-200 text-base">{issue.title}</td>
                                        <td className="p-5 font-mono text-xs text-slate-400 uppercase tracking-wide">{issue.category}</td>
                                        <td className="p-5">
                                            <p className="font-bold text-slate-300">{issue.creator_name || 'Tenant'}</p>
                                            {issue.creator_flat && <span className="text-[10px] font-mono text-slate-500 block mt-0.5">Flat {issue.creator_flat}</span>}
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-2.5 py-0.5 text-[10px] font-black tracking-widest uppercase rounded border inline-block
                                                ${issue.priority === 'Urgent' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.1)]' : 
                                                  issue.priority === 'High' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 
                                                  'text-slate-400 bg-slate-500/10 border-slate-500/20'}`}>
                                                {issue.priority}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-2.5 py-0.5 text-[10px] font-black tracking-widest uppercase rounded border inline-block
                                                ${issue.status === 'Resolved' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 
                                                  issue.status === 'Open' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' : 
                                                  'text-purple-400 bg-purple-500/10 border-purple-500/20'}`}>
                                                {issue.status}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right">
                                            <button onClick={() => openModal(issue)} className="px-4 py-1.5 text-xs font-black tracking-wider uppercase border border-cyan-500/20 rounded-xl bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-400 transition-colors">Manage</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && (
                    <div className="flex justify-between items-center p-5 border-t border-slate-800 bg-slate-950/40">
                        <span className="text-xs text-slate-500 font-mono">Page {currentPage} of {totalPages}</span>
                        <div className="flex gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 text-xs font-bold border border-slate-800 bg-slate-950/40 text-slate-300 disabled:opacity-20 rounded-lg">← Prev</button>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 text-xs font-bold border border-slate-800 bg-slate-950/40 text-slate-300 disabled:opacity-20 rounded-lg">Next →</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {selectedIssue && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="w-full max-w-5xl h-[85vh] flex flex-col border shadow-2xl bg-slate-900 border-slate-800 rounded-3xl overflow-hidden">
                        
                        <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-950/40 shrink-0">
                            <div>
                                <span className="text-[10px] font-mono tracking-widest text-slate-500 block uppercase">Ticket Registry Node: #{selectedIssue.id}</span>
                                <h2 className="text-xl font-black text-slate-100 mt-1 truncate max-w-xl">{selectedIssue.title}</h2>
                            </div>
                            <button onClick={closeModal} className="p-2 text-slate-400 hover:text-rose-400 transition-colors bg-slate-800/80 rounded-full border border-slate-700">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <div className="flex border-b border-slate-800/80 bg-slate-950/20 shrink-0">
                            <button onClick={() => setActiveTab('DETAILS')} className={`flex-1 py-3 text-xs font-black tracking-widest uppercase border-b-2 transition-all ${activeTab === 'DETAILS' ? 'text-cyan-400 border-cyan-500 bg-cyan-500/5' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>🛠️ Diagnostics & Triage</button>
                            <button onClick={() => setActiveTab('CHAT')} className={`flex-1 py-3 text-xs font-black tracking-widest uppercase border-b-2 transition-all ${activeTab === 'CHAT' ? 'text-cyan-400 border-cyan-500 bg-cyan-500/5' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>💬 Live Discussion Monitor</button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {activeTab === 'DETAILS' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 min-h-full divide-y md:divide-y-0 md:divide-x divide-slate-800/80">
                                    <div className="p-6 space-y-6 bg-slate-950/10">
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Complainant Registry Data</h4>
                                            <div className="p-4 border border-slate-800 bg-slate-950/40 rounded-xl text-xs space-y-1 text-slate-300 font-mono">
                                                <p className="font-sans text-base font-bold text-slate-100 mb-1">{selectedIssue.creator_name || 'Registry Tenant'}</p>
                                                <p>📍 Flat Unit: {selectedIssue.creator_flat || 'N/A'} (Block {selectedIssue.creator_block || '?'})</p>
                                                <p>📞 Phone Line: {selectedIssue.creator_phone || 'N/A'}</p>
                                                <p>✉️ Mail Endpt: {selectedIssue.creator_email || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Problem Spec Sheet Description</h4>
                                            <div className="p-4 border border-slate-800 bg-slate-950/40 rounded-xl text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">{selectedIssue.description}</div>
                                        </div>
                                        {selectedIssue.uploaded_images?.length > 0 && (
                                            <div>
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Attached Diagnostic Photos</h4>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {selectedIssue.uploaded_images.map((img, i) => (
                                                        <a key={i} href={img.image} target="_blank" rel="noopener noreferrer" className="block border border-slate-800 rounded-lg overflow-hidden hover:border-cyan-500/30 transition-all">
                                                            <img src={img.image} alt="Ticket attachment" className="object-cover w-full h-20" />
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6 bg-slate-900/20 space-y-5">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-3">Triage Allocation Engine</h4>
                                        {message && <div className="p-3 text-xs border rounded-xl text-emerald-400 bg-emerald-500/10 border-emerald-500/20 font-bold font-mono">{message}</div>}
                                        {error && <div className="p-3 text-xs border rounded-xl text-rose-400 bg-rose-500/10 border-rose-500/20 font-bold font-mono">{error}</div>}

                                        <form onSubmit={handleUpdate} className="space-y-4">
                                            <div>
                                                <label className="block text-[10px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">Priority Classification</label>
                                                <select value={selectedIssue.priority} onChange={(e) => handleModalChange('priority', e.target.value)} className="w-full p-3 text-xs font-bold border outline-none bg-slate-950 border-slate-800 text-slate-200 rounded-xl focus:border-amber-500 cursor-pointer">
                                                    <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option><option value="Urgent">Urgent</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">Lifecycle Operations State</label>
                                                <select value={selectedIssue.status} onChange={(e) => handleModalChange('status', e.target.value)} className="w-full p-3 text-xs font-bold border outline-none bg-slate-950 border-slate-800 text-slate-200 rounded-xl focus:border-amber-500 cursor-pointer">
                                                    <option value="Open">Open</option><option value="Assigned">Assigned</option><option value="In-Progress">In-Progress</option><option value="Resolved">Resolved</option><option value="Closed">Closed</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">Assign Maintenance Personnel Profile</label>
                                                <select value={selectedIssue.assigned_staff || ''} onChange={(e) => handleModalChange('assigned_staff', e.target.value)} className="w-full p-3 text-xs font-bold border outline-none bg-slate-950 border-slate-800 text-slate-200 rounded-xl focus:border-amber-500 cursor-pointer">
                                                    <option value="">-- Leave Unassigned / System Queue --</option>
                                                    {staffMembers.map(staff => <option key={staff.id} value={staff.id}>{staff.name} ({staff.designation || 'Technician'})</option>)}
                                                </select>
                                            </div>
                                            <button type="submit" disabled={updatingId === selectedIssue.id} className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-95 font-bold uppercase tracking-widest text-slate-950 text-xs rounded-xl shadow-lg transition-all disabled:opacity-30 mt-6">
                                                {updatingId === selectedIssue.id ? 'Saving Parameters...' : 'Commit Operational Settings'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'CHAT' && (
                                <div className="flex flex-col h-[520px]">
                                    <div className="p-3 text-center bg-slate-950/40 border-b border-slate-800 shrink-0">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Oversight Monitoring Pipeline Enabled</span>
                                    </div>
                                    <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-950/20 custom-scrollbar flex flex-col">
                                        {chatMessages.length === 0 ? (
                                            <div className="my-auto text-center text-xs italic text-slate-600 font-mono">No communication stream logs recorded for this ticket link.</div>
                                        ) : (
                                            chatMessages.map((msg, index) => {
                                                const isMe = msg.sender_role === 'ADMIN';
                                                return (
                                                    <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-full animate-fade-in`}>
                                                        <span className="text-[9px] font-bold text-slate-500 mb-1 px-1">{isMe ? 'You (Admin)' : `${msg.sender_name} (${msg.sender_role})`}</span>
                                                        <div className={`p-3 rounded-2xl text-xs max-w-[75%] break-words leading-relaxed shadow-md ${isMe ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'}`}>{msg.message}</div>
                                                        <span className="text-[8px] font-mono text-slate-600 mt-1 px-1">{msg.timestamp || 'Synced'}</span>
                                                    </div>
                                                );
                                            })
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>
                                    <form onSubmit={sendMessage} className="p-4 border-t border-slate-800 bg-slate-950/60 shrink-0 flex gap-2">
                                        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message into the 3-way ticket discussion..." className="flex-1 px-4 h-11 text-xs border outline-none bg-slate-900 text-slate-200 border-slate-800 rounded-xl focus:border-cyan-500 placeholder-slate-600" />
                                        <button type="submit" disabled={!newMessage.trim()} className="px-5 h-11 bg-cyan-500 text-slate-950 font-black tracking-wider uppercase text-xs rounded-xl hover:bg-cyan-400 transition-colors disabled:opacity-20 shrink-0">Send Packet</button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

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

export default AdminIssues;