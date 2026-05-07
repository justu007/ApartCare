import React, { useEffect, useState, useRef } from 'react';
import { getIssues } from '../../api/user'; 
import axiosInstance from '../../api/axios'; 
import { useSelector } from 'react-redux';

const IssueList = () => {
    const { user } = useSelector((state) => state.auth);

    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [activeTab, setActiveTab] = useState('DETAILS'); 
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    
    const wsRef = useRef(null);
    const chatEndRef = useRef(null); 

    useEffect(() => {
        fetchIssues();
    }, []);

    const fetchIssues = async () => {
        setLoading(true);
        try {
            const data = await getIssues();
            const fetchedIssues = data.data ? data.data : (Array.isArray(data) ? data : []);
            setIssues(Array.isArray(fetchedIssues) ? fetchedIssues : []);
        } catch (err) {
            console.error(err);
            setError('Failed to load your issues.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages, activeTab]);

    useEffect(() => {
        if (selectedIssue && activeTab === 'CHAT') {
            const fetchChatHistory = async () => {
                try {
                    const res = await axiosInstance.get(`/chat/issue/${selectedIssue.id}/history/`);
                    setChatMessages(res.data);

                } catch (err) {
                    console.error("Failed to load chat history", err);
                }
            };
            fetchChatHistory();

            const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
            const wsHost = window.location.host; 
            const ws = new WebSocket(`${wsProtocol}${wsHost}/ws/chat/issue/${selectedIssue.id}/`);
                                            
            ws.onopen = () => console.log("🟢 Issue Chat Connected!");
            
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                setChatMessages((prev) => [...prev, data]);
            };

            ws.onclose = () => console.log("🔴 Issue Chat Disconnected");
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

    const closeModal = () => {
        setSelectedIssue(null);
        setActiveTab('DETAILS');
        setChatMessages([]);
    };

    if (loading) return <div className="p-10 text-center text-slate-400">Loading your issues...</div>;
    if (error) return <div className="p-4 text-center border rounded-lg text-rose-300 bg-rose-500/10 border-rose-500/20">{error}</div>;

    return (
        <div className="w-full mt-6">
            {/* --- RESIDENT DATA TABLE (UNCHANGED) --- */}
            <div className="overflow-hidden border shadow-lg bg-slate-900/50 border-slate-800 rounded-2xl backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs tracking-wider uppercase border-b text-slate-400 border-slate-800 bg-slate-900/80">
                                <th className="p-4 font-bold">Issue Title</th>
                                <th className="p-4 font-bold">Category</th>
                                <th className="p-4 font-bold">Priority</th>
                                <th className="p-4 font-bold">Status</th>
                                <th className="p-4 font-bold text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {issues.length === 0 ? (
                                <tr><td colSpan={5} className="p-10 text-center text-slate-500">You haven't raised any issues yet.</td></tr>
                            ) : (
                                issues.map((issue) => (
                                    <tr key={issue.id} className="transition-colors hover:bg-slate-800/40">
                                        <td className="p-4 font-bold text-slate-200">{issue.title}</td>
                                        <td className="p-4 text-sm text-slate-400">{issue.category}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-bold rounded border ${issue.priority === 'Urgent' || issue.priority === 'High' ? 'text-rose-400 border-rose-500/30' : 'text-slate-400 border-slate-600/50'}`}>
                                                {issue.priority}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-bold rounded border 
                                                ${issue.status === 'Resolved' ? 'text-emerald-400 border-emerald-500/30' : 
                                                  issue.status === 'In-Progress' ? 'text-purple-400 border-purple-500/30' : 
                                                  'text-blue-400 border-blue-500/30'}`}>
                                                {issue.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => setSelectedIssue(issue)}
                                                className="px-3 py-1.5 text-xs font-bold transition-colors border rounded-lg text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- RESIDENT ISSUE MODAL --- */}
            {selectedIssue && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                    <div className="flex flex-col w-full max-w-2xl overflow-hidden border shadow-2xl h-[85vh] bg-slate-900 border-slate-700 rounded-2xl">
                        
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900">
                            <div>
                                <h2 className="text-xl font-bold text-slate-100">{selectedIssue.title}</h2>
                                <p className="text-sm text-slate-400">Ticket #{selectedIssue.id}</p>
                            </div>
                            <button onClick={closeModal} className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors bg-slate-800 rounded-full">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        {/* 🎯 TAB NAVIGATION */}
                        <div className="flex border-b border-slate-800 bg-slate-900/50">
                            <button 
                                onClick={() => setActiveTab('DETAILS')}
                                className={`flex-1 py-3 text-sm font-bold tracking-wider uppercase transition-colors ${activeTab === 'DETAILS' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-900/10' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Issue Details
                            </button>
                            
                            {/* ONLY SHOW CHAT TAB IF STAFF IS ASSIGNED */}
                            {selectedIssue.assigned_staff_name && (
                                <button 
                                    onClick={() => setActiveTab('CHAT')}
                                    className={`flex-1 py-3 text-sm font-bold tracking-wider uppercase transition-colors ${activeTab === 'CHAT' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-900/10' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Live Chat
                                </button>
                            )}
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            
                            {/* TAB 1: DETAILS */}
                            {activeTab === 'DETAILS' && (
                                <div className="p-6">
                                    <div className="flex items-center justify-between p-4 mb-6 border rounded-xl border-slate-700 bg-slate-800/50">
                                        <div>
                                            <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">Current Status</p>
                                            <p className="text-lg font-bold text-cyan-400">{selectedIssue.status}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold tracking-wider text-slate-500 uppercase text-right">Priority Level</p>
                                            <p className={`text-lg font-bold text-right ${selectedIssue.priority === 'Urgent' ? 'text-rose-400' : 'text-slate-200'}`}>{selectedIssue.priority}</p>
                                        </div>
                                    </div>

                                    <h3 className="mb-2 text-xs font-bold tracking-widest text-cyan-500 uppercase">Assigned Staff</h3>
                                    <div className="p-4 mb-6 border rounded-xl border-slate-700 bg-slate-800/30">
                                        {selectedIssue.assigned_staff_name ? (
                                            <>
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                                    </div>
                                                    <p className="text-lg font-bold text-slate-200">{selectedIssue.assigned_staff_name} - {selectedIssue.assigned_staff_designation}</p>
                                                </div>
                                                <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2 text-slate-400">
                                                    <p><span className="font-semibold text-slate-500">Phone:</span> <span className="text-slate-300">{selectedIssue.assigned_staff_phone || 'N/A'}</span></p>
                                                    <p><span className="font-semibold text-slate-500">Email:</span> <span className="text-slate-300">{selectedIssue.assigned_staff_email || 'N/A'}</span></p>
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-sm italic text-slate-500">Pending Assignment. An admin will assign a staff member shortly.</p>
                                        )}
                                    </div>

                                    <h3 className="mb-2 text-xs font-bold tracking-widest text-cyan-500 uppercase">Description</h3>
                                    <p className="p-4 mb-6 text-sm leading-relaxed border text-slate-300 border-slate-800 bg-slate-900/50 rounded-xl whitespace-pre-wrap">
                                        {selectedIssue.description}
                                    </p>

                                    {selectedIssue.uploaded_images && selectedIssue.uploaded_images.length > 0 && (
                                        <>
                                            <h3 className="mb-2 text-xs font-bold tracking-widest text-cyan-500 uppercase">Attached Photos</h3>
                                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                                {selectedIssue.uploaded_images.map((img, i) => (
                                                    <a key={i} href={img.image} target="_blank" rel="noopener noreferrer">
                                                        <img src={img.image} alt="Issue" className="block object-cover w-full h-32 transition-transform border rounded-lg shadow-md border-slate-700 hover:scale-105" />
                                                    </a>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* 🎯 TAB 2: LIVE CHAT */}
                            {activeTab === 'CHAT' && (
                                <div className="flex flex-col h-full bg-slate-900">
                                    {/* Message Display Area */}
                                    <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/50 min-h-[300px]">
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
                                        <div ref={chatEndRef} />
                                    </div>

                                    {/* Message Input Area */}
                                    <form onSubmit={sendMessage} className="p-4 border-t border-slate-800 bg-slate-900">
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder={`Message ${selectedIssue.assigned_staff_name}...`}
                                                className="flex-1 px-4 py-3 text-sm border outline-none bg-slate-800 text-slate-200 border-slate-700 rounded-xl focus:border-cyan-500"
                                            />
                                            <button 
                                                type="submit"
                                                disabled={!newMessage.trim()}
                                                className="px-6 py-3 font-bold text-white transition-colors bg-cyan-600 rounded-xl hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default IssueList;