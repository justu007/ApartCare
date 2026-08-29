
// // import React, { useEffect, useState } from 'react';
// // import { getStaffDashboard } from '../../api/user';
// // import { Link } from 'react-router-dom';

// // const StaffDashboard = () => {
// //     const [data, setData] = useState(null);
// //     const [loading, setLoading] = useState(true);
// //     const [error, setError] = useState('');

// //     useEffect(() => {
// //         const fetchDashboard = async () => {
// //             try {
// //                 const response = await getStaffDashboard();
// //                 setData(response);
// //             } catch (err) {
// //                 setError("Failed to load dashboard data.");
// //             } finally {
// //                 setLoading(false);
// //             }
// //         };
// //         fetchDashboard();
// //     }, []);

// //     if (loading) return <div className="mt-20 text-xl font-semibold text-center text-slate-400">Loading Dashboard...</div>;
// //     if (error) return <div className="mt-20 text-center text-rose-500">{error}</div>;
// //     if (!data) return null;

// //     // Helper to format currency
// //     const formatCurrency = (amount) => {
// //         return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
// //     };

// //     // Helper to determine status badge colors
// //     const getSalaryBadgeColor = (status) => {
// //         if (status === 'FULLY CREDITED') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
// //         if (status === 'PARTIALLY CREDITED') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
// //         return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
// //     };

// //     return (
// //         <div className="max-w-6xl p-6 mx-auto mt-8">
// //             <div className="mb-8">
// //                 <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">{data.welcome_message}</h1>
// //                 <p className="mt-2 text-lg text-slate-400">
// //                     Community: <span className="font-semibold text-amber-400">{data.community}</span>
// //                 </p>
// //             </div>

// //             <div className="grid grid-cols-1 gap-6 md:grid-cols-12 mb-8">
// //                 {/* --- EMPLOYMENT DETAILS CARD --- */}
// //                 <div className="p-6 transition-all duration-300 border shadow-lg bg-slate-900 border-slate-800 rounded-2xl md:col-span-7">
// //                     <h3 className="pb-3 mb-5 text-lg font-bold border-b text-slate-100 border-slate-800">Employment Details</h3>
// //                     <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
// //                         <div>
// //                             <span className="block mb-1 text-sm font-medium text-slate-400">Designation</span>
// //                             <span className="font-semibold text-slate-200">{data.job_details?.designation || 'N/A'}</span>
// //                         </div>
// //                         <div>
// //                             <span className="block mb-1 text-sm font-medium text-slate-400">Joining Date</span>
// //                             <span className="font-semibold text-slate-200">{data.job_details?.joining_date || 'N/A'}</span>
// //                         </div>
// //                         <div>
// //                             <span className="block mb-1 text-sm font-medium text-slate-400">Account Status</span>
// //                             <span className={`px-2.5 py-1 inline-block text-xs font-bold tracking-wider rounded border ${data.job_details?.status === 'ACTIVE' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'}`}>
// //                                 {data.job_details?.status || 'UNKNOWN'}
// //                             </span>
// //                         </div>
// //                     </div>
// //                 </div>

// //                 {/* --- 🎯 NEW: SALARY TRACKER CARD --- */}
// //                 <div className="p-6 transition-all duration-300 border shadow-lg bg-slate-900 border-x-slate-800 border-b-slate-800 border-t-4 border-t-emerald-500 rounded-2xl hover:shadow-emerald-900/20 md:col-span-5">
// //                     <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-800">
// //                         <h3 className="text-lg font-bold text-slate-100">Salary Status</h3>
// //                         <span className="text-xs font-bold tracking-wider uppercase text-slate-500">{data.salary_details?.current_month_name}</span>
// //                     </div>
                    
// //                     <div className="flex items-center justify-between mb-4">
// //                         <span className="text-sm font-medium text-slate-400">Base Salary</span>
// //                         <span className="font-bold text-slate-200">{formatCurrency(data.salary_details?.base_salary)}</span>
// //                     </div>
// //                     <div className="flex items-center justify-between mb-4">
// //                         <span className="text-sm font-medium text-slate-400">Amount Credited</span>
// //                         <span className="font-bold text-emerald-400">+{formatCurrency(data.salary_details?.amount_credited)}</span>
// //                     </div>
// //                     <div className="flex items-center justify-between pt-4 mb-4 border-t border-slate-800/50">
// //                         <span className="text-sm font-bold text-slate-300">Pending Balance</span>
// //                         <span className={`text-xl font-black ${data.salary_details?.amount_pending > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
// //                             {formatCurrency(data.salary_details?.amount_pending)}
// //                         </span>
// //                     </div>
// //                     <div className="mt-4 text-right">
// //                         <span className={`px-3 py-1.5 inline-block text-xs font-black tracking-widest uppercase rounded border ${getSalaryBadgeColor(data.salary_details?.status)}`}>
// //                             {data.salary_details?.status}
// //                         </span>
// //                     </div>
// //                     <div className="flex items-end justify-between mt-6">
// //                         <div>
// //                             <span className="block mb-1 text-[10px] font-bold tracking-wider uppercase text-slate-500">Lifetime Earnings</span>
// //                             <span className="text-lg font-bold text-emerald-500">
// //                                 {formatCurrency(data.salary_details?.total_earned_all_time)}
// //                             </span>
// //                         </div>
// //                         <span className={`px-3 py-1.5 inline-block text-[10px] font-black tracking-widest uppercase rounded border ${getSalaryBadgeColor(data.salary_details?.status)}`}>
// //                             {data.salary_details?.status}
// //                         </span>
// //                     </div>

// //                 </div>
// //             </div>

// //             {/* --- WORKLOAD BREAKDOWN --- */}
// //             <h2 className="mb-4 text-xl font-bold text-slate-200">Current Workload</h2>
// //             <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
// //                 <div className="p-6 transition-all duration-300 border shadow-lg bg-slate-900 border-x-slate-800 border-b-slate-800 border-t-4 border-t-amber-500 rounded-2xl hover:-translate-y-1">
// //                     <div className="flex items-center justify-between mb-2">
// //                         <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400">Assigned (To-Do)</h3>
// //                         <Link to="/staff/issues" className="text-xs font-bold text-amber-500 hover:text-amber-400">View</Link>
// //                     </div>
// //                     <p className="text-5xl font-black text-amber-400">{data.issue_statistics?.assigned || 0}</p>
// //                 </div>

// //                 <div className="p-6 transition-all duration-300 border shadow-lg bg-slate-900 border-x-slate-800 border-b-slate-800 border-t-4 border-t-purple-500 rounded-2xl hover:-translate-y-1">
// //                     <div className="flex items-center justify-between mb-2">
// //                         <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400">In-Progress</h3>
// //                         <Link to="/staff/issues" className="text-xs font-bold text-purple-500 hover:text-purple-400">View</Link>
// //                     </div>
// //                     <p className="text-5xl font-black text-purple-400">{data.issue_statistics?.in_progress || 0}</p>
// //                 </div>

// //                 <div className="p-6 transition-all duration-300 border shadow-lg bg-slate-900 border-x-slate-800 border-b-slate-800 border-t-4 border-t-cyan-500 rounded-2xl hover:-translate-y-1">
// //                     <h3 className="mb-2 text-xs font-bold tracking-wider uppercase text-slate-400">Resolved (Completed)</h3>
// //                     <p className="text-5xl font-black text-cyan-400">{data.issue_statistics?.resolved || 0}</p>
// //                 </div>
// //             </div>
// //         </div>
// //     );
// // };

// // export default StaffDashboard;

// import React, { useEffect, useState } from 'react';
// import { getStaffDashboard } from '../../api/user';
// import { Link } from 'react-router-dom';

// const StaffDashboard = () => {
//     const [data, setData] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');

//     useEffect(() => {
//         const fetchDashboard = async () => {
//             try {
//                 const response = await getStaffDashboard();
//                 setData(response);
//             } catch (err) {
//                 setError("Failed to load dashboard data.");
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchDashboard();
//     }, []);

//     if (loading) return <div className="mt-20 text-xl font-semibold text-center text-slate-400">Loading Dashboard...</div>;
//     if (error) return <div className="mt-20 text-center text-rose-500">{error}</div>;
//     if (!data) return null;

//     const formatCurrency = (amount) => {
//         return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
//     };

//     const getSalaryBadgeColor = (status) => {
//         if (status === 'FULLY CREDITED') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
//         if (status === 'PARTIALLY CREDITED') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
//         return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
//     };

//     return (
//         <div className="max-w-6xl p-6 mx-auto mt-8">
//             {/* Header */}
//             <div className="mb-8">
//                 <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">{data.welcome_message}</h1>
//                 <p className="mt-2 text-lg text-slate-400">
//                     Community: <span className="font-semibold text-amber-400">{data.community}</span>
//                 </p>
//             </div>

//             {/* Employment & Salary Row (Your existing code) */}
//             <div className="grid grid-cols-1 gap-6 md:grid-cols-12 mb-8">
//                 {/* ... Your Employment Details Card ... */}
//                 <div className="p-6 transition-all duration-300 border shadow-lg bg-slate-900 border-slate-800 rounded-2xl md:col-span-7">
//                     {/* ... inner code ... */}
//                     <h3 className="pb-3 mb-5 text-lg font-bold border-b text-slate-100 border-slate-800">Employment Details</h3>
//                     <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
//                         <div>
//                             <span className="block mb-1 text-sm font-medium text-slate-400">Designation</span>
//                             <span className="font-semibold text-slate-200">{data.job_details?.designation || 'N/A'}</span>
//                         </div>
//                         <div>
//                             <span className="block mb-1 text-sm font-medium text-slate-400">Joining Date</span>
//                             <span className="font-semibold text-slate-200">{data.job_details?.joining_date || 'N/A'}</span>
//                         </div>
//                         <div>
//                             <span className="block mb-1 text-sm font-medium text-slate-400">Account Status</span>
//                             <span className={`px-2.5 py-1 inline-block text-xs font-bold tracking-wider rounded border ${data.job_details?.status === 'ACTIVE' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'}`}>
//                                 {data.job_details?.status || 'UNKNOWN'}
//                             </span>
//                         </div>
//                     </div>
//                 </div>

//                 {/* ... Your Salary Status Card ... */}
//                 <div className="p-6 transition-all duration-300 border shadow-lg bg-slate-900 border-x-slate-800 border-b-slate-800 border-t-4 border-t-emerald-500 rounded-2xl hover:shadow-emerald-900/20 md:col-span-5">
//                     {/* ... inner code ... */}
//                      <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-800">
//                         <h3 className="text-lg font-bold text-slate-100">Salary Status</h3>
//                         <span className="text-xs font-bold tracking-wider uppercase text-slate-500">{data.salary_details?.current_month_name}</span>
//                     </div>
                    
//                     <div className="flex items-center justify-between mb-4">
//                         <span className="text-sm font-medium text-slate-400">Base Salary</span>
//                         <span className="font-bold text-slate-200">{formatCurrency(data.salary_details?.base_salary)}</span>
//                     </div>
//                     <div className="flex items-center justify-between mb-4">
//                         <span className="text-sm font-medium text-slate-400">Amount Credited</span>
//                         <span className="font-bold text-emerald-400">+{formatCurrency(data.salary_details?.amount_credited)}</span>
//                     </div>
//                     <div className="flex items-center justify-between pt-4 mb-4 border-t border-slate-800/50">
//                         <span className="text-sm font-bold text-slate-300">Pending Balance</span>
//                         <span className={`text-xl font-black ${data.salary_details?.amount_pending > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
//                             {formatCurrency(data.salary_details?.amount_pending)}
//                         </span>
//                     </div>
//                     <div className="mt-4 text-right">
//                         <span className={`px-3 py-1.5 inline-block text-xs font-black tracking-widest uppercase rounded border ${getSalaryBadgeColor(data.salary_details?.status)}`}>
//                             {data.salary_details?.status}
//                         </span>
//                     </div>
//                 </div>
//             </div>

//             {/* --- WORKLOAD & MEETINGS ROW --- */}
//             <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                
//                 {/* Current Workload (Takes up 7 columns) */}
//                 <div className="md:col-span-7">
//                     <h2 className="mb-4 text-xl font-bold text-slate-200">Current Workload</h2>
//                     <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
//                         <div className="p-6 transition-all duration-300 border shadow-lg bg-slate-900 border-x-slate-800 border-b-slate-800 border-t-4 border-t-amber-500 rounded-2xl hover:-translate-y-1">
//                             <div className="flex items-center justify-between mb-2">
//                                 <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400">Assigned</h3>
//                                 <Link to="/staff/issues" className="text-xs font-bold text-amber-500 hover:text-amber-400">View</Link>
//                             </div>
//                             <p className="text-5xl font-black text-amber-400">{data.issue_statistics?.assigned || 0}</p>
//                         </div>

//                         <div className="p-6 transition-all duration-300 border shadow-lg bg-slate-900 border-x-slate-800 border-b-slate-800 border-t-4 border-t-purple-500 rounded-2xl hover:-translate-y-1">
//                             <div className="flex items-center justify-between mb-2">
//                                 <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400">In-Progress</h3>
//                                 <Link to="/staff/issues" className="text-xs font-bold text-purple-500 hover:text-purple-400">View</Link>
//                             </div>
//                             <p className="text-5xl font-black text-purple-400">{data.issue_statistics?.in_progress || 0}</p>
//                         </div>

//                         <div className="p-6 transition-all duration-300 border shadow-lg bg-slate-900 border-x-slate-800 border-b-slate-800 border-t-4 border-t-cyan-500 rounded-2xl hover:-translate-y-1">
//                             <h3 className="mb-2 text-xs font-bold tracking-wider uppercase text-slate-400">Resolved</h3>
//                             <p className="text-5xl font-black text-cyan-400">{data.issue_statistics?.resolved || 0}</p>
//                         </div>
//                     </div>
//                 </div>

//                 {/* 🎯 NEW: COMMUNITY MEETINGS CARD (Takes up 5 columns) */}
//                 <div className="md:col-span-5 flex flex-col">
//                     <h2 className="mb-4 text-xl font-bold text-slate-200">Staff Meetings</h2>
//                     <div className="p-6 flex-grow transition-all duration-300 border shadow-lg bg-slate-900 border-x-slate-800 border-b-slate-800 border-t-4 border-t-blue-500 rounded-2xl hover:shadow-blue-900/20 flex flex-col">
//                         <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
//                             <div className="flex items-center gap-2">
//                                 <h3 className="text-lg font-bold text-slate-100">Schedule</h3>
//                                 {data.meeting_statistics?.urgent > 0 && (
//                                     <span className="flex h-2.5 w-2.5 relative">
//                                         <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-rose-400"></span>
//                                         <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
//                                     </span>
//                                 )}
//                             </div>
//                             {/* Make sure the link matches your staff meetings route */}
//                             <Link to="/staff/meetings" className="text-xs font-bold text-blue-400 hover:text-blue-300">Join Room →</Link>
//                         </div>
                        
//                         {/* Meetings Quick Stats */}
//                         <div className="flex gap-4 mb-4">
//                             <div className="flex-1 px-3 py-2 border rounded-lg bg-slate-800/50 border-slate-700/50 flex justify-between items-center">
//                                 <span className="text-xs font-bold text-slate-400">Upcoming</span>
//                                 <span className="text-sm font-black text-blue-400">{data.meeting_statistics?.upcoming || 0}</span>
//                             </div>
//                             <div className="flex-1 px-3 py-2 border rounded-lg bg-slate-800/50 border-slate-700/50 flex justify-between items-center">
//                                 <span className="text-xs font-bold text-slate-400">Missed</span>
//                                 <span className="text-sm font-black text-slate-500">{data.meeting_statistics?.missed || 0}</span>
//                             </div>
//                         </div>

//                         {/* Highlighted Next Meeting */}
//                         <div className="flex-1 mt-auto border border-dashed rounded-xl border-slate-700 bg-slate-800/30 p-4">
//                             {data.next_meeting ? (
//                                 <div>
//                                     <p className="text-[10px] font-bold tracking-widest uppercase mb-1 text-slate-500">Next Scheduled Briefing</p>
//                                     <div className="flex items-start justify-between">
//                                         <div>
//                                             <p className="font-bold text-slate-200 line-clamp-1">{data.next_meeting.title}</p>
//                                             <p className="text-xs font-semibold text-cyan-400 mt-0.5">{data.next_meeting.time_formatted}</p>
//                                         </div>
//                                         {data.next_meeting.is_urgent && (
//                                             <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
//                                                 URGENT
//                                             </span>
//                                         )}
//                                     </div>
//                                 </div>
//                             ) : (
//                                 <div className="h-full flex items-center justify-center text-sm text-slate-500 italic">
//                                     No upcoming meetings scheduled.
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>

