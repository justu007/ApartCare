import React, { useState, useEffect } from 'react';
import { getCommunityHalls, getHallAvailability, createResidentBooking, getResidentBookings,initiateHallPayment,verifyHallPayment} from '../../api/hallbooking';

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
    const [error, setError] = useState('');
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
            setBookedSlots(data.booked_slots.filter(b => b.booking_date === formData.booking_date));
        } catch (err) {
            console.error("Could not fetch availability", err);
        }
    };

    const handleSelectHall = (hall) => {
        setSelectedHall(hall);
        setFormData({ booking_date: '', start_time: '', end_time: '', purpose: '', attendees: '' });
        setBookedSlots([]);
        setError('');
        setActiveTab('BOOKING_FORM');
    };

    const handleTextChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const calculatedTotal = formData.attendees && selectedHall ? (formData.attendees * selectedHall.rent_per_seat).toFixed(2) : '0.00';

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 🎯 Validation: Prevent booking if they invite too many people
        if (parseInt(formData.attendees) > selectedHall.capacity) {
            setError(`This venue can only hold a maximum of ${selectedHall.capacity} people.`);
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await createResidentBooking({
                hall: selectedHall.id,
                total_amount: calculatedTotal, // Send the calculated money to backend
                ...formData
            });
            
            setPopup({ isOpen: true, status: 'success', message: 'Booking requested successfully! Pending Admin approval.' });
            
            const updatedHistory = await getResidentBookings();
            setMyBookings(updatedHistory);
            setActiveTab('HISTORY');
            
            setTimeout(() => setPopup({ isOpen: false, status: '', message: '' }), 4000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit booking.');
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
                        setPopup({ isOpen: true, status: 'error', message: 'Payment verification failed. Please contact admin.' });
                    }
                },
                theme: {
                    color: "#06b6d4" 
                }
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

    if (loading) return <div className="mt-20 text-xl font-semibold text-center text-slate-400">Loading Community Halls...</div>;

    return (
        <div className="max-w-6xl p-8 mx-auto mt-8">
            <div className="mb-8">
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                    Community Venues
                </h1>
                <p className="mt-2 text-slate-400">Browse available halls and submit booking requests.</p>
            </div>

            <div className="flex gap-6 mb-8 border-b border-slate-800">
                <button onClick={() => { setActiveTab('VENUES'); setSelectedHall(null); }} className={`pb-4 px-2 font-bold transition-colors relative ${activeTab === 'VENUES' || activeTab === 'BOOKING_FORM' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}>
                    Available Venues
                    {(activeTab === 'VENUES' || activeTab === 'BOOKING_FORM') && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"></span>}
                </button>
                <button onClick={() => setActiveTab('HISTORY')} className={`pb-4 px-2 font-bold transition-colors relative ${activeTab === 'HISTORY' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}>
                    My Booking History
                    {activeTab === 'HISTORY' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"></span>}
                </button>
            </div>

            {/* TAB 1: VENUE BROWSER */}
            {activeTab === 'VENUES' && (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
                    {halls.map((hall) => (
                        <div key={hall.id} className="overflow-hidden transition-all duration-300 border shadow-xl bg-slate-900/80 border-slate-800 rounded-3xl hover:border-cyan-500/30">
                            <div className="relative h-48 bg-slate-800">
                                {hall.images && hall.images.length > 0 ? (
                                    <img src={hall.images[0].image} alt={hall.name} className="object-cover w-full h-full" />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-slate-600">No Image</div>
                                )}
                                <div className="absolute top-4 right-4 px-3 py-1 text-xs font-bold rounded-lg bg-slate-900/90 text-cyan-400 border border-cyan-500/20">
                                    ₹{hall.rent_per_seat} / Seat
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="mb-2 text-xl font-bold text-slate-200">{hall.name}</h3>
                                <p className="mb-4 text-sm line-clamp-2 text-slate-400">{hall.description}</p>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                    <span className="text-sm font-semibold text-slate-300">Max Cap: {hall.capacity}</span>
                                    <button onClick={() => handleSelectHall(hall)} className="px-5 py-2 text-sm font-bold transition-colors shadow-lg rounded-xl text-slate-900 bg-cyan-400 hover:bg-cyan-300">
                                        Check Availability
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {halls.length === 0 && <div className="col-span-full p-10 text-center text-slate-500">No active halls available right now.</div>}
                </div>
            )}

            {/* TAB 2: BOOKING FORM */}
            {activeTab === 'BOOKING_FORM' && selectedHall && (
                <div className="max-w-3xl mx-auto overflow-hidden border shadow-2xl bg-slate-900 border-slate-800 rounded-3xl animate-fade-in">
                    <div className="flex items-center gap-4 px-8 py-6 border-b border-slate-800 bg-slate-800/30">
                        <button onClick={() => setActiveTab('VENUES')} className="p-2 transition-colors rounded-full text-slate-400 hover:text-white hover:bg-slate-700">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        </button>
                        <div>
                            <h2 className="text-2xl font-black text-slate-200">Book {selectedHall.name}</h2>
                            <p className="text-sm text-cyan-400">Rent: ₹{selectedHall.rent_per_seat} per seat</p>
                        </div>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {error && <div className="p-4 border rounded-xl text-rose-300 bg-rose-500/10 border-rose-500/20">{error}</div>}

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block mb-2 text-sm font-bold tracking-wide text-slate-400">Purpose of Booking</label>
                                <input type="text" name="purpose" required value={formData.purpose} onChange={handleTextChange} placeholder="e.g., Birthday Party" className="w-full p-3 transition-colors border outline-none bg-slate-800 border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500" />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-bold tracking-wide text-slate-400">Number of Guests (Max {selectedHall.capacity})</label>
                                <input type="number" name="attendees" required min="1" max={selectedHall.capacity} value={formData.attendees} onChange={handleTextChange} placeholder="e.g., 50" className="w-full p-3 transition-colors border outline-none bg-slate-800 border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500" />
                            </div>
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-bold tracking-wide text-slate-400">Select Date</label>
                            <input type="date" name="booking_date" required min={new Date().toISOString().split('T')[0]} value={formData.booking_date} onChange={handleTextChange} className="w-full p-3 transition-colors border outline-none bg-slate-800 border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 [color-scheme:dark]" />
                        </div>

                        {formData.booking_date && (
                            <div className="p-5 border rounded-2xl bg-slate-800/50 border-slate-700">
                                <h4 className="mb-3 text-sm font-bold uppercase text-slate-400">Schedule for {formData.booking_date}</h4>
                                {bookedSlots.length === 0 ? (
                                    <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        Fully Available!
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <p className="text-xs text-rose-400">⚠️ Please choose times that do not overlap with these approved bookings:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {bookedSlots.map((slot, i) => (
                                                <span key={i} className="px-3 py-1.5 text-xs font-bold border rounded-lg text-rose-300 bg-rose-500/10 border-rose-500/20">
                                                    {slot.start_time.slice(0,5)} to {slot.end_time.slice(0,5)} ({slot.purpose})
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block mb-2 text-sm font-bold tracking-wide text-slate-400">Start Time</label>
                                <input type="time" name="start_time" required value={formData.start_time} onChange={handleTextChange} className="w-full p-3 transition-colors border outline-none bg-slate-800 border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 [color-scheme:dark]" />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-bold tracking-wide text-slate-400">End Time</label>
                                <input type="time" name="end_time" required value={formData.end_time} onChange={handleTextChange} className="w-full p-3 transition-colors border outline-none bg-slate-800 border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 [color-scheme:dark]" />
                            </div>
                        </div>

                        {/* 🎯 Real-Time Calculation Box */}
                        <div className="flex items-center justify-between p-6 border border-cyan-500/30 rounded-xl bg-cyan-500/5 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                            <span className="font-bold text-slate-300">Total Estimated Cost:</span>
                            <span className="text-2xl font-black text-cyan-400">₹ {calculatedTotal}</span>
                        </div>

                        <div className="pt-2 border-t border-slate-800">
                            <button type="submit" disabled={submitting} className="w-full py-4 font-black tracking-widest uppercase transition-all duration-300 transform rounded-xl text-slate-900 bg-gradient-to-r from-cyan-400 to-blue-500 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:-translate-y-0.5 disabled:opacity-50">
                                {submitting ? 'Submitting...' : 'Request Booking'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* TAB 3: BOOKING HISTORY */}
            {activeTab === 'HISTORY' && (
                <div className="overflow-hidden border shadow-2xl bg-slate-900 border-slate-800 rounded-3xl animate-fade-in">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs tracking-wider uppercase border-b text-slate-400 border-slate-800 bg-slate-900/80">
                                    <th className="p-5 font-bold">Venue & Info</th>
                                    <th className="p-5 font-bold">Date & Time</th>
                                    <th className="p-5 font-bold">Status</th>
                                    <th className="p-5 font-bold text-right">Total Amount</th>
                                    <th className="p-5 font-bold text-center">Payment</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {myBookings.length === 0 ? (
                                    <tr><td colSpan={5} className="p-10 text-center text-slate-500">You haven't made any booking requests yet.</td></tr>
                                ) : (
                                    myBookings.map((booking) => (
                                        <tr key={booking.id} className="transition-colors hover:bg-slate-800/40">
                                            <td className="p-5">
                                                <p className="font-bold text-slate-200">{booking.hall_name}</p>
                                                <p className="text-xs text-slate-400">{booking.purpose} ({booking.attendees} Guests)</p>
                                            </td>
                                            <td className="p-5 text-sm text-slate-400">
                                                {booking.booking_date} <br/> 
                                                <span className="text-xs text-slate-500">{booking.start_time.slice(0,5)} - {booking.end_time.slice(0,5)}</span>
                                            </td>
                                            <td className="p-5">
                                                <span className={`px-2.5 py-1 text-xs font-bold tracking-wider rounded border 
                                                    ${booking.status === 'APPROVED' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 
                                                    booking.status === 'REJECTED' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 
                                                    'text-amber-400 bg-amber-500/10 border-amber-500/20'}`}>
                                                    {booking.status}
                                                </span>
                                                {booking.admin_remarks && (
                                                    <p className="mt-2 text-xs italic text-slate-500">{booking.admin_remarks}</p>
                                                )}
                                            </td>
                                            <td className="p-5 font-bold text-right text-slate-200">
                                                ₹ {booking.total_amount || '0.00'}
                                            </td>
                                            <td className="p-5 text-center">
                                                {/* 🎯 Payment Button Logic */}
                                                {booking.status === 'APPROVED' ? (
                                                    booking.is_paid ? (
                                                        <span className="px-3 py-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 rounded-lg">Paid</span>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handlePayment(booking)}
                                                            className="px-4 py-2 text-xs font-bold transition-all transform shadow-lg rounded-xl bg-cyan-500 text-slate-900 hover:bg-cyan-400 hover:-translate-y-0.5 hover:shadow-cyan-500/20"
                                                        >
                                                            Pay Now
                                                        </button>
                                                    )
                                                ) : (
                                                    <span className="text-xs text-slate-600">-</span>
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

            {/* Notification Popup */}
            {popup.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                    <div className="relative w-full max-w-sm p-8 text-center border shadow-2xl rounded-3xl bg-slate-900 border-cyan-500/30">
                        <h3 className="mb-2 text-2xl font-black text-cyan-400">Notice</h3>
                        <p className="mb-6 text-slate-300">{popup.message}</p>
                        <button onClick={() => setPopup({ isOpen: false, status: '', message: '' })} className="w-full py-3 font-bold rounded-xl bg-cyan-500/10 text-cyan-400">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResidentHallBooking;