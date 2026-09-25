
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios'; 

const UserMeetings = () => {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                const res = await axiosInstance.get('/meeting/meetings_list/');
                setMeetings(res.data);
            } catch (error) {
                console.error("Error fetching meetings", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMeetings();
    }, []);

    const now = new Date();
    const upcomingMeetings = meetings.filter(m => new Date(m.meeting_time) >= now);
    const pastMeetings = meetings.filter(m => new Date(m.meeting_time) < now).reverse();

    return (
        /* 🎯 PREMIUM WIDESCREEN CANVAS WRAPPER CONTAINER */
        <div className="w-full max-w-full px-6 lg:px-12 mx-auto space-y-10 animate-fade-in">
            
            {/* Header Module Meta Info Section */}
            <div className="border-b border-slate-800 pb-6">
                <h1 className="text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400">
                    Community Meetings Dashboard
                </h1>
                <p className="mt-2 text-sm text-slate-400 font-sans">
                    Monitor upcoming events, view agenda items, and launch secure video conferencing terminals.
                </p>
            </div>

            {loading ? (
                <div className="min-h-[40vh] flex items-center justify-center text-base font-bold text-slate-500 font-mono animate-pulse">
                    SYNCHRONIZING MEETING QUEUE NODES...
                </div>
            ) : (
                <div className="space-y-12">
                    
                    {/* --- UPCOMING MEETINGS LAYER SECMENT --- */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 border-b border-slate-800 pb-2.5">
                            <h2 className="text-xl font-black text-slate-200">Upcoming Events</h2>
                            {upcomingMeetings.length > 0 && (
                                <span className="px-2.5 py-0.5 text-[10px] font-black font-mono tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full uppercase animate-pulse">
                                    {upcomingMeetings.length} Active
                                </span>
                            )}
                        </div>
                        
                        {upcomingMeetings.length === 0 ? (
                            <div className="p-12 text-center border border-dashed border-slate-800 bg-slate-900/10 rounded-2xl text-slate-500 font-sans italic text-sm">
                                No upcoming briefing sessions scheduled on current network timeline.
                            </div>
                        ) : (
                            /* Widescreen Responsive Card Grid */
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {upcomingMeetings.map(meeting => (
                                    <MeetingCard key={meeting.id} meeting={meeting} isUpcoming={true} />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* --- HISTORICAL PAST MEETINGS LAYER SECTION --- */}
                    <section className="space-y-4">
                        <div className="border-b border-slate-800 pb-2.5">
                            <h2 className="text-xl font-black text-slate-400">Past Archives Directory</h2>
                        </div>
                        
                        {pastMeetings.length === 0 ? (
                            <div className="p-12 text-center border border-dashed border-slate-800 bg-slate-900/10 rounded-2xl text-slate-500 font-sans italic text-sm">
                                No historical meeting cycles recorded inside database registries.
                            </div>
                        ) : (
                            /* Grid layout with light opacity drop styling for archive elements */
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 opacity-65 hover:opacity-85 transition-opacity duration-300">
                                {pastMeetings.map(meeting => (
                                    <MeetingCard key={meeting.id} meeting={meeting} isUpcoming={false} />
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
};

const MeetingCard = ({ meeting, isUpcoming }) => {
    const dateObj = new Date(meeting.meeting_time);
    const dateStr = dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    const timeStr = dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

    // Target badge styling mapped dynamically based on message audiences
    const targetAudienceBadges = {
        'ALL': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        'RESIDENT': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        'STAFF': 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    };

    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between h-full hover:border-cyan-500/30 transition-all shadow-xl group">
            <div>
                {/* Upper Metadata Block */}
                <div className="flex items-start justify-between mb-4 pb-3 border-b border-slate-800/60">
                    <div className="flex flex-col">
                        <span className="text-sm font-black text-cyan-400 font-mono">{dateStr}</span>
                        <span className="text-xs text-slate-400 font-mono mt-0.5">{timeStr}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {meeting.is_urgent && isUpcoming && (
                            <span className="px-2 py-0.5 text-[9px] font-black tracking-widest bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded uppercase font-mono animate-pulse">
                                URGENT
                            </span>
                        )}
                        <span className={`text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded border uppercase font-mono ${targetAudienceBadges[meeting.target_audience] || 'border-slate-800 text-slate-400'}`}>
                            {meeting.target_audience}
                        </span>
                    </div>
                </div>
                
                {/* Content Block */}
                <h3 className="text-lg font-black text-slate-200 tracking-wide mb-2 block group-hover:text-cyan-400 transition-colors">{meeting.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans line-clamp-3 mb-6 whitespace-pre-wrap">
                    {meeting.description || "No tactical brief or operational agenda outline logged for this session node."}
                </p>
            </div>
            
            {/* Bottom Actions Row Footer */}
            <div className="mt-auto pt-4 border-t border-slate-800/60 flex justify-between items-center text-xs">
                <div className="text-slate-500 font-sans">
                    Host: <span className="text-slate-300 font-bold">{meeting.organizer_name || 'System Operator'}</span>
                </div>
                
                <a 
                    href={meeting.meeting_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase transition-all duration-200 transform hover:-translate-y-0.5 outline-none flex items-center gap-1.5 ${
                        isUpcoming 
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold shadow-lg shadow-green-950/40' 
                        : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium'
                    }`}
                >
                    {isUpcoming ? (
                        <>
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                            Join Room Call
                        </>
                    ) : 'View Link'}
                </a>
            </div>
        </div>
    );
};

export default UserMeetings;