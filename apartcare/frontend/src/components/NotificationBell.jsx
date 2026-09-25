
import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../api/axios'; 
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    
    const dropdownRef = useRef(null);
    const wsRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const response = await axiosInstance.get('/notifications/my-alerts/'); 
            setNotifications(response.data.notifications || []);
            setUnreadCount(response.data.unread_count || 0);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    useEffect(() => {
        if (!user || !user.id) return;
        fetchNotifications();
    }, [user]);

    useEffect(() => {
        if (!user || !user.id) return;

        let ws = null;
        let reconnectTimeout = null;

        const connectNotificationSocket = () => {
            const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
            
            const wsUrl = `${wsProtocol}localhost:8000/ws/notification/${user.id}/`;

            ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log(`🟢 Notification Bell Connected for User #${user.id}`);
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'ping') return; 

                    console.log("🔔 Real-time Notification received:", data);
                    fetchNotifications(); 
                } catch (err) {
                    console.error("Failed parsing notification message", err);
                }
            };

            ws.onclose = (e) => {
                console.log("🔴 Notification Bell Socket Disconnected. Auto-reconnecting in 5s...", e.reason);
                reconnectTimeout = setTimeout(() => {
                    connectNotificationSocket();
                }, 5000);
            };

            ws.onerror = (err) => {
                console.error("⚠️ Notification Socket Error:", err);
            };

            wsRef.current = ws;
        };

        connectNotificationSocket();

        return () => {
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
            if (ws) {
                ws.onclose = null; 
                ws.close();
            }
        };
    }, [user?.id]); 

    useEffect(() => {
        const pingInterval = setInterval(() => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: "ping" }));
            }
        }, 25000);

        return () => clearInterval(pingInterval);
    }, []);

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
            console.error("Failed to mark all as read", error);
        }
    };

    const markSingleAsRead = async (id) => {
        try {
            await axiosInstance.put('/notifications/my-alerts/mark-read/', { notification_id: id });
            setUnreadCount(prev => Math.max(0, prev - 1));
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error("Failed to mark single notification as read", error);
        }
    };
    const handleNotificationClick = async (notification) => {
        if (!notification.is_read) {
            await markSingleAsRead(notification.id);
        }
        setIsOpen(false);

        const userRole = user?.role?.toUpperCase();
        const message = notification.message?.toLowerCase() || '';

        const issuePath = userRole === 'ADMIN' ? '/admin/issues' : userRole === 'STAFF' ? '/staff/issues' : '/resident/issues';
        const hallPath = userRole === 'ADMIN' ? '/admin/manage-venues' : '/resident/venues';
        const paymentPath = userRole === 'ADMIN' ? '/admin/reports/payments' : userRole === 'STAFF' ? '/staff/salaries' : '/resident/bills';
        const meetingPath = userRole === 'ADMIN' ? '/admin/meetings' : '/meetings';


        const navigationState = {
            refreshAt: Date.now(),
            notificationId: notification.id,
        };

        if (message.includes('issue') || message.includes('complaint') || message.includes('leak')) {
            if (message.includes('resolved')) {
                navigationState.defaultTab = 'RESOLVED';
            } else if (message.includes('assigned') || message.includes('progress')) {
                navigationState.defaultTab = 'ASSIGNED';
            } else {
                navigationState.defaultTab = 'OPEN';
            }
            navigate(issuePath, { state: navigationState });
        } else if (message.includes('hall') || message.includes('booking')) {
            navigate(hallPath, { state: navigationState });
        } else if (message.includes('bill') || message.includes('payment') || message.includes('salary')) {
            navigate(paymentPath, { state: navigationState });
        } else if (message.includes('meeting') || message.includes('scheduled')) {
            navigate(meetingPath, { state: navigationState });
        } else {
            const dashboardPath = userRole === 'ADMIN' ? '/admin/dashboard' : userRole === 'STAFF' ? '/staff/dashboard' : '/resident/dashboard';
            navigate(dashboardPath, { state: navigationState });
        }
    };

    // const handleNotificationClick = async (notification) => {
    //     if (!notification.is_read) {
    //         await markSingleAsRead(notification.id);
    //     }
    //     setIsOpen(false);

    //     const userRole = user?.role?.toUpperCase(); 
    //     const message = notification.message?.toLowerCase() || '';

    //     let issuePath = userRole === 'ADMIN' ? '/admin/issues' : userRole === 'STAFF' ? '/staff/issues' : '/resident/issues';
    //     let hallPath = userRole === 'ADMIN' ? '/admin/manage-venues' : '/resident/venues';
    //     let paymentPath = userRole === 'ADMIN' ? '/admin/reports/payments' : userRole === 'STAFF' ? '/staff/salaries' : '/resident/bills';
    //     let meetingPath = '/meetings';

    //     if (message.includes('issue') || message.includes('complaint')) navigate(issuePath);
    //     else if (message.includes('hall') || message.includes('booking')) navigate(hallPath);
    //     else if (message.includes('bill') || message.includes('payment') || message.includes('salary')) navigate(paymentPath);
    //     else if (message.includes('meeting')) navigate(meetingPath);
    //     else {
    //         if (userRole === 'ADMIN') navigate('/admin/dashboard');
    //         else if (userRole === 'STAFF') navigate('/staff/dashboard');
    //         else navigate('/resident/dashboard');
    //     }
    // };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="relative p-2 transition-colors rounded-full text-slate-300 hover:text-cyan-400 hover:bg-slate-800"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                
                {unreadCount > 0 && (
                    <span className="absolute flex items-center justify-center w-5 h-5 text-[10px] font-black text-white bg-rose-500 rounded-full top-0 right-0 shadow-[0_0_10px_rgba(244,63,94,0.8)]">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

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
                                        onClick={() => handleNotificationClick(notif)}
                                        className={`p-4 transition-colors cursor-pointer hover:bg-slate-800/50 ${notif.is_read ? 'opacity-60' : 'bg-slate-800/20'}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${notif.is_read ? 'bg-slate-600' : 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]'}`}></div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-200">{notif.title}</p>
                                                <p className="mt-1 text-xs text-slate-400 line-clamp-2">{notif.message}</p>
                                                <p className="mt-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                                                    {notif.created_at ? new Date(notif.created_at).toLocaleString() : ''}
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