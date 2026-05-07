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
        <div className="max-w-7xl p-6 mx-auto mt-8">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                    Community Meetings
                </h1>
                <p className="mt-2 text-slate-400">View upcoming events and join live video calls.</p>
            </div>

            {loading ? (
                <div className="text-center text-slate-500 py-10">Loading your meetings...</div>
            ) : (
                <div className="space-y-12">
                    {/* UPCOMING */}
                    <section>
                        <h2 className="text-xl font-bold text-slate-200 mb-4 border-b border-slate-800 pb-2">Upcoming Events</h2>
                        {upcomingMeetings.length === 0 ? (
                            <div className="p-8 text-center border border-dashed border-slate-700 rounded-2xl text-slate-500">
                                You have no upcoming meetings scheduled.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {upcomingMeetings.map(meeting => (
                                    <MeetingCard key={meeting.id} meeting={meeting} isUpcoming={true} />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* HISTORY */}
                    <section>
                        <h2 className="text-xl font-bold text-slate-200 mb-4 border-b border-slate-800 pb-2">Past Meetings</h2>
                        {pastMeetings.length === 0 ? (
                            <div className="p-8 text-center border border-dashed border-slate-700 rounded-2xl text-slate-500">
                                No past meetings found.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75">
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

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 flex flex-col h-full hover:border-cyan-500/30 transition-colors">
            <div className="flex flex-col mb-3">
                <span className="text-sm font-bold text-cyan-400">{dateStr}</span>
                <span className="text-xs text-slate-400">{timeStr}</span>
            </div>
            
            <h3 className="text-lg font-bold text-slate-200 mb-1">{meeting.title}</h3>
            <p className="text-sm text-slate-400 flex-1">{meeting.description || "No agenda provided."}</p>
            
            <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center">
                <div className="text-xs text-slate-500">
                    Host: <span className="text-slate-300">{meeting.organizer_name}</span>
                </div>
                <a 
                    href={meeting.meeting_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                        isUpcoming 
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white shadow-lg' 
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                    }`}
                >
                    {isUpcoming ? 'Join Call' : 'View Link'}
                </a>
            </div>
        </div>
    );
};

export default UserMeetings;