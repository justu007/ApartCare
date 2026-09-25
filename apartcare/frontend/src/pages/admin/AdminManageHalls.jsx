
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getCommunityHalls, createCommunityHall, updateCommunityHall, getAllHallBookings, updateBookingStatus } from '../..//Api/hallbooking'; 

const AdminManageHalls = () => {
    const location = useLocation();
    const passedTab = location.state?.defaultTab;

    const [activeTab, setActiveTab] = useState(passedTab ? 'BOOKINGS' : 'VENUES'); 
    const [popup, setPopup] = useState({ isOpen: false, status: '', message: '' });

    const [halls, setHalls] = useState([]);
    const [loadingHalls, setLoadingHalls] = useState(true);
    const [isHallModalOpen, setIsHallModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentHallId, setCurrentHallId] = useState(null);
    const [submittingHall, setSubmittingHall] = useState(false);
    
    const [hallFormData, setHallFormData] = useState({
        name: '', description: '', capacity: '', rent_per_seat: '', is_active: true, ac_room:'true', images: [] 
    });

    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerImages, setViewerImages] = useState([]);
    const [viewerIndex, setViewerIndex] = useState(0);

    const [bookings, setBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [bookingFilter, setBookingFilter] = useState(passedTab === 'CONFIRMED' ? 'APPROVED' : 'PENDING');
    const [actionModal, setActionModal] = useState({ isOpen: false, type: '', booking: null });
    const [remarks, setRemarks] = useState('');
    const [processingBooking, setProcessingBooking] = useState(false);

    useEffect(() => {
        if (activeTab === 'VENUES') fetchHalls();
        if (activeTab === 'BOOKINGS') fetchBookings();
    }, [activeTab]);

    useEffect(() => {
        const handleHashChange = () => {
            if (window.location.hash !== '#gallery' && viewerOpen) setViewerOpen(false);
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [viewerOpen]);

    const fetchHalls = async () => {
        setLoadingHalls(true);
        try {
            const data = await getCommunityHalls(); setHalls(data);
        } catch (err) { 
            console.error(err);
            setPopup({
                isOpen: true,
                status: 'error',
                message: err.response?.data?.error || "Failed to fetch halls"
            }); 

        } 
          finally {
             setLoadingHalls(false); 
        }
    };

    const handleHallTextChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setHallFormData({ ...hallFormData, [e.target.name]: value });
    };

    const handleHallImageChange = (e) => {
        setHallFormData({ ...hallFormData, images: Array.from(e.target.files) });
    };

    const openCreateModal = () => {
        setEditMode(false); setCurrentHallId(null);
        setHallFormData({ name: '', description: '', capacity: '', rent_per_seat: '', is_active: true, images: [] });
        setIsHallModalOpen(true);
    };

    const openEditModal = (hall) => {
        setEditMode(true); setCurrentHallId(hall.id);
        setHallFormData({
            name: hall.name, description: hall.description || '', capacity: hall.capacity, rent_per_seat: hall.rent_per_seat, is_active: hall.is_active, images: []
        });
        setIsHallModalOpen(true);
    };

    const openImageViewer = (images) => {
        if (!images || images.length === 0) return;
        setViewerImages(images); setViewerIndex(0); setViewerOpen(true); window.location.hash = 'gallery'; 
    };

    const closeImageViewer = () => {
        if (window.location.hash === '#gallery') window.history.back(); else setViewerOpen(false);
    };

    const handleHallSubmit = async (e) => {
        e.preventDefault(); setSubmittingHall(true);
        const submitData = new FormData();
        submitData.append('name', hallFormData.name); 
        submitData.append('description', hallFormData.description);
        submitData.append('capacity', hallFormData.capacity); 
        submitData.append('rent_per_seat', hallFormData.rent_per_seat); 
        submitData.append('is_active', hallFormData.is_active ? 'True' : 'False');
        submitData.append('ac_room',hallFormData.ac_room === true? 'AC':'NON_AC')
        hallFormData.images.forEach((image) => submitData.append('images', image));

        try {
            if (editMode) await updateCommunityHall(currentHallId, submitData);
            else await createCommunityHall(submitData);
            setPopup({ isOpen: true, status: 'success', message: 'Hall saved successfully!' });
            setIsHallModalOpen(false); fetchHalls(); 
            setTimeout(() => setPopup({ isOpen: false, status: '', message: '' }), 3000);
        } catch (err) {
            setPopup({ isOpen: true, status: 'error', message: 'Failed to save hall parameters.' });
        } finally { setSubmittingHall(false); }
    };

    const fetchBookings = async () => {
        setLoadingBookings(true);
        try { const data = await getAllHallBookings(); setBookings(data); } catch (err) { console.error(err); } finally { setLoadingBookings(false); }
    };

    const handleBookingActionModal = (type, booking) => { setActionModal({ isOpen: true, type, booking }); setRemarks(''); };

    const handleUpdateBookingStatus = async () => {
        setProcessingBooking(true);
        try {
            await updateBookingStatus(actionModal.booking.id, actionModal.type, remarks);
            setPopup({ isOpen: true, status: 'success', message: `Booking processed successfully!` });
            setActionModal({ isOpen: false, type: '', booking: null }); fetchBookings();
            setTimeout(() => setPopup({ isOpen: false, status: '', message: '' }), 3000);
        } catch (err) {
            setPopup({ isOpen: true, status: 'error', message: 'Validation mismatch on transaction.' });
        } finally { setProcessingBooking(false); }
    };

    const filteredBookings = bookingFilter === 'ALL' ? bookings : bookings.filter(b => b.status === bookingFilter);

    return (
        <div className="w-full max-w-full px-6 lg:px-12 mx-auto space-y-6 animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
                <div>
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-400 tracking-tight">Community Venues & Hall Desk</h1>
                    {/* <p className="mt-1 text-xs text-slate-400 font-mono">Moderate structure facilities, inspect floor assets, and moderate layout booking logs.</p> */}
                </div>
                {activeTab === 'VENUES' && (
                    <button onClick={openCreateModal} className="px-5 py-2.5 text-xs font-black tracking-widest uppercase shadow-lg rounded-xl text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-500 hover:opacity-95 transform hover:-translate-y-0.5 transition-all">+ Add Halls</button>
                )}
            </div>

            <div className="flex gap-4 border-b border-slate-800 bg-slate-950/20 p-1 rounded-t-xl">
                <button onClick={() => setActiveTab('VENUES')} className={`pb-3 pt-2 px-4 text-xs font-black tracking-widest uppercase transition-all relative ${activeTab === 'VENUES' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>🏢 Halls Available{activeTab === 'VENUES' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400 shadow-[0_0_10px_#10b981]"></span>}</button>
                <button onClick={() => setActiveTab('BOOKINGS')} className={`pb-3 pt-2 px-4 text-xs font-black tracking-widest uppercase transition-all relative ${activeTab === 'BOOKINGS' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>📬 Hall Requests{activeTab === 'BOOKINGS' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400 shadow-[0_0_10px_#10b981]"></span>}</button>
            </div>

            {activeTab === 'VENUES' && (
                <div className="w-full">
                    {loadingHalls ? (
                        <div className="text-center font-mono py-12 text-xs text-slate-500 animate-pulse">Querying structural complex blocks map...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {halls.length === 0 ? (
                                <div className="col-span-full p-12 text-center border border-dashed rounded-2xl border-slate-800 font-mono text-slate-500 text-xs">No physical facility tokens registered inside this building core index.</div>
                            ) : halls.map((hall) => (
                                <div key={hall.id} className="overflow-hidden border bg-slate-900/40 border-slate-800 rounded-2xl flex flex-col justify-between hover:border-slate-700 shadow-xl group">
                                    <div className="relative h-48 cursor-pointer bg-slate-950 overflow-hidden" onClick={() => openImageViewer(hall.images)}>
                                        {hall.images?.length > 0 ? (
                                            <>
                                                <img src={hall.images[0].image} alt={hall.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                                                {hall.images.length > 1 && <div className="absolute bottom-3 right-3 px-2 py-0.5 text-[9px] font-bold rounded bg-slate-950/80 border border-slate-800 text-white font-mono">+{hall.images.length - 1} PHOTOS</div>}
                                            </>
                                        ) : <div className="flex items-center justify-center h-full text-slate-700 text-xs font-mono uppercase">Asset Image Missing</div>}
                                        <div className="absolute top-3 left-3 px-2.5 py-0.5 text-[10px] font-black font-mono rounded-lg bg-slate-950/90 text-emerald-400 border border-slate-800 shadow-md">₹{hall.rent_per_seat} / Seat</div>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                        <div>
                                            <h3 className="text-lg font-black text-slate-200 tracking-wide">{hall.name}</h3>
                                            <p className="text-xs text-slate-400 leading-relaxed font-sans line-clamp-2 mt-1">{hall.description}</p>
                                            <p className="text-xs text-slate-400 leading-relaxed font-sans line-clamp-2 mt-1">{hall.ac_room}</p>
                                        </div>
                                        <div className="flex justify-between items-center pt-3 border-t border-slate-800/60 text-xs">
                                            <span className="font-mono text-slate-500 font-bold">Capacity Node: <span className="text-slate-300 font-black">{hall.capacity}</span></span>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 text-[9px] font-black tracking-widest uppercase rounded border ${hall.is_active ? 'text-emerald-400 bg-emerald-500/5 border-emerald-500/20' : 'text-rose-400 bg-rose-500/5 border-rose-500/20'}`}>{hall.is_active ? 'Operational' : 'Decommissioned'}</span>
                                                <button onClick={() => openEditModal(hall)} className="px-3 py-1 font-bold rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]">Configure</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'BOOKINGS' && (
                <div className="w-full space-y-4">
                    <div className="flex gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none whitespace-nowrap">
                        {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((tab) => (
                            <button key={tab} onClick={() => setBookingFilter(tab)} className={`px-4 py-1 text-xs font-black tracking-widest uppercase border rounded-xl transition-all ${bookingFilter === tab ? 'border-emerald-500 bg-emerald-500/5 text-emerald-300' : 'border-slate-800 bg-slate-950/20 text-slate-500 hover:text-slate-300'}`}>{tab}</button>
                        ))}
                    </div>
                    {loadingBookings ? (
                        <div className="text-center font-mono py-12 text-xs text-slate-500 animate-pulse">Querying reservation ledgers...</div>
                    ) : (
                        <div className="border border-slate-800 shadow-2xl bg-slate-900/30 rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="text-[11px] tracking-widest uppercase border-b text-slate-400 border-slate-800/80 bg-slate-900/80 font-black">
                                            <th className="p-4">Resident Client Node</th>
                                            <th className="p-4">Facility Venue Asset</th>
                                            <th className="p-4">Execution Time Window</th>
                                            <th className="p-4">Function Purpose Description</th>
                                            <th className="p-4 text-center">Lifecycle Status</th>
                                            <th className="p-4 text-center">Triage Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/40 font-medium">
                                        {filteredBookings.length === 0 ? (
                                            <tr><td colSpan="6" className="p-10 text-center text-slate-500 font-mono italic">No reservation records registered matching this filtering category layer.</td></tr>
                                        ) : filteredBookings.map((booking) => (
                                            <tr key={booking.id} className="hover:bg-slate-800/20 transition-colors">
                                                <td className="p-4">
                                                    <p className="font-bold text-slate-200">{booking.resident_name}</p>
                                                    <span className="text-[10px] font-mono text-slate-500 block mt-0.5">Unit Flat: {booking.flat_name}</span>
                                                </td>
                                                <td className="p-4 font-bold text-slate-300">{booking.hall_name}</td>
                                                <td className="p-4 text-xs font-mono text-slate-400">
                                                    <span>📅 {booking.booking_date}</span>
                                                    <span className="text-emerald-400 block font-bold mt-0.5">⏱️ {booking.start_time.slice(0,5)} - {booking.end_time.slice(0,5)}</span>
                                                </td>
                                                <td className="p-4 text-xs text-slate-300 leading-relaxed max-w-xs truncate">{booking.purpose}</td>
                                                <td className="p-4 text-center">
                                                    <span className={`px-2.5 py-0.5 text-[10px] font-black tracking-widest uppercase rounded border inline-block
                                                        ${booking.status === 'APPROVED' ? 'text-emerald-400 bg-emerald-500/5 border-emerald-500/20' : 
                                                          booking.status === 'REJECTED' ? 'text-rose-400 bg-rose-500/5 border-rose-500/20' : 
                                                          'text-amber-400 bg-amber-500/5 border-amber-500/20'}`}>{booking.status}</span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    {booking.status === 'PENDING' ? (
                                                        <div className="flex justify-center gap-1.5">
                                                            <button onClick={() => handleBookingActionModal('APPROVED', booking)} className="px-2.5 py-1 text-[10px] font-black tracking-wider uppercase bg-emerald-400 text-slate-950 rounded hover:opacity-90">Approve</button>
                                                            <button onClick={() => handleBookingActionModal('REJECTED', booking)} className="px-2.5 py-1 text-[10px] font-black tracking-wider uppercase bg-rose-600 text-white rounded hover:opacity-90">Reject</button>
                                                        </div>
                                                    ) : <span className="text-xs text-slate-500 italic font-sans">{booking.admin_remarks || 'Logged — Verified'}</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ACTION CONFIRMATION SUB-MODAL LAYER OVERLAY CONTAINER */}
            {actionModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="w-full max-w-md overflow-hidden border shadow-2xl bg-slate-900 rounded-2xl border-slate-800">
                        <div className={`px-6 py-4 border-b border-slate-800 ${actionModal.type === 'APPROVED' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                            <h2 className={`text-lg font-black tracking-wider uppercase ${actionModal.type === 'APPROVED' ? 'text-emerald-400' : 'text-rose-400'}`}>Confirm Triage Run: {actionModal.type}</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-xs text-slate-300 leading-relaxed font-sans">You are modifying authorization keys for reservation record belonging to <strong>{actionModal.booking.resident_name}</strong> on asset <strong>{actionModal.booking.hall_name}</strong>.</p>
                            <div>
                                <label className="block text-[9px] font-black tracking-widest text-slate-500 uppercase mb-1">Administrative Remarks / Logs</label>
                                <textarea rows="3" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Provide optional notes or verification parameters..." className="w-full p-2.5 text-xs border outline-none bg-slate-950 border-slate-800 text-slate-200 rounded-xl focus:border-cyan-500 resize-none font-sans" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setActionModal({ isOpen: false, type: '', booking: null })} className="w-1/2 py-2.5 text-xs font-bold border text-slate-400 border-slate-800 bg-slate-950/40 rounded-xl">Discard Run</button>
                                <button onClick={handleUpdateBookingStatus} disabled={processingBooking} className={`w-1/2 py-2.5 text-xs font-black tracking-widest uppercase rounded-xl text-slate-950 disabled:opacity-30 ${actionModal.type === 'APPROVED' ? 'bg-emerald-400' : 'bg-rose-500 text-white'}`}>{processingBooking ? 'Processing...' : 'Commit Run'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* HALL EDIT/ADD INFRASTRUCTURE INPUT FORM SHEET OVERLAY */}
            {isHallModalOpen && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="w-full max-w-lg border bg-slate-900 border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="p-5 border-b border-slate-800 bg-slate-950/20">
                            <h2 className="text-base font-black uppercase tracking-widest text-slate-200">{editMode ? 'Modify Venue Parameters' : 'Add Facility Asset Asset'}</h2>
                        </div>
                        <form onSubmit={handleHallSubmit} className="p-6 space-y-4 text-xs font-bold">
                            <div>
                                <label className="block mb-1 text-slate-500 uppercase tracking-wide">Facility  Name</label>
                                <input type="text" name="name" required value={hallFormData.name} onChange={handleHallTextChange} className="w-full p-2.5 border outline-none bg-slate-950 border-slate-800 text-slate-200 rounded-xl focus:border-emerald-500" />
                            </div>
                            <div>
                                <label className="block mb-1 text-slate-500 uppercase tracking-wide"> Description</label>
                                <textarea name="description" rows="3" value={hallFormData.description} onChange={handleHallTextChange} className="w-full p-2.5 border outline-none bg-slate-950 border-slate-800 text-slate-200 rounded-xl focus:border-emerald-500 font-normal font-sans leading-relaxed resize-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1 text-slate-500 uppercase tracking-wide">Head Count Capacity</label>
                                    <input type="number" name="capacity" required value={hallFormData.capacity} onChange={handleHallTextChange} className="w-full p-2.5 border outline-none bg-slate-950 border-slate-800 text-slate-200 rounded-xl font-mono text-sm focus:border-emerald-500" />
                                </div>
                                <div>
                                    <label className="block mb-1 text-slate-500 uppercase tracking-wide">Rent Prize / Seat (₹)</label>
                                    <input type="number" name="rent_per_seat" required value={hallFormData.rent_per_seat} onChange={handleHallTextChange} className="w-full p-2.5 border outline-none bg-slate-950 border-slate-800 text-slate-200 rounded-xl font-mono text-sm focus:border-emerald-500" />
                                </div>
                                {/* <div>
                                    <label className="block mb-1 text-slate-500 uppercase tracking-wide">A/C or non A/C (₹)</label>
                                    <input type="text" name="ac_room" required value={hallFormData.ac_room} onChange={handleHallTextChange} className="w-full p-2.5 border outline-none bg-slate-950 border-slate-800 text-slate-200 rounded-xl font-mono text-sm focus:border-emerald-500" />
                                </div> */}
                                <div>
                                    <label className="block mb-1 text-slate-500 uppercase tracking-wide">Air Conditioning</label>
                                    <select name="ac_room" value={hallFormData.ac_room} onChange={(e)=>setHallFormData({...hallFormData,ac_room:e.target.value === 'true'})} className="w-full p-2.5 border outline-none bg-slate-950 border-slate-800 text-slate-200 rounded-xl font-mono text-sm focus:border-emerald-500" > 
                                        <option value="true">A/C</option>
                                        <option value="false">NON_AC</option>
                                    </select>
                                </div>
                            </div>
                            {editMode && (
                                <div className="flex items-center gap-3 p-3 border rounded-xl border-slate-800 bg-slate-950/40">
                                    <input type="checkbox" name="is_active" id="is_active" checked={hallFormData.is_active} onChange={handleHallTextChange} className="w-4 h-4 accent-emerald-500 cursor-pointer" />
                                    <label htmlFor="is_active" className="text-slate-300 cursor-pointer">Activate</label>
                                </div>
                            )}
                            <div>
                                <label className="block mb-1 text-slate-500 uppercase">Upload  Photos</label>
                                <input type="file" multiple accept="image/*" onChange={handleHallImageChange} className="w-full p-1.5 border bg-slate-950 border-slate-800 text-slate-500 rounded-xl file:bg-emerald-500/10 file:text-emerald-400 file:border-0 file:mr-3 file:py-1 file:px-3 file:rounded file:text-[11px] file:font-black file:tracking-wider file:uppercase" />
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-slate-800 mt-5">
                                <button type="button" onClick={() => setIsHallModalOpen(false)} className="w-1/2 py-2.5 border text-slate-400 border-slate-800 bg-slate-950/40 rounded-xl">Cancel</button>
                                <button type="submit" disabled={submittingHall} className="w-1/2 py-2.5 text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl shadow-md">{submittingHall ? 'Creating...' : 'Create Hall'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* GALL MODULE GALLERY VIEWER SUB LAYER MODAL */}
            {viewerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fade-in">
                    <button onClick={closeImageViewer} className="absolute p-2 text-white transition-colors top-6 right-6 hover:text-rose-400 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">✕ Close</button>
                    <div className="relative flex items-center justify-center w-full max-w-4xl h-[75vh]">
                        {viewerImages.length > 1 && <button onClick={() => setViewerIndex(p => p === 0 ? viewerImages.length - 1 : p - 1)} className="absolute left-0 p-3 text-white rounded-full bg-black/60 border border-slate-800 hover:scale-105 backdrop-blur-md">◀</button>}
                        <img src={viewerImages[viewerIndex].image} alt="Gallery view item" className="object-contain max-w-full max-h-full rounded-xl shadow-2xl" />
                        {viewerImages.length > 1 && <button onClick={() => setViewerIndex(p => p === viewerImages.length - 1 ? 0 : p + 1)} className="absolute right-0 p-3 text-white rounded-full bg-black/60 border border-slate-800 hover:scale-105 backdrop-blur-md">▶</button>}
                    </div>
                </div>
            )}
            {popup.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                    <div className={`relative w-full max-w-sm p-8 text-center transition-all transform border shadow-2xl rounded-3xl bg-slate-900 ${popup.status === 'success' ? 'border-emerald-500/30 shadow-emerald-900/20' : 'border-rose-500/30 shadow-rose-900/20'}`}>
                        <div className={`flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full border-4 ${popup.status === 'success' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-rose-500/10 border-rose-500 text-rose-400'}`}>
                            {popup.status === 'success' ? (
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </div>
                        <h3 className={`text-2xl font-black mb-2 ${popup.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {popup.status === 'success' ? 'Success!' : 'Oops!'}
                        </h3>
                        <p className="mb-8 text-sm leading-relaxed text-slate-300">{popup.message}</p>
                        <button 
                            onClick={() => setPopup({ isOpen: false, status: '', message: '' })} 
                            className={`w-full py-3.5 font-bold tracking-widest uppercase transition-all duration-300 transform rounded-xl border border-transparent hover:-translate-y-0.5 ${popup.status === 'success' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-slate-900 hover:shadow-[0_0_20px_rgba(52,211,153,0.4)]' : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white hover:shadow-[0_0_20px_rgba(244,63,94,0.4)]'}`}
                        >
                            {popup.status === 'success' ? 'Awesome' : 'Close'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManageHalls;