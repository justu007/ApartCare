import { useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import { getResidents, getStaff } from '../../api/admin';
import AddUserModal from '../../components/AddUserModel'; 
import ToggleUserStatus from '../../components/ToggleUserStatus';


const CommunityDirectory = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'residents');
    const [currentPage, setCurrentPage] = useState(location.state?.currentPage || 1);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    
    const [totalItems, setTotalItems] = useState(0);
    const limit = 3;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, [activeTab, currentPage]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let response;
            if (activeTab === 'residents') {
                response = await getResidents(currentPage, limit);
            } else {
                response = await getStaff(currentPage, limit);
            }
            
            setUsers(response.data || []);
            setTotalItems(response.total || 0);
            
        } catch (error) {
            console.error("Failed to fetch data", error);
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

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(totalItems / limit);

    return (
        <div className="max-w-6xl p-6 mx-auto mt-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Community Directory</h1>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 font-semibold text-white transition bg-blue-600 rounded shadow hover:bg-blue-700"
                >
                    + Add New {activeTab === 'residents' ? 'Resident' : 'Staff'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex mb-6 border-b border-gray-200">
                <button 
                    onClick={() => handleTabChange('residents')}
                    className={`px-6 py-3 font-medium text-sm transition-colors duration-200 ${
                        activeTab === 'residents' 
                        ? 'border-b-2 border-blue-600 text-blue-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Residents
                </button>
                <button 
                    onClick={() => handleTabChange('staff')}
                    className={`px-6 py-3 font-medium text-sm transition-colors duration-200 ${
                        activeTab === 'staff' 
                        ? 'border-b-2 border-blue-600 text-blue-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Staff Members
                </button>
            </div>



            <div className="overflow-hidden bg-white border border-gray-100 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-sm text-gray-600 border-b border-gray-200 bg-gray-50">
                                <th className="p-4 font-semibold">Name</th>
                                <th className="p-4 font-semibold">Email & Phone</th>
                                <th className="p-4 font-semibold">Status</th>
                                
                                {/* CONDITIONAL HEADERS: 1 for Resident, 2 for Staff */}
                                {activeTab === 'residents' ? (
                                    <th className="p-4 font-semibold">Residence (Block - Flat)</th>
                                ) : (
                                    <>
                                        <th className="p-4 font-semibold">Designation</th>
                                        <th className="p-4 font-semibold">Salary</th>
                                    </>
                                )}
                                
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    {/* Notice colSpan changes based on the active tab width! */}
                                    <td colSpan={activeTab === 'residents' ? 5 : 6} className="p-8 text-center text-gray-500">
                                        Loading records...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={activeTab === 'residents' ? 5 : 6} className="p-8 text-center text-gray-500">
                                        No {activeTab} found in this community.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="transition-colors hover:bg-gray-50">
                                        <td className="p-4 font-medium text-gray-800">{user.name}</td>
                                        <td className="p-4 text-sm text-gray-600">
                                            <div>{user.email}</div>
                                            <div className="text-gray-400">{user.phone || 'N/A'}</div>
                                        </td>
                                        <td className="p-4">
                                        {user.is_active ? (
                                            <span className="px-2 py-1 text-xs font-bold text-green-700 bg-green-100 rounded-full">
                                            Active
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs font-bold text-red-700 bg-red-100 rounded-full">
                                            Inactive
                                            </span>
                                        )}
                                        </td>

                                        {/* CONDITIONAL DATA CELLS */}
                                        {activeTab === 'residents' ? (
                                            <td className="p-4 text-sm text-gray-600">
                                                {user.flat ? `Block ${user.block} - Flat ${user.flat}` : 'Not Assigned'}
                                            </td>
                                        ) : (
                                            <>
                                                <td className="p-4 text-sm text-gray-600">{user.designation || 'Not Assigned'}</td>
                                                <td className="p-4 text-sm text-gray-600">₹{user.monthly_salary || 0}</td>
                                            </>
                                        )}

                                        {/* ACTIONS COLUMN: Both buttons inside ONE cell */}
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <ToggleUserStatus user={user} onToggleSuccess={handleToggleSuccess} />
                                                
                                                <button
                                                    onClick={() => navigate (activeTab === 'staff' ?
                                                                 `/edit-staff/${user.id}` : 
                                                                 `/edit-resident/${user.id}`,
                                                                { state: { userToEdit: user,
                                                                           returnTab: activeTab,
                                                                           returnPage: currentPage
                                                                 }}
                                                            )}
                                                    className="px-3 py-1 text-sm font-medium text-blue-600 transition bg-blue-100 rounded hover:bg-blue-200"
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
        

                {/* Pagination Controls */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
                        <span className="text-sm text-gray-600">
                            Showing page <span className="font-semibold text-gray-900">{currentPage}</span> of <span className="font-semibold text-gray-900">{totalPages}</span>
                        </span>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add User Modal Component */}
            <AddUserModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                activeTab={activeTab}
                onUserAdded={fetchData} 
            />
        </div>
    );
};

export default CommunityDirectory;