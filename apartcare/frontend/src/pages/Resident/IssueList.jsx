import React, { useEffect, useState } from 'react';
import { getIssues } from '../../api/user'; 

const IssueList = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Modal state
    const [selectedIssue, setSelectedIssue] = useState(null);

    useEffect(() => {
        fetchIssues();
    }, []);

    const fetchIssues = async () => {
        setLoading(true);
        try {
            const data = await getIssues();
            const fetchedIssues = data.results || data;
            setIssues(Array.isArray(fetchedIssues) ? fetchedIssues : []);
        } catch (err) {
            console.error(err);
            setError('Failed to load your issues.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-400">Loading your issues...</div>;
    if (error) return <div className="p-4 text-center border rounded-lg text-rose-300 bg-rose-500/10 border-rose-500/20">{error}</div>;

    return (
        <div className="w-full mt-6">
            
            {/* --- RESIDENT DATA TABLE --- */}
            <div className="overflow-hidden border shadow-lg bg-slate-900/50 border-slate-800 rounded-2xl backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs tracking-wider uppercase border-b text-slate-400 border-slate-800 bg-slate-900/80">
                                <th className="p-4 font-bold">Issue Title</th>
                                <th className="p-4 font-bold">Category</th>
                                <th className="p-4 font-bold">Priority</th>
                                <th className="p-4 font-bold">Status</th>
                                <th className="p-4 font-bold text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {issues.length === 0 ? (
                                <tr><td colSpan={5} className="p-10 text-center text-slate-500">You haven't raised any issues yet.</td></tr>
                            ) : (
                                issues.map((issue) => (
                                    <tr key={issue.id} className="transition-colors hover:bg-slate-800/40">
                                        <td className="p-4 font-bold text-slate-200">{issue.title}</td>
                                        <td className="p-4 text-sm text-slate-400">{issue.category}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-bold rounded border ${issue.priority === 'Urgent' || issue.priority === 'High' ? 'text-rose-400 border-rose-500/30' : 'text-slate-400 border-slate-600/50'}`}>
                                                {issue.priority}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-bold rounded border 
                                                ${issue.status === 'Resolved' ? 'text-emerald-400 border-emerald-500/30' : 
                                                  issue.status === 'In-Progress' ? 'text-purple-400 border-purple-500/30' : 
                                                  'text-blue-400 border-blue-500/30'}`}>
                                                {issue.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => setSelectedIssue(issue)}
                                                className="px-3 py-1.5 text-xs font-bold transition-colors border rounded-lg text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- RESIDENT READ-ONLY MODAL --- */}
            {selectedIssue && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                    <div className="w-full max-w-2xl overflow-hidden border shadow-2xl bg-slate-900 border-slate-700 rounded-2xl">
                        
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900">
                            <h2 className="text-xl font-bold text-slate-100">{selectedIssue.title}</h2>
                            <button onClick={() => setSelectedIssue(null)} className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors bg-slate-800 rounded-full">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            
                            {/* Status Banner */}
                            <div className="flex items-center justify-between p-4 mb-6 border rounded-xl border-slate-700 bg-slate-800/50">
                                <div>
                                    <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">Current Status</p>
                                    <p className="text-lg font-bold text-cyan-400">{selectedIssue.status}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold tracking-wider text-slate-500 uppercase text-right">Priority Level</p>
                                    <p className={`text-lg font-bold text-right ${selectedIssue.priority === 'Urgent' ? 'text-rose-400' : 'text-slate-200'}`}>{selectedIssue.priority}</p>
                                </div>
                            </div>

                            {/* --- NEW: ASSIGNED STAFF SECTION --- */}
                            <h3 className="mb-2 text-xs font-bold tracking-widest text-cyan-500 uppercase">Assigned Staff</h3>
                            <div className="p-4 mb-6 border rounded-xl border-slate-700 bg-slate-800/30">
                                {selectedIssue.assigned_staff_name ? (
                                    <>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                            </div>
                                            <p className="text-lg font-bold text-slate-200">{selectedIssue.assigned_staff_name} - {selectedIssue.assigned_staff_designation}</p>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2 text-slate-400">
                                            <p><span className="font-semibold text-slate-500">Phone:</span> <span className="text-slate-300">{selectedIssue.assigned_staff_phone || 'N/A'}</span></p>
                                            <p><span className="font-semibold text-slate-500">Email:</span> <span className="text-slate-300">{selectedIssue.assigned_staff_email || 'N/A'}</span></p>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-sm italic text-slate-500">Pending Assignment. An admin will assign a staff member shortly.</p>
                                )}
                            </div>

                            <h3 className="mb-2 text-xs font-bold tracking-widest text-cyan-500 uppercase">Description</h3>
                            <p className="p-4 mb-6 text-sm leading-relaxed border text-slate-300 border-slate-800 bg-slate-900/50 rounded-xl whitespace-pre-wrap">
                                {selectedIssue.description}
                            </p>

                            {selectedIssue.uploaded_images && selectedIssue.uploaded_images.length > 0 && (
                                <>
                                    <h3 className="mb-2 text-xs font-bold tracking-widest text-cyan-500 uppercase">Attached Photos</h3>
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                        {selectedIssue.uploaded_images.map((img, i) => (
                                            <a key={i} href={img.image} target="_blank" rel="noopener noreferrer">
                                                <img src={img.image} alt="Issue" className="block object-cover w-full h-32 transition-transform border rounded-lg shadow-md border-slate-700 hover:scale-105" />
                                            </a>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default IssueList;