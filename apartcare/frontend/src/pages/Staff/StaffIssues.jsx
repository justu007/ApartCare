
import React, { useEffect, useState, useRef } from 'react';
import { getIssues, updateIssue } from '../../api/user'; 
import axiosInstance from '../../api/axios'; 
import { useSelector } from 'react-redux';

const StaffIssues = () => {
    const { user } = useSelector((state) => state.auth);

    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [updateMessage, setUpdateMessage] = useState('');
    const [updateError, setUpdateError] = useState('');

    const [activeTab, setActiveTab] = useState('DETAILS');
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    
    const wsRef = useRef(null);
    const chatEndRef = useRef(null);

    useEffect(() => {
        fetchIssues(currentPage);
    }, [currentPage]);

    const fetchIssues = async (page = 1) => {
        setLoading(true);
        try {
            const data = await getIssues(page);
            const fetchedIssues = data.data ? data.data : (Array.isArray(data) ? data : []);
            setIssues(Array.isArray(fetchedIssues) ? fetchedIssues : []);
            
            if (data.count) setTotalPages(Math.ceil(data.count / 10));
        } catch (err) {
            console.error(err);
            setError('Failed to load your assigned tasks.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages, activeTab]);

    // useEffect(() => {
    //     if (selectedIssue && activeTab === 'CHAT') {
    //         const fetchChatHistory = async () => {
    //             try {
    //                 const res = await axiosInstance.get(`/chat/issue/${selectedIssue.id}/history/`);
    //                 setChatMessages(res.data);
    //             } catch (err) {
    //                 console.error("Failed to load chat history", err);
    //             }
    //         };
    //         fetchChatHistory();
    //         const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    //         const wsHost = window.location.host;
    //         const ws = new WebSocket(`${wsProtocol}${wsHost}/ws/notifications/${user.id}/`);
                        
    //         ws.onopen = () => console.log("🟢 Staff Issue Chat Connected!");
            
    //         ws.onmessage = (event) => {
    //             const data = JSON.parse(event.data);
    //             setChatMessages((prev) => [...prev, data]);
    //         };

    //         ws.onclose = () => console.log("🔴 Staff Issue Chat Disconnected");
    //         wsRef.current = ws;

    //         return () => {
    //             if (wsRef.current) wsRef.current.close();
    //         };
    //     }
    // }, [selectedIssue, activeTab]);

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
            
            ws.onopen = () => console.log("🟢 Staff Issue Chat Connected!");
            
            ws.onmessage = (event) => {
                console.log("🔥 MESSAGE RECEIVED FROM DJANGO:", event.data);
                const data = JSON.parse(event.data);
                setChatMessages((prev) => {
                    const safePrev = Array.isArray(prev) ? prev : [];
                    return [...safePrev, data];
                });
            };

            ws.onclose = () => console.log("🔴 Staff Issue Chat Disconnected");
            wsRef.current = ws;

            return () => {
                if (wsRef.current) wsRef.current.close();
            };
        }
    }, [selectedIssue, activeTab]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ message: newMessage }));
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
            setTimeout(() => {
                closeModal();
            }, 2000);

        } catch (err) {
            console.error("Update failed", err);
            setUpdateError(err.response?.data?.detail || "Failed to update status.");
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
        setUpdateMessage('');
        setUpdateError('');
    };

    if (loading) return <div className="flex items-center justify-center min-h-[50vh] text-xl font-semibold text-slate-400">Loading Assigned Tasks...</div>;

    return (
        <div className="max-w-7xl p-6 mx-auto mt-8">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                    My Assigned Tasks
                </h1>
                <p className="mt-2 text-slate-400">View resident details and update your job statuses here.</p>
            </div>

            {error && <div className="p-4 mb-6 text-center border rounded-lg text-rose-300 bg-rose-500/10 border-rose-500/20">{error}</div>}

            {/* --- THE DATA TABLE --- */}
            <div className="overflow-hidden border shadow-2xl bg-slate-900/50 border-slate-800 rounded-2xl backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs tracking-wider uppercase border-b text-slate-400 border-slate-800 bg-slate-900/80">
                                <th className="p-5 font-bold">Task Title</th>
                                <th className="p-5 font-bold">Location</th>
                                <th className="p-5 font-bold">Priority</th>
                                <th className="p-5 font-bold">Status</th>
                                <th className="p-5 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {issues.length === 0 ? (
                                <tr><td colSpan={5} className="p-10 text-center text-slate-500">You have no tasks assigned right now. Great job!</td></tr>
                            ) : (
                                issues.map((issue) => (
                                    <tr key={issue.id} className="transition-colors hover:bg-slate-800/40">
                                        <td className="p-5 font-bold text-slate-200">
                                            {issue.title}
                                            <span className="block mt-1 text-xs font-normal text-slate-500">{issue.category}</span>
                                        </td>
                                        <td className="p-5 text-sm font-medium text-slate-300">
                                            Block {issue.creator_block || '?'} - Flat {issue.creator_flat || '?'}
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
                                                  issue.status === 'In-Progress' ? 'text-purple-400 bg-purple-500/10 border-purple-500/20' : 
                                                  'text-blue-400 bg-blue-500/10 border-blue-500/20'}`}>
                                                {issue.status}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right">
                                            <button 
                                                onClick={() => openModal(issue)}
                                                className="px-4 py-1.5 text-xs font-bold transition-colors border rounded-lg text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                                            >
                                                View & Update
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination Controls */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between p-5 border-t bg-slate-900/80 border-slate-800">
                        <span className="text-sm text-slate-400">Showing page <span className="font-bold text-slate-200">{currentPage}</span> of <span className="font-bold text-slate-200">{totalPages}</span></span>
                        <div className="flex gap-2">
                            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 text-sm font-bold transition-colors border rounded-lg text-slate-300 border-slate-700 bg-slate-800/50 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed">Prev</button>
                            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-bold transition-colors border rounded-lg text-slate-300 border-slate-700 bg-slate-800/50 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed">Next</button>
                        </div>
                    </div>
                )}
            </div>

            {/* --- THE DETAILED MODAL WITH TABS --- */}
            {selectedIssue && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                    <div className="flex flex-col w-full max-w-4xl max-h-[90vh] border shadow-2xl bg-slate-900 border-slate-700 rounded-2xl overflow-hidden">
                        
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/95 z-10 shrink-0">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-100">{selectedIssue.title}</h2>
                                <p className="text-sm text-slate-400 mt-1">Priority: <span className={`font-bold ${selectedIssue.priority === 'Urgent' ? 'text-rose-400' : 'text-amber-400'}`}>{selectedIssue.priority}</span></p>
                            </div>
                            <button onClick={closeModal} className="p-2 text-slate-400 hover:text-rose-400 transition-colors bg-slate-800 rounded-full">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        {/* 🎯 TAB NAVIGATION */}
                        <div className="flex border-b border-slate-800 bg-slate-900/50 shrink-0">
                            <button 
                                onClick={() => setActiveTab('DETAILS')}
                                className={`flex-1 py-3 text-sm font-bold tracking-wider uppercase transition-colors ${activeTab === 'DETAILS' ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-900/10' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Job Details & Status
                            </button>
                            <button 
                                onClick={() => setActiveTab('CHAT')}
                                className={`flex-1 py-3 text-sm font-bold tracking-wider uppercase transition-colors ${activeTab === 'CHAT' ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-900/10' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Live Chat w/ Resident
                            </button>
                        </div>

                        {/* Modal Body - Scrollable Area */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-900">
                            
                            {/* TAB 1: DETAILS */}
                            {activeTab === 'DETAILS' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 min-h-full">
                                    {/* Left Column: Details & User Info */}
                                    <div className="p-6 border-r border-slate-800 bg-slate-900/50">
                                        <h3 className="mb-4 text-xs font-bold tracking-widest text-amber-500 uppercase">Resident Location & Contact</h3>
                                        <div className="p-4 mb-6 border rounded-xl border-slate-700 bg-slate-800/30">
                                            <p className="font-semibold text-slate-200 text-lg mb-2">{selectedIssue.creator_name || 'Unknown Resident'}</p>
                                            <div className="grid grid-cols-2 gap-3 text-sm text-slate-400">
                                                <p><span className="font-semibold text-slate-500">Block:</span> <span className="text-slate-300">{selectedIssue.creator_block || 'N/A'}</span></p>
                                                <p><span className="font-semibold text-slate-500">Flat:</span> <span className="text-slate-300">{selectedIssue.creator_flat || 'N/A'}</span></p>
                                                <p className="col-span-2"><span className="font-semibold text-slate-500">Phone:</span> <span className="text-slate-300">{selectedIssue.creator_phone || 'N/A'}</span></p>
                                            </div>
                                        </div>

                                        <h3 className="mb-4 text-xs font-bold tracking-widest text-amber-500 uppercase">Issue Description</h3>
                                        <div className="p-4 mb-6 border rounded-xl border-slate-700 bg-slate-800/30">
                                            <p className="text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">{selectedIssue.description}</p>
                                        </div>

                                        {selectedIssue.uploaded_images && selectedIssue.uploaded_images.length > 0 && (
                                            <>
                                                <h3 className="mb-4 text-xs font-bold tracking-widest text-amber-500 uppercase">Attached Photos</h3>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {selectedIssue.uploaded_images.map((img, i) => (
                                                        <a key={i} href={img.image} target="_blank" rel="noopener noreferrer">
                                                            <img src={img.image} alt="Issue" className="block object-cover w-full h-24 transition-transform border rounded-lg shadow-md border-slate-700 hover:scale-105 hover:border-amber-500/50" />
                                                        </a>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Right Column: Staff Actions */}
                                    <div className="p-6">
                                        <h3 className="mb-4 text-xs font-bold tracking-widest text-emerald-500 uppercase">Update Task Status</h3>
                                        
                                        {updateMessage && <div className="p-3 mb-4 text-sm border rounded-lg text-emerald-300 bg-emerald-500/10 border-emerald-500/20">{updateMessage}</div>}
                                        {updateError && <div className="p-3 mb-4 text-sm border rounded-lg text-rose-300 bg-rose-500/10 border-rose-500/20">{updateError}</div>}

                                        <div className="p-5 border border-slate-700 bg-slate-800/30 rounded-xl mb-6">
                                            <p className="text-sm text-slate-400 mb-4">Please update the status of this job as you work on it to keep the administration and resident informed.</p>
                                            
                                            <form onSubmit={handleUpdateStatus} className="space-y-6">
                                                <div>
                                                    <label className="block mb-2 text-sm font-medium text-slate-400">Current Status</label>
                                                    <select 
                                                        value={selectedIssue.status} 
                                                        onChange={(e) => handleModalChange('status', e.target.value)}
                                                        className="w-full p-3 transition-all duration-200 border outline-none bg-slate-800 border-slate-700 text-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
                                                    >
                                                        <option className="text-blue-400" value="Assigned">Assigned (Not Started)</option>
                                                        <option className="text-purple-400" value="In-Progress">In-Progress</option>
                                                        <option className="text-emerald-400" value="Resolved">Resolved (Finished)</option>
                                                    </select>
                                                </div>

                                                <div className="pt-6 border-t border-slate-700">
                                                    <button 
                                                        type="submit" 
                                                        disabled={updatingId === selectedIssue.id}
                                                        className="w-full py-3.5 font-bold text-white transition-all duration-300 transform rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 disabled:opacity-50"
                                                    >
                                                        {updatingId === selectedIssue.id ? 'Saving...' : 'Update Status'}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 🎯 TAB 2: LIVE CHAT */}
                            {activeTab === 'CHAT' && (
                                <div className="flex flex-col h-[500px] bg-slate-900">
                                    {/* Message Display Area */}
                                    <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/50">
                                        {chatMessages.length === 0 ? (
                                            <div className="flex items-center justify-center h-full text-sm italic text-slate-500">
                                                No messages yet. Send a message to start the conversation!
                                            </div>
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
                                                                'bg-rose-500/20 text-rose-400' 
                                                            }`}>
                                                                {msg.sender_role}
                                                            </span>
                                                        </div>

                                                        {/* MESSAGE BUBBLE */}
                                                        <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm shadow-md ${
                                                            isAdmin ? 'bg-emerald-600 text-white rounded-tr-sm' :
                                                            isStaff ? 'bg-cyan-700 text-white rounded-tl-sm' : 
                                                            'bg-rose-500/20 text-slate-100 rounded-tl-sm border border-slate-600' // Resident Bubble is Slate
                                                        }`}>
                                                            {msg.message}
                                                        </div>

                                                        {/* TIMESTAMP */}
                                                        <span className="text-[10px] text-slate-500 mt-1">{msg.timestamp}</span>
                                                    </div>
                                                );
                                            })
                                        )}
                                        <div ref={chatEndRef} />
                                    </div>

                                    {/* Message Input Area */}
                                    <form onSubmit={sendMessage} className="p-4 border-t border-slate-800 bg-slate-900 shrink-0">
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder={`Message ${selectedIssue.creator_name}...`}
                                                className="flex-1 px-4 py-3 text-sm border outline-none bg-slate-800 text-slate-200 border-slate-700 rounded-xl focus:border-amber-500"
                                            />
                                            <button 
                                                type="submit"
                                                disabled={!newMessage.trim()}
                                                className="px-6 py-3 font-bold text-white transition-colors bg-amber-600 rounded-xl hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Send
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffIssues;