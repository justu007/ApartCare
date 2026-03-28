

import React, { useEffect, useState } from 'react';
import { getIssues, updateIssue } from '../../api/user'; 
import { getStaff } from '../../api/admin';

const AdminIssues = () => {
    const [issues, setIssues] = useState([]);
    const [staffMembers, setStaffMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [selectedIssue, setSelectedIssue] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchData(currentPage);
    }, [currentPage]);

    const fetchData = async (page = 1) => {
        setLoading(true);
        try {
            const issuesData = await getIssues(page); 
            const fetchedIssues = issuesData.results || issuesData;
            setIssues(Array.isArray(fetchedIssues) ? fetchedIssues : []);
            
            if (issuesData.count) setTotalPages(Math.ceil(issuesData.count / 10)); 

            const staffData = await getStaff(1, 100); 
            setStaffMembers(staffData.data || []);
        } catch (err) {
            console.error(err);
            setError('Failed to load issues or staff members.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setUpdatingId(selectedIssue.id);
        setMessage(''); setError('');

        try {
            const formBox = new FormData();
            formBox.append('priority', selectedIssue.priority);
            formBox.append('status', selectedIssue.status);
            
            if (selectedIssue.assigned_staff) {
                formBox.append('assigned_staff', selectedIssue.assigned_staff);
            } else {
                formBox.append('assigned_staff', ''); 
            }

            await updateIssue(selectedIssue.id, formBox);
            await fetchData(currentPage);
            
            setMessage("Issue updated and assigned successfully!");
            setTimeout(() => {
                setMessage('');
                setSelectedIssue(null); 
            }, 2000);

        } catch (err) {
            console.error("Update failed", err);
            setError(err.response?.data?.detail || "Failed to update issue.");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleModalChange = (field, value) => {
        setSelectedIssue({ ...selectedIssue, [field]: value });
    };

    const openModal = (issue) => {
        setSelectedIssue({ ...issue });
        setError('');
        setMessage('');
    };

    return (
        <div className="max-w-7xl p-6 mx-auto mt-8">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                    Issue Management
                </h1>
                <p className="mt-2 text-slate-400">Review resident issues, set priorities, and assign staff members.</p>
            </div>

            {/* --- THE DATA TABLE --- */}
            <div className="overflow-hidden border shadow-2xl bg-slate-900/50 border-slate-800 rounded-2xl backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs tracking-wider uppercase border-b text-slate-400 border-slate-800 bg-slate-900/80">
                                <th className="p-5 font-bold">Issue Title</th>
                                <th className="p-5 font-bold">Category</th>
                                <th className="p-5 font-bold">Resident</th>
                                <th className="p-5 font-bold">Priority</th>
                                <th className="p-5 font-bold">Status</th>
                                <th className="p-5 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {loading ? (
                                <tr><td colSpan={6} className="p-10 text-center text-slate-500">Loading records...</td></tr>
                            ) : issues.length === 0 ? (
                                <tr><td colSpan={6} className="p-10 text-center text-slate-500">No issues reported yet!</td></tr>
                            ) : (
                                issues.map((issue) => (
                                    <tr key={issue.id} className="transition-colors hover:bg-slate-800/40">
                                        <td className="p-5 font-bold text-slate-200">{issue.title}</td>
                                        <td className="p-5 text-sm text-slate-400">{issue.category}</td>
                                        <td className="p-5 text-sm text-slate-300">
                                            {issue.creator_name || 'Resident'}
                                            {/* Note: Ensure your Django serializer sends 'creator_flat' if you want it in the table view! */}
                                            {issue.creator_flat && <span className="block text-xs text-slate-500">Flat {issue.creator_flat}</span>}
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-2.5 py-1 text-xs font-bold tracking-wider rounded border 
                                                ${issue.priority === 'Urgent' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 
                                                  issue.priority === 'High' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 
                                                  'text-slate-300 bg-slate-500/10 border-slate-500/20'}`}>
                                                {issue.priority}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-2.5 py-1 text-xs font-bold tracking-wider rounded border 
                                                ${issue.status === 'Resolved' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 
                                                  issue.status === 'Open' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' : 
                                                  'text-purple-400 bg-purple-500/10 border-purple-500/20'}`}>
                                                {issue.status}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right">
                                            <button 
                                                onClick={() => openModal(issue)}
                                                className="px-4 py-1.5 text-xs font-bold transition-colors border rounded-lg text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10"
                                            >
                                                Review & Assign
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination Controls */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between p-5 border-t bg-slate-900/80 border-slate-800">
                        <span className="text-sm text-slate-400">Showing page <span className="font-bold text-slate-200">{currentPage}</span> of <span className="font-bold text-slate-200">{totalPages}</span></span>
                        <div className="flex gap-2">
                            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 text-sm font-bold transition-colors border rounded-lg text-slate-300 border-slate-700 bg-slate-800/50 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed">Prev</button>
                            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-bold transition-colors border rounded-lg text-slate-300 border-slate-700 bg-slate-800/50 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed">Next</button>
                        </div>
                    </div>
                )}
            </div>

            {/* --- THE DETAILED MODAL --- */}
            {selectedIssue && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                    <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto border shadow-2xl bg-slate-900 border-slate-700 rounded-2xl custom-scrollbar">
                        
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur z-10">
                            <h2 className="text-2xl font-bold text-slate-100">Issue #{selectedIssue.id}: {selectedIssue.title}</h2>
                            <button onClick={() => setSelectedIssue(null)} className="p-2 text-slate-400 hover:text-rose-400 transition-colors bg-slate-800 rounded-full">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2">
                            {/* Left Column: Details & User Info */}
                            <div className="p-6 border-r border-slate-800 bg-slate-900/50">
                                
                                <h3 className="mb-4 text-xs font-bold tracking-widest text-cyan-500 uppercase">Resident Information</h3>
                                <div className="p-4 mb-6 border rounded-xl border-slate-700 bg-slate-800/30">
                                    <p className="font-semibold text-slate-200 text-lg mb-2">{selectedIssue.creator_name || 'Unknown Resident'}</p>
                                    <div className="grid grid-cols-2 gap-3 text-sm text-slate-400">
                                        {/* YOU WILL NEED TO ADD THESE TO YOUR DJANGO SERIALIZER IF THEY AREN'T THERE YET! */}
                                        <p><span className="font-semibold text-slate-500">Block:</span> <span className="text-slate-300">{selectedIssue.creator_block || 'N/A'}</span></p>
                                        <p><span className="font-semibold text-slate-500">Flat:</span> <span className="text-slate-300">{selectedIssue.creator_flat || 'N/A'}</span></p>
                                        <p className="col-span-2"><span className="font-semibold text-slate-500">Phone:</span> <span className="text-slate-300">{selectedIssue.creator_phone || 'N/A'}</span></p>
                                        <p className="col-span-2"><span className="font-semibold text-slate-500">Email:</span> <span className="text-slate-300">{selectedIssue.creator_email || 'N/A'}</span></p>
                                    </div>
                                </div>

                                <h3 className="mb-4 text-xs font-bold tracking-widest text-cyan-500 uppercase">Issue Description</h3>
                                <div className="p-4 mb-6 border rounded-xl border-slate-700 bg-slate-800/30">
                                    <p className="text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">{selectedIssue.description}</p>
                                </div>

                                {selectedIssue.uploaded_images && selectedIssue.uploaded_images.length > 0 && (
                                    <>
                                        <h3 className="mb-4 text-xs font-bold tracking-widest text-cyan-500 uppercase">Attached Photos</h3>
                                        <div className="grid grid-cols-3 gap-3">
                                            {selectedIssue.uploaded_images.map((img, i) => (
                                                <a key={i} href={img.image} target="_blank" rel="noopener noreferrer">
                                                    <img src={img.image} alt="Issue" className="block object-cover w-full h-24 transition-transform border rounded-lg shadow-md border-slate-700 hover:scale-105 hover:border-cyan-500/50" />
                                                </a>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Right Column: Admin Actions */}
                            <div className="p-6">
                                <h3 className="mb-4 text-xs font-bold tracking-widest text-amber-500 uppercase">Admin Triage Controls</h3>
                                
                                {message && <div className="p-3 mb-4 text-sm border rounded-lg text-emerald-300 bg-emerald-500/10 border-emerald-500/20">{message}</div>}
                                {error && <div className="p-3 mb-4 text-sm border rounded-lg text-rose-300 bg-rose-500/10 border-rose-500/20">{error}</div>}

                                <form onSubmit={handleUpdate} className="space-y-6">
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-slate-400">Set Priority</label>
                                        <select 
                                            value={selectedIssue.priority} 
                                            onChange={(e) => handleModalChange('priority', e.target.value)}
                                            className="w-full p-3 transition-all duration-200 border outline-none bg-slate-800 border-slate-700 text-slate-100 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer"
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option className="font-semibold text-amber-400" value="High">High</option>
                                            <option className="font-bold text-rose-400" value="Urgent">Urgent</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-slate-400">Update Status</label>
                                        <select 
                                            value={selectedIssue.status} 
                                            onChange={(e) => handleModalChange('status', e.target.value)}
                                            className="w-full p-3 transition-all duration-200 border outline-none bg-slate-800 border-slate-700 text-slate-100 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer"
                                        >
                                            <option value="Open">Open</option>
                                            <option className="text-blue-400" value="Assigned">Assigned</option>
                                            <option className="text-purple-400" value="In-Progress">In-Progress</option>
                                            <option className="text-emerald-400" value="Resolved">Resolved</option>
                                            <option className="text-slate-500" value="Closed">Closed</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-slate-400">Assign Staff Member</label>
                                        <select 
                                            value={selectedIssue.assigned_staff || ''} 
                                            onChange={(e) => handleModalChange('assigned_staff', e.target.value)}
                                            className="w-full p-3 transition-all duration-200 border outline-none bg-slate-800 border-slate-700 text-slate-100 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer"
                                        >
                                            <option value="">-- Leave Unassigned --</option>
                                            {staffMembers.map(staff => (
                                                <option key={staff.id} value={staff.id}>
                                                    {staff.name} ({staff.designation || 'Staff'})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="pt-6 border-t border-slate-800">
                                        <button 
                                            type="submit" 
                                            disabled={updatingId === selectedIssue.id}
                                            className="w-full py-3.5 font-bold text-white transition-all duration-300 transform rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:-translate-y-0.5 disabled:opacity-50"
                                        >
                                            {updatingId === selectedIssue.id ? 'Saving Updates...' : 'Confirm & Save Updates'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminIssues;