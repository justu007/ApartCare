import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { fetchCommunities, toggleDeactivate } from "../../features/community/communitySlice";
import { createCommunityAdmin } from '../../api/superadmin';
import EditCommunityModal from "../../components/EditCommunityModal";

const CommunitiesManager = () => {
    const dispatch = useDispatch();
    const { communities, loading } = useSelector((state) => state.community);
    
    const [activeTab, setActiveTab] = useState('list'); 
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    
    // 🎯 Initialization explicitly enforces empty initial values
    const [formData, setFormData] = useState({ 
        name: '', 
        address: '', 
        admin_name: '', 
        admin_email: '', 
        admin_password: '' 
    });
    const [createLoading, setCreateLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => { 
        dispatch(fetchCommunities()); 
    }, [dispatch]);

    const handleCreateChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({}); 
        setSuccessMessage('');
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault(); 
        setCreateLoading(true); 
        setErrors({});
        try {
            const response = await createCommunityAdmin(formData);
            setSuccessMessage(response.message);
            
            // 🎯 FORCED RESET: Explicitly clear out every single input variable state to blank text
            setFormData({ 
                name: '', 
                address: '', 
                admin_name: '', 
                admin_email: '', 
                admin_password: '' 
            });
            
            dispatch(fetchCommunities());
        } catch (error) {
            if (error.response && error.response.data) setErrors(error.response.data);
            else setErrors({ non_field_errors: "Cannot connect to the server." });
        } finally { 
            setCreateLoading(false); 
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 mt-8 text-slate-200 relative">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/5 blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-pink-500/5 blur-[120px] pointer-events-none"></div>

            <div className="mb-8">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                    Communities Hub
                </h1>
                {/* <p className="text-sm text-slate-400 mt-1">Initialize new tenant groups and monitor active network nodes.</p> */}
            </div>

            <div className="flex gap-2 p-1.5 bg-slate-950/40 border border-slate-800/80 rounded-xl max-w-md mb-8 backdrop-blur-md">
                <button
                    type="button"
                    onClick={() => { setActiveTab('list'); setSuccessMessage(''); setErrors({}); }}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${
                        activeTab === 'list'
                            ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border border-transparent'
                    }`}
                >
                    📋 Registered Network
                </button>
                <button
                    type="button"
                    onClick={() => { setActiveTab('create'); setSuccessMessage(''); setErrors({}); }}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${
                        activeTab === 'create'
                            ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border border-transparent'
                    }`}
                >
                    ➕ Initialize Community
                </button>
            </div>

            {activeTab === 'list' && (
                <div className="overflow-hidden border shadow-2xl bg-slate-900/50 border-slate-800 rounded-2xl backdrop-blur-sm animate-fade-in">
                    {loading ? (
                        <div className="p-20 text-center text-slate-400 font-medium animate-pulse">
                            Querying platform community registry...
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="text-sm tracking-wider uppercase border-b text-slate-400 border-slate-800 bg-slate-900/80">
                                    <tr>
                                        <th className="p-5 font-bold">Community</th>
                                        <th className="p-5 font-bold">Address</th>
                                        <th className="p-5 font-bold">Admin Name</th>
                                        <th className="p-5 font-bold">Admin Contact</th>
                                        <th className="p-5 text-center font-bold">Status</th>
                                        <th className="p-5 text-right font-bold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {communities.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="p-10 text-center text-sm italic text-slate-500">
                                                No community tenancies configured on current cluster nodes.
                                            </td>
                                        </tr>
                                    ) : (
                                        communities.map((community) => (
                                            <tr key={community.id} className="transition-colors hover:bg-slate-800/40">
                                                <td className="p-5 font-bold text-slate-200">{community.name}</td>
                                                <td className="p-5 text-sm text-slate-400 max-w-xs truncate">{community.address}</td>
                                                <td className="p-5 text-sm font-medium text-slate-300">{community.admin?.name || 'N/A'}</td>
                                                <td className="p-5 text-sm text-slate-400">
                                                    <div className="text-slate-300 font-mono">{community.admin?.email}</div>
                                                    <div className="text-slate-500">{community.admin?.phone || 'N/A'}</div>
                                                </td>
                                                <td className="p-5 text-center">
                                                    {community.is_active ? (
                                                        <span className="px-2.5 py-1 text-xs font-bold tracking-wider rounded border text-emerald-400 bg-emerald-500/10 border-emerald-500/20">Active</span>
                                                    ) : (
                                                        <span className="px-2.5 py-1 text-xs font-bold tracking-wider rounded border text-rose-400 bg-rose-500/10 border-rose-500/20">Inactive</span>
                                                    )}
                                                </td>
                                                <td className="p-5 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <button 
                                                            type="button"
                                                            onClick={() => setSelectedCommunity(community)}
                                                            className="px-3 py-1.5 text-xs font-bold transition-colors border rounded-lg text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => dispatch(toggleDeactivate({ id: community.id, is_active: community.is_active }))}
                                                            className={`px-3 py-1.5 text-xs font-bold transition-colors border rounded-lg ${
                                                                community.is_active 
                                                                ? "text-rose-400 border-rose-500/30 hover:bg-rose-500/10" 
                                                                : "text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                                                            }`}
                                                        >
                                                            {community.is_active ? "Deactivate" : "Activate"}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ➕ TAB PANEL B: INITIALIZE COMMUNITY INPUT FORM */}
            {activeTab === 'create' && (
                <div className="relative p-8 border shadow-2xl bg-slate-900/40 border-slate-800 rounded-2xl backdrop-blur-md animate-fade-in max-w-4xl mx-auto">
                    <h2 className="mb-6 text-xl font-bold text-slate-100 flex items-center gap-2">
                        🏢 Community Creation
                    </h2>

                    {successMessage && <div className="p-3 mb-5 text-sm border rounded-lg text-emerald-300 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">{successMessage}</div>}
                    {errors.non_field_errors && <div className="p-3 mb-5 text-sm border rounded-lg text-rose-300 bg-rose-500/10 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]">{errors.non_field_errors}</div>}

                    {/* 🎯 Added autoComplete="off" to the master form context view */}
                    <form onSubmit={handleCreateSubmit} className="space-y-6" autoComplete="off">
                        
                        {/* Community Profile Segment */}
                        <div className="bg-slate-950/40 p-5 rounded-xl border border-slate-800/60">
                            <h3 className="pb-2 mb-4 text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80">Community Location Profile</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-1">
                                    <label className="block mb-1.5 text-xs font-semibold text-slate-400">Community Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleCreateChange} required autoComplete="off" className="w-full p-2.5 text-sm transition-all duration-200 border outline-none bg-slate-800/40 border-slate-700 text-slate-100 rounded-lg focus:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                                    {errors.name && <p className="mt-1 text-[10px] text-rose-400">{errors.name[0]}</p>}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block mb-1.5 text-xs font-semibold text-slate-400">Physical Address Description</label>
                                    <input type="text" name="address" value={formData.address} onChange={handleCreateChange} required autoComplete="off" className="w-full p-2.5 text-sm transition-all duration-200 border outline-none bg-slate-800/40 border-slate-700 text-slate-100 rounded-lg focus:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                                    {errors.address && <p className="mt-1 text-[10px] text-rose-400">{errors.address[0]}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Admin Identity Credentials Segment */}
                        <div className="bg-slate-950/40 p-5 rounded-xl border border-slate-800/60">
                            <h3 className="pb-2 mb-4 text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80">Administrative Sign-In Info</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block mb-1.5 text-xs font-semibold text-slate-400">Admin Account Full Name</label>
                                    <input type="text" name="admin_name" value={formData.admin_name} onChange={handleCreateChange} required autoComplete="off" className="w-full p-2.5 text-sm transition-all duration-200 border outline-none bg-slate-800/40 border-slate-700 text-slate-100 rounded-lg focus:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                                    {errors.admin_name && <p className="mt-1 text-[10px] text-rose-400">{errors.admin_name[0]}</p>}
                                </div>
                                <div>
                                    <label className="block mb-1.5 text-xs font-semibold text-slate-400">Admin Unique Email Address</label>
                                    {/* 🎯 Added autoComplete="new-email" to prevent username suggestion locks */}
                                    <input type="email" name="admin_email" value={formData.admin_email} onChange={handleCreateChange} required autoComplete="new-email" className="w-full p-2.5 text-sm transition-all duration-200 border outline-none bg-slate-800/40 border-slate-700 text-slate-100 rounded-lg focus:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                                    {errors.admin_email && <p className="mt-1 text-[10px] text-rose-400">{errors.admin_email[0]}</p>}
                                </div>
                                <div>
                                    <label className="block mb-1.5 text-xs font-semibold text-slate-400">Temporary Verification Password</label>
                                    {/* 🎯 Added autoComplete="new-password" to completely disable browser auto-population rules */}
                                    <input type="password" name="admin_password" value={formData.admin_password} onChange={handleCreateChange} required autoComplete="new-password" className="w-full p-2.5 text-sm transition-all duration-200 border outline-none bg-slate-800/40 border-slate-700 text-slate-100 rounded-lg focus:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                                    {errors.admin_password && <p className="mt-1 text-[10px] text-rose-400">{errors.admin_password[0]}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Submit Action Block */}
                        <div className="pt-4 border-t border-slate-800 flex justify-end">
                            <button 
                                type="submit" 
                                disabled={createLoading} 
                                className="px-8 py-3 font-bold text-white transition-all duration-300 transform rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:-translate-y-0.5 disabled:opacity-50"
                            >
                                {createLoading ? 'Creating community...' : '🚀 Submit'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {selectedCommunity && (
                <EditCommunityModal 
                    community={selectedCommunity} 
                    onClose={() => { setSelectedCommunity(null); dispatch(fetchCommunities()); }} 
                />
            )}
        </div>
    );
};

export default CommunitiesManager;