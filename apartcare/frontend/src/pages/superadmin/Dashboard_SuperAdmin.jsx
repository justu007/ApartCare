import React, { useEffect, useState } from 'react';
import { getSuperAdminAnalytics, getSuperAdminNotifications, dismissSuperAdminNotification } from '../../api/superadmin';

const SuperAdminDashboard = () => {
    const [summary, setSummary] = useState(null);
    const [communities, setCommunities] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [popup, setPopup] = useState({ isOpen: false, status: '', message: '' });

    const loadCoreTelemetryData = async () => {
        try {
            const analytics = await getSuperAdminAnalytics();
            setSummary(analytics.summary);
            setCommunities(analytics.communities);

            const activeAlerts = await getSuperAdminNotifications();
            setNotifications(activeAlerts);
        } catch (err) {
            setPopup({ 
                isOpen: true, 
                status: 'error', 
                message: err.response?.data?.error || err.response?.data?.detail || "Dashboard synchronization error." 
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCoreTelemetryData();
    }, []);

    const clearAlertNotification = async (id) => {
        try {
            await dismissSuperAdminNotification(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (err) {
            setPopup({
                isOpen: true,
                status: 'error',
                message: err.response?.data?.error || "Failed to dismiss notification."
            });
        }
    };

    if (loading) return <div className="mt-20 text-xl font-black text-center text-slate-400 animate-pulse">Synchronizing Platform Command Panel Systems...</div>;

    return (
        <div className="max-w-7xl mx-auto p-6 text-slate-200">

            {/* Header Identity Container */}
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white">Super Admin Command Center</h1>
                    <p className="text-sm text-slate-400 mt-1">Real-time SaaS billing architecture matrix controllers.</p>
                </div>
                <button onClick={loadCoreTelemetryData} className="px-4 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 font-bold rounded-xl text-xs transition-colors">
                    🔄 Refresh Stream Nodes
                </button>
            </div>

            {/* 🔔 LIVE OPERATIONAL NOTIFICATIONS WARNING BAR TICKER */}
            {notifications.length > 0 && (
                <div className="mb-8 p-5 border bg-slate-950/60 border-purple-500/20 rounded-2xl backdrop-blur-md">
                    <h3 className="text-xs font-black uppercase text-purple-400 tracking-widest mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></span>
                        Active System Infrastructure Notifications
                    </h3>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2">
                        {notifications.map(n => (
                            <div key={n.id} className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex justify-between items-center gap-4 transition-all hover:border-slate-700">
                                <div className="flex gap-2.5 items-start">
                                    <span className="text-sm">{n.type === 'EXPIRATION_WARNING' ? '⏳' : '💳'}</span>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-200">{n.message}</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">{n.created_at}</p>
                                    </div>
                                </div>
                                <button onClick={() => clearAlertNotification(n.id)} className="text-[10px] font-bold text-slate-400 hover:text-purple-400 px-2 py-1 bg-slate-950 border border-slate-800 rounded-md transition-colors">
                                    Dismiss
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {/* Gross Revenue Box */}
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Platform Revenue</span>
                    <h3 className="text-4xl font-black text-emerald-400 mt-2">₹{summary?.total_platform_revenue?.toLocaleString('en-IN')}</h3>
                </div>

                {/* Fully Active Tenants Box */}
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fully Active Tenants</span>
                    <h3 className="text-4xl font-black text-cyan-400 mt-2">{summary?.subscribed_count || 0}</h3>
                </div>

                {/* Lapsed / Frozen Licenses Box */}
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-lg border-rose-900/50 bg-rose-950/10">
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Lapsed / Frozen Licenses</span>
                    <h3 className="text-4xl font-black text-rose-400 mt-2">{summary?.deactivated_count || 0}</h3>
                </div>
            </div>

            {/* 📊 ROW 2: SUBSCRIPTION BREAKDOWN CARDS */}
            <h2 className="text-lg font-bold text-slate-300 mb-4">Subscription Tiers Breakdown</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
                <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-lg">
                    <span className="text-xs font-medium text-slate-400">Trial Period Track</span>
                    <p className="text-2xl font-bold text-amber-400 mt-1">{summary?.trial_period_count || 0} Community</p>
                </div>
                <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-lg">
                    <span className="text-xs font-medium text-slate-400">Monthly Billing Tier</span>
                    <p className="text-2xl font-bold text-purple-400 mt-1">{summary?.monthly_billing_count || 0} Community</p>
                </div>
                <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-lg">
                    <span className="text-xs font-medium text-slate-400">Yearly Billing Tier</span>
                    <p className="text-2xl font-bold text-indigo-400 mt-1">{summary?.yearly_billing_count || 0} Community</p>
                </div>
            </div>

            {/* 📋 ROW 3: ALL COMMUNITIES DATA LEDGER */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <div className="p-5 border-b border-slate-800 bg-slate-900/50">
                    <h3 className="font-bold text-white text-base">Communities Network Ledger Matrix</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800 text-xs tracking-wider uppercase font-black">
                                <th className="p-4">Community Profile</th>
                                <th className="p-4">Admin Email Node</th>
                                <th className="p-4">Billing Strategy Track</th>
                                <th className="p-4">Aggregated Contributed</th>
                                <th className="p-4">Next Invoice Check</th>
                                <th className="p-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {communities.map((com) => (
                                <tr key={com.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="p-4 font-bold text-slate-200">
                                        <div>{com.name}</div>
                                        <span className="text-[10px] text-slate-500 font-normal">{com.address}</span>
                                    </td>
                                    <td className="p-4 text-slate-400 font-mono text-xs">{com.admin_email}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${com.plan_type.includes('Trial') ? 'bg-amber-500/10 text-amber-300' : 'bg-purple-500/10 text-purple-300'}`}>
                                            {com.plan_type}
                                        </span>
                                    </td>
                                    <td className="p-4 font-semibold text-emerald-400">₹{com.amount_paid.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                                    <td className="p-4 text-slate-400 font-mono text-xs">{com.next_bill} ({com.days_remaining})</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${com.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                                            {com.status === 'ACTIVE' ? '🟢 PAID / ACTIVE' : '🔴 EXPIRED'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 🎯 THE BEAUTIFUL NOTIFICATION POPUP MODAL */}
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

export default SuperAdminDashboard;