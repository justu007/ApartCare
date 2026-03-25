import React, { useState, useEffect } from 'react';
import { getIssues } from '../../api/user';

const IssueList = () => {
    const [issues, setIssues] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

   
    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const data = await getIssues();
                
                if (data && data.results && Array.isArray(data.results)) {
                    setIssues(data.results);
                } 
                else if (Array.isArray(data)) {
                    setIssues(data);
                } 
                else {
                    console.error("Unexpected data format from backend:", data);
                    setIssues([]); 
                }

            } catch (err) {
                console.error(err);
                setError('Failed to load issues. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchIssues();
    }, []); 

    
    if (loading) return <div className="p-8 text-center text-gray-500">Loading issues...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="max-w-6xl p-6 mx-auto mt-8">
            {/* <h2 className="mb-6 text-2xl font-bold text-gray-800">Issue Dashboard</h2> */}
            
            {issues.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-lg shadow">
                    <p className="text-gray-500">No issues found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* The .map() function loops through our array and builds a card for every issue */}
                    {issues.map((issue) => (
                        <div key={issue.id} className="flex flex-col p-5 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md">
                            
                            {/* Header: Title & Status */}
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="font-semibold text-gray-800 truncate">{issue.title}</h3>
                                <span className={`px-2 py-1 text-xs font-bold rounded-full 
                                    ${issue.status === 'Open' ? 'bg-blue-100 text-blue-700' : 
                                      issue.status === 'Assigned' ? 'bg-yellow-100 text-yellow-700' : 
                                      issue.status === 'In-Progress' ? 'bg-purple-100 text-purple-700' : 
                                      issue.status === 'Resolved' ? 'bg-green-100 text-green-700' : 
                                      'bg-gray-100 text-gray-700'}`}>
                                    {issue.status}
                                </span>
                            </div>

                            {/* Body: Description & Details */}
                            <p className="flex-grow mb-4 text-sm text-gray-600 line-clamp-3">
                                {issue.description}
                            </p>

                            <div className="pt-3 text-xs text-gray-500 border-t border-gray-100 space-y-1">
                                <p><span className="font-medium">Category:</span> {issue.category}</p>
                                {/* <p>
                                    <span className="font-medium">Priority:</span> 
                                    <span className={`ml-1 ${issue.priority === 'High' || issue.priority === 'Urgent' ? 'text-red-600 font-bold' : ''}`}>
                                        {issue.priority}
                                    </span>
                                </p> */}
                                <p><span className="font-medium">Raised By:</span> {issue.creator_name} {issue.creator_flat ? `(Flat ${issue.creator_flat})` : ''}</p>
                            </div>

                            {/* Images Viewer (If they uploaded any!) */}
                            {issue.uploaded_images && issue.uploaded_images.length > 0 && (
                                <div className="mt-4">
                                    <p className="mb-2 text-xs font-medium text-gray-500">Attached Photos:</p>
                                    <div className="flex gap-2 overflow-x-auto">
                                        {issue.uploaded_images.map((img) => (
                                            <img 
                                                key={img.id} 
                                                src={img.image} 
                                                alt="Issue attachment" 
                                                className="block object-cover w-16 h-16 rounded-md border border-gray-200"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default IssueList;