import React, { useEffect, useState } from 'react';
import { getStaffDashboard } from '../../api/user';
import { Link } from 'react-router-dom';

const StaffDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await getStaffDashboard();
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
            <div className="mb-8">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">{data.welcome_message}</h1>
                <p className="mt-2 text-lg text-slate-400">
                    Community: <span className="font-semibold text-amber-400">{data.community}</span>
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Employment Details Card */}
                <div className="p-6 transition-all duration-300 border shadow-lg bg-slate-900 border-x-slate-800 border-b-slate-800 border-t-4 border-t-cyan-500 rounded-2xl hover:shadow-cyan-900/20 md:col-span-3">
                    <h3 className="pb-3 mb-5 text-lg font-bold border-b text-slate-100 border-slate-800">Employment Details</h3>
                    <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                        <div>
                            <span className="block mb-1 text-sm font-medium text-slate-400">Designation</span>
                            <span className="font-semibold text-slate-200">{data.job_details?.designation || 'N/A'}</span>
                        </div>
                        <div>
                            <span className="block mb-1 text-sm font-medium text-slate-400">Monthly Salary</span>
                            <span className="font-semibold text-slate-200">₹{data.job_details?.salary || 0}</span>
                        </div>
                        <div>
                            <span className="block mb-1 text-sm font-medium text-slate-400">Joining Date</span>
                            <span className="font-semibold text-slate-200">{data.job_details?.joining_date || 'N/A'}</span>
                        </div>
                        <div>
                            <span className="block mb-1 text-sm font-medium text-slate-400">Status</span>
                            <span className={`px-2.5 py-1 inline-block text-xs font-bold tracking-wider rounded border ${data.job_details?.status === 'ACTIVE' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'}`}>
                                {data.job_details?.status || 'UNKNOWN'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* --- NEW: WORKLOAD BREAKDOWN --- */}
                <div className="p-6 transition-all duration-300 border shadow-lg bg-slate-900 border-x-slate-800 border-b-slate-800 border-t-4 border-t-amber-500 rounded-2xl hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400">Assigned (To-Do)</h3>
                        <Link to="/staff/issues" className="text-xs font-bold text-amber-500 hover:text-amber-400">View</Link>
                    </div>
                    <p className="text-5xl font-black text-amber-400">{data.issue_statistics?.assigned || 0}</p>
                </div>

                <div className="p-6 transition-all duration-300 border shadow-lg bg-slate-900 border-x-slate-800 border-b-slate-800 border-t-4 border-t-purple-500 rounded-2xl hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400">In-Progress</h3>
                        <Link to="/staff/issues" className="text-xs font-bold text-purple-500 hover:text-purple-400">View</Link>
                    </div>
                    <p className="text-5xl font-black text-purple-400">{data.issue_statistics?.in_progress || 0}</p>
                </div>

                <div className="p-6 transition-all duration-300 border shadow-lg bg-slate-900 border-x-slate-800 border-b-slate-800 border-t-4 border-t-emerald-500 rounded-2xl hover:-translate-y-1">
                    <h3 className="mb-2 text-xs font-bold tracking-wider uppercase text-slate-400">Resolved (Completed)</h3>
                    <p className="text-5xl font-black text-emerald-400">{data.issue_statistics?.resolved || 0}</p>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;