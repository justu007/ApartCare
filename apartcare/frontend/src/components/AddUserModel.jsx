import React, { useState } from 'react';
import { addUser } from '../api/admin';

const AddUserModal = ({ isOpen, onClose, activeTab, onUserAdded }) => {
    const role = activeTab === 'residents' ? 'RESIDENT' : 'STAFF';
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '' 
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                ...formData,
                role: role
            };
            
            await addUser(payload);
            
            onUserAdded(); 
            onClose();     
        } catch (err) {

            if (err.response && err.response.data) {
                const errorData = err.response.data;

                const firstErrorKey = Object.keys(errorData)[0];
                setError(`${firstErrorKey}: ${errorData[firstErrorKey][0]}`);
            } else {
                setError('Failed to create user. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
                <div className="flex items-center justify-between pb-3 mb-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">
                        Add New {role === 'RESIDENT' ? 'Resident' : 'Staff'}
                    </h2>
                    <button onClick={onClose} className="text-2xl font-bold text-gray-500 hover:text-red-500">
                        &times;
                    </button>
                </div>

                {error && (
                    <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Full Name</label>
                        <input 
                            type="text" 
                            name="name" 
                            value={formData.name}
                            onChange={handleChange} 
                            required 
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                        />
                    </div>
                    
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Email Address</label>
                        <input 
                            type="email" 
                            name="email" 
                            value={formData.email}
                            onChange={handleChange} 
                            required 
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                        />
                    </div>
                    
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Phone Number</label>
                        <input 
                            type="text" 
                            name="phone" 
                            value={formData.phone}
                            onChange={handleChange} 
                            required 
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Initial Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            value={formData.password}
                            onChange={handleChange} 
                            required 
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 mt-6 border-t">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-4 py-2 font-medium text-gray-700 transition bg-gray-100 rounded hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="px-4 py-2 font-medium text-white transition bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUserModal;