import React, { useEffect, useState } from 'react';
import { getAdminDashboard } from '../../api/admin'; 
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const data = await getAdminDashboard();
                setDashboardData(data);
            } catch (err) {
                if (err.response && err.response.status === 401) setError("Unauthorized. Please log in again.");
                else setError("Failed to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) return <div className="flex items-center justify-center min-h-[50vh] text-xl font-semibold text-slate-400">Loading Dashboard...</div>;
    if (error) return <div className="p-4 mt-10 text-center border rounded-lg text-rose-300 bg-rose-500/10 border-rose-500/20 mx-auto max-w-2xl">{error}</div>;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

  
    const issueChartData = [
        { name: 'Open', value: dashboardData.issue_statistics?.open || 0, color: '#06b6d4' },
        { name: 'Assigned', value: dashboardData.issue_statistics?.assigned || 0, color: '#3b82f6' },
        { name: 'In Progress', value: dashboardData.issue_statistics?.in_progress || 0, color: '#a855f7' },
        { name: 'Resolved', value: dashboardData.issue_statistics?.resolved || 0, color: '#10b981' }
    ].filter(item => item.value > 0); 

    return (
        <div className="max-w-7xl p-6 mx-auto mt-8">
            {/* Header */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Community Admin Dashboard</h1>
                    <p className="mt-2 text-lg text-slate-400">
                        Managing: <span className="font-semibold text-cyan-400">{dashboardData.community_name}</span>
                    </p>
                </div>
            </div>

            {/* --- ROW 1: FINANCIAL OVERVIEW --- */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <h2 className="text-xl font-bold text-slate-200">Financial Overview</h2>
                <Link to="/admin/finance" className="text-xs font-bold text-emerald-400 hover:text-emerald-300">View Master Ledger →</Link>
            </div>
            <div className="grid grid-cols-1 gap-4 mb-10 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-6 border shadow-lg bg-slate-900 border-slate-800 border-t-4 border-t-emerald-500 rounded-xl">
                    <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400">Total Revenue Collected</h3>
                    <p className="mt-2 text-3xl font-black text-emerald-400">{formatCurrency(dashboardData.finance_statistics?.total_revenue || 0)}</p>
                </div>
                <div className="p-6 border shadow-lg bg-slate-900 border-slate-800 border-t-4 border-t-amber-500 rounded-xl">
                    <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400">Pending Dues</h3>
                    <p className="mt-2 text-3xl font-black text-amber-400">{formatCurrency(dashboardData.finance_statistics?.pending_revenue || 0)}</p>
                </div>
                <div className="p-6 border shadow-lg bg-slate-900 border-slate-800 border-t-4 border-t-rose-500 rounded-xl">
                    <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400">Total Expenses (Salaries)</h3>
                    <p className="mt-2 text-3xl font-black text-rose-400">{formatCurrency(dashboardData.finance_statistics?.total_expenses || 0)}</p>
                </div>
                <div className="p-6 border shadow-lg bg-slate-900 border-slate-800 border-t-4 border-t-orange-500 rounded-xl">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                        <Link to="/admin/bills/generate" className="text-xs text-purple-400 hover:text-purple-300">Bills</Link>
                    </div>
                    <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400">Overdue Bills</h3>
                    <p className="mt-2 text-3xl font-black text-orange-400">
                        {dashboardData.finance_statistics?.overdue_bills || 0} <span className="text-sm font-medium text-slate-500">bills</span>
                    </p>
                </div>
            </div>

            {/* --- ROW 2: CHARTS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                {/* Finance Bar Chart */}
                <div className="lg:col-span-2 p-6 border shadow-lg bg-slate-900 border-slate-800 rounded-xl">
                    <h3 className="text-sm font-bold tracking-wider uppercase text-slate-400 mb-6">6-Month Financial Trend</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dashboardData.chart_data_finance || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 12}} />
                                <YAxis stroke="#64748b" tick={{fontSize: 12}} tickFormatter={(value) => `₹${value/1000}k`} />
                                <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                                <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                                <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Issue Distribution Pie Chart */}
                <div className="p-6 border shadow-lg bg-slate-900 border-slate-800 rounded-xl">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                        <Link to="/admin/issues" className="text-xs text-purple-400 hover:text-purple-300">See Issues</Link>
                    </div>
                    <h3 className="text-sm font-bold tracking-wider uppercase text-slate-400 mb-6">Issue Distribution</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={issueChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} 
                                    paddingAngle={5} dataKey="value" stroke="none"
                                >
                                    {issueChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* --- ROW 3: LISTS & PROPERTY STATS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                {/* 🎯 UPGRADED: Operations & Property Grid */}
 
                <div className="grid grid-cols-2 gap-4 h-max">
                    
                    {/* Row 1: People Stats */}
                    <div className="p-5 border shadow-lg bg-slate-900/50 border-slate-800 rounded-xl">
                        <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500">Residents</h3>
                        <p className="mt-1 text-2xl font-black text-slate-200">{dashboardData.statistics?.total_active_residents || 0}</p>
                    </div>
                    <div className="p-5 border shadow-lg bg-slate-900/50 border-slate-800 rounded-xl">
                        <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500">Staff</h3>
                        <p className="mt-1 text-2xl font-black text-slate-200">{dashboardData.statistics?.total_active_staff || 0}</p>
                    </div>

                    {/* Row 2: Property Stats */}
                    <div className="p-5 border shadow-lg bg-slate-900/50 border-slate-800 rounded-xl">
                        <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500">Blocks</h3>
                        <p className="mt-1 text-2xl font-black text-slate-200">{dashboardData.statistics?.total_blocks || 0}</p>
                    </div>
                    <div className="p-5 border shadow-lg bg-slate-900/50 border-slate-800 rounded-xl">
                        <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500">Flats</h3>
                        <p className="mt-1 text-2xl font-black text-slate-200">{dashboardData.statistics?.total_flats || 0}</p>
                    </div>
                    
                    {/* Row 3: Venue Stats (Both are now clickable links!) */}
                    <Link 
                        to="/admin/manage-venues" 
                        state={{ defaultTab: 'PENDING' }}
                        className="p-5 border shadow-lg bg-slate-900 border-slate-800 rounded-xl relative overflow-hidden hover:bg-slate-800 transition-colors cursor-pointer block group"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                        <div className="flex justify-between items-start">
                            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500 group-hover:text-amber-400 transition-colors">Pending Halls</h3>
                            {dashboardData.booking_statistics?.pending > 0 && (
                                <span className="flex h-3 w-3 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                                </span>
                            )}
                        </div>
                        <p className="mt-1 text-2xl font-black text-amber-400">{dashboardData.booking_statistics?.pending || 0}</p>
                    </Link>

                    {/* 🎯 Updated to include 'state' for tab routing */}
                    <Link 
                        to="/admin/manage-venues" 
                        state={{ defaultTab: 'CONFIRMED' }}
                        className="p-5 border shadow-lg bg-slate-900 border-slate-800 rounded-xl relative overflow-hidden hover:bg-slate-800 transition-colors cursor-pointer block group"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                        <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500 group-hover:text-emerald-400 transition-colors">Confirmed Halls</h3>
                        <p className="mt-1 text-2xl font-black text-emerald-400">{dashboardData.booking_statistics?.confirmed || 0}</p>
                    </Link>

                </div>
                
                {/* Upcoming Meetings */}
                <div className="p-6 border shadow-lg bg-slate-900 border-slate-800 rounded-xl">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                        <h3 className="text-sm font-bold tracking-wider uppercase text-slate-400">Upcoming Meetings</h3>
                        <Link to="/admin/meetings" className="text-xs text-blue-400 hover:text-blue-300">Manage</Link>
                    </div>
                    <ul className="space-y-4">
                        {dashboardData.upcoming_meetings?.length > 0 ? dashboardData.upcoming_meetings.map(m => (
                            <li key={m.id} className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-slate-200">{m.title}</span>
                                <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                                    {new Date(m.meeting_time).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                                </span>
                            </li>
                        )) : <p className="text-sm text-slate-500 italic">No meetings scheduled.</p>}
                    </ul>
                </div>

                {/* Recent Announcements */}
                <div className="p-6 border shadow-lg bg-slate-900 border-slate-800 rounded-xl">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                        <h3 className="text-sm font-bold tracking-wider uppercase text-slate-400">Announcements</h3>
                        <Link to="/admin/announcements" className="text-xs text-purple-400 hover:text-purple-300">Post New</Link>
                    </div>
                    <ul className="space-y-4">
                        {dashboardData.recent_announcements?.length > 0 ? dashboardData.recent_announcements.map(a => (
                            <li key={a.id}>
                                <p className="text-sm font-semibold text-slate-200 line-clamp-1">{a.title}</p>
                                <span className="text-xs text-slate-500">{new Date(a.created_at).toLocaleDateString()}</span>
                            </li>
                        )) : <p className="text-sm text-slate-500 italic">No recent announcements.</p>}
                    </ul>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;