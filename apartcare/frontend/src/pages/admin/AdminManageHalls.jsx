import React, { useState, useEffect } from 'react';
import { 
    getCommunityHalls, createCommunityHall, updateCommunityHall, 
    getAllHallBookings, updateBookingStatus 
} from '../..//Api/hallbooking'; 

const AdminManageHalls = () => {
    const [activeTab, setActiveTab] = useState('VENUES'); 
    const [popup, setPopup] = useState({ isOpen: false, status: '', message: '' });

    const [halls, setHalls] = useState([]);
    const [loadingHalls, setLoadingHalls] = useState(true);
    const [isHallModalOpen, setIsHallModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentHallId, setCurrentHallId] = useState(null);
    const [submittingHall, setSubmittingHall] = useState(false);
    
    const [hallFormData, setHallFormData] = useState({
        name: '', description: '', capacity: '', rent_per_seat: '', is_active: true, images: [] 
    });

    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerImages, setViewerImages] = useState([]);
    const [viewerIndex, setViewerIndex] = useState(0);

    // ==========================================
    // 2. BOOKINGS STATE & LOGIC
    // ==========================================
    const [bookings, setBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [bookingFilter, setBookingFilter] = useState('PENDING'); 
    const [actionModal, setActionModal] = useState({ isOpen: false, type: '', booking: null });
    const [remarks, setRemarks] = useState('');
    const [processingBooking, setProcessingBooking] = useState(false);

    // ==========================================
    // EFFECT HOOKS
    // ==========================================
    useEffect(() => {
        if (activeTab === 'VENUES') fetchHalls();
        if (activeTab === 'BOOKINGS') fetchBookings();
    }, [activeTab]);

    // Handle Hash for Image Viewer Back Button
    useEffect(() => {
        const handleHashChange = () => {
            if (window.location.hash !== '#gallery' && viewerOpen) {
                setViewerOpen(false);
            }
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [viewerOpen]);

    // ==========================================
    // VENUES FUNCTIONS
    // ==========================================
    const fetchHalls = async () => {
        setLoadingHalls(true);
        try {
            const data = await getCommunityHalls();
            setHalls(data);
        } catch (err) {
            console.error("Failed to load halls", err);
        } finally {
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
        setEditMode(false);
        setCurrentHallId(null);
        setHallFormData({ name: '', description: '', capacity: '', rent_per_seat: '', is_active: true, images: [] });
        setIsHallModalOpen(true);
    };

    const openEditModal = (hall) => {
        setEditMode(true);
        setCurrentHallId(hall.id);
        setHallFormData({
            name: hall.name, description: hall.description || '', capacity: hall.capacity,
            rent_per_seat: hall.rent_per_seat, is_active: hall.is_active, images: []
        });
        setIsHallModalOpen(true);
    };

    const openImageViewer = (images) => {
        if (!images || images.length === 0) return;
        setViewerImages(images);
        setViewerIndex(0);
        setViewerOpen(true);
        window.location.hash = 'gallery'; 
    };

    const closeImageViewer = () => {
        if (window.location.hash === '#gallery') window.history.back(); 
        else setViewerOpen(false);
    };

    const handleHallSubmit = async (e) => {
        e.preventDefault();
        setSubmittingHall(true);

        const submitData = new FormData();
        submitData.append('name', hallFormData.name);
        submitData.append('description', hallFormData.description);
        submitData.append('capacity', hallFormData.capacity);
        submitData.append('rent_per_seat', hallFormData.rent_per_seat); 
        submitData.append('is_active', hallFormData.is_active ? 'True' : 'False');
        hallFormData.images.forEach((image) => submitData.append('images', image));

        try {
            if (editMode) {
                await updateCommunityHall(currentHallId, submitData);
                setPopup({ isOpen: true, status: 'success', message: 'Hall updated successfully!' });
            } else {
                await createCommunityHall(submitData);
                setPopup({ isOpen: true, status: 'success', message: 'Hall added successfully!' });
            }
            setIsHallModalOpen(false);
            fetchHalls(); 
            setTimeout(() => setPopup({ isOpen: false, status: '', message: '' }), 3000);
        } catch (err) {
            setPopup({ isOpen: true, status: 'error', message: 'Failed to save hall. Please check inputs.' });
        } finally {
            setSubmittingHall(false);
        }
    };

    // ==========================================
    // BOOKINGS FUNCTIONS
    // ==========================================
    const fetchBookings = async () => {
        setLoadingBookings(true);
        try {
            const data = await getAllHallBookings();
            setBookings(data);
        } catch (err) {
            console.error("Failed to load bookings", err);
        } finally {
            setLoadingBookings(false);
        }
    };

    const handleBookingActionModal = (type, booking) => {
        setActionModal({ isOpen: true, type, booking });
        setRemarks(''); 
    };

    const handleUpdateBookingStatus = async () => {
        setProcessingBooking(true);
        try {
            await updateBookingStatus(actionModal.booking.id, actionModal.type, remarks);
            setPopup({ isOpen: true, status: 'success', message: `Booking ${actionModal.type.toLowerCase()} successfully!` });
            setActionModal({ isOpen: false, type: '', booking: null });
            fetchBookings();
            setTimeout(() => setPopup({ isOpen: false, status: '', message: '' }), 3000);
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.response?.data?.non_field_errors || "Failed to update booking status.";
            setPopup({ isOpen: true, status: 'error', message: errorMsg });
            setActionModal({ isOpen: false, type: '', booking: null });
        } finally {
            setProcessingBooking(false);
        }
    };

    const filteredBookings = bookingFilter === 'ALL' ? bookings : bookings.filter(b => b.status === bookingFilter);

    // ==========================================
    // RENDER
    // ==========================================
    return (
        <div className="max-w-7xl p-8 mx-auto mt-8">
            {/* Main Header */}
            <div className="flex flex-col items-start justify-between mb-8 md:flex-row md:items-center">
                <div>
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
                        Community Venues
                    </h1>
                    <p className="mt-2 text-slate-400">Manage physical halls and review resident booking requests.</p>
                </div>
                {activeTab === 'VENUES' && (
                    <button onClick={openCreateModal} className="px-6 py-3 mt-4 font-bold tracking-wider uppercase shadow-lg rounded-xl text-slate-900 bg-emerald-400 hover:bg-emerald-300 md:mt-0">
                        + Add New Hall
                    </button>
                )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-6 mb-8 border-b border-slate-800">
                <button onClick={() => setActiveTab('VENUES')} className={`pb-4 px-2 font-bold transition-colors relative ${activeTab === 'VENUES' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>
                    Manage Halls
                    {activeTab === 'VENUES' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></span>}
                </button>
                <button onClick={() => setActiveTab('BOOKINGS')} className={`pb-4 px-2 font-bold transition-colors relative ${activeTab === 'BOOKINGS' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>
                    Booking Requests
                    {activeTab === 'BOOKINGS' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></span>}
                </button>
            </div>

            {/* ========================================= */}
            {/* TAB 1: VENUES GRID                        */}
            {/* ========================================= */}
            {activeTab === 'VENUES' && (
                <div className="animate-fade-in">
                    {loadingHalls ? (
                        <div className="mt-20 text-xl font-semibold text-center text-slate-400">Loading Venues...</div>
                    ) : (
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {halls.length === 0 ? (
                                <div className="col-span-full p-10 text-center border-2 border-dashed rounded-3xl border-slate-700 text-slate-500">No halls created yet.</div>
                            ) : (
                                halls.map((hall) => (
                                    <div key={hall.id} className="overflow-hidden transition-all duration-300 border shadow-xl bg-slate-900/80 border-slate-800 rounded-3xl hover:border-emerald-500/30">
                                        <div className="relative h-48 cursor-pointer bg-slate-800 group" onClick={() => openImageViewer(hall.images)}>
                                            {hall.images && hall.images.length > 0 ? (
                                                <>
                                                    <img src={hall.images[0].image} alt={hall.name} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" />
                                                    {hall.images.length > 1 && (
                                                        <div className="absolute bottom-4 right-4 px-3 py-1 text-xs font-bold rounded-lg bg-black/60 text-white backdrop-blur-sm border border-white/20">
                                                            +{hall.images.length - 1} more
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-black/40 group-hover:opacity-100">
                                                        <span className="px-4 py-2 text-sm font-bold text-white rounded-full bg-black/60 backdrop-blur-md">View Gallery</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex items-center justify-center w-full h-full text-slate-600">No Image</div>
                                            )}
                                            <div className="absolute top-4 right-4 px-3 py-1 text-xs font-bold rounded-lg bg-slate-900/90 text-emerald-400 border border-emerald-500/20">
                                                ₹{hall.rent_per_seat} / Seat
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <h3 className="mb-2 text-xl font-bold text-slate-200">{hall.name}</h3>
                                            <p className="mb-4 text-sm line-clamp-2 text-slate-400">{hall.description}</p>
                                            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                                <span className="text-sm font-semibold text-slate-300">Cap: {hall.capacity}</span>
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-2 py-1 text-xs font-bold rounded ${hall.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                                        {hall.is_active ? 'Active' : 'Closed'}
                                                    </span>
                                                    <button onClick={() => openEditModal(hall)} className="p-2 text-cyan-400 transition-colors rounded-lg bg-cyan-500/10 hover:bg-cyan-500 hover:text-white">
                                                        Edit
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ========================================= */}
            {/* TAB 2: BOOKINGS TABLE                     */}
            {/* ========================================= */}
            {activeTab === 'BOOKINGS' && (
                <div className="animate-fade-in">
                    {/* Filter Tabs for Bookings */}
                    <div className="flex gap-4 mb-6 border-b border-slate-800">
                        {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((tab) => (
                            <button key={tab} onClick={() => setBookingFilter(tab)} className={`pb-4 px-4 font-bold transition-colors relative ${bookingFilter === tab ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>
                                {tab}
                                {bookingFilter === tab && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></span>}
                            </button>
                        ))}
                    </div>

                    {loadingBookings ? (
                        <div className="mt-20 text-xl font-semibold text-center text-slate-400">Loading Requests...</div>
                    ) : (
                        <div className="overflow-hidden border shadow-2xl bg-slate-900 border-slate-800 rounded-3xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-xs tracking-wider uppercase border-b text-slate-400 border-slate-800 bg-slate-900/80">
                                            <th className="p-5 font-bold">Resident</th>
                                            <th className="p-5 font-bold">Venue</th>
                                            <th className="p-5 font-bold">Date & Time</th>
                                            <th className="p-5 font-bold">Purpose</th>
                                            <th className="p-5 font-bold text-center">Status</th>
                                            <th className="p-5 font-bold text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {filteredBookings.length === 0 ? (
                                            <tr><td colSpan={6} className="p-10 text-center text-slate-500">No {bookingFilter.toLowerCase()} requests found.</td></tr>
                                        ) : (
                                            filteredBookings.map((booking) => (
                                                <tr key={booking.id} className="transition-colors hover:bg-slate-800/40">
                                                    <td className="p-5">
                                                        <p className="font-bold text-slate-200">{booking.resident_name}</p>
                                                        <p className="text-xs text-slate-500">Flat: {booking.flat_name}</p>
                                                    </td>
                                                    <td className="p-5 font-semibold text-slate-300">{booking.hall_name}</td>
                                                    <td className="p-5 text-sm text-slate-400">
                                                        {booking.booking_date} <br/> 
                                                        <span className="text-xs text-emerald-400/70">{booking.start_time.slice(0,5)} - {booking.end_time.slice(0,5)}</span>
                                                    </td>
                                                    <td className="p-5 text-sm text-slate-300">{booking.purpose}</td>
                                                    <td className="p-5 text-center">
                                                        <span className={`px-3 py-1 text-xs font-bold tracking-wider rounded border 
                                                            ${booking.status === 'APPROVED' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 
                                                            booking.status === 'REJECTED' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 
                                                            'text-amber-400 bg-amber-500/10 border-amber-500/20'}`}>
                                                            {booking.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-5 text-center">
                                                        {booking.status === 'PENDING' ? (
                                                            <div className="flex justify-center gap-2">
                                                                <button onClick={() => handleBookingActionModal('APPROVED', booking)} className="px-3 py-1.5 text-xs font-bold text-slate-900 transition-colors bg-emerald-400 rounded hover:bg-emerald-300">
                                                                    Approve
                                                                </button>
                                                                <button onClick={() => handleBookingActionModal('REJECTED', booking)} className="px-3 py-1.5 text-xs font-bold text-white transition-colors bg-rose-500 rounded hover:bg-rose-600">
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-slate-500 italic">{booking.admin_remarks || 'No remarks'}</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}


            {isHallModalOpen && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-lg overflow-hidden border shadow-2xl bg-slate-900 rounded-3xl border-slate-700">
                        <div className="px-8 py-6 border-b border-slate-800 bg-slate-800/30">
                            <h2 className="text-2xl font-black text-slate-200">{editMode ? 'Edit Hall Details' : 'Add New Hall'}</h2>
                        </div>
                        <form onSubmit={handleHallSubmit} className="p-8 space-y-5">
                            <div>
                                <label className="block mb-2 text-sm font-bold text-slate-400">Hall Name</label>
                                <input type="text" name="name" required value={hallFormData.name} onChange={handleHallTextChange} className="w-full p-3 border outline-none bg-slate-800 border-slate-700 text-slate-200 rounded-xl" />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-bold text-slate-400">Description</label>
                                <textarea name="description" rows="2" value={hallFormData.description} onChange={handleHallTextChange} className="w-full p-3 border outline-none bg-slate-800 border-slate-700 text-slate-200 rounded-xl"></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block mb-2 text-sm font-bold text-slate-400">Capacity</label>
                                    <input type="number" name="capacity" required value={hallFormData.capacity} onChange={handleHallTextChange} className="w-full p-3 border outline-none bg-slate-800 border-slate-700 text-slate-200 rounded-xl" />
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-bold text-slate-400">Rent Per Seat (₹)</label>
                                    <input type="number" name="rent_per_seat" required value={hallFormData.rent_per_seat} onChange={handleHallTextChange} className="w-full p-3 border outline-none bg-slate-800 border-slate-700 text-slate-200 rounded-xl" />
                                </div>
                            </div>
                            {editMode && (
                                <div className="flex items-center gap-3 p-4 border rounded-xl border-slate-700 bg-slate-800/50">
                                    <input type="checkbox" name="is_active" id="is_active" checked={hallFormData.is_active} onChange={handleHallTextChange} className="w-5 h-5 accent-emerald-500" />
                                    <label htmlFor="is_active" className="text-sm font-bold text-slate-300">Hall is Active & Open for Booking</label>
                                </div>
                            )}
                            <div>
                                <label className="block mb-2 text-sm font-bold text-slate-400">
                                    {editMode ? 'Add More Images (Optional)' : 'Hall Images (Upload Multiple)'}
                                </label>
                                <input type="file" multiple accept="image/*" onChange={handleHallImageChange} className="w-full p-2 text-sm border bg-slate-800 border-slate-700 text-slate-400 rounded-xl file:bg-emerald-500/10 file:text-emerald-400 file:border-0 file:mr-4 file:py-2 file:px-4 file:rounded-lg" />
                            </div>
                            <div className="flex gap-4 pt-4 mt-6 border-t border-slate-800">
                                <button type="button" onClick={() => setIsHallModalOpen(false)} className="w-1/2 py-3 font-bold border text-slate-300 border-slate-700 bg-slate-800 rounded-xl">Cancel</button>
                                <button type="submit" disabled={submittingHall} className="w-1/2 py-3 font-bold text-slate-900 bg-emerald-400 rounded-xl disabled:opacity-50">
                                    {submittingHall ? 'Saving...' : (editMode ? 'Update Hall' : 'Save Hall')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 2. Approve/Reject Booking Modal */}
            {actionModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-md overflow-hidden border shadow-2xl bg-slate-900 rounded-3xl border-slate-700">
                        <div className={`px-8 py-6 border-b border-slate-800 ${actionModal.type === 'APPROVED' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                            <h2 className={`text-2xl font-black ${actionModal.type === 'APPROVED' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                Confirm {actionModal.type === 'APPROVED' ? 'Approval' : 'Rejection'}
                            </h2>
                        </div>
                        <div className="p-8">
                            <p className="mb-4 text-slate-300">
                                You are about to <strong className={actionModal.type === 'APPROVED' ? 'text-emerald-400' : 'text-rose-400'}>{actionModal.type.toLowerCase()}</strong> the booking for <strong>{actionModal.booking.hall_name}</strong> by {actionModal.booking.resident_name}.
                            </p>
                            <label className="block mb-2 text-sm font-bold tracking-wide text-slate-400">Admin Remarks (Optional)</label>
                            <textarea 
                                rows="3" value={remarks} onChange={(e) => setRemarks(e.target.value)} 
                                placeholder={actionModal.type === 'REJECTED' ? "Reason for rejection..." : "Any notes for the resident..."}
                                className="w-full p-3 transition-colors border outline-none bg-slate-800 border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500" 
                            ></textarea>
                            <div className="flex gap-4 pt-4 mt-6">
                                <button onClick={() => setActionModal({ isOpen: false, type: '', booking: null })} className="w-1/2 py-3 font-bold border text-slate-300 border-slate-700 bg-slate-800 rounded-xl">Cancel</button>
                                <button onClick={handleUpdateBookingStatus} disabled={processingBooking} className={`w-1/2 py-3 font-bold rounded-xl disabled:opacity-50 text-slate-900 ${actionModal.type === 'APPROVED' ? 'bg-emerald-400 hover:bg-emerald-300' : 'bg-rose-500 text-white hover:bg-rose-600'}`}>
                                    {processingBooking ? 'Processing...' : `Confirm ${actionModal.type}`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. Image Gallery Viewer */}
            {viewerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fade-in">
                    <button onClick={closeImageViewer} className="absolute p-2 text-white transition-colors top-6 right-6 hover:text-rose-400 bg-white/10 rounded-xl backdrop-blur-md">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                    <div className="relative flex items-center justify-center w-full max-w-5xl h-[80vh]">
                        {viewerImages.length > 1 && (
                            <button onClick={() => setViewerIndex(prev => prev === 0 ? viewerImages.length - 1 : prev - 1)} className="absolute left-0 p-4 text-white transition-transform -translate-y-1/2 rounded-full top-1/2 bg-black/50 hover:bg-black hover:scale-110 backdrop-blur-md">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path></svg>
                            </button>
                        )}
                        <img src={viewerImages[viewerIndex].image} alt="Gallery" className="object-contain max-w-full max-h-full rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)]" />
                        {viewerImages.length > 1 && (
                            <button onClick={() => setViewerIndex(prev => prev === viewerImages.length - 1 ? 0 : prev + 1)} className="absolute right-0 p-4 text-white transition-transform -translate-y-1/2 rounded-full top-1/2 bg-black/50 hover:bg-black hover:scale-110 backdrop-blur-md">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
                            </button>
                        )}
                        <div className="absolute px-4 py-2 text-sm font-bold text-white -bottom-12 rounded-xl bg-white/10 backdrop-blur-md">
                            Image {viewerIndex + 1} of {viewerImages.length}
                        </div>
                    </div>
                </div>
            )}

            {/* 4. Universal Notification Popup */}
            {popup.isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                    <div className={`relative w-full max-w-sm p-8 text-center border shadow-2xl rounded-3xl bg-slate-900 ${popup.status === 'success' ? 'border-emerald-500/30' : 'border-rose-500/30'}`}>
                        <h3 className={`text-2xl font-black mb-2 ${popup.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {popup.status === 'success' ? 'Success!' : 'Oops!'}
                        </h3>
                        <p className="mb-6 text-slate-300">{popup.message}</p>
                        <button onClick={() => setPopup({ isOpen: false, status: '', message: '' })} className={`w-full py-3 font-bold rounded-xl ${popup.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManageHalls;