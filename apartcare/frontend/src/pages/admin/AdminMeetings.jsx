import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios'; 

const AdminMeetings = () => {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        meeting_time: '',
        meeting_link: '',
        target_audience: 'ALL'
    });
    const [formStatus, setFormStatus] = useState({ error: '', message: '', loading: false });

    useEffect(() => {
        fetchMeetings();
    }, []);

    const fetchMeetings = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/meeting/meetings_list/');
            console.log("Fetched meetings:", res.data);
            setMeetings(res.data);
        } catch (error) {
            console.error("Error fetching meetings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormStatus({ error: '', message: '', loading: true });

        try {
            await axiosInstance.post('/meeting/meetings_list/', formData);
            setFormStatus({ error: '', message: 'Meeting scheduled successfully!', loading: false });
            
            // Refresh list and reset form
            fetchMeetings();
            setTimeout(() => {
                setShowModal(false);
                setFormData({ title: '', description: '', meeting_time: '', meeting_link: '', target_audience: 'ALL' });
                setFormStatus({ error: '', message: '', loading: false });
            }, 1500);

        } catch (error) {
            console.error("Failed to schedule", error);
            setFormStatus({ 
                error: error.response?.data?.detail || 'Failed to schedule meeting. Check your inputs.', 
                message: '', 
                loading: false 
            });
        }
    };

    // 🎯 Splitting logic: Upcoming vs History
    const now = new Date();
    const upcomingMeetings = meetings.filter(m => new Date(m.meeting_time) >= now);
    const pastMeetings = meetings.filter(m => new Date(m.meeting_time) < now).reverse(); // Reverse to show newest history first

    return (
        <div className="max-w-7xl p-6 mx-auto mt-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        Community Meetings
                    </h1>
                    <p className="mt-2 text-slate-400">Schedule video calls and maintain meeting history.</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-transform hover:-translate-y-1"
                >
                    + Schedule Meeting
                </button>
            </div>

            {loading ? (
                <div className="text-center text-slate-500 py-10">Loading meetings...</div>
            ) : (
                <div className="space-y-12">
                    
                    {/* --- UPCOMING MEETINGS --- */}
                    <section>
                        <h2 className="text-xl font-bold text-slate-200 mb-4 border-b border-slate-800 pb-2">Upcoming Meetings</h2>
                        {upcomingMeetings.length === 0 ? (
                            <div className="p-8 text-center border border-dashed border-slate-700 rounded-2xl text-slate-500">
                                No upcoming meetings scheduled.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {upcomingMeetings.map(meeting => (
                                    <MeetingCard key={meeting.id} meeting={meeting} isUpcoming={true} />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* --- MEETING HISTORY --- */}
                    <section>
                        <h2 className="text-xl font-bold text-slate-200 mb-4 border-b border-slate-800 pb-2">Meeting History</h2>
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

            {/* --- SCHEDULE MODAL --- */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-lg p-8 border shadow-2xl bg-slate-900 border-slate-700 rounded-2xl">
                        <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                            <h2 className="text-2xl font-bold text-slate-100">Schedule New Meeting</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-rose-400 text-2xl">&times;</button>
                        </div>

                        {formStatus.message && <div className="p-3 mb-4 text-sm rounded text-emerald-300 bg-emerald-500/10 border border-emerald-500/20">{formStatus.message}</div>}
                        {formStatus.error && <div className="p-3 mb-4 text-sm rounded text-rose-300 bg-rose-500/10 border border-rose-500/20">{formStatus.error}</div>}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Meeting Title</label>
                                <input required type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none" placeholder="e.g. Monthly Association Meeting" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Date & Time</label>
                                    <input required type="datetime-local" name="meeting_time" value={formData.meeting_time} onChange={handleInputChange} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Target Audience</label>
                                    <select name="target_audience" value={formData.target_audience} onChange={handleInputChange} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none">
                                        <option value="ALL">Everyone</option>
                                        <option value="RESIDENT">Residents Only</option>
                                        <option value="STAFF">Staff Only</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Video Call Link (Zoom/Meet)</label>
                                <input required type="url" name="meeting_link" value={formData.meeting_link} onChange={handleInputChange} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none" placeholder="https://meet.google.com/xyz-abc-def" />
                            </div>

                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Description (Optional)</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none" placeholder="Agenda or notes..."></textarea>
                            </div>

                            <button type="submit" disabled={formStatus.loading} className="w-full py-3 mt-4 font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg disabled:opacity-50 transition-colors">
                                {formStatus.loading ? 'Scheduling...' : 'Schedule Meeting'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Helper Component for the Meeting Cards ---
const MeetingCard = ({ meeting, isUpcoming }) => {
    // Format Date & Time cleanly
    const dateObj = new Date(meeting.meeting_time);
    const dateStr = dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    const timeStr = dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

    // Audience badges
    const audienceColors = {
        'ALL': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        'RESIDENT': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        'STAFF': 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    };

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 hover:border-slate-600 transition-colors flex flex-col h-full">
            <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-cyan-400">{dateStr}</span>
                    <span className="text-xs text-slate-400">{timeStr}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded border ${audienceColors[meeting.target_audience]}`}>
                    {meeting.target_audience}
                </span>
            </div>
            
            <h3 className="text-lg font-bold text-slate-200 mb-1">{meeting.title}</h3>
            <p className="text-sm text-slate-400 flex-1 line-clamp-2">{meeting.description || "No agenda provided."}</p>
            
            <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center">
                <div className="text-xs text-slate-500">
                    Host: <span className="text-slate-300">{meeting.organizer_name}</span>
                </div>
                {/* 🎯 Join Video Call Redirect Link */}
                <a 
                    href={meeting.meeting_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                        isUpcoming 
                        ? 'bg-green-600 hover:bg-green-500 text-white' 
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                    }`}
                >
                    {isUpcoming ? 'Join Call' : 'View Link'}
                </a>
            </div>
        </div>
    );
};

export default AdminMeetings;