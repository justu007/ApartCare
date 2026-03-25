import React, { useState } from 'react';
import IssueList from './IssueList';  
import RaiseIssue from './RaiseIssue'; 

const IssueDashboard = () => {
    const [activeTab, setActiveTab] = useState('list'); 

    return (
        <div className="max-w-6xl p-6 mx-auto mt-8">
            
            {/* --- THE TAB BUTTONS --- */}
            <div className="flex mb-6 border-b border-gray-200">
                <button 
                    onClick={() => setActiveTab('list')}
                    className={`px-6 py-3 font-medium text-sm transition-colors duration-200 ${
                        activeTab === 'list' 
                        ? 'border-b-2 border-blue-600 text-blue-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    View Issues
                </button>
                <button 
                    onClick={() => setActiveTab('create')}
                    className={`px-6 py-3 font-medium text-sm transition-colors duration-200 ${
                        activeTab === 'create' 
                        ? 'border-b-2 border-blue-600 text-blue-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Raise New Issue
                </button>
            </div>

            {/* --- THE TV SCREEN (Where the components render) --- */}
            <div className="mt-4">
                {/* This is React magic. It says: 
                    "If the clipboard says 'list', render the IssueList component. 
                    Otherwise, render the RaiseIssue component." 
                */}
                {activeTab === 'list' ? <IssueList /> : <RaiseIssue />}
            </div>

        </div>
    );
};

export default IssueDashboard;