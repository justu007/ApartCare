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

    if (loading) return <div className="mt-20 text-xl font-semibold text-center text-gray-600">Loading Profile...</div>;
    if (!profileData) return <div className="mt-20 text-center text-red-500">Error loading profile.</div>;

    return (
        <div className="max-w-3xl p-8 mx-auto mt-10 bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
                
                {!isEditing && (
                    <button 
                        onClick={handleEditClick}
                        className="px-4 py-2 text-sm font-semibold text-white bg-gray-800 rounded hover:bg-gray-700 transition"
                    >
                        Edit Profile
                    </button>
                )}
            </div>

            {message.text && (
                <div className={`p-3 mb-6 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 bg-gray-50 p-4 rounded-lg border">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                        {isEditing ? (
                            <input 
                                type="text" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                required
                                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" 
                            />
                        ) : (
                            <p className="text-lg font-semibold text-gray-900">{profileData.name}</p>
                        )}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
                        {isEditing ? (
                            <input 
                                type="text" 
                                name="phone" 
                                value={formData.phone} 
                                onChange={handleChange}
                                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" 
                            />
                        ) : (
                            <p className="text-lg font-semibold text-gray-900">{profileData.phone || 'Not provided'}</p>
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="mb-4 text-lg font-semibold text-gray-800 border-b pb-2">Account Details</h3>
                    <div className="grid grid-cols-1 gap-y-4 gap-x-6 md:grid-cols-2 text-sm">
                        <div>
                            <span className="block text-gray-500 font-medium mb-1">Email Address</span>
                            <p className="text-gray-900 font-medium">{profileData.email}</p>
                        </div>
                        <div>
                            <span className="block text-gray-500 font-medium mb-1">Role</span>
                            <span className="px-2 py-1 text-xs font-bold text-blue-800 bg-blue-100 rounded border border-blue-200">
                                {profileData.role}
                            </span>
                        </div>
                        <div>
                            <span className="block text-gray-500 font-medium mb-1">Account Status</span>
                            <span className={`px-2 py-1 text-xs font-bold rounded border ${profileData.status === 'Active' ? 'text-green-800 bg-green-100 border-green-200' : 'text-yellow-800 bg-yellow-100 border-yellow-200'}`}>
                                {profileData.status}
                            </span>
                        </div>
                        
                        {profileData.community && (
                            <div>
                                <span className="block text-gray-500 font-medium mb-1">Community</span>
                                <p className="text-gray-900 font-medium">{profileData.community.name}</p>
                            </div>
                        )}
                        {profileData.designation && (
                            <div>
                                <span className="block text-gray-500 font-medium mb-1">Designation</span>
                                <p className="text-gray-900 font-medium">{profileData.designation}</p>
                            </div>
                        )}
                        {profileData.monthly_salary && (
                            <div>
                                <span className="block text-gray-500 font-medium mb-1">Salary</span>
                                <p className="text-gray-900 font-medium">{profileData.monthly_salary}</p>
                            </div>
                        )}
                        {profileData.flat && (
                            <div>
                                <span className="block text-gray-500 font-medium mb-1">Residence</span>
                                <p className="text-gray-900 font-medium">Block {profileData.block?.name}, Flat {profileData.flat.name}</p>
                            </div>
                        )}
                    </div>
                </div>

                {isEditing && (
                    <div className="flex gap-3 pt-6 mt-6 border-t">
                        <button 
                            type="submit" 
                            disabled={saving} 
                            className="px-6 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-blue-300 font-medium transition"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button 
                            type="button" 
                            onClick={handleCancel}
                            disabled={saving}
                            className="px-6 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 font-medium transition"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default Profile;