//             </div>
//         </div>
//     );
// };

// export default StaffDashboard;
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

    if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-xl font-black text-slate-500 animate-pulse font-mono">RETRIEVING PROFILE TELEMETRY...</div>;
    if (error) return <div className="min-h-[50vh] flex items-center justify-center text-rose-500 font-bold bg-rose-500/5 border border-rose-500/10 rounded-2xl p-6 m-8">{error}</div>;
    if (!data) return None;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
    };

    const getSalaryBadgeColor = (status) => {
        if (status === 'FULLY CREDITED') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
        if (status === 'PARTIALLY CREDITED') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    };

    return (
        /* 🎯 ULTRA-WIDE HORIZONTAL MATRIX CONTAINER */
        <div className="w-full max-w-full px-6 lg:px-12 mx-auto space-y-8 animate-fade-in">
            
            {/* Header Platform Title block */}
            <div className="border-b border-slate-800 pb-6 relative">
                <div className="absolute right-0 top-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 px-4 py-2 rounded-xl backdrop-blur-md">
                    <span className="text-[10px] text-amber-400 font-bold tracking-widest uppercase block">Operational Sector</span>
                    <span className="text-sm font-black text-slate-200 mt-0.5 block">📍 {data.community}</span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-300">
                    {data.welcome_message}
                </h1>
                <p className="mt-2 text-xs text-slate-400 font-mono tracking-wide">Staff Workspace Terminal Matrix</p>
            </div>

            {/* TOP INFRASTRUCTURE GRID ROW */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                
                {/* Employment Profile Details Card */}
                <div className="xl:col-span-7 bg-slate-900/40 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col justify-between">
                    <div>
                        <h3 className="text-xs font-black tracking-widest uppercase text-slate-500 mb-6 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span> Profile Parameters
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
                                <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Designation</span>
                                <span className="text-base font-bold text-slate-200 block truncate">{data.job_details?.designation || 'N/A'}</span>
                            </div>
                            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
                                <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Appointment Date</span>
                                <span className="text-base font-bold text-slate-200 block font-mono">{data.job_details?.joining_date || 'N/A'}</span>
                            </div>
                            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
                                <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Security Node Status</span>
                                <span className={`mt-1 px-3 py-0.5 text-xs font-black tracking-widest uppercase rounded border inline-block ${data.job_details?.status === 'ACTIVE' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'}`}>
                                    {data.job_details?.status || 'UNKNOWN'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 border-t border-slate-800/60 pt-4 flex justify-between items-center text-xs text-slate-500">
                        <span>Terminal Link Secure</span>
                        <span className="font-mono">Node ID: {data.job_details?.id || 'SYS-001'}</span>
                    </div>
                </div>

                {/* Salary Ledger Monitoring Component Card */}
                <div className="xl:col-span-5 bg-gradient-to-b from-slate-900/60 to-slate-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden border-t-4 border-t-emerald-500/80">
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80">
                        <h3 className="text-xs font-black tracking-widest uppercase text-emerald-400">Salary Statement Ledger</h3>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 uppercase">{data.salary_details?.current_month_name}</span>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-900/30 transition-colors">
                            <span className="text-xs font-medium text-slate-400">Base Salary Grade</span>
                            <span className="text-sm font-bold text-slate-200 font-mono">{formatCurrency(data.salary_details?.base_salary)}</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                            <span className="text-xs font-medium text-emerald-400">Amount Transferred</span>
                            <span className="text-sm font-black text-emerald-400 font-mono">+{formatCurrency(data.salary_details?.amount_credited)}</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 pt-3 border-t border-slate-800/80">
                            <span className="text-xs font-bold text-slate-300">Outstanding Processing Balance</span>
                            <span className={`text-lg font-black font-mono ${data.salary_details?.amount_pending > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`}>
                                {formatCurrency(data.salary_details?.amount_pending)}
                            </span>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                        <Link to="/staff/salaries" className="text-[11px] font-bold text-slate-400 hover:text-emerald-400 underline transition-colors">View Financial Records</Link>
                        <span className={`px-2.5 py-0.5 text-[10px] font-black tracking-widest uppercase rounded border ${getSalaryBadgeColor(data.salary_details?.status)}`}>
                            {data.salary_details?.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* LOWER INFRASTRUCTURE GRID ROW */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                
                {/* Task Distribution Metric Center (7 Columns) */}
                <div className="xl:col-span-7 space-y-4 flex flex-col">
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 pl-1">Task Operations Track</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
                        
                        <div className="bg-slate-900/40 border border-slate-800/90 border-t-4 border-t-amber-500 p-5 rounded-2xl shadow-lg flex flex-col justify-between hover:border-slate-700 transition-colors group">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-black tracking-widest uppercase text-slate-500">Assigned</h3>
                                <Link to="/staff/issues" className="text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded opacity-80 group-hover:opacity-100 transition-all">Launch Tracker</Link>
                            </div>
                            <p className="text-5xl font-black text-amber-400 font-mono mt-4">{data.issue_statistics?.assigned || 0}</p>
                        </div>

                        <div className="bg-slate-900/40 border border-slate-800/90 border-t-4 border-t-purple-500 p-5 rounded-2xl shadow-lg flex flex-col justify-between hover:border-slate-700 transition-colors group">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-black tracking-widest uppercase text-slate-500">In-Progress</h3>
                                <Link to="/staff/issues" className="text-[10px] font-bold text-purple-500 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded opacity-80 group-hover:opacity-100 transition-all">Review</Link>
                            </div>
                            <p className="text-5xl font-black text-purple-400 font-mono mt-4">{data.issue_statistics?.in_progress || 0}</p>
                        </div>

                        <div className="bg-slate-900/40 border border-slate-800/90 border-t-4 border-t-cyan-500 p-5 rounded-2xl shadow-lg flex flex-col justify-between hover:border-slate-700 transition-colors">
                            <h3 className="text-[10px] font-black tracking-widest uppercase text-slate-500">Resolved Log</h3>
                            <p className="text-5xl font-black text-cyan-400 font-mono mt-4">{data.issue_statistics?.resolved || 0}</p>
                        </div>

                    </div>
                </div>

                {/* Briefing Room & Sync Engine (5 Columns) */}
                <div className="xl:col-span-5 space-y-4 flex flex-col">
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 pl-1">Briefing Sync Engine</h2>
                    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-lg flex-grow flex flex-col justify-between border-t-4 border-t-blue-500/80">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-3">
                            <div className="flex items-center gap-2">
                                <h3 className="text-xs font-black tracking-widest uppercase text-slate-300">Live Briefing Rooms</h3>
                                {data.meeting_statistics?.urgent > 0 && (
                                    <span className="flex h-2 w-2 relative">
                                        <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-rose-400"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                                    </span>
                                )}
                            </div>
                            <Link to="/meetings" className="text-[11px] font-black text-blue-400 hover:underline">Launch Console →</Link>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Upcoming</span>
                                <span className="text-sm font-black font-mono text-blue-400">{data.meeting_statistics?.upcoming || 0}</span>
                            </div>
                            <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Missed Log</span>
                                <span className="text-sm font-black font-mono text-slate-500">{data.meeting_statistics?.missed || 0}</span>
                            </div>
                        </div>

                        {/* Next Scheduled Item Meta Block */}
                        <div className="border border-dashed border-slate-800 bg-slate-950/40 rounded-xl p-3.5 mt-auto">
                            {data.next_meeting ? (
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <span className="text-[9px] font-mono tracking-widest uppercase text-slate-500 block">Queue Target</span>
                                        <p className="font-bold text-xs text-slate-200 mt-1 block truncate">{data.next_meeting.title}</p>
                                        <p className="text-xs font-semibold text-cyan-400 mt-0.5 font-mono">{data.next_meeting.time_formatted}</p>
                                    </div>
                                    {data.next_meeting.is_urgent && (
                                        <span className="px-2 py-0.5 text-[8px] tracking-widest font-black rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0 uppercase">
                                            CRITICAL
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-2 text-xs text-slate-500 italic font-mono">No live operational updates logged.</div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StaffDashboard;