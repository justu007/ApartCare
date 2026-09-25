

import React, { useEffect, useState } from 'react';
import { getAdminDashboard } from '../../api/admin'; 
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [staffPage, setStaffPage] = useState(1);
    const STAFF_PER_PAGE = 5;

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

    if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-base font-bold text-slate-500 font-mono animate-pulse">SYNCHRONIZING MANAGEMENT PROTOCOLS...</div>;
    if (error) return <div className="p-6 border border-rose-500/20 bg-rose-500/10 text-rose-400 rounded-2xl mx-auto max-w-2xl mt-12 text-center font-semibold">{error}</div>;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    const issueChartData = [
        { name: 'Open', value: dashboardData.issue_statistics?.open || 0, color: '#06b6d4' },
        { name: 'Assigned', value: dashboardData.issue_statistics?.assigned || 0, color: '#3b82f6' },
        { name: 'In Progress', value: dashboardData.issue_statistics?.in_progress || 0, color: '#a855f7' },
        { name: 'Resolved', value: dashboardData.issue_statistics?.resolved || 0, color: '#10b981' }
    ].filter(item => item.value > 0); 

    const staffData = dashboardData.performance_data || [];
    const totalStaffPages = Math.ceil(staffData.length / STAFF_PER_PAGE);
    const paginatedStaff = staffData.slice((staffPage - 1) * STAFF_PER_PAGE, staffPage * STAFF_PER_PAGE);

    return (
        <div className="w-full max-w-full px-6 lg:px-12 mx-auto space-y-8 animate-fade-in pb-12">
            
            {/* Header Identity Board */}
            <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 tracking-tight">
                        Community Admin Dashboard
                    </h1>
                    <p className="mt-1 text-sm text-slate-400">
                        Active Workspace Node: <span className="font-bold text-cyan-400 font-mono">{dashboardData.community_name}</span>
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link to="/admin/announcements" className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 font-bold rounded-xl text-xs text-slate-300 transition-all">📢 Broadcast Alert</Link>
                    <Link to="/admin/meetings" className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 font-bold rounded-xl text-xs text-slate-300 transition-all">🗓️ Briefing Rooms</Link>
                </div>
            </div>

            {/* FINANCIAL STATS CARDS GRID */}
            <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80">
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Financial Ledger Operations</h2>
                    <div className="flex gap-4 text-xs font-bold">
                        <Link to="/admin/finance" className="text-emerald-400 hover:underline">Master Ledger →</Link>
                        <Link to="/admin/reports/payments" className="text-cyan-400 hover:underline">Payment Reports →</Link>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="p-6 bg-slate-900/40 border border-slate-800 border-t-4 border-t-emerald-500 rounded-2xl shadow-xl backdrop-blur-sm">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Gross Revenue Log</span>
                        <p className="mt-2 text-3xl font-black text-emerald-400 font-mono">{formatCurrency(dashboardData.finance_statistics?.total_revenue || 0)}</p>
                    </div>
                    <div className="p-6 bg-slate-900/40 border border-slate-800 border-t-4 border-t-amber-500 rounded-2xl shadow-xl backdrop-blur-sm">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Pending Receivables</span>
                        <p className="mt-2 text-3xl font-black text-amber-400 font-mono">{formatCurrency(dashboardData.finance_statistics?.pending_revenue || 0)}</p>
                    </div>
                    <div className="p-6 bg-slate-900/40 border border-slate-800 border-t-4 border-t-rose-500 rounded-2xl shadow-xl backdrop-blur-sm">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Disbursed Expenditures</span>
                        <p className="mt-2 text-3xl font-black text-rose-400 font-mono">{formatCurrency(dashboardData.finance_statistics?.total_expenses || 0)}</p>
                    </div>
                    <Link to="/admin/bills/generate" className="p-6 bg-slate-900/40 border border-slate-800 border-t-4 border-t-orange-500 rounded-2xl shadow-xl backdrop-blur-sm hover:border-slate-700 transition-all block group">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block group-hover:text-orange-400 transition-colors">Overdue Invoices</span>
                            <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-orange-400 uppercase tracking-wider">Process</span>
                        </div>
                        <p className="mt-2 text-3xl font-black text-orange-400 font-mono">
                            {dashboardData.finance_statistics?.overdue_bills || 0} <span className="text-xs font-sans font-normal text-slate-500 uppercase tracking-wider">Invoices</span>
                        </p>
                    </Link>
                </div>
            </div>

            {/* ANALYTICS CHARTS GRID */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-8 p-6 bg-slate-900/40 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-sm">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">6-Month Financial Trend Matrix</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dashboardData.chart_data_finance || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 11, fontFamily: 'monospace'}} />
                                <YAxis stroke="#64748b" tick={{fontSize: 11, fontFamily: 'monospace'}} tickFormatter={(value) => `₹${value/1000}k`} />
                                <RechartsTooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '12px' }} />
                                <Legend wrapperStyle={{ paddingTop: '15px', fontSize: '11px', fontWeight: 'bold' }}/>
                                <Bar dataKey="revenue" name="Revenue stream" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expenses" name="Expenditures Log" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="xl:col-span-4 p-6 bg-slate-900/40 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-sm flex flex-col justify-between">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Issue Telemetry</h3>
                        <Link to="/admin/issues" className="text-[10px] font-black uppercase tracking-widest text-purple-400 hover:underline">Launch Console</Link>
                    </div>
                    <div className="h-64 relative flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={issueChartData} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none">
                                    {issueChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <RechartsTooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute text-center">
                            <p className="text-3xl font-black text-slate-200 font-mono">
                                {issueChartData.reduce((acc, curr) => acc + curr.value, 0)}
                            </p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-0.5">Total Tickets</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-bold text-slate-400 mt-2">
                        {issueChartData.map((item, idx) => (
                            <div key={idx} className="p-1 rounded bg-slate-950/40 border border-slate-800/60">
                                <span className="block truncate" style={{ color: item.color }}>{item.name}</span>
                                <span className="font-mono text-slate-200 block font-black mt-0.5">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* INFRASTRUCTURE MATRIX LISTS */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                
                {/* Registry Demographics metrics cluster (4 Columns) */}
                <div className="xl:col-span-4 grid grid-cols-2 gap-4 h-max">
                    <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl shadow-lg">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Active Residents</h4>
                        <p className="text-3xl font-black text-slate-200 font-mono mt-1">{dashboardData.statistics?.total_active_residents || 0}</p>
                    </div>
                    <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl shadow-lg">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Staff Personnel</h4>
                        <p className="text-3xl font-black text-slate-200 font-mono mt-1">{dashboardData.statistics?.total_active_staff || 0}</p>
                    </div>
                    <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl shadow-lg">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Registered Blocks</h4>
                        <p className="text-3xl font-black text-slate-200 font-mono mt-1">{dashboardData.statistics?.total_blocks || 0}</p>
                    </div>
                    <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl shadow-lg">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sectors / Flats</h4>
                        <p className="text-3xl font-black text-slate-200 font-mono mt-1">{dashboardData.statistics?.total_flats || 0}</p>
                    </div>
                    
                    <Link to="/admin/manage-venues" state={{ defaultTab: 'PENDING' }} className="p-4 bg-slate-900/40 border border-slate-800 hover:border-amber-500/30 rounded-xl shadow-lg relative overflow-hidden transition-all flex justify-between items-center group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-amber-400 transition-colors">Pending Halls</h4>
                            <p className="text-2xl font-black text-amber-400 font-mono mt-0.5">{dashboardData.booking_statistics?.pending || 0}</p>
                        </div>
                        {dashboardData.booking_statistics?.pending > 0 && <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />}
                    </Link>

                    <Link to="/admin/manage-venues" state={{ defaultTab: 'CONFIRMED' }} className="p-4 bg-slate-900/40 border border-slate-800 hover:border-emerald-500/30 rounded-xl shadow-lg relative overflow-hidden transition-all flex justify-between items-center group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-emerald-400 transition-colors">Confirmed Venues</h4>
                            <p className="text-2xl font-black text-emerald-400 font-mono mt-0.5">{dashboardData.booking_statistics?.confirmed || 0}</p>
                        </div>
                    </Link>
                </div>

                {/* Upcoming Events list (4 Columns) */}
                <div className="xl:col-span-4 p-6 bg-slate-900/40 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-sm flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Scheduled Sessions</h3>
                            <Link to="/admin/meetings" className="text-[10px] font-bold text-blue-400 hover:underline font-mono">Launch Module</Link>
                        </div>
                        <ul className="space-y-3 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                            {dashboardData.upcoming_meetings?.length > 0 ? dashboardData.upcoming_meetings.map(m => (
                                <li key={m.id} className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 flex justify-between items-center gap-3">
                                    <span className="text-xs font-bold text-slate-200 block truncate">{m.title}</span>
                                    <span className="text-[10px] text-blue-400 bg-blue-500/5 border border-blue-500/20 px-2 py-0.5 font-mono rounded font-black shrink-0">
                                        {new Date(m.meeting_time).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                                    </span>
                                </li>
                            )) : <p className="text-xs text-slate-500 italic py-4 text-center font-mono">No briefings logged in active stack.</p>}
                        </ul>
                    </div>
                </div>

                {/* Broadcast Registry (4 Columns) */}
                <div className="xl:col-span-4 p-6 bg-slate-900/40 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-sm flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Live Broadcast Feed</h3>
                            <Link to="/admin/announcements" className="text-[10px] font-bold text-purple-400 hover:underline font-mono">New Bulletin</Link>
                        </div>
                        <ul className="space-y-3 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                            {dashboardData.recent_announcements?.length > 0 ? dashboardData.recent_announcements.map(a => (
                                <li key={a.id} className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 flex flex-col gap-1">
                                    <p className="text-xs font-bold text-slate-200 truncate">{a.title}</p>
                                    <span className="text-[9px] font-mono text-slate-500">{new Date(a.created_at).toLocaleDateString()}</span>
                                </li>
                            )) : <p className="text-xs text-slate-500 italic py-4 text-center font-mono">No active bulletins posted.</p>}
                        </ul>
                    </div>
                </div>

            </div>

            {/* PERFORMANCE LEADERBOARD CONTAINER MATRIX */}
            <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-sm">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">Staff Operations Performance Leaderboard</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-slate-800 text-[11px] tracking-widest uppercase text-slate-500 font-black bg-slate-950/20">
                                <th className="p-4">Personnel Node</th>
                                <th className="p-4 text-center">Assigned Workload</th>
                                <th className="p-4 text-center">Active Troubleshooting</th>
                                <th className="p-4 text-center">Resolved Logs</th>
                                <th className="p-4">Resolution Efficiency Node</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40 font-medium">
                            {paginatedStaff.length > 0 ? paginatedStaff.map((staff) => (
                                <tr key={staff.id} className="hover:bg-slate-800/25 transition-colors">
                                    <td className="p-4 font-bold text-slate-200">{staff.name}</td>
                                    <td className="p-4 text-center text-slate-400 font-mono font-bold">{staff.total_issues}</td>
                                    <td className="p-4 text-center text-amber-400 font-mono font-bold">{staff.in_progress}</td>
                                    <td className="p-4 text-center text-emerald-400 font-mono font-black">{staff.resolved}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-4 max-w-xs">
                                            <div className="w-full bg-slate-950/80 border border-slate-800/80 rounded-full h-2.5 overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-500 ${staff.completion_rate > 75 ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : staff.completion_rate > 40 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                                                    style={{ width: `${staff.completion_rate}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-bold text-slate-300 w-10 shrink-0 font-mono text-right">{staff.completion_rate}%</span>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-500 font-mono italic">No staff profiles registered inside active complex directory.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {totalStaffPages > 1 && (
                    <div className="flex justify-between items-center mt-5 pt-4 border-t border-slate-800/60">
                        <span className="text-xs text-slate-500 font-mono">Displaying indices <span className="font-bold text-slate-300">{(staffPage - 1) * STAFF_PER_PAGE + 1} - {Math.min(staffPage * STAFF_PER_PAGE, staffData.length)}</span> of {staffData.length} personnel</span>
                        <div className="flex gap-2">
                            <button onClick={() => setStaffPage(p => Math.max(1, p - 1))} disabled={staffPage === 1} className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-800 bg-slate-950/40 text-slate-300 disabled:opacity-20 transition-all">← Prev</button>
                            <button onClick={() => setStaffPage(p => Math.min(totalStaffPages, p + 1))} disabled={staffPage === totalStaffPages} className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-800 bg-slate-950/40 text-slate-300 disabled:opacity-20 transition-all">Next →</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
