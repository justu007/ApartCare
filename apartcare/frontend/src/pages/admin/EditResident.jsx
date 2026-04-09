

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { editUser, editResident } from '../../features/users/userSlice'; 
import axiosInstance from '../../api/axios';

const EditResident = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    
    const userToEdit = location.state?.userToEdit;
    const returnTab = location.state?.returnTab || 'residents';
    const returnPage = location.state?.returnPage || 1;

    const [name, setName] = useState(userToEdit?.name || '');
    const [email, setEmail] = useState(userToEdit?.email || '');
    const [phone, setPhone] = useState(userToEdit?.phone || '');
    const [flats, setFlats] = useState([]);
    const [selectedFlatId, setSelectedFlatId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!userToEdit) { navigate('/admin/directory'); return; }
        const fetchFlats = async () => {
            try {
                const response = await axiosInstance.get('/apartment/get-flats/');
                setFlats(response.data);
                if (userToEdit?.flat) {
                    const currentFlat = response.data.find(f => f.name === userToEdit.flat);
                    setSelectedFlatId(currentFlat ? currentFlat.id : 'KEEP_CURRENT');
                }
            } catch (err) { console.error("Failed to fetch flats", err); }
        };
        fetchFlats();
    }, [userToEdit, navigate]); 

    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true); setError('');
        try {
            await dispatch(editUser({ id: id, data: { name, email, phone } })).unwrap();
            const residentPayload = {};
            if (selectedFlatId !== '' && selectedFlatId !== 'KEEP_CURRENT') residentPayload.flat = parseInt(selectedFlatId);
            else if (selectedFlatId === '') residentPayload.flat = null;

            await dispatch(editResident({ id: id, data: residentPayload })).unwrap();
            
            navigate('/admin/directory', { state: { activeTab: returnTab, currentPage: returnPage } });
        } catch (err) {
            setError(err?.flat?.[0] || err?.detail || err?.error || "Failed to update resident.");
        } finally { setLoading(false); }
    };
    
    if (!userToEdit) return <div className="p-8 text-center text-slate-400">Loading...</div>;

    return (
        <div className="relative max-w-2xl p-8 mx-auto mt-10 overflow-hidden transition-all duration-300 border shadow-2xl bg-slate-900 border-slate-800 rounded-2xl">
            <h2 className="mb-6 text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Edit Resident Profile</h2>
            {error && <div className="p-3 mb-5 text-sm border rounded-lg text-rose-300 bg-rose-500/10 border-rose-500/20">{error}</div>}

            <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
                <div className="grid grid-cols-2 gap-5">
                    <div>
                        <label className="block mb-1.5 text-sm font-medium text-slate-300">Full Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-3 transition-all duration-200 border outline-none bg-slate-800/50 border-slate-700 text-slate-100 rounded-xl focus:bg-slate-800 focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                    </div>
                    <div>
                        <label className="block mb-1.5 text-sm font-medium text-slate-300">Phone</label>
                        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full p-3 transition-all duration-200 border outline-none bg-slate-800/50 border-slate-700 text-slate-100 rounded-xl focus:bg-slate-800 focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                    </div>
                </div>
                <div>
                    <label className="block mb-1.5 text-sm font-medium text-slate-300">Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-3 transition-all duration-200 border outline-none bg-slate-800/50 border-slate-700 text-slate-100 rounded-xl focus:bg-slate-800 focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                </div>

                <hr className="my-6 border-slate-800" />

                <div>
                    <label className="block mb-1.5 text-sm font-medium text-slate-300">Assigned Flat</label>
                    <select value={selectedFlatId} onChange={(e) => setSelectedFlatId(e.target.value)} className="w-full p-3 transition-all duration-200 border outline-none bg-slate-800/50 border-slate-700 text-slate-100 rounded-xl focus:bg-slate-800 focus:ring-2 focus:ring-cyan-500 focus:border-transparent cursor-pointer">
                        <option className="bg-slate-800" value="">-- Unassigned --</option>
                        {selectedFlatId === 'KEEP_CURRENT' && <option className="bg-slate-800" value="KEEP_CURRENT">Flat {userToEdit.flat} (Currently Assigned)</option>}
                        {flats.map((flatItem) => (
                            <option className="bg-slate-800" key={flatItem.id} value={flatItem.id}>{flatItem.name}</option>
                        ))}
                    </select>
                    <p className="mt-2 text-xs text-slate-500">Current Block: <span className="font-semibold text-slate-300">{userToEdit.block || 'None'}</span></p>
                </div>

                <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-slate-800">
                    <button type="button" onClick={() => navigate('/admin/directory', { state: { activeTab: returnTab, currentPage: returnPage } })} className="px-5 py-2.5 text-sm font-bold transition-all duration-300 border rounded-xl text-slate-300 border-slate-700 bg-slate-800/50 hover:bg-slate-700 hover:text-white">Cancel</button>
                    <button type="submit" disabled={loading} className="px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 transform rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:-translate-y-0.5 disabled:opacity-50">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditResident;