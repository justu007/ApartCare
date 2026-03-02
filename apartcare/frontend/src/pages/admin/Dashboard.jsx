import React, { useEffect, useState } from 'react';
import { getAdminDashboard } from '../../api/admin';

const AdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const data = await getAdminDashboard();
                setDashboardData(data);
            } catch (err) {
                if (err.response && err.response.status === 401) {
                    setError("Unauthorized. Please log in again.");
                } else {
                    setError("Failed to load dashboard data.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen text-xl font-semibold">Loading Dashboard...</div>;
    }

    if (error) {
        return <div className="p-4 mt-10 text-center text-red-600 bg-red-100 rounded mx-auto max-w-2xl">{error}</div>;
    }

    return (
        <div className="max-w-6xl p-6 mx-auto mt-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Community Admin Dashboard</h1>
                <p className="mt-2 text-lg text-gray-600">
                    Managing: <span className="font-semibold text-blue-600">{dashboardData.community_name}</span>
                </p>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                
                {/* Blocks Card */}
                <div className="p-6 bg-white rounded-lg shadow-md border-t-4 border-blue-500">
                    <h3 className="text-sm font-medium text-gray-500 uppercase">Total Blocks</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-800">
                        {dashboardData.statistics.total_blocks}
                    </p>
                </div>

                {/* Flats Card */}
                <div className="p-6 bg-white rounded-lg shadow-md border-t-4 border-green-500">
                    <h3 className="text-sm font-medium text-gray-500 uppercase">Total Flats</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-800">
                        {dashboardData.statistics.total_flats}
                    </p>
                </div>

                {/* Residents Card */}
                <div className="p-6 bg-white rounded-lg shadow-md border-t-4 border-purple-500">
                    <h3 className="text-sm font-medium text-gray-500 uppercase">Active Residents</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-800">
                        {dashboardData.statistics.total_active_residents}
                    </p>
                </div>

                {/* Staff Card */}
                <div className="p-6 bg-white rounded-lg shadow-md border-t-4 border-orange-500">
                    <h3 className="text-sm font-medium text-gray-500 uppercase">Active Staff</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-800">
                        {dashboardData.statistics.total_active_staff}
                    </p>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;