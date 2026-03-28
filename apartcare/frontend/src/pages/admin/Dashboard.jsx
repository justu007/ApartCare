

import React, { useEffect, useState } from 'react';
import { getAdminDashboard } from '../../api/admin';
import { Link } from 'react-router-dom';

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

    return (
        <div className="max-w-6xl p-6 mx-auto mt-8">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Community Admin Dashboard</h1>
                <p className="mt-2 text-lg text-slate-400">
                    Managing: <span className="font-semibold text-cyan-400">{dashboardData.community_name}</span>
                </p>
            </div>

            {/* --- NEW: GLOBAL ISSUE OVERVIEW --- */}
            
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <h2 className="mb-4 text-xl font-bold text-slate-200">Global Issue Status</h2>
                <Link to="/admin/issues" className="text-xs font-bold text-purple-400 hover:text-purple-300">View All →</Link>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-10 lg:grid-cols-4">

                <div className="p-5 transition-all duration-300 border shadow-lg bg-slate-900 border-x-slate-800 border-b-slate-800 border-t-4 border-t-cyan-500 rounded-xl hover:-translate-y-1">
                    <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400">Total Open</h3>
                    <p className="mt-1 text-3xl font-black text-cyan-400">{dashboardData.issue_statistics?.open || 0}</p>
                </div>
                <div className="p-5 transition-all duration-300 border shadow-lg bg-slate-900 border-x-slate-800 border-b-slate-800 border-t-4 border-t-blue-500 rounded-xl hover:-translate-y-1">
                    <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400">Assigned</h3>
                    <p className="mt-1 text-3xl font-black text-blue-400">{dashboardData.issue_statistics?.assigned || 0}</p>
                </div>
                <div className="p-5 transition-all duration-300 border shadow-lg bg-slate-900 border-x-slate-800 border-b-slate-800 border-t-4 border-t-purple-500 rounded-xl hover:-translate-y-1">
                    <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400">In-Progress</h3>
                    <p className="mt-1 text-3xl font-black text-purple-400">{dashboardData.issue_statistics?.in_progress || 0}</p>
                </div>
                <div className="p-5 transition-all duration-300 border shadow-lg bg-slate-900 border-x-slate-800 border-b-slate-800 border-t-4 border-t-emerald-500 rounded-xl hover:-translate-y-1">
                    <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400">Resolved</h3>
                    <p className="mt-1 text-3xl font-black text-emerald-400">{dashboardData.issue_statistics?.resolved || 0}</p>
                </div>
            </div>

            
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <h2 className="mb-4 text-xl font-bold text-slate-200">Property Statistics</h2>
                <Link to="/admin/setup" className="text-xs font-bold text-purple-400 hover:text-purple-300">View All →</Link>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-6 transition-all duration-300 border shadow-lg bg-slate-900/50 border-slate-800 rounded-2xl">
                    <h3 className="text-sm font-bold tracking-wider uppercase text-slate-500">Total Blocks</h3>
                    <p className="mt-2 text-4xl font-black text-slate-200">{dashboardData.statistics?.total_blocks || 0}</p>
                </div>
                <div className="p-6 transition-all duration-300 border shadow-lg bg-slate-900/50 border-slate-800 rounded-2xl">
                    <h3 className="text-sm font-bold tracking-wider uppercase text-slate-500">Total Flats</h3>
                    <p className="mt-2 text-4xl font-black text-slate-200">{dashboardData.statistics?.total_flats || 0}</p>
                </div>
                <div className="p-6 transition-all duration-300 border shadow-lg bg-slate-900/50 border-slate-800 rounded-2xl">
                    <h3 className="text-sm font-bold tracking-wider uppercase text-slate-500">Active Residents</h3>
                    <p className="mt-2 text-4xl font-black text-slate-200">{dashboardData.statistics?.total_active_residents || 0}</p>
                </div>
                <div className="p-6 transition-all duration-300 border shadow-lg bg-slate-900/50 border-slate-800 rounded-2xl">
                    <h3 className="text-sm font-bold tracking-wider uppercase text-slate-500">Active Staff</h3>
                    <p className="mt-2 text-4xl font-black text-slate-200">{dashboardData.statistics?.total_active_staff || 0}</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;