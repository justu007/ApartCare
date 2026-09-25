
import React, { useEffect, useState } from 'react';
import { getProfile, updateProfile, changePassword } from '../../api/profile';
import { validateStrongPassword } from '../../utils/validators';

const Profile = () => {
    const [popup, setPopup] = useState({ isOpen: false, status: '', message: '' });
    const [profileData, setProfileData] = useState(null);
    const [formData, setFormData] = useState({ name: '', phone: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isEditing, setIsEditing] = useState(false); 

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        new_password: '',
        confirm_new_password: ''
    });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [passwordLoading, setPasswordLoading] = useState(false);

    useEffect(() => {
        fetchProfileData();
        ;
    }, []);

    const fetchProfileData = async () => {
        setLoading(true);
        try {
            const data = await getProfile();
            console.log('loaded data :',{data})
            setProfileData(data);
            setFormData({
                name: data?.name || '',
                phone: data?.phone ? String(data.phone).replace(/\D/g, '').slice(0, 10) : ''
            });
        } catch (err) {
            console.error("Profile load failed:", err);
            setMessage({ type: 'error', text: 'Failed to load profile data.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setMessage({ type: '', text: '' });
    };

    const handlePhoneChange = (e) => {
        const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
        setFormData({ ...formData, phone: clean });
    };

    const handlePasswordInputChange = (e) => {
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
        setPasswordErrors({ ...passwordErrors, [e.target.name]: '' });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            name: profileData?.name || '',
            phone: profileData?.phone ? String(profileData.phone).replace(/\D/g, '').slice(0, 10) : ''
        });
        setMessage({ type: '', text: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        if (formData.phone && formData.phone.length !== 10) {
            setSaving(false);
            const err = "Phone number must be exactly 10 digits.";
            setMessage({ type: 'error', text: err });
            setPopup({ isOpen: true, status: 'error', message: err });
            return;
        }

        try {
            const response = await updateProfile({
                name: formData.name.trim(),
                phone: formData.phone.trim()
            });
            setMessage({ type: 'success', text: response.message || 'Profile updated successfully!' });
            setProfileData(prev => ({ 
                ...prev, 
                name: response.data?.name || formData.name, 
                phone: response.data?.phone || formData.phone 
            }));
            setIsEditing(false);
        } catch (err) {
            const resolvedError = 
                err.response?.data?.phone?.[0] ||
                err.response?.data?.name?.[0] ||
                err.response?.data?.detail ||
                err.response?.data?.error ||
                'Failed to update profile. Please check your inputs.';

            setMessage({ type: 'error', text: resolvedError });
            setPopup({
                isOpen: true,
                status: 'error',
                message: resolvedError
            });
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordErrors({});
        
        if (passwordForm.new_password !== passwordForm.confirm_new_password) {
            setPasswordErrors({ confirm_new_password: ['New passwords do not match.'] });
            return;
        }

        const strengthError = validateStrongPassword(passwordForm.new_password);
        if (strengthError) {
            setPasswordErrors({ new_password: [strengthError] });
            return; 
        }
        
        setPasswordLoading(true);
        try {
            const res = await changePassword(passwordForm);
            setMessage({ type: 'success', text: res.message || 'Password changed successfully!' });
            setShowPasswordModal(false);
            setPasswordForm({ current_password: '', new_password: '', confirm_new_password: '' });
        } catch (err) {
            const data = err.response?.data;
            const extractedMessage = 
                data?.non_field_errors?.[0] ||
                data?.new_password?.[0] ||
                data?.current_password?.[0] ||
                data?.confirm_new_password?.[0] ||
                data?.detail ||
                data?.error ||
                'Failed to change password. Try again.';

            if (data && typeof data === 'object') {
                setPasswordErrors(data);
            } else {
                setPasswordErrors({ global: extractedMessage });
            }

            setPopup({
                isOpen: true,
                status: 'error',
                message: extractedMessage
            });
        } finally {
            setPasswordLoading(false);
        }
    };

    // Helper: Safely resolve community text regardless of structure
    const getCommunityName = () => {
        if (!profileData?.community) return 'ApartCare Community';
        if (typeof profileData.community === 'object' && profileData.community !== null) {
            return profileData.community.name || 'ApartCare Community';
        }
        return String(profileData.community);
    };

    // Helper: Safely resolve residence details (only rendered for residents)
    const renderResidence = () => {
        if (profileData?.role?.toUpperCase() === 'STAFF') return null;

        const blockName = typeof profileData?.block === 'object' && profileData?.block !== null
            ? profileData.block.name
            : profileData?.block;

        const flatName = typeof profileData?.flat === 'object' && profileData?.flat !== null
            ? profileData.flat.name
            : profileData?.flat;

        if (!blockName && !flatName) return null;

        return (
            <div>
                <span className="block mb-1 font-medium text-slate-400">Residence</span>
                <p className="font-medium text-slate-200">
                    {blockName ? `Block ${blockName}` : ''}
                    {blockName && flatName ? ', ' : ''}
                    {flatName ? `Flat ${flatName}` : ''}
                </p>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-xl font-semibold font-mono text-cyan-400 animate-pulse">
                    Loading Profile...
                </div>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="max-w-md p-6 mx-auto mt-20 text-center border border-rose-500/30 rounded-2xl bg-slate-900">
                <p className="text-rose-400 font-semibold mb-4">Error loading profile data.</p>
                <button 
                    onClick={fetchProfileData}
                    className="px-4 py-2 text-xs font-bold text-white rounded-lg bg-cyan-600 hover:bg-cyan-500"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="relative max-w-3xl p-8 mx-auto mt-10 overflow-hidden transition-all duration-300 border shadow-2xl bg-slate-900 border-slate-800 rounded-2xl">
            <div className="absolute top-0 left-1/2 w-full h-1/2 bg-cyan-500/5 -translate-x-1/2 blur-[100px] pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
                    <div>
                        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                            My Profile
                        </h2>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            {profileData.role || 'Member'} Account
                        </span>
                    </div>
                    
                    <div className="flex gap-3">
                        {!isEditing && (
                            <>
                                <button 
                                    type="button" 
                                    onClick={() => { setShowPasswordModal(true); setPasswordErrors({}); }}
                                    className="px-4 py-2 text-sm font-semibold transition-colors border rounded-lg text-slate-400 border-slate-800 hover:text-amber-400 hover:border-amber-500/40"
                                >
                                    🔒 Reset Password
                                </button>
                                <button 
                                    onClick={() => { setIsEditing(true); setMessage({ type: '', text: '' }); }}
                                    className="px-4 py-2 text-sm font-semibold transition-colors border rounded-lg text-slate-300 border-slate-700 hover:text-cyan-400 hover:border-cyan-500/50 hover:bg-slate-800/50"
                                >
                                    Edit Profile
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {message.text && (
                    <div className={`p-4 mb-6 rounded-lg border ${
                        message.type === 'success' 
                            ? 'bg-emerald-900/30 text-emerald-200 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                            : 'bg-rose-900/30 text-rose-200 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
                    }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
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
                                    className="w-full p-2.5 text-sm transition-all duration-200 bg-slate-800/50 border border-slate-700 text-slate-100 rounded-lg focus:bg-slate-800 focus:ring-2 focus:ring-cyan-500 outline-none" 
                                />
                            ) : (
                                <p className="text-lg font-semibold text-slate-200">{profileData.name || 'Anonymous User'}</p>
                            )}
                        </div>
                        
                        <div>
                            <label className="block mb-1.5 text-sm font-medium text-slate-400">Phone Number</label>
                            {isEditing ? (
                                <input 
                                    type="tel" 
                                    name="phone" 
                                    value={formData.phone} 
                                    onChange={handlePhoneChange} 
                                    placeholder="Enter 10-digit phone"
                                    maxLength={10}
                                    className="w-full p-2.5 text-sm transition-all duration-200 bg-slate-800/50 border border-slate-700 text-slate-100 rounded-lg focus:bg-slate-800 focus:ring-2 focus:ring-cyan-500 outline-none" 
                                />
                            ) : (
                                <p className="text-lg font-semibold text-slate-200">{profileData.phone || 'Not provided'}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <h3 className="pb-2 mb-5 text-lg font-bold border-b text-slate-100 border-slate-800">Account Details</h3>
                        <div className="grid grid-cols-1 text-sm gap-y-5 gap-x-6 md:grid-cols-2">
                            <div>
                                <span className="block mb-1 font-medium text-slate-400">Email Address</span>
                                <p className="font-medium text-slate-200">{profileData.email || 'N/A'}</p>
                            </div>

                            <div>
                                <span className="block mb-1 font-medium text-slate-400">Role</span>
                                <span className="px-2.5 py-1 text-xs font-bold tracking-wider rounded border text-cyan-300 bg-cyan-500/10 border-cyan-500/20">
                                    {profileData.role || 'Staff'}
                                </span>
                            </div>

                            <div>
                                <span className="block mb-1 font-medium text-slate-400">Account Status</span>
                                <span className={`px-2.5 py-1 text-xs font-bold tracking-wider rounded border ${
                                    profileData.status === 'Active' || profileData.is_active 
                                        ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20' 
                                        : 'text-amber-300 bg-amber-500/10 border-amber-500/20'
                                }`}>
                                    {profileData.status || (profileData.is_active ? 'Active' : 'Inactive')}
                                </span>
                            </div>
                            
                            <div>
                                <span className="block mb-1 font-medium text-slate-400">Community</span>
                                <p className="font-medium text-slate-200">{getCommunityName()}</p>
                            </div>

                            {/* Staff Designation */}
                            {profileData.designation && (
                                <div>
                                    <span className="block mb-1 font-medium text-slate-400">Designation</span>
                                    <p className="font-medium text-slate-200">
                                        {typeof profileData.designation === 'object' && profileData.designation !== null
                                            ? (profileData.designation.designation || profileData.designation.name || 'Staff Member')
                                            : (profileData.designation || 'Not Assigned')}
                                    </p>
                                </div>
                            )}

                            {/* Staff Salary */}
                            {profileData.monthly_salary !== undefined && profileData.monthly_salary !== null && (
                                <div>
                                    <span className="block mb-1 font-medium text-slate-400">Monthly Salary</span>
                                    <p className="font-medium text-slate-200">
                                        ₹{(() => {
                                            const salary = profileData.monthly_salary;
                                            if (typeof salary === 'object' && salary !== null) {
                                                return salary.monthly_salary ?? salary.amount ?? salary.salary ?? 0;
                                            }
                                            return salary === 'None' || !salary ? 0 : salary;
                                        })()}
                                    </p>
                                </div>
                            )}

                            {/* Resident Flat/Block */}
                            {renderResidence()}

                            {/* Resident Paid Amount */}
                            {profileData.paid_amount && (
                                <div>
                                    <span className="block mb-1 font-medium text-slate-400">Paid Amount</span>
                                    <p className="font-medium text-slate-200">₹{profileData.paid_amount}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {isEditing && (
                        <div className="flex gap-4 pt-6 mt-6 border-t border-slate-800">
                            <button 
                                type="submit" 
                                disabled={saving} 
                                className="px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 transform rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50"
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

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-md p-6 border shadow-2xl bg-slate-900 border-slate-800 rounded-2xl">
                        <h3 className="mb-4 text-xl font-bold text-slate-100">Update Secure Access Password</h3>
                        {passwordErrors.global && (
                            <div className="p-2.5 mb-3 text-xs text-rose-300 border rounded border-rose-500/20 bg-rose-500/5">
                                {passwordErrors.global}
                            </div>
                        )}
                        
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                                <label className="block mb-1 text-xs font-semibold text-slate-400">Current Password</label>
                                <input 
                                    required 
                                    type="password" 
                                    name="current_password" 
                                    value={passwordForm.current_password} 
                                    onChange={handlePasswordInputChange}
                                    className="w-full p-2.5 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white outline-none focus:border-amber-500"
                                />
                                {passwordErrors.current_password && (
                                    <span className="text-xs text-rose-400 mt-1 block">
                                        {Array.isArray(passwordErrors.current_password) ? passwordErrors.current_password[0] : passwordErrors.current_password}
                                    </span>
                                )}
                            </div>
                            <div>
                                <label className="block mb-1 text-xs font-semibold text-slate-400">New Password</label>
                                <input 
                                    required 
                                    type="password" 
                                    name="new_password" 
                                    value={passwordForm.new_password} 
                                    onChange={handlePasswordInputChange}
                                    className="w-full p-2.5 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white outline-none focus:border-amber-500"
                                />
                                {passwordErrors.new_password && (
                                    <span className="text-xs text-rose-400 mt-1 block">
                                        {Array.isArray(passwordErrors.new_password) ? passwordErrors.new_password[0] : passwordErrors.new_password}
                                    </span>
                                )}
                            </div>
                            <div>
                                <label className="block mb-1 text-xs font-semibold text-slate-400">Confirm New Password</label>
                                <input 
                                    required 
                                    type="password" 
                                    name="confirm_new_password" 
                                    value={passwordForm.confirm_new_password} 
                                    onChange={handlePasswordInputChange}
                                    className="w-full p-2.5 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white outline-none focus:border-amber-500"
                                />
                                {passwordErrors.confirm_new_password && (
                                    <span className="text-xs text-rose-400 mt-1 block">
                                        {Array.isArray(passwordErrors.confirm_new_password) ? passwordErrors.confirm_new_password[0] : passwordErrors.confirm_new_password}
                                    </span>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                                <button 
                                    type="button" 
                                    onClick={() => setShowPasswordModal(false)}
                                    className="px-4 py-2 text-xs font-bold transition-colors border rounded-lg text-slate-400 border-slate-800 hover:bg-slate-800"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={passwordLoading}
                                    className="px-4 py-2 text-xs font-bold text-slate-900 bg-amber-400 rounded-lg hover:bg-amber-300 disabled:opacity-50"
                                >
                                    {passwordLoading ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Notification Alert Popup */}
            {popup.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                    <div className={`relative w-full max-w-sm p-8 text-center transition-all transform border shadow-2xl rounded-3xl bg-slate-900 ${
                        popup.status === 'success' ? 'border-emerald-500/30' : 'border-rose-500/30'
                    }`}>
                        <div className={`flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full border-4 ${
                            popup.status === 'success' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-rose-500/10 border-rose-500 text-rose-400'
                        }`}>
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
                            className={`w-full py-3.5 font-bold tracking-widest uppercase transition-all duration-300 rounded-xl ${
                                popup.status === 'success' 
                                    ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-slate-900' 
                                    : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white'
                            }`}
                        >
                            {popup.status === 'success' ? 'Awesome' : 'Close'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;