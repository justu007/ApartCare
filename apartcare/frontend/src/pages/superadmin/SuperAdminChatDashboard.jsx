import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import AdminSuperAdminChat from '../../components/AdminSuperAdminChat';

const SuperAdminChatDashboard = () => {
    const [communities, setCommunities] = useState([]);
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [unreadMap, setUnreadMap] = useState({});
    
    // 🎯 1. Inject the Global Popup State
    const [popup, setPopup] = useState({ isOpen: false, status: '', message: '' });

    useEffect(() => {
        const loadCommunities = async () => {
            try {
                const res = await axiosInstance.get('/webapp/get-communities/');
                const list = res.data.results || res.data || [];
                setCommunities(list);
                if (list.length > 0) setSelectedCommunity(list[0]);
            } catch (err) {
                // 🎯 2. Route HTTP failures to the UI instead of the console
                setPopup({ 
                    isOpen: true, 
                    status: 'error', 
                    message: err.response?.data?.error || "Failed to load active tenancy directories." 
                });
            } finally {
                setLoading(false);
            }
        };
        loadCommunities();
    }, []);

    useEffect(() => {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
        const notificationSocket = new WebSocket(`${wsProtocol}localhost:8000/ws/notification/superadmin/`);

        notificationSocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                const incomingCommunityId = data.from_room_id;
                
                if (incomingCommunityId && String(incomingCommunityId) !== String(selectedCommunity?.id)) {
                    setUnreadMap(prev => ({
                        ...prev,
                        [incomingCommunityId]: (prev[incomingCommunityId] || 0) + 1
                    }));
                }
            } catch (err) {
                // Background parsing errors can remain in the console so they don't interrupt the admin's workflow
                console.error("Error parsing background notification packet:", err);
            }
        };

        return () => notificationSocket.close();
    }, [selectedCommunity]);

    const handleSelectCommunity = (community) => {
        setSelectedCommunity(community);
        setUnreadMap(prev => ({
            ...prev,
            [community.id]: 0
        }));
    };

    if (loading) return <div className="p-12 text-center text-slate-400 font-mono animate-pulse">Establishing Administrative Communication Lanes...</div>;

    return (
        <div className="w-full max-w-6xl mx-auto px-6 py-4 relative z-10">
            <div className="mb-6">
                <h1 className="text-3xl font-black text-white tracking-wide">
                    Direct Operations Desk Feed
                </h1>
                <p className="text-xs text-slate-400 mt-1">Direct encrypted lines linking SaaS operations platform executives with regional real estate administrators.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch w-full">
                
                {/* REGIONAL CHANNELS LEFT DIRECTORY COLUMN */}
                <div className="md:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 h-[580px] overflow-y-auto custom-scrollbar shadow-xl shadow-black/20">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 mb-3">Active Workspace Terminals</h3>
                    {communities.length === 0 ? (
                        <p className="text-xs italic text-slate-500 text-center py-6">No regional networks logged inside system registries.</p>
                    ) : (
                        communities.map((c) => {
                            const unreadMessages = unreadMap[c.id] || 0;

                            return (
                                <button
                                    key={c.id}
                                    onClick={() => handleSelectCommunity(c)}
                                    className={`w-full text-left p-3.5 rounded-xl transition-all flex items-center justify-between border outline-none ${
                                        selectedCommunity?.id === c.id 
                                            ? 'bg-purple-600/10 border-purple-500 text-purple-300 shadow-md shadow-purple-950/20' 
                                            : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40 text-slate-400 focus:border-slate-700'
                                    }`}
                                >
                                    <div className="flex flex-col gap-1 min-w-0 flex-1 pr-2">
                                        <span className="font-bold text-xs tracking-wide block truncate">{c.name}</span>
                                        <span className="text-[10px] opacity-50 font-mono">Terminal Token ID: #{c.id}</span>
                                    </div>

                                    {unreadMessages > 0 && (
                                        <span className="flex items-center justify-center bg-rose-500 text-white font-black text-[10px] h-5 min-w-5 px-1.5 rounded-full border border-slate-950 animate-pulse shadow-[0_0_10px_#f43f5e] shrink-0">
                                            {unreadMessages}
                                        </span>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>

                {/* PREMIUM CHAT VIEWER INTERACTIVE ROW RIGHT COLUMN */}
                <div className="md:col-span-2">
                    {selectedCommunity ? (
                        <AdminSuperAdminChat 
                            key={selectedCommunity.id} 
                            communityId={selectedCommunity.id} 
                            adminName={selectedCommunity.name} 
                        />
                    ) : (
                        <div className="h-[580px] bg-slate-900 border border-slate-800/80 rounded-2xl flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs italic font-mono shadow-2xl">
                            Select an operational command network terminal link from the left directory column row.
                        </div>
                    )}
                </div>
            </div>

            {/* 🎯 3. Render the standardized Error Popup Component */}
            {popup.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                    <div className={`relative w-full max-w-sm p-8 text-center transition-all transform border shadow-2xl rounded-3xl bg-slate-900 ${popup.status === 'success' ? 'border-emerald-500/30 shadow-emerald-900/20' : 'border-rose-500/30 shadow-rose-900/20'}`}>
                        <div className={`flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full border-4 ${popup.status === 'success' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-rose-500/10 border-rose-500 text-rose-400'}`}>
                            {popup.status === 'success' ? (
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                            ) : (
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
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

export default SuperAdminChatDashboard;