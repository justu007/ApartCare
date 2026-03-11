import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { editUser, editStaff } from '../../features/users/userSlice'; 

const EditStaff = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const location = useLocation();
    const userToEdit = location.state?.userToEdit;
    const returnTab = location.state?.returnTab || 'staff';
    const returnPage = location.state?.returnPage || 1;

    const [name, setName] = useState(userToEdit?.name || '');
    const [email, setEmail] = useState(userToEdit?.email || '');
    const [phone, setPhone] = useState(userToEdit?.phone || '');
    const [designation, setDesignation] = useState(userToEdit?.designation || '');
    const [salary, setSalary] = useState(userToEdit?.monthly_salary || '');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!userToEdit) {
            navigate('/admin/directory');
        }
    }, [userToEdit, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {


            await dispatch(editUser({ 
                id: id, 
                data: { name, email, phone } 
            })).unwrap();
            alert("Staff updated successfully!");


            await dispatch(editStaff({ 
                id: id, 
                data: { designation, monthly_salary: salary } 
            })).unwrap();




            navigate('/admin/directory', { state: { activeTab: returnTab, currentPage: returnPage } });

        } catch (err) {
            console.error("Failed to update:", err);
            setError("Failed to update user. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!userToEdit) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="max-w-2xl p-6 mx-auto mt-10 bg-white rounded-lg shadow-md">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">Edit Staff Member</h2>
            
            {error && <div className="p-3 mb-4 text-red-700 bg-red-100 rounded">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* --- BASE USER FIELDS --- */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required 
                               className="w-full p-2 mt-1 border rounded focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required 
                               className="w-full p-2 mt-1 border rounded focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required 
                           className="w-full p-2 mt-1 border rounded focus:ring-2 focus:ring-blue-500" />
                </div>

                <hr className="my-6" />

                {/* --- STAFF PROFILE FIELDS --- */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Designation</label>
                        <input type="text" value={designation} onChange={(e) => setDesignation(e.target.value)} required 
                               className="w-full p-2 mt-1 border rounded focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Monthly Salary (₹)</label>
                        <input type="number" value={salary} onChange={(e) => setSalary(e.target.value)} required 
                               className="w-full p-2 mt-1 border rounded focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button type="button" 
                        onClick={() => navigate('/admin/directory', { state: { activeTab: returnTab, currentPage: returnPage } })}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading}
                            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditStaff;