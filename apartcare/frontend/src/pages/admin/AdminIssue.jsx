

import React, { useEffect, useState, useRef } from 'react';
import { getIssues, updateIssue } from '../../api/user'; 
import { getStaff } from '../../api/admin';
import axiosInstance from '../../api/axios'; 

const AdminIssues = () => {
    const [issues, setIssues] = useState([]);
    const [staffMembers, setStaffMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [selectedIssue, setSelectedIssue] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');


    const [activeTab, setActiveTab] = useState('DETAILS');
    const [chatMessages, setChatMessages] = useState([]);
    const wsRef = useRef(null);


    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);

    const sendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() !== "" && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ message: newMessage }));
            setNewMessage("");
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

    
    useEffect(() => {
        fetchData(currentPage);
    }, [currentPage]);

    const fetchData = async (page = 1) => {
        setLoading(true);
        try {
            const issuesData = await getIssues(page); 
            
            const fetchedIssues = issuesData.results || issuesData.data || issuesData;
            setIssues(Array.isArray(fetchedIssues) ? fetchedIssues : []);
            
            const totalItems = issuesData.count || issuesData.total || 0;
            if (totalItems) {
                setTotalPages(Math.ceil(totalItems / 10)); 
            } else {
                setTotalPages(1);
            }

            const staffData = await getStaff(1, 100); 
            setStaffMembers(staffData.results || staffData.data || staffData);
            
        } catch (err) {
            console.error(err);
            setError('Failed to load issues or staff members.');
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
            
            if (selectedIssue.assigned_staff) {
                formBox.append('assigned_staff', selectedIssue.assigned_staff);
            } else {
                formBox.append('assigned_staff', ''); 
            }

            await updateIssue(selectedIssue.id, formBox);
            await fetchData(currentPage);
            
            setMessage("Issue updated and assigned successfully!");
            setTimeout(() => {
                setMessage('');
                closeModal(); // Cleanly close modal after success
            }, 2000);

        } catch (err) {
            console.error("Update failed", err);
            setError(err.response?.data?.detail || "Failed to update issue.");
        } finally {
            setUpdatingId(null);
        }
    };

    // 🎯 NEW: WebSocket Connection Hook for Admin
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
            
            ws.onopen = () => console.log("🟢 Admin Oversight Chat Connected!");
            
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                setChatMessages((prev) => {
                    const safePrev = Array.isArray(prev) ? prev : [];
                    return [...safePrev, data];
                });
            };

            ws.onclose = () => console.log("🔴 Admin Chat Disconnected");
            wsRef.current = ws;

            return () => {
                if (wsRef.current) wsRef.current.close();
            };
        }
    }, [selectedIssue, activeTab]);

    const handleModalChange = (field, value) => {
        setSelectedIssue({ ...selectedIssue, [field]: value });
    };

    const openModal = (issue) => {
        setSelectedIssue({ ...issue });
        setActiveTab('DETAILS'); // Always open to details first
        setError('');
        setMessage('');
    };

    // 🎯 NEW: Clean close function
    const closeModal = () => {
        setSelectedIssue(null);
        setChatMessages([]);
        setActiveTab('DETAILS');
        if (wsRef.current) wsRef.current.close();
    };

    return (
        <div className="max-w-7xl p-6 mx-auto mt-8">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                    Issue Management
                </h1>
                <p className="mt-2 text-slate-400">Review resident issues, set priorities, and assign staff members.</p>
            </div>

            {/* --- THE DATA TABLE --- */}
            <div className="overflow-hidden border shadow-2xl bg-slate-900/50 border-slate-800 rounded-2xl backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs tracking-wider uppercase border-b text-slate-400 border-slate-800 bg-slate-900/80">
                                <th className="p-5 font-bold">Issue Title</th>
                                <th className="p-5 font-bold">Category</th>
                                <th className="p-5 font-bold">Resident</th>
                                <th className="p-5 font-bold">Priority</th>
                                <th className="p-5 font-bold">Status</th>
                                <th className="p-5 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {loading ? (
                                <tr><td colSpan={6} className="p-10 text-center text-slate-500">Loading records...</td></tr>
                            ) : issues.length === 0 ? (
                                <tr><td colSpan={6} className="p-10 text-center text-slate-500">No issues reported yet!</td></tr>
                            ) : (
                                issues.map((issue) => (
                                    <tr key={issue.id} className="transition-colors hover:bg-slate-800/40">
                                        <td className="p-5 font-bold text-slate-200">{issue.title}</td>
                                        <td className="p-5 text-sm text-slate-400">{issue.category}</td>
                                        <td className="p-5 text-sm text-slate-300">
                                            {issue.creator_name || 'Resident'}
                                            {issue.creator_flat && <span className="block text-xs text-slate-500">Flat {issue.creator_flat}</span>}
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-2.5 py-1 text-xs font-bold tracking-wider rounded border 
                                                ${issue.priority === 'Urgent' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 
                                                  issue.priority === 'High' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 
                                                  'text-slate-300 bg-slate-500/10 border-slate-500/20'}`}>
                                                {issue.priority}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-2.5 py-1 text-xs font-bold tracking-wider rounded border 
                                                ${issue.status === 'Resolved' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 
                                                  issue.status === 'Open' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' : 
                                                  'text-purple-400 bg-purple-500/10 border-purple-500/20'}`}>
                                                {issue.status}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right">
                                            <button 
                                                onClick={() => openModal(issue)}
                                                className="px-4 py-1.5 text-xs font-bold transition-colors border rounded-lg text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10"
                                            >
                                                Manage
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination Controls */}
                {!loading &&  (
                    <div className="flex items-center justify-between p-5 border-t bg-slate-900/80 border-slate-800">
                        <span className="text-sm text-slate-400">Showing page <span className="font-bold text-slate-200">{currentPage}</span> of <span className="font-bold text-slate-200">{totalPages}</span></span>
                        <div className="flex gap-2">
                            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 text-sm font-bold transition-colors border rounded-lg text-slate-300 border-slate-700 bg-slate-800/50 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed">Prev</button>
                            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-bold transition-colors border rounded-lg text-slate-300 border-slate-700 bg-slate-800/50 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed">Next</button>
                        </div>
                    </div>
                )}
            </div>

            {/* --- THE DETAILED MODAL --- */}
            {selectedIssue && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                    <div className="w-full max-w-4xl h-[90vh] flex flex-col border shadow-2xl bg-slate-900 border-slate-700 rounded-2xl overflow-hidden">
                        
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900 shrink-0">
                            <h2 className="text-2xl font-bold text-slate-100">Issue #{selectedIssue.id}: {selectedIssue.title}</h2>
                            <button onClick={closeModal} className="p-2 text-slate-400 hover:text-rose-400 transition-colors bg-slate-800 rounded-full">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        {/* 🎯 NEW: Tab Navigation */}
                        <div className="flex border-b border-slate-800 bg-slate-900/95 shrink-0">
                            <button 
                                onClick={() => setActiveTab('DETAILS')}
                                className={`flex-1 p-4 text-sm font-bold tracking-wider transition-colors border-b-2 ${activeTab === 'DETAILS' ? 'text-cyan-400 border-cyan-400 bg-cyan-500/5' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                            >
                                ISSUE DETAILS & ASSIGNMENT
                            </button>
                            <button 
                                onClick={() => setActiveTab('CHAT')}
                                className={`flex-1 p-4 text-sm font-bold tracking-wider transition-colors border-b-2 ${activeTab === 'CHAT' ? 'text-cyan-400 border-cyan-400 bg-cyan-500/5' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                            >
                                LIVE CHAT MONITOR
                            </button>
                        </div>

                        {/* Modal Content Area (Scrollable) */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            
                            {/* TAB: DETAILS */}
                            {activeTab === 'DETAILS' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 min-h-full">
                                    {/* Left Column: Details & User Info */}
                                    <div className="p-6 border-r border-slate-800 bg-slate-900/50">
                                        <h3 className="mb-4 text-xs font-bold tracking-widest text-cyan-500 uppercase">Resident Information</h3>
                                        <div className="p-4 mb-6 border rounded-xl border-slate-700 bg-slate-800/30">
                                            <p className="font-semibold text-slate-200 text-lg mb-2">{selectedIssue.creator_name || 'Unknown Resident'}</p>
                                            <div className="grid grid-cols-2 gap-3 text-sm text-slate-400">
                                                <p><span className="font-semibold text-slate-500">Block:</span> <span className="text-slate-300">{selectedIssue.creator_block || 'N/A'}</span></p>
                                                <p><span className="font-semibold text-slate-500">Flat:</span> <span className="text-slate-300">{selectedIssue.creator_flat || 'N/A'}</span></p>
                                                <p className="col-span-2"><span className="font-semibold text-slate-500">Phone:</span> <span className="text-slate-300">{selectedIssue.creator_phone || 'N/A'}</span></p>
                                                <p className="col-span-2"><span className="font-semibold text-slate-500">Email:</span> <span className="text-slate-300">{selectedIssue.creator_email || 'N/A'}</span></p>
                                            </div>
                                        </div>

                                        <h3 className="mb-4 text-xs font-bold tracking-widest text-cyan-500 uppercase">Issue Description</h3>
                                        <div className="p-4 mb-6 border rounded-xl border-slate-700 bg-slate-800/30">
                                            <p className="text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">{selectedIssue.description}</p>
                                        </div>

                                        {selectedIssue.uploaded_images && selectedIssue.uploaded_images.length > 0 && (
                                            <>
                                                <h3 className="mb-4 text-xs font-bold tracking-widest text-cyan-500 uppercase">Attached Photos</h3>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {selectedIssue.uploaded_images.map((img, i) => (
                                                        <a key={i} href={img.image} target="_blank" rel="noopener noreferrer">
                                                            <img src={img.image} alt="Issue" className="block object-cover w-full h-24 transition-transform border rounded-lg shadow-md border-slate-700 hover:scale-105 hover:border-cyan-500/50" />
                                                        </a>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Right Column: Admin Actions */}
                                    <div className="p-6">
                                        <h3 className="mb-4 text-xs font-bold tracking-widest text-amber-500 uppercase">Admin Triage Controls</h3>
                                        
                                        {message && <div className="p-3 mb-4 text-sm border rounded-lg text-emerald-300 bg-emerald-500/10 border-emerald-500/20">{message}</div>}
                                        {error && <div className="p-3 mb-4 text-sm border rounded-lg text-rose-300 bg-rose-500/10 border-rose-500/20">{error}</div>}

                                        <form onSubmit={handleUpdate} className="space-y-6">
                                            <div>
                                                <label className="block mb-2 text-sm font-medium text-slate-400">Set Priority</label>
                                                <select 
                                                    value={selectedIssue.priority} 
                                                    onChange={(e) => handleModalChange('priority', e.target.value)}
                                                    className="w-full p-3 transition-all duration-200 border outline-none bg-slate-800 border-slate-700 text-slate-100 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer"
                                                >
                                                    <option value="Low">Low</option>
                                                    <option value="Medium">Medium</option>
                                                    <option className="font-semibold text-amber-400" value="High">High</option>
                                                    <option className="font-bold text-rose-400" value="Urgent">Urgent</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block mb-2 text-sm font-medium text-slate-400">Update Status</label>
                                                <select 
                                                    value={selectedIssue.status} 
                                                    onChange={(e) => handleModalChange('status', e.target.value)}
                                                    className="w-full p-3 transition-all duration-200 border outline-none bg-slate-800 border-slate-700 text-slate-100 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer"
                                                >
                                                    <option value="Open">Open</option>
                                                    <option className="text-blue-400" value="Assigned">Assigned</option>
                                                    <option className="text-purple-400" value="In-Progress">In-Progress</option>
                                                    <option className="text-emerald-400" value="Resolved">Resolved</option>
                                                    <option className="text-slate-500" value="Closed">Closed</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block mb-2 text-sm font-medium text-slate-400">Assign Staff Member</label>
                                                <select 
                                                    value={selectedIssue.assigned_staff || ''} 
                                                    onChange={(e) => handleModalChange('assigned_staff', e.target.value)}
                                                    className="w-full p-3 transition-all duration-200 border outline-none bg-slate-800 border-slate-700 text-slate-100 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer"
                                                >
                                                    <option value="">-- Leave Unassigned --</option>
                                                    {staffMembers.map(staff => (
                                                        <option key={staff.id} value={staff.id}>
                                                            {staff.name} ({staff.designation || 'Staff'})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="pt-6 border-t border-slate-800">
                                                <button 
                                                    type="submit" 
                                                    disabled={updatingId === selectedIssue.id}
                                                    className="w-full py-3.5 font-bold text-white transition-all duration-300 transform rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:-translate-y-0.5 disabled:opacity-50"
                                                >
                                                    {updatingId === selectedIssue.id ? 'Saving Updates...' : 'Confirm & Save Updates'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {/* 🎯 UPGRADED TAB: 3-WAY LIVE CHAT */}
                            {activeTab === 'CHAT' && (
                                <div className="flex flex-col h-full bg-slate-900/50">
                                    
                                    {/* Chat Header */}
                                    <div className="p-4 text-center border-b border-slate-700/50 bg-slate-800/50 shrink-0">
                                        <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">3-Way Communication Active</span>
                                        <p className="text-sm text-slate-400 mt-1">You are in a live chat with {selectedIssue.creator_name} (Resident) and {selectedIssue.assigned_staff_name || 'Staff'}.</p>
                                    </div>

                                    {/* Message History Area */}
                                    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col space-y-4">
                                        {chatMessages.length === 0 ? (
                                            <p className="text-slate-500 text-center italic mt-10">No messages have been sent yet.</p>
                                        ) : (
                                            chatMessages.map((msg, index) => {
                                                const isStaff = msg.sender_role === 'STAFF';
                                                const isAdmin = msg.sender_role === 'ADMIN';
                                                const isResident = msg.sender_role === 'RESIDENT';
                                                
                                                return (
                                                    <div key={index} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                                                        
                                                        {/* NAME & BADGE */}
                                                        <div className={`flex items-baseline gap-2 mb-1 ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
                                                            <span className="text-xs text-slate-400 font-semibold">
                                                                {isAdmin ? 'You (Admin)' : msg.sender_name}
                                                            </span>
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                                                isAdmin ? 'bg-emerald-500/20 text-emerald-400' :
                                                                isStaff ? 'bg-cyan-500/20 text-cyan-400' : 
                                                                'bg-rose-500/20 text-rose-400' // Resident Badge is Rose
                                                            }`}>
                                                                {msg.sender_role}
                                                            </span>
                                                        </div>

                                                        {/* MESSAGE BUBBLE */}
                                                        <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm shadow-md ${
                                                            isAdmin ? 'bg-emerald-600 text-white rounded-tr-sm' :
                                                            isStaff ? 'bg-cyan-700 text-white rounded-tl-sm' : 
                                                            'bg-rose-500/20  text-slate-200 rounded-tl-sm border border-slate-600' // Resident Bubble is Slate
                                                        }`}>
                                                            {msg.message}
                                                        </div>

                                                        {/* TIMESTAMP */}
                                                        <span className="text-[10px] text-slate-500 mt-1">{msg.timestamp}</span>
                                                    </div>
                                                );
                                            })
                                        )}
                                        <div ref={messagesEndRef} /> {/* Auto-scroll target */}
                                    </div>

                                    {/* 🎯 NEW: Admin Message Input Bar */}
                                    <div className="p-4 bg-slate-800 border-t border-slate-700 shrink-0">
                                        <form onSubmit={sendMessage} className="flex gap-3">
                                            <input 
                                                type="text" 
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Type an official admin response..." 
                                                className="flex-1 bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                                            />
                                            <button 
                                                type="submit"
                                                disabled={!newMessage.trim()}
                                                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center"
                                            >
                                                Send
                                            </button>
                                        </form>
                                    </div>

                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminIssues;