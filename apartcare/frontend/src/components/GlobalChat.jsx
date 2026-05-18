import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../api/axios'; 

const GlobalChat = ({ currentUserRole, currentUserName, communityId }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    
    const wsRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axiosInstance.get('chat/global/history/'); 
                setMessages(Array.isArray(res.data) ? res.data : res.data.results || []);
            } catch (err) {
                console.error("Failed to load global chat history", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    useEffect(() => {
        if (!communityId) return;

        const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
        const wsHost = window.location.host; 
        
        const wsUrl = `${wsProtocol}${wsHost}/ws/chat/community/${communityId}/`;
        const ws = new WebSocket(wsUrl);
        
        ws.onopen = () => console.log("🟢 Global Chat Connected!");
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setMessages((prev) => [...prev, data]);
        };

        ws.onclose = () => console.log("🔴 Global Chat Disconnected");
        wsRef.current = ws;

        return () => {
            if (wsRef.current) wsRef.current.close();
        };
    }, [communityId]);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    // 4. Send Message Handler
    const sendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() !== "" && wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ message: newMessage }));
            setNewMessage("");
        }
    };

    return (
        <>
            {/* --- FLOATING TOGGLE BUTTON --- */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="fixed flex items-center justify-center w-14 h-14 text-white transition-all transform shadow-2xl z-[100] bottom-6 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full hover:scale-110 hover:shadow-blue-500/50"
            >
                {isOpen ? (
                    // Close Icon (X)
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                ) : (
                    // Chat Bubble Icon
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                )}
            </button>

            {/* --- FLOATING CHAT WINDOW --- */}
            {isOpen && (
                <div className="fixed z-[90] bottom-24 right-6 w-[22rem] sm:w-96 h-[32rem] max-h-[80vh] flex flex-col border shadow-2xl bg-slate-900 border-slate-700 rounded-2xl overflow-hidden animate-fade-in">
                    
                    {/* Chat Header */}
                    <div className="flex items-center justify-between p-4 border-b shrink-0 bg-slate-800 border-slate-700">
                        <div>
                            <h2 className="text-sm font-black tracking-wider text-transparent uppercase bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                                Community Chat
                            </h2>
                            <p className="text-[10px] text-slate-400 mt-0.5">Live Global Channel</p>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-1 text-slate-400 hover:text-rose-400 transition-colors bg-slate-900 rounded-md">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>

                    {/* Chat History Area */}
                    <div className="flex-col flex-1 p-4 space-y-4 overflow-y-auto bg-slate-900/80 custom-scrollbar flex">
                        {loading ? (
                            <div className="flex items-center justify-center h-full text-sm text-slate-500">Loading chat...</div>
                        ) : messages.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-sm italic text-slate-500">Be the first to say hello!</div>
                        ) : (
                            messages.map((msg, index) => {
                                const isMe = msg.sender_name === currentUserName; 
                                const isAdmin = msg.sender_role === 'ADMIN';
                                const isStaff = msg.sender_role === 'STAFF';

                                return (
                                    <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        
                                        {/* Sender Info Badge */}
                                        <div className={`flex items-baseline gap-1.5 mb-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <span className="text-[10px] font-semibold text-slate-400">
                                                {isMe ? 'You' : msg.sender_name}
                                            </span>
                                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                                                isAdmin ? 'bg-emerald-500/20 text-emerald-400' :
                                                isStaff ? 'bg-cyan-500/20 text-cyan-400' : 
                                                'bg-indigo-500/20 text-indigo-400' 
                                            }`}>
                                                {msg.sender_role}
                                            </span>
                                        </div>

                                        {/* Message Bubble */}
                                        <div className={`px-3 py-2 rounded-2xl max-w-[85%] text-sm shadow-md ${
                                            isMe 
                                            ? 'bg-blue-600 text-white rounded-tr-sm' 
                                            : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700'
                                        }`}>
                                            {msg.message}
                                        </div>

                                        {/* Timestamp */}
                                        <span className="text-[9px] text-slate-500 mt-1">{msg.timestamp}</span>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 border-t shrink-0 bg-slate-800 border-slate-700">
                        <form onSubmit={sendMessage} className="flex gap-2">
                            <input 
                                type="text" 
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..." 
                                className="flex-1 px-3 py-2 text-sm transition-all border outline-none bg-slate-900 border-slate-600 rounded-xl text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                            <button 
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="flex items-center justify-center p-2 font-bold text-white transition-all shadow-md bg-blue-600 rounded-xl hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600"
                            >
                                <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                            </button>
                        </form>
                    </div>

                </div>
            )}
        </>
    );
};

export default GlobalChat;