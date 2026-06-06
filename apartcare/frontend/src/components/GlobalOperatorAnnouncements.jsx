import React, { useEffect, useState } from 'react';
import { getSuperAdminAnnouncements } from '../api/superadmin';

const GlobalOperatorAnnouncements = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSuperAdminAnnouncements()
            .then(data => { setNotices(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-10 text-center text-slate-500 font-medium animate-pulse">Establishing communication links...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 mt-8 text-slate-200">
            <div className="mb-6">
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                    🛡️ Official System Platform Updates
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Policy directives and service notices issued directly from ApartCare SaaS operators.</p>
            </div>

            {notices.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-slate-800 text-slate-500 rounded-xl italic">
                    No operator-level system notices logged on current workspace terminal.
                </div>
            ) : (
                <div className="space-y-4">
                    {notices.map(n => (
                        <div key={n.id} className="p-5 bg-gradient-to-b from-slate-900 to-slate-950/80 border border-slate-800 rounded-xl relative overflow-hidden shadow-lg">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>
                            <div className="flex justify-between items-center gap-4 border-b border-slate-800 pb-2 mb-3">
                                <h4 className="font-bold text-slate-100 text-base">{n.title}</h4>
                                <span className="text-[10px] text-slate-500 font-mono font-medium">{n.created_at}</span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">{n.content}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GlobalOperatorAnnouncements;
