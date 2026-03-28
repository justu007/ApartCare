

import React, { useState } from 'react';
import IssueList from './IssueList';
import RaiseIssue from './RaiseIssue'; 

const IssueDashboard = () => {
    const [activeTab, setActiveTab] = useState('list'); 

    return (
        <div className="max-w-6xl p-6 mx-auto mt-8">
            <div className="flex mb-6 border-b border-slate-800">
                <button 
                    onClick={() => setActiveTab('list')}
                    className={`px-6 py-3 font-medium text-sm transition-colors duration-200 ${
                        activeTab === 'list' 
                        ? 'border-b-2 border-cyan-500 text-cyan-400' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                    View Issues
                </button>
                <button 
                    onClick={() => setActiveTab('create')}
                    className={`px-6 py-3 font-medium text-sm transition-colors duration-200 ${
                        activeTab === 'create' 
                        ? 'border-b-2 border-cyan-500 text-cyan-400' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                    Raise New Issue
                </button>
            </div>
            <div className="mt-4">
                {activeTab === 'list' ? <IssueList /> : <RaiseIssue />}
            </div>
        </div>
    );
};

export default IssueDashboard;