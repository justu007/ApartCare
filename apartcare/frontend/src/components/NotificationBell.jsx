import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../api/axios'; 
import { useSelector } from 'react-redux';

const NotificationBell = () => {
    const { user } = useSelector((state) => state.auth);
    
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const response = await axiosInstance.get('/notifications/my-alerts/'); 
            setNotifications(response.data.notifications);
            setUnreadCount(response.data.unread_count);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    useEffect(() => {
        if (!user || !user.id) return;

        fetchNotifications(); 

        const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
        const ws = new WebSocket(`${wsProtocol}localhost:8000/ws/notifications/${user.id}/`);

        ws.onopen = () => {
            console.log("🟢 WebSocket Connected!");
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("🔔 Real-time Notification received:", data);
            
            const newNotif = {
                id: Date.now(), 
                title: data.title,
                message: data.message,
                is_read: false,
                created_at: new Date().toISOString()
            };

            setUnreadCount(prev => prev + 1);
            
            setNotifications(prevNotifications => [newNotif, ...prevNotifications]);
        };

        ws.onclose = () => {
            console.log("🔴 WebSocket Disconnected");
        };

        return () => {
            ws.close();
        };
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAllAsRead = async () => {
        try {
            await axiosInstance.put('/notifications/my-alerts/mark-read/', { notification_id: 'ALL' });
            setUnreadCount(0);
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error("Failed to mark as read");
        }
    };

    const markSingleAsRead = async (id) => {
        try {
            if (String(id).length > 10) {
                 setUnreadCount(prev => Math.max(0, prev - 1));
                 setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
                 return;
            }

            await axiosInstance.put('/notifications/my-alerts/mark-read/', { notification_id: id });
            setUnreadCount(prev => Math.max(0, prev - 1));
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error("Failed to mark as read");
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* The Bell Icon */}
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="relative p-2 transition-colors rounded-full text-slate-300 hover:text-cyan-400 hover:bg-slate-800"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                
                {/* 🎯 Glowing Red Dot for Unread */}
                {unreadCount > 0 && (
                    <span className="absolute flex items-center justify-center w-5 h-5 text-[10px] font-black text-white bg-rose-500 rounded-full top-0 right-0 shadow-[0_0_10px_rgba(244,63,94,0.8)]">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* The Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 z-50 w-80 mt-3 overflow-hidden border shadow-2xl bg-slate-900 border-slate-700 rounded-2xl animate-fade-in">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-800/50">
                        <h3 className="font-bold text-slate-200">Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className="text-xs font-semibold transition-colors text-cyan-400 hover:text-cyan-300">
                                Mark all read
                            </button>
                        )}
                    </div>
                    
                    <div className="overflow-y-auto max-h-96">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-sm text-center text-slate-500">You're all caught up!</div>
                        ) : (
                            <ul className="divide-y divide-slate-800">
                                {notifications.map((notif) => (
                                    <li 
                                        key={notif.id} 
                                        onClick={() => !notif.is_read && markSingleAsRead(notif.id)}
                                        className={`p-4 transition-colors cursor-pointer hover:bg-slate-800/50 ${notif.is_read ? 'opacity-60' : 'bg-slate-800/20'}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Status Dot */}
                                            <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${notif.is_read ? 'bg-slate-600' : 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]'}`}></div>
                                            
                                            <div>
                                                <p className="text-sm font-bold text-slate-200">{notif.title}</p>
                                                <p className="mt-1 text-xs text-slate-400 line-clamp-2">{notif.message}</p>
                                                <p className="mt-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                                                    {new Date(notif.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;