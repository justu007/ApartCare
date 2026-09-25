
import { useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useState, useTransition } from 'react';
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
    const [isPending, startTransition] = useTransition();
    const [totalItems, setTotalItems] = useState(0);
    const limit = 5;

    const [popup, setPopup] = useState({ isOpen: false, status: '', message: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [resetModalOpen, setResetModalOpen] = useState(false);
    const [userToReset, setUserToReset] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [resetStatus, setResetStatus] = useState({ loading: false, error: '', message: '' });
    const navigate = useNavigate();

    useEffect(() => { 
        fetchData(); 
    }, [activeTab, currentPage]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = activeTab === 'residents' 
                ? await getResidents(currentPage, limit) 
                : await getStaff(currentPage, limit);
            
            // Batch state updates inside React Transition for fluid frame rendering
            startTransition(() => {
                setUsers(response.data || []);
                setTotalItems(response.total || 0);
            });
        } catch (error) {
            console.error("Failed to fetch directory records", error);
            setPopup({
                isOpen: true,
                status: 'error',
                message: error.response?.data?.error || error.response?.data?.detail || 'Failed to load community records.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleSuccess = (userId, newIsActive) => {
        setUsers(prevUsers => prevUsers.map(user => 
            user.id === userId 
                ? { ...user, is_active: newIsActive, status: newIsActive ? 'Active' : 'Inactive' } 
                : user
        ));
    };

    const openResetModal = (user) => {
        setUserToReset(user); 
        setNewPassword(''); 
        setResetStatus({ loading: false, error: '', message: '' }); 
        setResetModalOpen(true);
    };

    const handleForceReset = async (e) => {
        e.preventDefault();
        setResetStatus({ loading: true, error: '', message: '' });
        if (newPassword.length < 8) {
            return setResetStatus({ loading: false, error: 'Password must be at least 8 characters.', message: '' });
        }
        try {
            const response = await axiosInstance.post(`/admin/users/${userToReset.id}/reset-password/`, { new_password: newPassword });
            setResetStatus({ loading: false, error: '', message: response.data.message });
            setTimeout(() => setResetModalOpen(false), 2000);
        } catch (err) {
            setResetStatus({ loading: false, error: err.response?.data?.error || "Failed to reset password.", message: '' });
            setPopup({
                isOpen: true,
                status: 'error',
                message: err.response?.data?.error || err.response?.data?.detail || 'Failed to reset password.'
            });
        }
    };

    const handleTabChange = (tab) => { 
        if (tab === activeTab) return;
        setActiveTab(tab); 
        setCurrentPage(1); 
    };

    const totalPages = Math.ceil(totalItems / limit);

    return (
        <div className="max-w-6xl p-6 mx-auto mt-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        Community Directory
                    </h1>
                    <p className="mt-1 text-sm text-slate-400">
                        Manage all community members, residents, and facility staff in one centralized matrix.
                    </p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 transform rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:-translate-y-0.5 active:translate-y-0"
                >
                    + Add New {activeTab === 'residents' ? 'Resident' : 'Staff'}
                </button>
            </div>

            {/* Smooth Floating Pill-Tab Switcher */}
            <div className="flex p-1.5 mb-6 border w-fit rounded-2xl bg-slate-900/80 border-slate-800 backdrop-blur-md">
                <button 
                    onClick={() => handleTabChange('residents')} 
                    className={`relative px-6 py-2.5 font-bold text-sm rounded-xl transition-all duration-300 ${
                        activeTab === 'residents' 
                            ? 'text-cyan-300 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.15)] border border-cyan-500/30' 
                            : 'text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                >
                    Residents
                </button>
                <button 
                    onClick={() => handleTabChange('staff')} 
                    className={`relative px-6 py-2.5 font-bold text-sm rounded-xl transition-all duration-300 ${
                        activeTab === 'staff' 
                            ? 'text-cyan-300 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.15)] border border-cyan-500/30' 
                            : 'text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                >
                    Staff Members
                </button>
            </div>

            {/* Dark Glass Table Container */}
            <div className="relative overflow-hidden border shadow-2xl bg-slate-900/50 border-slate-800 rounded-2xl backdrop-blur-sm min-h-[380px]">
                {/* Non-intrusive Top Loading Indicator bar */}
                {(loading || isPending) && (
                    <div className="absolute top-0 left-0 right-0 z-20 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 animate-pulse" />
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs tracking-wider uppercase border-b text-slate-400 border-slate-800 bg-slate-900/90">
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

                        {/* Smooth Transition Body: Dims gracefully during transitions without jumping height */}
                        <tbody 
                            className={`divide-y divide-slate-800/50 transition-opacity duration-300 ease-in-out ${
                                (loading || isPending) ? 'opacity-40 pointer-events-none' : 'opacity-100'
                            }`}
                        >
                            {users.length === 0 && !loading ? (
                                <tr>
                                    <td colSpan={6} className="p-16 text-center text-slate-500 animate-fade-in">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <span className="text-2xl">📂</span>
                                            <p className="text-sm font-medium">No {activeTab} found in this community directory.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr 
                                        key={user.id} 
                                        className="transition-colors duration-150 hover:bg-slate-800/40 animate-fade-in"
                                    >
                                        <td className="p-5 font-bold text-slate-200">{user.name}</td>
                                        <td className="p-5 text-sm text-slate-400">
                                            <div className="font-medium text-slate-300">{user.email}</div>
                                            <div className="text-xs text-slate-500">{user.phone || 'N/A'}</div>
                                        </td>
                                        <td className="p-5">
                                            {user.is_active ? (
                                                <span className="px-2.5 py-1 text-xs font-bold tracking-wider rounded border text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 text-xs font-bold tracking-wider rounded border text-rose-400 bg-rose-500/10 border-rose-500/20">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        {activeTab === 'residents' ? (
                                            <td className="p-5 text-sm font-medium text-slate-300">
                                                {user.flat ? (
                                                    `Block ${user.block || 'A'} - Flat ${user.flat}`
                                                ) : (
                                                    <span className="italic text-slate-500">Not Assigned</span>
                                                )}
                                            </td>
                                        ) : (
                                            <>
                                                <td className="p-5 text-sm font-medium text-slate-300">
                                                    {user.designation || <span className="italic text-slate-500">Not Assigned</span>}
                                                </td>
                                                <td className="p-5 text-sm font-medium text-slate-300">
                                                    ₹{user.monthly_salary || 0}
                                                </td>
                                            </>
                                        )}
                                        <td className="p-5 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <ToggleUserStatus user={user} onToggleSuccess={handleToggleSuccess} />
                                                <button 
                                                    onClick={() => openResetModal(user)} 
                                                    className="px-3 py-1.5 text-xs font-bold transition-colors border rounded-lg text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                                                >
                                                    Reset Pwd
                                                </button>
                                                <button 
                                                    onClick={() => navigate(
                                                        activeTab === 'staff' ? `/edit-staff/${user.id}` : `/edit-resident/${user.id}`, 
                                                        { state: { userToEdit: user, returnTab: activeTab, returnPage: currentPage } }
                                                    )} 
                                                    className="px-3 py-1.5 text-xs font-bold transition-colors border rounded-lg text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10"
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Dark Mode Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-5 border-t bg-slate-900/80 border-slate-800">
                        <span className="text-sm text-slate-400">
                            Showing page <span className="font-bold text-slate-200">{currentPage}</span> of <span className="font-bold text-slate-200">{totalPages}</span>
                        </span>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                                disabled={currentPage === 1 || loading} 
                                className="px-4 py-2 text-sm font-bold transition-colors border rounded-lg text-slate-300 border-slate-700 bg-slate-800/50 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Prev
                            </button>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                                disabled={currentPage === totalPages || loading} 
                                className="px-4 py-2 text-sm font-bold transition-colors border rounded-lg text-slate-300 border-slate-700 bg-slate-800/50 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <AddUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} activeTab={activeTab} onUserAdded={fetchData} />

            {/* Dark Mode Reset Password Modal */}
            {resetModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-md p-6 border shadow-2xl bg-slate-900 border-slate-800 rounded-2xl">
                        <h2 className="mb-4 text-xl font-bold text-slate-100">
                            Reset Password for <span className="text-cyan-400">{userToReset?.name}</span>
                        </h2>
                        {resetStatus.message && (
                            <div className="p-3 mb-4 text-sm border rounded-lg text-emerald-300 bg-emerald-500/10 border-emerald-500/20">
                                {resetStatus.message}
                            </div>
                        )}
                        {resetStatus.error && (
                            <div className="p-3 mb-4 text-sm border rounded-lg text-rose-300 bg-rose-500/10 border-rose-500/20">
                                {resetStatus.error}
                            </div>
                        )}
                        <form onSubmit={handleForceReset}>
                            <div className="mb-5">
                                <label className="block mb-1.5 text-sm font-medium text-slate-300">New Password</label>
                                <input 
                                    type="password" 
                                    value={newPassword} 
                                    onChange={(e) => setNewPassword(e.target.value)} 
                                    placeholder="Minimum 8 characters" 
                                    required 
                                    className="w-full p-3 transition-all duration-200 border outline-none bg-slate-800/50 border-slate-700 text-slate-100 rounded-xl focus:bg-slate-800 focus:ring-2 focus:ring-rose-500 focus:border-transparent placeholder-slate-500" 
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button 
                                    type="button" 
                                    onClick={() => setResetModalOpen(false)} 
                                    className="px-5 py-2.5 text-sm font-bold transition-all duration-300 border rounded-xl text-slate-300 border-slate-700 bg-slate-800/50 hover:bg-slate-700 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={resetStatus.loading || resetStatus.message !== ''} 
                                    className="px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 transform rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 hover:shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:-translate-y-0.5 disabled:opacity-50"
                                >
                                    {resetStatus.loading ? 'Saving...' : 'Confirm Reset'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Notification Alert Popup */}
            {popup.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                    <div className={`relative w-full max-w-sm p-8 text-center transition-all transform border shadow-2xl rounded-3xl bg-slate-900 ${popup.status === 'success' ? 'border-emerald-500/30 shadow-emerald-900/20' : 'border-rose-500/30 shadow-rose-900/20'}`}>
                        <div className={`flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full border-4 ${popup.status === 'success' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-rose-500/10 border-rose-500 text-rose-400'}`}>
                            {popup.status === 'success' ? (
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </div>
                        <h3 className={`text-2xl font-black mb-2 ${popup.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {popup.status === 'success' ? 'Success!' : 'Oops!'}
                        </h3>
                        <p className="mb-8 text-sm leading-relaxed text-slate-300">{popup.message}</p>
                        <button 
                            onClick={() => setPopup({ isOpen: false, status: '', message: '' })} 
                            className={`w-full py-3.5 font-bold tracking-widest uppercase transition-all duration-300 transform rounded-xl border border-transparent hover:-translate-y-0.5 ${popup.status === 'success' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-slate-900 hover:shadow-[0_0_20px_rgba(52,211,153,0.4)]' : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white hover:shadow-[0_0_20px_rgba(244,63,94,0.4)]'}`}
                        >
                            {popup.status === 'success' ? 'Awesome' : 'Close'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityDirectory;