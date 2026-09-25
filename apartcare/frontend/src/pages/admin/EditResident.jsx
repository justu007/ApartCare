
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { editUser, editResident } from '../../features/users/userSlice'; 
import axiosInstance from '../../api/axios';

const EditResident = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const [popup, setPopup] = useState({ isOpen: false, status: '', message: '' });
    const userToEdit = location.state?.userToEdit;
    const returnTab = location.state?.returnTab || 'residents';
    const returnPage = location.state?.returnPage || 1;

    // 1. Clean and sanitize phone number immediately upon component load
    const initialCleanPhone = userToEdit?.phone 
        ? String(userToEdit.phone).replace(/\D/g, '').slice(0, 10) 
        : '';

    // 2. Resolve initial flat ID as a clean string ID
    const resolveInitialFlatId = () => {
        if (!userToEdit?.flat) return '';
        if (typeof userToEdit.flat === 'object' && userToEdit.flat !== null) {
            return String(userToEdit.flat.id);
        }
        return String(userToEdit.flat);
    };

    const initialFlatId = resolveInitialFlatId();

    const [name, setName] = useState(userToEdit?.name || '');
    const [email, setEmail] = useState(userToEdit?.email || '');
    const [phone, setPhone] = useState(initialCleanPhone);
    const [flats, setFlats] = useState([]);
    const [selectedFlatId, setSelectedFlatId] = useState(initialFlatId);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Fetch flats from backend
    useEffect(() => {
        if (!userToEdit) { 
            navigate('/admin/directory'); 
            return; 
        }

        const fetchFlats = async () => {
            try {
                const response = await axiosInstance.get('/apartment/get-flats/');
                const flatsArray = Array.isArray(response.data?.data) 
                    ? response.data.data 
                    : (Array.isArray(response.data) ? response.data : []);

                setFlats(flatsArray);

                // If user has a flat assigned, ensure selectedFlatId matches one in flatsArray
                if (initialFlatId) {
                    const matched = flatsArray.find(f => String(f.id) === String(initialFlatId));
                    if (matched) {
                        setSelectedFlatId(String(matched.id));
                    }
                }
            } catch (err) { 
                console.error("Failed to fetch flats", err);
            }
        };

        fetchFlats();
    }, [userToEdit, initialFlatId, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setLoading(true); 
        setError('');
        setSuccessMessage('');

        // Sanitize phone input
        const cleanPhone = phone.replace(/\D/g, '');

        if (cleanPhone) {
            if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
                setLoading(false);
                setError("Phone number must be exactly 10 digits and start with 6, 7, 8, or 9.");
                return;
            }
        }

        try {
            // 1. Update basic user credentials (name, email, clean phone)
            await dispatch(editUser({ 
                id: id, 
                data: { 
                    name: name.trim(), 
                    email: email.trim(), 
                    phone: cleanPhone 
                } 
            })).unwrap();
            
            // 2. Update flat ONLY if it changed
            if (selectedFlatId !== initialFlatId) {
                const residentPayload = {
                    flat: selectedFlatId ? parseInt(selectedFlatId) : null
                };
                await dispatch(editResident({ id: id, data: residentPayload })).unwrap();
            }

            setSuccessMessage("🎉 Resident details synchronized successfully...");

            setTimeout(() => {
                navigate('/admin/directory', { state: { activeTab: returnTab, currentPage: returnPage } });
            }, 1500);

        }  catch (err) {
            console.error("Update failed:", err);

            // Handle unwrapped Redux payload (err) vs raw Axios error (err.response?.data)
            const errorData = err.response?.data || err;

            let errorText = "Failed to update resident parameters.";

            if (typeof errorData === "string") {
                errorText = errorData;
            } else if (errorData && typeof errorData === "object") {
                const rawField = 
                    errorData.phone || 
                    errorData.email || 
                    errorData.name || 
                    errorData.flat || 
                    errorData.non_field_errors ||
                    errorData.detail || 
                    errorData.error;

                if (Array.isArray(rawField)) {
                    errorText = rawField[0];
                } else if (typeof rawField === "string") {
                    errorText = rawField;
                } else {
                    const firstKey = Object.keys(errorData)[0];
                    if (firstKey) {
                        const val = errorData[firstKey];
                        errorText = Array.isArray(val) ? val[0] : String(val);
                    }
                }
            }

            setError(errorText);
            setPopup({
                isOpen: true,
                status: 'error',
                message: errorText
            });
        } finally { 
            setLoading(false); 
        }
    };
    
    if (!userToEdit) return <div className="p-8 text-center text-slate-400">Loading node instances...</div>;

    // Display string for the currently assigned flat
    const currentFlatDisplay = typeof userToEdit.flat === 'object' && userToEdit.flat !== null
        ? userToEdit.flat.name || userToEdit.flat_number
        : (userToEdit.flat_number || userToEdit.flat || null);

    return (
        <div className="relative max-w-2xl p-8 mx-auto mt-10 overflow-hidden border shadow-2xl bg-slate-900 border-slate-800 rounded-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] pointer-events-none"></div>

            <h2 className="mb-6 text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Edit Resident Profile
            </h2>
            
            {error && (
                <div className="p-4 mb-5 text-sm font-semibold border rounded-xl bg-rose-500/10 border-rose-500/20 text-rose-300 shadow-xl shadow-rose-950/20 transform animate-fade-in">
                    <div className="flex items-center gap-3">
                        <span className="text-lg">❌</span>
                        <p>{error}</p>
                    </div>
                </div>
            )}

            {successMessage && (
                <div className="p-4 mb-5 text-sm font-semibold border rounded-xl bg-emerald-500/10 border-emerald-500/20 text-emerald-300 shadow-xl shadow-emerald-950/20 transform animate-fade-in">
                    <div className="flex items-center gap-3">
                        <span className="text-lg">✅</span>
                        <p>{successMessage}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="relative z-10 space-y-5" autoComplete="off">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block mb-1.5 text-sm font-medium text-slate-300">Full Name</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                            disabled={loading || successMessage}
                            className="w-full p-3 transition-all duration-200 border outline-none bg-slate-800/40 border-slate-700 text-slate-100 rounded-xl focus:bg-slate-800 focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-40" 
                        />
                    </div>
                    <div>
                        <label className="block mb-1.5 text-sm font-medium text-slate-300">Phone</label>
                        <input 
                            type="tel" 
                            value={phone} 
                            onChange={(e) => {
                                setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                                if (error) setError('');
                            }} 
                            placeholder="10-digit mobile number"
                            maxLength={10}
                            disabled={loading || successMessage}
                            className="w-full p-3 transition-all duration-200 border outline-none bg-slate-800/40 border-slate-700 text-slate-100 rounded-xl focus:bg-slate-800 focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-40"
                        />
                    </div>
                </div>
                
                <div>
                    <label className="block mb-1.5 text-sm font-medium text-slate-300">Email Address</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        disabled={loading || successMessage}
                        className="w-full p-3 transition-all duration-200 border outline-none bg-slate-800/40 border-slate-700 text-slate-100 rounded-xl focus:bg-slate-800 focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-40" 
                    />
                </div>

                <hr className="my-6 border-slate-800/80" />

                <div>
                    <label className="block mb-1.5 text-sm font-medium text-slate-300">Assigned Flat Unit</label>
                    <select 
                        value={selectedFlatId} 
                        onChange={(e) => setSelectedFlatId(e.target.value)} 
                        disabled={loading || successMessage}
                        className="w-full p-3 transition-all duration-200 border outline-none bg-slate-800/40 border-slate-700 text-slate-100 rounded-xl focus:bg-slate-800 focus:ring-2 focus:ring-cyan-500 focus:border-transparent cursor-pointer disabled:opacity-40"
                    >
                        {/* 1. Unassign option */}
                        <option className="bg-slate-800 text-slate-400" value="">-- Unassigned --</option>
                        
                        {/* 2. If the current flat exists and is not present in flats list, keep it as an option */}
                        {initialFlatId && !flats.some(f => String(f.id) === String(initialFlatId)) && (
                            <option className="bg-slate-800 text-cyan-300 font-semibold" value={initialFlatId}>
                                Flat {currentFlatDisplay} ({userToEdit?.block || 'Current Block'}) • Currently Assigned
                            </option>
                        )}

                        {/* 3. All other flats from API */}
                        {flats && flats.length > 0 && flats.map((flatItem) => (
                            <option className="bg-slate-800" key={flatItem.id} value={String(flatItem.id)}>
                                Flat {flatItem.name || flatItem.flat_number} ({flatItem.block?.name || flatItem.block || 'No Block'}) {String(flatItem.id) === String(initialFlatId) ? '• Currently Assigned' : (flatItem.occupied ? '• Occupied' : '• Available')}
                            </option>
                        ))}
                    </select>
                    <p className="mt-2 text-xs text-slate-500">
                        Current Assigned Block: <span className="font-semibold text-slate-300">{userToEdit?.block || 'None'}</span>
                    </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-slate-800">
                    <button 
                        type="button" 
                        disabled={loading || successMessage}
                        onClick={() => navigate('/admin/directory', { state: { activeTab: returnTab, currentPage: returnPage } })} 
                        className="px-5 py-2.5 text-sm font-bold transition-all duration-300 border rounded-xl text-slate-300 border-slate-700 bg-slate-800/30 hover:bg-slate-800 hover:text-white disabled:opacity-30"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={loading || successMessage} 
                        className="px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 transform rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:-translate-y-0.5 disabled:opacity-50"
                    >
                        {loading ? 'Saving Data...' : successMessage ? 'Saved!' : 'Save Changes'}
                    </button>
                </div>
            </form>

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

export default EditResident;