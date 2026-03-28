
import React, { useEffect, useState } from 'react';
import { getProfile, updateProfile } from '../../api/profile';

const Profile = () => {
    const [profileData, setProfileData] = useState(null);
    const [formData, setFormData] = useState({ name: '', phone: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    const [isEditing, setIsEditing] = useState(false); 

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            const data = await getProfile();
            setProfileData(data);
            setFormData({
                name: data.name || '',
                phone: data.phone || ''
            });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to load profile data.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setMessage({ type: '', text: '' });
    };

    const handleEditClick = () => {
        setIsEditing(true);
        setMessage({ type: '', text: '' });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            name: profileData.name || '',
            phone: profileData.phone || ''
        });
        setMessage({ type: '', text: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await updateProfile(formData);
            setMessage({ type: 'success', text: response.message || 'Profile updated successfully!' });
            
            setProfileData(prev => ({ 
                ...prev, 
                name: response.data?.name || formData.name, 
                phone: response.data?.phone || formData.phone 
            }));
            
            setIsEditing(false);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update profile. Please check your inputs.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="mt-20 text-xl font-semibold text-center text-slate-400">Loading Profile...</div>;
    if (!profileData) return <div className="mt-20 text-center text-rose-500">Error loading profile.</div>;

    return (
        <div className="relative max-w-3xl p-8 mx-auto mt-10 overflow-hidden transition-all duration-300 border shadow-2xl bg-slate-900 border-slate-800 rounded-2xl">
            
            {/* Subtle glow effect behind the card */}
            <div className="absolute top-0 left-1/2 w-full h-1/2 bg-cyan-500/5 -translate-x-1/2 blur-[100px] pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">My Profile</h2>
                    
                    {!isEditing && (
                        <button 
                            onClick={handleEditClick}
                            className="px-5 py-2 text-sm font-semibold transition-colors border rounded-lg text-slate-300 border-slate-700 hover:text-cyan-400 hover:border-cyan-500/50 hover:bg-slate-800/50"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>

                {message.text && (
                    <div className={`p-4 mb-6 rounded-lg border ${message.type === 'success' ? 'bg-emerald-900/30 text-emerald-200 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-rose-900/30 text-rose-200 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.1)]'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Editable Section */}
                    <div className="grid grid-cols-1 gap-6 p-5 border md:grid-cols-2 bg-slate-800/30 rounded-xl border-slate-700/50">
                        <div>
                            <label className="block mb-1.5 text-sm font-medium text-slate-400">Full Name</label>
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={handleChange} 
                                    required
                                    className="w-full p-2.5 text-sm transition-all duration-200 bg-slate-800/50 border border-slate-700 text-slate-100 rounded-lg focus:bg-slate-800 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none" 
                                />
                            ) : (
                                <p className="text-lg font-semibold text-slate-200">{profileData.name}</p>
                            )}
                        </div>
                        
                        <div>
                            <label className="block mb-1.5 text-sm font-medium text-slate-400">Phone Number</label>
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    name="phone" 
                                    value={formData.phone} 
                                    onChange={handleChange}
                                    className="w-full p-2.5 text-sm transition-all duration-200 bg-slate-800/50 border border-slate-700 text-slate-100 rounded-lg focus:bg-slate-800 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none" 
                                />
                            ) : (
                                <p className="text-lg font-semibold text-slate-200">{profileData.phone || 'Not provided'}</p>
                            )}
                        </div>
                    </div>

                    {/* Read-Only Details Section */}
                    <div>
                        <h3 className="pb-2 mb-5 text-lg font-bold border-b text-slate-100 border-slate-800">Account Details</h3>
                        <div className="grid grid-cols-1 text-sm gap-y-5 gap-x-6 md:grid-cols-2">
                            <div>
                                <span className="block mb-1 font-medium text-slate-400">Email Address</span>
                                <p className="font-medium text-slate-200">{profileData.email}</p>
                            </div>
                            <div>
                                <span className="block mb-1 font-medium text-slate-400">Role</span>
                                <span className="px-2.5 py-1 text-xs font-bold tracking-wider rounded border text-cyan-300 bg-cyan-500/10 border-cyan-500/20">
                                    {profileData.role}
                                </span>
                            </div>
                            <div>
                                <span className="block mb-1 font-medium text-slate-400">Account Status</span>
                                <span className={`px-2.5 py-1 text-xs font-bold tracking-wider rounded border ${
                                    profileData.status === 'Active' 
                                    ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20' 
                                    : 'text-amber-300 bg-amber-500/10 border-amber-500/20'
                                }`}>
                                    {profileData.status}
                                </span>
                            </div>
                            
                            {profileData.community && (
                                <div>
                                    <span className="block mb-1 font-medium text-slate-400">Community</span>
                                    <p className="font-medium text-slate-200">{profileData.community.name}</p>
                                </div>
                            )}
                            {profileData.designation && (
                                <div>
                                    <span className="block mb-1 font-medium text-slate-400">Designation</span>
                                    <p className="font-medium text-slate-200">{profileData.designation}</p>
                                </div>
                            )}
                            {profileData.monthly_salary && (
                                <div>
                                    <span className="block mb-1 font-medium text-slate-400">Salary</span>
                                    <p className="font-medium text-slate-200">{profileData.monthly_salary}</p>
                                </div>
                            )}
                            {profileData.flat && (
                                <div>
                                    <span className="block mb-1 font-medium text-slate-400">Residence</span>
                                    <p className="font-medium text-slate-200">Block {profileData.block?.name}, Flat {profileData.flat.name}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {isEditing && (
                        <div className="flex gap-4 pt-6 mt-6 border-t border-slate-800">
                            <button 
                                type="submit" 
                                disabled={saving} 
                                className="px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 transform rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:-translate-y-0.5 disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button 
                                type="button" 
                                onClick={handleCancel}
                                disabled={saving}
                                className="px-6 py-2.5 text-sm font-bold transition-all duration-300 border rounded-lg text-slate-300 border-slate-700 bg-slate-800/50 hover:bg-slate-700 hover:text-white"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Profile;