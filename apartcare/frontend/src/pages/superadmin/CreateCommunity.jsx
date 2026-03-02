import React, { useState } from 'react';
import { createCommunityAdmin } from '../../api/superadmin';

const CreateCommunity = () => {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        admin_name: '',
        admin_email: '',
        admin_password: ''
    });

    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setErrors({}); 
        setSuccessMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setLoading(true);
        setErrors({});
        
        try {
            const response = await createCommunityAdmin(formData);
            
            setSuccessMessage(response.message);
            
            setFormData({
                name: '', address: '', admin_name: '', admin_email: '', admin_password: ''
            });

        } catch (error) {
            if (error.response && error.response.data) {
                setErrors(error.response.data);
            } else {
                setErrors({ non_field_errors: "Cannot connect to the server." });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
            <h2 className="text-2xl font-bold mb-6">Create New Community</h2>

            {successMessage && (
                <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
                    {successMessage}
                </div>
            )}

            {errors.non_field_errors && (
                <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                    {errors.non_field_errors}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Community Details Section */}
                <div>
                    <h3 className="text-lg font-semibold border-b pb-2 mb-3">Community Details</h3>
                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700">Community Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required
                            className="w-full border p-2 rounded mt-1" />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
                    </div>

                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <textarea name="address" value={formData.address} onChange={handleChange} required
                            className="w-full border p-2 rounded mt-1" rows="3"></textarea>
                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address[0]}</p>}
                    </div>
                </div>

                {/* Admin Details Section */}
                <div>
                    <h3 className="text-lg font-semibold border-b pb-2 mb-3">Community Admin Details</h3>
                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700">Admin Name</label>
                        <input type="text" name="admin_name" value={formData.admin_name} onChange={handleChange} required
                            className="w-full border p-2 rounded mt-1" />
                        {errors.admin_name && <p className="text-red-500 text-xs mt-1">{errors.admin_name[0]}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Admin Email</label>
                            <input type="email" name="admin_email" value={formData.admin_email} onChange={handleChange} required
                                className="w-full border p-2 rounded mt-1" />
                            {errors.admin_email && <p className="text-red-500 text-xs mt-1">{errors.admin_email[0]}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Admin Password</label>
                            <input type="password" name="admin_password" value={formData.admin_password} onChange={handleChange} required
                                className="w-full border p-2 rounded mt-1" />
                            {errors.admin_password && <p className="text-red-500 text-xs mt-1">{errors.admin_password[0]}</p>}
                        </div>
                    </div>
                </div>

                <button type="submit" disabled={loading}
                    className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:bg-blue-300">
                    {loading ? 'Creating...' : 'Create Community & Admin'}
                </button>
            </form>
        </div>
    );
};

export default CreateCommunity;