import React, { useEffect, useState } from 'react';
import { getResidentDashboard } from '../../api/user';

const ResidentDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await getResidentDashboard();
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

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Residence Details Card */}
                <div className="p-6 bg-white border-t-4 border-blue-500 rounded-lg shadow-md">
                    <h3 className="mb-4 text-lg font-bold text-gray-800 border-b pb-2">My Residence</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Block</span>
                            <span className="font-semibold text-gray-900">{data.residence_details.block}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Flat</span>
                            <span className="font-semibold text-gray-900">{data.residence_details.flat}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t mt-2">
                            <span className="text-gray-500">Profile Status</span>
                            <span className={`font-semibold ${data.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>
                                {data.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Placeholder for Future Features (e.g., Bills, Maintenance Requests) */}
                <div className="p-6 bg-white border-t-4 border-gray-300 rounded-lg shadow-md flex items-center justify-center text-gray-400">
                    <p>Recent activity will appear here.</p>
                </div>
            </div>
        </div>
    );
};

export default ResidentDashboard;