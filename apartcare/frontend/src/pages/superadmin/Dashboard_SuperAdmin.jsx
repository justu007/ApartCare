// import React, { useEffect, useState } from 'react';
// import axiosInstance from '../../api/axios';
// import { getSuperAdminAnalytics } from '../../api/superadmin';

// const SuperAdminDashboard = () => {
//     const [dashboardData, setDashboardData] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         getSuperAdminAnalytics()
//             .then((data) => {
//                 setDashboardData(data); 
//                 setLoading(false);
//             })
//             .catch((err) => {
//                 console.error("Failed to load dashboard metrics:", err);
//                 setError("Could not retrieve platform metrics.");
//                 setLoading(false);
//             });
//     }, []);

//     if (loading) return <div className="mt-20 text-xl font-bold text-center text-slate-400">Loading Dashboard Financial Data...</div>;
//     if (error) return <div className="mt-20 text-center text-rose-500 font-semibold">{error}</div>;

//     const { summary, communities } = dashboardData;

//     return (
//         <div className="max-w-7xl mx-auto p-6 text-slate-200">
            
//             {/* Header Title */}
//             <div className="mb-8">
//                 <h1 className="text-3xl font-black text-white">Super Admin Financial Control Panel</h1>
//                 <p className="text-sm text-slate-400 mt-1">Platform-wide subscription revenue logs and billing cycles.</p>
//             </div>

//             {/* 📊 ROW 1: THE REVENUE & MAIN COUNTERS */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
//                 <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
//                     <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Platform Revenue</span>
//                     <h3 className="text-4xl font-black text-emerald-400 mt-2">₹{summary.total_platform_revenue.toLocaleString()}</h3>
//                     <p className="text-xs text-slate-500 mt-1">Total aggregated revenue earned across all cycles</p>
//                 </div>
//                 <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
//                     <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fully Active & Paid</span>
//                     <h3 className="text-4xl font-black text-cyan-400 mt-2">{summary.active_paid_count}</h3>
//                     <p className="text-xs text-slate-500 mt-1">Communities with successful up-to-date invoices</p>
//                 </div>
//                 <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-lg border-rose-900/50 bg-rose-950/10">
//                     <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Overdue / Pending Payments</span>
//                     <h3 className="text-4xl font-black text-rose-400 mt-2">{summary.pending_payment_count}</h3>
//                     <p className="text-xs text-slate-400 mt-1">Requires administrative follow-up</p>
//                 </div>
//             </div>

//             {/* 📊 ROW 2: SUBSCRIPTION BREAKDOWN CARDS */}
//             <h2 className="text-lg font-bold text-slate-300 mb-4">Subscription Tiers Breakdown</h2>
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
//                 <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-lg">
//                     <span className="text-xs font-medium text-slate-400">Trial Period Communities</span>
//                     {/* 🎯 FIXED: Points explicitly to trial_period_count attribute parameter */}
//                     <p className="text-2xl font-bold text-amber-400 mt-1">{summary?.trial_period_count || 0} Apartment(s)</p>
//                 </div>
//                 <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-lg">
//                     <span className="text-xs font-medium text-slate-400">Monthly Billing Cycle Plan</span>
//                     {/* 🎯 FIXED: Points explicitly to monthly_billing_count attribute parameter */}
//                     <p className="text-2xl font-bold text-purple-400 mt-1">{summary?.monthly_billing_count || 0} Apartment(s)</p>
//                 </div>
//                 <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-lg">
//                     <span className="text-xs font-medium text-slate-400">Yearly Billing Cycle Plan</span>
//                     {/* 🎯 FIXED: Points explicitly to yearly_billing_count attribute parameter */}
//                     <p className="text-2xl font-bold text-indigo-400 mt-1">{summary?.yearly_billing_count || 0} Apartment(s)</p>
//                 </div>
//             </div>      

//             {/* 📋 ROW 3: ALL COMMUNITIES CENTRAL DATA LEDGER */}
//             <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
//                 <div className="p-5 border-b border-slate-800 bg-slate-900/50">
//                     <h3 className="font-bold text-white text-base">Communities Ledger & Individual Status</h3>
//                 </div>

