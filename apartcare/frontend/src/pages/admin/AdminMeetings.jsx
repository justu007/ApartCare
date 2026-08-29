

import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../api/axios'; 

const AdminMeetings = () => {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    const [expandedMeetingId, setExpandedMeetingId] = useState(null);
    const [uploadingId, setUploadingId] = useState(null);
    const fileInputRef = useRef(null);

    const [alertWindow, setAlertWindow] = useState({ show: false, message: '', type: 'success' });

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

    const triggerAlert = (message, type = 'success') => {
        setAlertWindow({ show: true, message, type });
        setTimeout(() => {
            setAlertWindow({ show: false, message: '', type: 'success' });
        }, 3500);
    };

    const fetchMeetings = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/meeting/meetings_list/');
            setMeetings(res.data);
        } catch (error) {
            console.error("Error fetching meetings", error);
            triggerAlert("Failed to fetch community meetings from the server.", "error");
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
            
            fetchMeetings();
            triggerAlert("New meeting scheduled and added successfully!");
            
            setTimeout(() => {
                setShowModal(false);
                setFormData({ title: '', description: '', meeting_time: '', meeting_link: '', target_audience: 'ALL' });
                setFormStatus({ error: '', message: '', loading: false });
            }, 1500);

        } catch (error) {
            console.error("Failed to schedule", error);
            const errorMsg = error.response?.data?.detail || 'Failed to schedule meeting. Check your inputs.';
            setFormStatus({ error: errorMsg, message: '', loading: false });
            triggerAlert(errorMsg, "error");
        }
    };

    const toggleAccordion = (id) => {
        setExpandedMeetingId(expandedMeetingId === id ? null : id);
    };

    const handleFileChange = async (event, meetingId) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploadingId(meetingId);
        const uploadData = new FormData();
        uploadData.append('attendance_file', file);

        try {
            await axiosInstance.post(`/meeting/${meetingId}/upload-attendance/`, uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            triggerAlert("Attendance log processed and saved successfully!", "success");
            fetchMeetings(); 
        } catch (error) {
            console.error("Upload failed", error);
            triggerAlert("Failed to upload attendance. Ensure the file layout is a valid CSV.", "error");
        } finally {
            setUploadingId(null);
            if (fileInputRef.current) fileInputRef.current.value = ""; 
        }
    };


    const now = new Date();
    const upcomingMeetings = meetings.filter(m => new Date(m.meeting_time) >= now);
    const pastMeetings = meetings.filter(m => new Date(m.meeting_time) < now).reverse();

    return (
        /* 🎯 ULTRA-WIDESCREEN FLUID MATRIX CANVAS */
        <div className="w-full max-w-full px-6 lg:px-12 mx-auto space-y-10 animate-fade-in pb-12">
            
            {/* Status Feedback Popup Modal System */}
            {alertWindow.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className={`max-w-md w-full p-8 rounded-3xl border shadow-2xl bg-slate-900 flex flex-col items-center text-center ${
                        alertWindow.type === 'success' 
                        ? 'border-emerald-500/30 text-emerald-400 shadow-emerald-950/40' 
                        : 'border-rose-500/30 text-rose-400 shadow-rose-950/40'
                    }`}>
                        <div className={`p-3 rounded-full mb-4 ${alertWindow.type === 'success' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                            {alertWindow.type === 'success' ? (
                                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                            ) : (
                                <svg className="w-8 h-8 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                            )}
                        </div>
                        <h3 className="font-black text-xl text-slate-100">{alertWindow.type === 'success' ? 'Operation Completed' : 'Process Exception'}</h3>
                        <p className="text-sm text-slate-400 mt-2 max-w-sm leading-relaxed">{alertWindow.message}</p>
                        <button onClick={() => setAlertWindow({ show: false, message: '', type: 'success' })} className={`mt-6 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-slate-950 ${alertWindow.type === 'success' ? 'bg-emerald-400 hover:bg-emerald-300' : 'bg-rose-400 hover:bg-rose-300'}`}>Dismiss Window</button>
                    </div>
                </div>
            )}

            {/* Top Operational Title Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 tracking-tight">
                        Community Video Briefings
                    </h1>
                    <p className="mt-1 text-xs text-slate-400 font-mono tracking-wide">Schedule digital operational rooms and manage attendance logs.</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="px-6 py-3 font-black tracking-widest text-xs uppercase shadow-lg rounded-xl text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 transform hover:-translate-y-0.5 transition-all shrink-0"
                >
                    + Schedule New Session
                </button>
            </div>

            {loading ? (
                <div className="min-h-[40vh] flex items-center justify-center text-xs font-black font-mono text-slate-500 animate-pulse">SYNCHRONIZING DIGITAL BRIEFING INFRASTRUCTURE...</div>
            ) : (
                <div className="space-y-12">
                    
                    {/* --- UPCOMING ROOMS SECTION --- */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-800/80 pb-2.5">
                            <h2 className="text-xl font-black text-slate-200 tracking-wide">Active Scheduled Sessions</h2>
                            {upcomingMeetings.length > 0 && (
                                <span className="px-2.5 py-0.5 text-[10px] font-black font-mono tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full uppercase animate-pulse">
                                    {upcomingMeetings.length} Open
                                </span>
                            )}
                        </div>
                        {upcomingMeetings.length === 0 ? (
                            <div className="p-12 text-center border border-dashed border-slate-800 bg-slate-900/10 rounded-2xl text-slate-500 font-mono text-xs italic">
                                No active conference channels scheduled on current telemetry timeline.
                            </div>
                        ) : (
                            /* Widescreen Card Grid layout */
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {upcomingMeetings.map(meeting => (
                                    <MeetingCard key={meeting.id} meeting={meeting} isUpcoming={true} />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* --- HISTORY & ACCORDION ATTENDANCE TRACKER SECTION --- */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-black text-slate-400 border-b border-slate-800 pb-2.5">Past Records Archive & Attendance Logs</h2>
                        {pastMeetings.length === 0 ? (
                            <div className="p-12 text-center border border-dashed border-slate-800 bg-slate-900/10 rounded-2xl text-slate-500 font-mono text-xs italic">
                                No historical meeting timelines found inside registry blocks.
                            </div>
                        ) : (
                            <div className="space-y-4 w-full">
                                {pastMeetings.map((meeting) => {
                                    const rawTime = meeting.meeting_time;
                                    const isoString = (typeof rawTime === 'string' && !rawTime.endsWith('Z') && !rawTime.includes('+')) 
                                        ? `${rawTime}Z` 
                                        : rawTime;

                                    const dateObj = new Date(isoString);
                                    const dateStr = dateObj.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
                                    const timeStr = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
                                        
                                    return (
                                        <div key={meeting.id} className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:border-slate-800 transition-all group">
                                            
                                            {/* Accordion Master Row Trigger Line */}
                                            <div 
                                                className="p-5 flex flex-wrap md:flex-nowrap items-center justify-between cursor-pointer bg-slate-900/20 hover:bg-slate-800/20 transition-colors gap-4"
                                                onClick={() => toggleAccordion(meeting.id)}
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-base font-black text-slate-200 block truncate group-hover:text-cyan-400 transition-colors">{meeting.title}</h3>
                                                    <p className="text-xs text-slate-500 font-mono mt-1">📅 {dateStr} — ⏱️ {timeStr}</p>
                                                </div>
                                                
                                                <div className="flex items-center gap-6 shrink-0">
                                                    <div className="text-right">
                                                        <p className="text-2xl font-black text-cyan-400 font-mono">{meeting.attendees?.length || 0}</p>
                                                        <p className="text-[9px] uppercase tracking-widest text-slate-500 font-black">Logged Attendees</p>
                                                    </div>
                                                    <svg className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${expandedMeetingId === meeting.id ? 'rotate-180 text-cyan-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
                                                    </svg>
                                                </div>
                                            </div>

                                            {/* Expanded inner container data grid block */}
                                            {expandedMeetingId === meeting.id && (
                                                <div className="p-6 border-t border-slate-800/80 bg-slate-950/20 space-y-6 animate-fade-in">
                                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-800 pb-3">
                                                        <div>
                                                            <h4 className="font-black text-xs uppercase tracking-widest text-slate-400">Resident Presence Database</h4>
                                                            <p className="text-[11px] font-mono text-slate-500 mt-0.5">Upload a raw Google Meet participation CSV sheet to map tracking durations automatically.</p>
                                                        </div>
                                                        
                                                        <div className="shrink-0 relative">
                                                            <input 
                                                                type="file" accept=".csv" className="hidden" 
                                                                id={`csv-upload-${meeting.id}`}
                                                                onChange={(e) => handleFileChange(e, meeting.id)}
                                                                ref={fileInputRef}
                                                            />
                                                            <label 
                                                                htmlFor={`csv-upload-${meeting.id}`}
                                                                className={`px-4 py-2 text-xs font-black tracking-widest uppercase rounded-xl cursor-pointer transition-all border flex items-center gap-2 shadow-lg ${uploadingId === meeting.id ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-slate-900 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/5'}`}
                                                            >
                                                                {uploadingId === meeting.id ? 'Compiling CSV Matrix...' : '📁 Ingest Meet CSV Log'}
                                                            </label>
                                                        </div>
                                                    </div>

                                                    {/* Nested Attendance Grid Map */}
                                                    {meeting.attendees && meeting.attendees.length > 0 ? (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                                                            {meeting.attendees.map((user, idx) => (
                                                                <div key={idx} className="flex items-center gap-3.5 p-3 bg-slate-950/30 rounded-xl border border-slate-800/60">
                                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-950 to-slate-900 flex items-center justify-center text-cyan-400 text-sm font-black border border-cyan-500/10 shrink-0">
                                                                        {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="text-xs font-black text-slate-200 truncate block">{user.name}</p>
                                                                        {user.duration_minutes !== undefined && <p className="text-[10px] font-mono text-emerald-400 font-bold mt-0.5">Duration: {user.duration_minutes} mins</p>}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-8 text-xs text-slate-600 font-mono italic bg-slate-950/20 rounded-xl border border-dashed border-slate-800">
                                                            No verified tracking data bound to this instance. Parse a Google Meet spreadsheet to sync logs.
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>
            )}

            {/* --- CORE PARAMETER INPUT CREATION FORM OVERLAY MODAL --- */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="w-full max-w-xl border bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
                        <div className="px-8 py-5 border-b border-slate-800 bg-slate-950/20 flex justify-between items-center">
                            <h2 className="text-base font-black uppercase tracking-widest text-slate-200">Initialize Briefing Room</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-rose-400 font-bold text-xl">&times;</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-4 text-xs font-bold">
                            {formStatus.message && <div className="p-3 text-xs border font-mono rounded-xl text-emerald-400 bg-emerald-500/10 border-emerald-500/20">{formStatus.message}</div>}
                            {formStatus.error && <div className="p-3 text-xs border font-mono rounded-xl text-rose-400 bg-rose-500/10 border-rose-500/20">{formStatus.error}</div>}

                            <div>
                                <label className="block text-[10px] font-black tracking-widest text-slate-500 uppercase mb-1">Session / Briefing Title</label>
                                <input required type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full p-3 border outline-none bg-slate-950 border-slate-800 text-slate-200 rounded-xl focus:border-cyan-500" placeholder="e.g. Annual Budget Allocation Voting" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black tracking-widest text-slate-500 uppercase mb-1">Execution Date & Time</label>
                                    <input required type="datetime-local" name="meeting_time" value={formData.meeting_time} onChange={handleInputChange} className="w-full p-3 font-mono border outline-none bg-slate-950 border-slate-800 text-slate-200 rounded-xl focus:border-cyan-500 cursor-pointer [color-scheme:dark]" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black tracking-widest text-slate-500 uppercase mb-1">Target Audience Scope</label>
                                    <select name="target_audience" value={formData.target_audience} onChange={handleInputChange} className="w-full p-3 border outline-none bg-slate-950 border-slate-800 text-slate-200 rounded-xl cursor-pointer focus:border-cyan-500">
                                        <option value="ALL">Everyone (Global Inhabitants)</option>
                                        <option value="RESIDENT">Residents Track Only</option>
                                        <option value="STAFF">Maintenance Staff Networks</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black tracking-widest text-slate-500 uppercase mb-1">Video Conferencing Proxy Endpoint URL</label>
                                <input required type="url" name="meeting_link" value={formData.meeting_link} onChange={handleInputChange} className="w-full p-3 font-mono border outline-none bg-slate-950 border-slate-800 text-slate-200 rounded-xl focus:border-cyan-500" placeholder="https://meet.google.com/xyz-abc-def" />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black tracking-widest text-slate-500 uppercase mb-1">Agenda / Tactical Briefing</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full p-3 font-sans font-normal text-sm border outline-none bg-slate-950 border-slate-800 text-slate-200 rounded-xl focus:border-cyan-500 resize-none leading-relaxed" placeholder="Map out conference checklist data here..." />
                            </div>

                            <div className="flex gap-4 pt-4 mt-6 border-t border-slate-800">
                                <button type="button" onClick={() => setShowModal(false)} className="w-1/2 py-3 border text-slate-400 border-slate-800 bg-slate-950/40 rounded-xl">Cancel Request</button>
                                <button type="submit" disabled={formStatus.loading} className="w-1/2 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 uppercase tracking-wider rounded-xl shadow-lg shadow-cyan-950/40">
                                    {formStatus.loading ? 'Deploying...' : 'Deploy Room Link'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const MeetingCard = ({ meeting, isUpcoming }) => {
    const rawTime = meeting?.meeting_time;
    const dateObj = rawTime ? new Date(rawTime) : new Date();

    const dateStr = dateObj.toLocaleDateString('en-IN', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });

    const timeStr = dateObj.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });

    const audienceColors = {
        'ALL': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        'RESIDENT': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        'STAFF': 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    };

    return (
        <div className="bg-slate-900/40 border border-slate-800/90 rounded-2xl p-6 hover:border-cyan-500/30 transition-all flex flex-col justify-between h-full shadow-2xl relative group overflow-hidden">
            <div className="absolute top-0 left-0 h-full w-0.5 bg-cyan-500/20 group-hover:bg-cyan-500 transition-colors"></div>
            <div>
                <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-800/60 w-full">
                    <div className="flex flex-col">
                        <span className="text-base font-black text-cyan-400 font-mono tracking-tight">{dateStr}</span>
                        <span className="text-xs text-slate-400 font-mono mt-0.5">{timeStr}</span>
                    </div>
                    <span className={`text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded border uppercase font-mono ${audienceColors[meeting?.target_audience] || 'border-slate-800 text-slate-400'}`}>
                        {meeting?.target_audience || 'ALL'}
                    </span>
                </div>
                
                <h3 className="text-lg lg:text-xl font-black text-slate-100 group-hover:text-cyan-400 transition-colors tracking-wide mb-2 line-clamp-1">{meeting?.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans line-clamp-3 mb-6 whitespace-pre-wrap font-medium">
                    {meeting?.description || "No agenda specification sheet provided for this digital room line."}
                </p>
            </div>
            
            <div className="mt-auto pt-4 border-t border-slate-800/60 flex justify-between items-center text-xs">
                <div className="text-slate-500 font-sans">
                    Host Organizer: <span className="text-slate-300 font-bold">{meeting?.organizer_name || 'Administrator'}</span>
                </div>
                
                <a 
                    href={meeting?.meeting_link || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase transition-all flex items-center gap-1.5 transform hover:-translate-y-0.5 ${
                        isUpcoming 
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold shadow-lg shadow-green-950/40' 
                        : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium'
                    }`}
                >
                    {isUpcoming ? (
                        <>
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                            Join Call Room
                        </>
                    ) : 'View Link'}
                </a>
            </div>
        </div>
    );
};
export default AdminMeetings;