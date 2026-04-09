

import { useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import { getResidents, getStaff } from '../../api/admin';
import AddUserModal from '../../components/AddUserModel'; 
import ToggleUserStatus from '../../components/ToggleUserStatus';
import axiosInstance from "../../api/axios";

const CommunityDirectory = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'residents');
    const [currentPage, setCurrentPage] = useState(location.state?.currentPage || 1);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 5;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [resetModalOpen, setResetModalOpen] = useState(false);
    const [userToReset, setUserToReset] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [resetStatus, setResetStatus] = useState({ loading: false, error: '', message: '' });
    const navigate = useNavigate();

    useEffect(() => { fetchData(); }, [activeTab, currentPage]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let response = activeTab === 'residents' ? await getResidents(currentPage, limit) : await getStaff(currentPage, limit);
            setUsers(response.data || []);
            setTotalItems(response.total || 0);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleSuccess = (userId, newIsActive) => {
        setUsers(prevUsers => prevUsers.map(user => user.id === userId ? { ...user, is_active: newIsActive, status: newIsActive ? 'Active' : 'Inactive' } : user));
    };

    const openResetModal = (user) => {
        setUserToReset(user); setNewPassword(''); setResetStatus({ loading: false, error: '', message: '' }); setResetModalOpen(true);
    };

    const handleForceReset = async (e) => {
        e.preventDefault();
        setResetStatus({ loading: true, error: '', message: '' });
        if (newPassword.length < 8) return setResetStatus({ loading: false, error: 'Password must be at least 8 characters.', message: '' });
        try {
            const response = await axiosInstance.post(`/admin/users/${userToReset.id}/reset-password/`, { new_password: newPassword });
            setResetStatus({ loading: false, error: '', message: response.data.message });
            setTimeout(() => setResetModalOpen(false), 2000);
        } catch (err) {
            setResetStatus({ loading: false, error: err.response?.data?.error || "Failed to reset password.", message: '' });
        }
    };

    const handleTabChange = (tab) => { setActiveTab(tab); setCurrentPage(1); };
    const totalPages = Math.ceil(totalItems / limit);

    return (
        <div className="max-w-6xl p-6 mx-auto mt-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Community Directory</h1>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 transform rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:-translate-y-0.5"
                >
                    + Add New {activeTab === 'residents' ? 'Resident' : 'Staff'}
                </button>
            </div>

            {/* Dark Mode Tabs */}
            <div className="flex mb-6 border-b border-slate-800">
                <button onClick={() => handleTabChange('residents')} className={`px-6 py-3 font-bold text-sm transition-colors duration-200 ${activeTab === 'residents' ? 'border-b-2 border-cyan-500 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}>Residents</button>
                <button onClick={() => handleTabChange('staff')} className={`px-6 py-3 font-bold text-sm transition-colors duration-200 ${activeTab === 'staff' ? 'border-b-2 border-cyan-500 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}>Staff Members</button>
            </div>

            {/* Dark Glass Table */}
            <div className="overflow-hidden border shadow-2xl bg-slate-900/50 border-slate-800 rounded-2xl backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-sm tracking-wider uppercase border-b text-slate-400 border-slate-800 bg-slate-900/80">
                                <th className="p-5 font-bold">Name</th>
                                <th className="p-5 font-bold">Email & Phone</th>
                                <th className="p-5 font-bold">Status</th>
                                {activeTab === 'residents' ? (
                                    <th className="p-5 font-bold">Residence</th>
                                ) : (
                                    <>
                                        <th className="p-5 font-bold">Designation</th>
                                        <th className="p-5 font-bold">Salary</th>
                                    </>
                                )}
                                <th className="p-5 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {loading ? (
                                <tr><td colSpan={6} className="p-10 text-center text-slate-500">Loading records...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={6} className="p-10 text-center text-slate-500">No {activeTab} found in this community.</td></tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="transition-colors hover:bg-slate-800/40">
                                        <td className="p-5 font-bold text-slate-200">{user.name}</td>
                                        <td className="p-5 text-sm text-slate-400">
                                            <div className="text-slate-300">{user.email}</div>
                                            <div className="text-slate-500">{user.phone || 'N/A'}</div>
                                        </td>
                                        <td className="p-5">
                                            {user.is_active ? (
                                                <span className="px-2.5 py-1 text-xs font-bold tracking-wider rounded border text-emerald-400 bg-emerald-500/10 border-emerald-500/20">Active</span>
                                            ) : (
                                                <span className="px-2.5 py-1 text-xs font-bold tracking-wider rounded border text-rose-400 bg-rose-500/10 border-rose-500/20">Inactive</span>
                                            )}
                                        </td>
                                        {activeTab === 'residents' ? (
                                            <td className="p-5 text-sm font-medium text-slate-300">{user.flat ? `Block ${user.block} - Flat ${user.flat}` : <span className="text-slate-500">Not Assigned</span>}</td>
                                        ) : (
                                            <>
                                                <td className="p-5 text-sm font-medium text-slate-300">{user.designation || <span className="text-slate-500">Not Assigned</span>}</td>
                                                <td className="p-5 text-sm font-medium text-slate-300">₹{user.monthly_salary || 0}</td>
                                            </>
                                        )}
                                        <td className="p-5 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                {/* Ensure ToggleUserStatus component is dark mode compatible inside its own file! */}
                                                <ToggleUserStatus user={user} onToggleSuccess={handleToggleSuccess} />
                                                <button onClick={() => openResetModal(user)} className="px-3 py-1.5 text-xs font-bold transition-colors border rounded-lg text-rose-400 border-rose-500/30 hover:bg-rose-500/10">Reset Pwd</button>
                                                <button onClick={() => navigate(activeTab === 'staff' ? `/edit-staff/${user.id}` : `/edit-resident/${user.id}`, { state: { userToEdit: user, returnTab: activeTab, returnPage: currentPage }})} className="px-3 py-1.5 text-xs font-bold transition-colors border rounded-lg text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10">Edit</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Dark Mode Pagination */}
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

            {/* Keeping Modals exactly as they are for logic, just swapping white bg for dark bg! */}
            <AddUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} activeTab={activeTab} onUserAdded={fetchData} />

            {/* Dark Mode Reset Password Modal */}
            {resetModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-md p-6 border shadow-2xl bg-slate-900 border-slate-800 rounded-2xl">
                        <h2 className="mb-4 text-xl font-bold text-slate-100">Reset Password for <span className="text-cyan-400">{userToReset?.name}</span></h2>
                        {resetStatus.message && <div className="p-3 mb-4 text-sm border rounded-lg text-emerald-300 bg-emerald-500/10 border-emerald-500/20">{resetStatus.message}</div>}
                        {resetStatus.error && <div className="p-3 mb-4 text-sm border rounded-lg text-rose-300 bg-rose-500/10 border-rose-500/20">{resetStatus.error}</div>}
                        <form onSubmit={handleForceReset}>
                            <div className="mb-5">
                                <label className="block mb-1.5 text-sm font-medium text-slate-300">New Password</label>
                                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimum 8 characters" required className="w-full p-3 transition-all duration-200 border outline-none bg-slate-800/50 border-slate-700 text-slate-100 rounded-xl focus:bg-slate-800 focus:ring-2 focus:ring-rose-500 focus:border-transparent placeholder-slate-500" />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setResetModalOpen(false)} className="px-5 py-2.5 text-sm font-bold transition-all duration-300 border rounded-xl text-slate-300 border-slate-700 bg-slate-800/50 hover:bg-slate-700 hover:text-white">Cancel</button>
                                <button type="submit" disabled={resetStatus.loading || resetStatus.message !== ''} className="px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 transform rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 hover:shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:-translate-y-0.5 disabled:opacity-50">
                                    {resetStatus.loading ? 'Saving...' : 'Confirm Reset'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityDirectory;