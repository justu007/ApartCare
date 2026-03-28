import React, { useEffect, useState } from 'react';
import { getResidentDashboard } from '../../api/user';
import { Link } from 'react-router-dom';

const ResidentDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await getResidentDashboard();
                setData(response);
            } catch (err) {
                setError("Failed to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) return <div className="mt-20 text-xl font-semibold text-center text-slate-400">Loading Dashboard...</div>;
    if (error) return <div className="mt-20 text-center text-rose-500">{error}</div>;
    if (!data) return null;

    return (
        <div className="max-w-5xl p-6 mx-auto mt-8">
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                    {data.welcome_message}
                </h1>
                <p className="mt-2 text-lg text-slate-400">
                    Community: <span className="font-semibold text-cyan-400">{data.community}</span>
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                
                {/* Residence Details Card (Active State) */}
                <div className="p-6 transition-all duration-300 border shadow-lg bg-slate-900 border-x-slate-800 border-b-slate-800 border-t-4 border-t-cyan-500 rounded-2xl hover:shadow-cyan-900/20">
                    
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                        <h3 className="pb-3 mb-4 text-lg font-bold border-b text-slate-100 border-slate-800">My Residence</h3>
                        <Link to="/profile" className="text-xs font-bold text-purple-400 hover:text-purple-300">View All →</Link>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Block</span>
                            <span className="font-semibold text-slate-200">{data.residence_details.block}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Flat</span>
                            <span className="font-semibold text-slate-200">{data.residence_details.flat}</span>
                        </div>
                        <div className="flex justify-between pt-3 mt-2 border-t border-slate-800">
                            <span className="text-slate-400">Profile Status</span>
                            <span className={`font-bold tracking-wider text-xs px-2 py-1 rounded border ${
                                data.status === 'ACTIVE' 
                                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                                : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                            }`}>
                                {data.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* --- NEW: MY REPORTED ISSUES CARD --- */}
                <div className="flex flex-col p-6 transition-all duration-300 border shadow-lg bg-slate-900 border-x-slate-800 border-b-slate-800 border-t-4 border-t-purple-500 rounded-2xl hover:shadow-purple-900/20">
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                        <h3 className="text-lg font-bold text-slate-100">My Reported Issues</h3>
                        <Link to="/resident/issues" className="text-xs font-bold text-purple-400 hover:text-purple-300">View All →</Link>
                    </div>
                    
                    <div className="grid flex-grow grid-cols-2 gap-4">
                        <div className="p-3 text-center border rounded-lg bg-slate-800/50 border-slate-700/50">
                            <p className="mb-1 text-xs font-bold tracking-wider uppercase text-slate-400">Open</p>
                            <p className="text-2xl font-black text-cyan-400">{data.issue_statistics?.open || 0}</p>
                        </div>
                        <div className="p-3 text-center border rounded-lg bg-slate-800/50 border-slate-700/50">
                            <p className="mb-1 text-xs font-bold tracking-wider uppercase text-slate-400">Assigned</p>
                            <p className="text-2xl font-black text-blue-400">{data.issue_statistics?.assigned || 0}</p>
                        </div>
                        <div className="p-3 text-center border rounded-lg bg-slate-800/50 border-slate-700/50">
                            <p className="mb-1 text-xs font-bold tracking-wider uppercase text-slate-400">In-Progress</p>
                            <p className="text-2xl font-black text-purple-400">{data.issue_statistics?.in_progress || 0}</p>
                        </div>
                        <div className="p-3 text-center border rounded-lg bg-slate-800/50 border-slate-700/50">
                            <p className="mb-1 text-xs font-bold tracking-wider uppercase text-slate-400">Resolved</p>
                            <p className="text-2xl font-black text-emerald-400">{data.issue_statistics?.resolved || 0}</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ResidentDashboard;