//                 <div className="overflow-x-auto">
//                     <table className="w-full text-left border-collapse text-sm">
//                         <thead>
//                             <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
//                                 <th className="p-4 font-semibold">Community Name</th>
//                                 <th className="p-4 font-semibold">Admin Username/Email</th>
//                                 <th className="p-4 font-semibold">Billing Plan Type</th>
//                                 <th className="p-4 font-semibold">Total Contributed</th>
//                                 <th className="p-4 font-semibold">Next Invoice Date</th>
//                                 <th className="p-4 font-semibold text-center">Payment Status</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-800/60">
//                             {communities.length === 0 ? (
//                                 <tr>
//                                     <td colSpan="6" className="p-8 text-center italic text-slate-500">No community accounts registered on the system yet.</td>
//                                 </tr>
//                             ) : (
//                                 communities.map((com) => (
//                                     <tr key={com.id} className="hover:bg-slate-800/30 transition-colors">
//                                         <td className="p-4 font-bold text-slate-200">{com.name}</td>
//                                         <td className="p-4 text-slate-400 font-mono">{com.admin_email}</td>
//                                         <td className="p-4">
//                                             <span className={`px-2 py-0.5 rounded text-xs font-semibold ₹{
//                                                 com.plan_type.includes('Trial') ? 'bg-amber-500/10 text-amber-300' :
//                                                 com.plan_type.includes('Monthly') ? 'bg-purple-500/10 text-purple-300' : 'bg-indigo-500/10 text-indigo-300'
//                                             }`}>
//                                                 {com.plan_type}
//                                             </span>
//                                         </td>
//                                         <td className="p-4 font-semibold text-emerald-400">₹{com.amount_paid.toFixed(2)}</td>
//                                         <td className="p-4 text-slate-300">{com.next_bill}</td>
//                                         <td className="p-4 text-center">
//                                             <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide border ₹{
//                                                 com.status === 'ACTIVE' 
//                                                 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
//                                                 : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
//                                             }`}>
//                                                 {com.status === 'ACTIVE' ? '🟢 PAID' : '🔴 PENDING'}
//                                             </span>
//                                         </td>
//                                     </tr>
//                                 ))
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default SuperAdminDashboard;

import React, { useEffect, useState } from 'react';
import { getSuperAdminAnalytics, getSuperAdminNotifications, dismissSuperAdminNotification } from '../../api/superadmin';

const SuperAdminDashboard = () => {
    const [summary, setSummary] = useState(null);
    const [communities, setCommunities] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadCoreTelemetryData = async () => {
        try {
            const analytics = await getSuperAdminAnalytics();
            setSummary(analytics.summary);
            setCommunities(analytics.communities);

            const activeAlerts = await getSuperAdminNotifications();
            setNotifications(activeAlerts);
        } catch (err) {
            console.error("Dashboard synchronization error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCoreTelemetryData();
    }, []);

    const clearAlertNotification = async (id) => {
        await dismissSuperAdminNotification(id);
        setNotifications(prev => prev.filter(n => n.id !== id));
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

            {/* 📊 ROW 1: THE REVENUE & MAIN COUNTERS
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Platform Revenue</span>
                    <h3 className="text-4xl font-black text-emerald-400 mt-2">₹{summary?.total_platform_revenue?.toLocaleString('en-IN', {minimumFractionDigits: 2})}</h3>
                    <p className="text-xs text-slate-500 mt-1">Total platform collections</p>
                </div>
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fully Active Tenants</span>
                    <h3 className="text-4xl font-black text-cyan-400 mt-2">{summary?.subscribed_count || 0}</h3>
                    <p className="text-xs text-slate-500 mt-1">Communities with active subscription keys</p>
                </div>
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-lg border-rose-900/50 bg-rose-950/10">
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Lapsed / Frozen Licenses</span>
                    <h3 className="text-4xl font-black text-rose-400 mt-2">{summary?.deactivated_count || 0}</h3>
                    <p className="text-xs text-slate-400 mt-1">Suspended access nodes</p>
                </div>
            </div> */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {/* Gross Revenue Box */}
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Platform Revenue</span>
                    <h3 className="text-4xl font-black text-emerald-400 mt-2">₹{summary?.total_platform_revenue?.toLocaleString('en-IN')}</h3>
                </div>
                
                {/* Fully Active Tenants Box */}
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fully Active Tenants</span>
                    {/* 🎯 VERIFY: Explicitly points to summary.subscribed_count attribute */}
                    <h3 className="text-4xl font-black text-cyan-400 mt-2">{summary?.subscribed_count || 0}</h3>
                </div>
                
                {/* Lapsed / Frozen Licenses Box */}
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-lg border-rose-900/50 bg-rose-950/10">
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Lapsed / Frozen Licenses</span>
                    {/* 🎯 VERIFY: Explicitly points to summary.deactivated_count attribute */}
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
        </div>
    );
};

export default SuperAdminDashboard;