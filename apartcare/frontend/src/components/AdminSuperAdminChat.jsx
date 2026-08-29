

import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '../api/axios';

const AdminSuperAdminChat = ({ communityId, adminName }) => {
    const { user } = useSelector((state) => state.auth);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [connected, setConnected] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isWindowFocused, setIsWindowFocused] = useState(true);

    const socketRef = useRef(null);
    const scrollRef = useRef(null);

    // Dynamic ID parser to accommodate both string primitives and object structures
    let rawId = user?.role === 'SUPER_ADMIN' ? communityId : user?.community;
    if (rawId && typeof rawId === 'object') {
        rawId = rawId.id || rawId._id || rawId.communityId || (rawId.community && rawId.community.id);
    }

    const roomId = rawId;
    const roomType = 'support'; 

    useEffect(() => {
        const handleFocus = () => setIsWindowFocused(true);
        const handleBlur = () => setIsWindowFocused(false);
        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);
        return () => {
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
        };
    }, []);

    useEffect(() => {
        if (isWindowFocused) setUnreadCount(0);
    }, [isWindowFocused]);

    useEffect(() => {
        if (!roomId || String(roomId).includes('[object')) {
            console.warn("⏳ AdminSuperAdminChat: Awaiting a valid, numeric community ID...");
            return;
        }

        const loadHistory = async () => {
            try {
                const res = await axiosInstance.get(`/webapp/chat-history/${roomType}/${roomId}/`);
                const formattedHistory = (res.data || []).map(msg => ({
                    message: msg.message,
                    sender_name: msg.sender_name || msg.sender?.name || msg.sender?.username || 'Unknown',
                    sender_role: msg.sender_role || msg.sender?.role || 'ADMIN',
                    timestamp: msg.timestamp || new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }));
                setMessages(formattedHistory);
            } catch (err) {
                console.error("Failed loading support history:", err);
            }
        };
        loadHistory();

        const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
        const wsUrl = `${wsProtocol}localhost:8000/ws/chat/${roomType}/${roomId}/`;
        
        socketRef.current = new WebSocket(wsUrl);

        socketRef.current.onopen = () => setConnected(true);
        socketRef.current.onclose = () => setConnected(false);

        socketRef.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                // Append real-time message broadcast directly to state list
                setMessages((prev) => [...prev, data]);
                if (!isWindowFocused) setUnreadCount((c) => c + 1);
            } catch (err) {
                console.error("Error unpacking payload packet:", err);
            }
        };

        return () => {
            if (socketRef.current) socketRef.current.close();
        };
    }, [roomId, isWindowFocused]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const textToSend = inputMessage.trim();

        if (connected) {
            socketRef.current.send(JSON.stringify({ message: textToSend }));
            setInputMessage('');
        } else {
            try {
                const res = await axiosInstance.post(`/webapp/send-message-rest/`, {
                    room_type: roomType,
                    room_id: roomId,
                    message: textToSend
                });
                
                const fallbackPayload = {
                    message: textToSend,
                    sender_name: user?.name || user?.username || 'You',
                    sender_role: user?.role || 'ADMIN',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                
                setMessages((prev) => [...prev, fallbackPayload]);
                setInputMessage('');
            } catch (err) {
                console.error("REST messaging route fallback execution failed:", err);
            }
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto py-24 relative z-10">
         {/* <div className="w-full relative z-10"> */}
            {/* <div className="flex flex-col h-[640px] bg-slate-900 border border-slate-800/90 rounded-2xl overflow-hidden shadow-2xl shadow-black/60"> */}
            <div className="flex flex-col h-[580px] bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
                
                {/* HEADER BAR */}
                <div className="p-4 bg-slate-950/60 border-b border-slate-800/80 flex justify-between items-center backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-black text-white text-sm shadow-lg shadow-purple-500/10">
                            {user?.role === 'SUPER_ADMIN' ? 'HQ' : 'AC'}
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-100 tracking-wide">
                                {user?.role === 'SUPER_ADMIN' ? `${adminName || 'Community Admin'}` : "ApartCare Corporate HQ"}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400 shadow-[0_0_8px_#fbbf24] animate-pulse'}`} />
                                <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                                    {connected ? 'Operational Secure Line' : 'Verifying Link Connection Nodes...'}
                                </span>
                            </div>
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <span className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] px-2.5 py-1 rounded-lg font-bold">
                            {unreadCount} pending
                        </span>
                    )}
                </div>

                {/* CHAT DISPLAY CONTAINER */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/20 scrollbar-thin scrollbar-thumb-slate-800">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6">
                            <span className="text-2xl mb-2 opacity-40">🔒</span>
                            <p className="text-xs text-slate-500 font-mono max-w-xs leading-relaxed">
                                Secure terminal initialized. Encrypted messages sent here route directly to administrative consoles.
                            </p>
                        </div>
                    ) : (
                        messages.map((msg, index) => {
                            // 🎯 COMPATIBILITY FIX: Checks user properties comprehensively to avoid render failures
                            const isMe = msg.sender_role === user?.role || 
                                         msg.sender_name === user?.name || 
                                         msg.sender_name === user?.username;
                            
                            return (
                                <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                    <div className={`max-w-[85%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        
                                        {!isMe && (
                                            <span className="text-[10px] font-bold text-slate-400 mb-1 ml-1 tracking-wide">
                                                {msg.sender_name} <span className="text-[8px] text-slate-500 opacity-60">({msg.sender_role?.replace('_', ' ')})</span>
                                            </span>
                                        )}
                                        
                                        <div className={`p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-md ${
                                            isMe 
                                                ? 'bg-purple-600 text-white rounded-tr-none shadow-purple-950/20' 
                                                : 'bg-slate-800 border border-slate-700/50 text-slate-200 rounded-tl-none shadow-black/30'
                                        }`}>
                                            <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                                        </div>
                                        
                                        <span className="text-[9px] text-slate-500 mt-1 font-mono tracking-tight px-1">
                                            {msg.timestamp || "Just now"}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={scrollRef} />
                </div>

                {/* TEXTBOX INPUT ROW BAR */}
                <div className="p-4 bg-slate-950/40 border-t border-slate-800/60">
                    <form onSubmit={sendMessage} className="flex gap-2 items-center">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Type a secure message..."
                            className="flex-1 bg-slate-950/80 border border-slate-800 text-slate-200 text-xs px-4 h-12 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-slate-950 transition-all placeholder-slate-600 relative z-20 cursor-text"
                        />
                        <button
                            type="submit"
                            disabled={!inputMessage.trim()}
                            className="h-12 w-12 flex items-center justify-center bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:hover:bg-purple-600 text-white rounded-xl transition-all shadow-lg shadow-purple-950/40 shrink-0 relative z-20"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 transform rotate-90">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminSuperAdminChat;

