import React, { useEffect, useState } from 'react';
import { getStaffDashboard } from '../../api/user';

const StaffDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await getStaffDashboard();
                setData(response);
            } catch (err) {
                setError("Failed to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) return <div className="mt-20 text-xl font-semibold text-center text-gray-600">Loading Dashboard...</div>;
    if (error) return <div className="mt-20 text-center text-red-500">{error}</div>;
    if (!data) return null;

    return (
        <div className="max-w-5xl p-6 mx-auto mt-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">{data.welcome_message}</h1>
                <p className="mt-2 text-lg text-gray-600">
                    Community: <span className="font-semibold text-blue-600">{data.community}</span>
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Tasks Card */}
                <div className="p-6 bg-white border-t-4 border-orange-500 rounded-lg shadow-md">
                    <h3 className="text-sm font-medium text-gray-500 uppercase">Assigned Tasks Today</h3>
                    <p className="mt-2 text-4xl font-bold text-gray-800">
                        {data.assigned_tasks_today}
                    </p>
                </div>

                {/* Job Details Card */}
                <div className="p-6 bg-white border-t-4 border-green-500 rounded-lg shadow-md lg:col-span-2">
                    <h3 className="mb-4 text-lg font-bold text-gray-800 border-b pb-2">Employment Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="block text-sm text-gray-500">Designation</span>
                            <span className="font-semibold text-gray-900">{data.job_details.designation}</span>
                        </div>
                        <div>
                            <span className="block text-sm text-gray-500">Monthly Salary</span>
                            <span className="font-semibold text-gray-900">₹{data.job_details.salary}</span>
                        </div>
                        <div>
                            <span className="block text-sm text-gray-500">Joining Date</span>
                            <span className="font-semibold text-gray-900">{data.job_details.joining_date}</span>
                        </div>
                        <div>
                            <span className="block text-sm text-gray-500">Status</span>
                            <span className={`font-semibold ${data.job_details.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>
                                {data.job_details.status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;