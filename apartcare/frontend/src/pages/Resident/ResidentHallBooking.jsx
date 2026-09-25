import React, { useState, useEffect } from 'react';
import { getCommunityHalls, getHallAvailability, createResidentBooking, getResidentBookings, initiateHallPayment, verifyHallPayment } from '../../api/hallbooking';

const ResidentHallBooking = () => {
    const [activeTab, setActiveTab] = useState('VENUES'); 
    
    const [halls, setHalls] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [selectedHall, setSelectedHall] = useState(null);
    const [bookedSlots, setBookedSlots] = useState([]); 
    const [formData, setFormData] = useState({
        booking_date: '',
        start_time: '',
        end_time: '',
        purpose: '',
        attendees: '' 
    });
    
    const [submitting, setSubmitting] = useState(false);
    const [popup, setPopup] = useState({ isOpen: false, status: '', message: '' });

    useEffect(() => { fetchAllData(); }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [hallsData, historyData] = await Promise.all([
                getCommunityHalls(),
                getResidentBookings()
            ]);
            setHalls(hallsData);
            setMyBookings(historyData);
        } catch (err) {
            console.error("Failed to load data", err);
            setPopup({
                isOpen: true,
                status: 'error',
                message: err.response?.data?.error || err.response?.data?.detail || 'Failed to load your assigned tasks.'
            });

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedHall && formData.booking_date) checkAvailability();
    }, [formData.booking_date, selectedHall]);

    const checkAvailability = async () => {
        try {
            const dateObj = new Date(formData.booking_date);
            const data = await getHallAvailability(selectedHall.id, dateObj.getMonth() + 1, dateObj.getFullYear());
            setBookedSlots(data.booked_slots?.filter(b => b.booking_date === formData.booking_date) || []);
        } catch (err) {
            setPopup({
                isOpen: true,
                status: 'error',
                message: err.response?.data?.error || err.response?.data?.detail || 'Failed to load your assigned tasks.'
            });
        }
    };

    const handleSelectHall = (hall) => {
        setSelectedHall(hall);
        setFormData({ booking_date: '', start_time: '', end_time: '', purpose: '', attendees: '' });
        setBookedSlots([]);
        setActiveTab('BOOKING_FORM');
    };

    const handleTextChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const calculatedTotal = formData.attendees && selectedHall ? (parseInt(formData.attendees) * selectedHall.rent_per_seat).toFixed(2) : '0.00';

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (parseInt(formData.attendees) > selectedHall.capacity) {
            setPopup({ isOpen: true, status: 'error', message: `This venue can only hold a maximum of ${selectedHall.capacity} people.` });
            return;
        }

        setSubmitting(true);

        try {
            const payload = {
                hall: selectedHall.id, 
                purpose: formData.purpose,
                booking_date: formData.booking_date,
                start_time: formData.start_time,
                end_time: formData.end_time,
                attendees: parseInt(formData.attendees),
                total_amount: parseFloat(calculatedTotal) 
            };

            await createResidentBooking(payload);
            
            setPopup({ isOpen: true, status: 'success', message: 'Booking requested successfully! Pending Admin approval.' });
            
            const updatedHistory = await getResidentBookings();
            setMyBookings(updatedHistory);
            setActiveTab('HISTORY');
            
            setTimeout(() => setPopup({ isOpen: false, status: '', message: '' }), 4000);
        } catch (err) {
            setPopup({ isOpen: true, status: 'error', message: err.response?.data?.error || 'Failed to submit booking request.' });
        } finally {
            setSubmitting(false);
        }
    };

    const handlePayment = async (booking) => {
        try {
            setPopup({ isOpen: true, status: 'loading', message: 'Initializing secure checkout...' });
            const orderData = await initiateHallPayment(booking.id);
            setPopup({ isOpen: false, status: '', message: '' }); 

            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: "INR",
                name: "ApartCare Venues",
                description: `Booking for ${booking.hall_name}`,
                order_id: orderData.razorpay_order_id, 
                handler: async function (response) {
                    setPopup({ isOpen: true, status: 'loading', message: 'Verifying payment and updating ledger...' });
                    try {
                        await verifyHallPayment({
                            booking_id: booking.id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        setPopup({ isOpen: true, status: 'success', message: 'Payment successful! Receipt added to ledger.' });
                        fetchAllData(); 
                        setTimeout(() => setPopup({ isOpen: false, status: '', message: '' }), 4000);
                    } catch (verifyErr) {
                        setPopup({ isOpen: true, status: 'error', message: verifyErr.response?.data?.error || 'Payment verification failed. Please contact admin.' });
                    }
                },
                theme: { color: "#06b6d4" }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response){
                setPopup({ isOpen: true, status: 'error', message: response.error.description });
            });
            rzp.open();
        } catch (err) {
            setPopup({ isOpen: true, status: 'error', message: err.response?.data?.error || 'Could not initiate payment.' });
        }
    };

    if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-xs font-black font-mono text-slate-500 animate-pulse">SYNCHRONIZING COMPLEX VENUES...</div>;

    return (
        <div className="w-full max-w-full px-6 lg:px-12 mx-auto space-y-6 animate-fade-in pb-12">
            
            <div>
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 tracking-tight">
                    Resident Venues Booking Panel
                </h1>
                <p className="mt-1 text-xs text-slate-400 font-mono">Browse compound structural halls, evaluate live slots availability, and execute payments.</p>
            </div>

            <div className="flex gap-4 border-b border-slate-800 bg-slate-950/20 p-1 rounded-t-xl">
                <button onClick={() => { setActiveTab('VENUES'); setSelectedHall(null); }} className={`pb-3 pt-2 px-4 text-xs font-black tracking-widest uppercase transition-all relative ${activeTab === 'VENUES' || activeTab === 'BOOKING_FORM' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}>
                    🏢 Spatial Asset Venues
                    {(activeTab === 'VENUES' || activeTab === 'BOOKING_FORM') && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 shadow-[0_0_10px_#06b6d4]"></span>}
                </button>
                <button onClick={() => setActiveTab('HISTORY')} className={`pb-3 pt-2 px-4 text-xs font-black tracking-widest uppercase transition-all relative ${activeTab === 'HISTORY' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}>
                    📜 My Booking History Ledgers
                    {activeTab === 'HISTORY' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 shadow-[0_0_10px_#06b6d4]"></span>}
                </button>
            </div>

            {activeTab === 'VENUES' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
                    {halls.map((hall) => (
                        <div key={hall.id} className="overflow-hidden border bg-slate-900/40 border-slate-800/90 rounded-2xl flex flex-col justify-between h-full hover:border-slate-700 shadow-xl group">
                            <div className="relative h-48 bg-slate-950 overflow-hidden">
                                {hall.images && hall.images.length > 0 ? (
                                    <img src={hall.images[0].image} alt={hall.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                                ) : <div className="flex items-center justify-center h-full text-slate-700 text-xs font-mono uppercase">Asset Photo Unassigned</div>}
                                <div className="absolute top-3 right-3 px-2.5 py-0.5 text-[10px] font-black font-mono rounded-lg bg-slate-950/90 text-cyan-400 border border-slate-800 shadow-md">₹{hall.rent_per_seat} / Seat</div>
                            </div>
                            <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-lg font-black text-slate-200 tracking-wide group-hover:text-cyan-400 transition-colors">{hall.name}</h3>
                                    <p className="text-xs text-slate-400 font-sans leading-relaxed mt-1 line-clamp-2">{hall.description}</p>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs">
                                    <span className="font-mono text-slate-500 font-bold">Max Capacity: <span className="text-slate-300 font-black">{hall.capacity}</span></span>
                                    <button onClick={() => handleSelectHall(hall)} className="px-4 py-1.5 font-black tracking-wider uppercase bg-cyan-500 text-slate-950 text-[11px] rounded-xl hover:opacity-90">Verify & Book</button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {halls.length === 0 && <div className="col-span-full p-12 text-center border border-dashed rounded-2xl border-slate-800 font-mono text-slate-500 text-xs">No active building facility assets logged under this complex community scope.</div>}
                </div>
            )}

            {activeTab === 'BOOKING_FORM' && selectedHall && (
                <div className="max-w-3xl mx-auto border shadow-2xl bg-slate-900/40 border-slate-800/90 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md animate-fade-in">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500"></div>
                    
                    <div className="flex items-center gap-4 pb-4 border-b border-slate-800 mb-6">
                        <button onClick={() => setActiveTab('VENUES')} className="p-2 transition-colors border border-slate-800 bg-slate-950/40 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white">←</button>
                        <div>
                            <h2 className="text-xl font-black text-slate-200">Initialize Reservation: {selectedHall.name}</h2>
                            <p className="text-[10px] font-mono text-slate-400 mt-0.5 uppercase">Unit Space Rate: ₹{selectedHall.rent_per_seat} / Seat Capacity</p>
                        </div>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-5 text-xs font-bold">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block mb-1 text-[10px] font-black tracking-widest text-slate-500 uppercase">Purpose of Booking</label>
                                <input type="text" name="purpose" required value={formData.purpose} onChange={handleTextChange} placeholder="e.g., Marriage Ceremony Reception" className="w-full p-3 border outline-none bg-slate-950 border-slate-800 text-slate-200 rounded-xl focus:border-cyan-500" />
                            </div>
                            <div>
                                <label className="block mb-1 text-[10px] font-black tracking-widest text-slate-500 uppercase">Expected Invitees Count</label>
                                <input type="number" name="attendees" required min="1" max={selectedHall.capacity} value={formData.attendees} onChange={handleTextChange} placeholder={`Max limit ${selectedHall.capacity} occupants`} className="w-full p-3 border outline-none bg-slate-950 border-slate-800 text-slate-200 rounded-xl focus:border-cyan-500 font-mono text-sm" />
                            </div>
                        </div>

                        <div>
                            <label className="block mb-1 text-[10px] font-black tracking-widest text-slate-500 uppercase">Target Selection Date</label>
                            <input type="date" name="booking_date" required min={new Date().toISOString().split('T')[0]} value={formData.booking_date} onChange={handleTextChange} className="w-full p-3 border outline-none bg-slate-950 border-slate-800 text-slate-200 rounded-xl focus:border-cyan-500 font-mono [color-scheme:dark]" />
                        </div>

                        {formData.booking_date && (
                            <div className="p-4 border rounded-xl bg-slate-950/40 border-slate-800 space-y-2">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Availability Array Log Check: {formData.booking_date}</h4>
                                {bookedSlots.length === 0 ? (
                                    <p className="text-emerald-400 font-black text-[11px] font-mono">🟢 SCHEDULE NODE OPTIMIZED: Entire operating window is clear for booking.</p>
                                ) : (
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] text-amber-500">⚠️ Conflicting reservation cells detected on same timeline link:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {bookedSlots.map((slot, i) => (
                                                <span key={i} className="px-2.5 py-1 text-[10px] font-mono font-bold border border-rose-900/30 rounded-lg bg-rose-500/5 text-rose-300">
                                                    🔒 {slot.start_time.slice(0,5)} - {slot.end_time.slice(0,5)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block mb-1 text-[10px] font-black tracking-widest text-slate-500 uppercase">Start Time Window</label>
                                <input type="time" name="start_time" required value={formData.start_time} onChange={handleTextChange} className="w-full p-3 border outline-none bg-slate-950 border-slate-800 text-slate-200 rounded-xl focus:border-cyan-500 font-mono [color-scheme:dark]" />
                            </div>
                            <div>
                                <label className="block mb-1 text-[10px] font-black tracking-widest text-slate-500 uppercase">End Time Window</label>
                                <input type="time" name="end_time" required value={formData.end_time} onChange={handleTextChange} className="w-full p-3 border outline-none bg-slate-950 border-slate-800 text-slate-200 rounded-xl focus:border-cyan-500 font-mono [color-scheme:dark]" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-5 border border-cyan-500/20 bg-cyan-500/5 rounded-xl shadow-lg shadow-cyan-950/20">
                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Aggregated Cost Allocation Estimate:</span>
                            <span className="text-2xl font-black font-mono text-cyan-400">₹ {Number(calculatedTotal).toLocaleString('en-IN', {minimumFractionDigits:2})}</span>
                        </div>

                        <div className="pt-4 border-t border-slate-800/80">
                            <button type="submit" disabled={submitting} className="w-full py-4 text-xs font-black tracking-widest uppercase text-slate-950 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:opacity-95 shadow-lg disabled:opacity-30">
                                {submitting ? 'Transmitting Request Parameters...' : 'Deploy Booking Request'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === 'HISTORY' && (
                <div className="border border-slate-800 shadow-2xl bg-slate-900/30 rounded-2xl overflow-hidden backdrop-blur-md animate-fade-in">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="text-[11px] tracking-widest uppercase border-b text-slate-400 border-slate-800/80 bg-slate-900/80 font-black">
                                    <th className="p-4">Venue Specification Asset</th>
                                    <th className="p-4">Scheduled Window</th>
                                    <th className="p-4">Triage Status</th>
                                    <th className="p-4 text-right">Invoice Total</th>
                                    <th className="p-4 text-center">Payment Link Node</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40 font-medium">
                                {myBookings.length === 0 ? (
                                    <tr><td colSpan={5} className="p-10 text-center text-slate-500 font-mono italic">No reservation log sessions initialized under your profile token.</td></tr>
                                ) : myBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-slate-800/20 transition-colors">
                                        <td className="p-4">
                                            <p className="font-bold text-slate-200 text-base">{booking.hall_name}</p>
                                            <span className="text-[10px] font-mono text-slate-400 block mt-0.5 uppercase tracking-wide">{booking.purpose} • ({booking.attendees} Occupants)</span>
                                        </td>
                                        <td className="p-4 text-xs font-mono text-slate-400">
                                            <span>📅 {booking.booking_date}</span>
                                            <span className="text-slate-500 block font-bold mt-0.5">⏱️ {booking.start_time.slice(0,5)} - {booking.end_time.slice(0,5)}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 text-[10px] font-black tracking-widest uppercase rounded border inline-block
                                                ${booking.status === 'APPROVED' ? 'text-emerald-400 bg-emerald-500/5 border-emerald-500/20' : 
                                                  booking.status === 'REJECTED' ? 'text-rose-400 bg-rose-500/5 border-rose-500/20' : 
                                                  'text-amber-400 bg-amber-500/5 border-amber-500/20'}`}>{booking.status}</span>
                                            {booking.admin_remarks && <p className="mt-1.5 text-[11px] italic font-sans text-slate-500 font-normal">Message: "{booking.admin_remarks}"</p>}
                                        </td>
                                        <td className="p-4 font-black font-mono text-right text-slate-200">₹{parseFloat(booking.total_amount || booking.amount || 0).toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
                                        <td className="p-4 text-center">
                                            {booking.status === 'APPROVED' ? (
                                                booking.is_paid ? (
                                                    <span className="px-2.5 py-1 text-[10px] font-black tracking-widest uppercase rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">Account Settled</span>
                                                ) : (
                                                    <button onClick={() => handlePayment(booking)} className="px-4 py-1.5 text-xs font-black tracking-wider uppercase bg-cyan-500 text-slate-950 rounded-xl hover:opacity-90 transform active:scale-95 shadow-md">Execute Checkout</button>
                                                )
                                            ) : <span className="text-xs text-slate-600 font-mono">—</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 🎯 THE BEAUTIFUL NOTIFICATION POPUP MODAL */}
            {popup.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                    <div className={`relative w-full max-w-sm p-8 text-center transition-all transform border shadow-2xl rounded-3xl bg-slate-900 ${popup.status === 'success' ? 'border-emerald-500/30 shadow-emerald-900/20' : popup.status === 'loading' ? 'border-blue-500/30 shadow-blue-900/20' : 'border-rose-500/30 shadow-rose-900/20'}`}>
                        <div className={`flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full border-4 ${popup.status === 'success' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : popup.status === 'loading' ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'bg-rose-500/10 border-rose-500 text-rose-400'}`}>
                            {popup.status === 'success' ? (
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                            ) : popup.status === 'loading' ? (
                                <svg className="w-10 h-10 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            ) : (
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                            )}
                        </div>
                        <h3 className={`text-2xl font-black mb-2 ${popup.status === 'success' ? 'text-emerald-400' : popup.status === 'loading' ? 'text-blue-400' : 'text-rose-400'}`}>
                            {popup.status === 'success' ? 'Success!' : popup.status === 'loading' ? 'Processing...' : 'Oops!'}
                        </h3>
                        <p className="mb-8 text-sm leading-relaxed text-slate-300">{popup.message}</p>
                        
                        {popup.status !== 'loading' && (
                            <button 
                                onClick={() => setPopup({ isOpen: false, status: '', message: '' })} 
                                className={`w-full py-3.5 font-bold tracking-widest uppercase transition-all duration-300 transform rounded-xl border border-transparent hover:-translate-y-0.5 ${popup.status === 'success' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-slate-900 hover:shadow-[0_0_20px_rgba(52,211,153,0.4)]' : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white hover:shadow-[0_0_20px_rgba(244,63,94,0.4)]'}`}
                            >
                                {popup.status === 'success' ? 'Awesome' : 'Close'}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResidentHallBooking;