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
        if (!userToEdit) {
            navigate('/admin/directory');
            return; 
        }

        
        const fetchFlats = async () => {
            try {
                const response = await axiosInstance.get('/apartment/get-flats/');
                const allFlats = response.data; 
                
                console.log("🔥 1. ALL FLATS FROM DJANGO:", allFlats);
                console.log("🔥 2. THIS USER'S FLAT:", userToEdit.flat);
                setFlats(allFlats);

                if (userToEdit?.flat) {
                    const currentFlat = allFlats.find(f => f.name === userToEdit.flat);
                    
                    if (currentFlat) {
                        setSelectedFlatId(currentFlat.id);
                    } else {

                        setSelectedFlatId('KEEP_CURRENT');
                    }
                }
            } catch (err) {
                console.error("Failed to fetch flats", err);
            }
        };

        fetchFlats();
        
    }, [userToEdit, navigate]); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await dispatch(editUser({ 
                id: id, 
                data: { name, email, phone } 
            })).unwrap();

            const residentPayload = {};
            
            if (selectedFlatId !== '' && selectedFlatId !== 'KEEP_CURRENT') {
                 residentPayload.flat = parseInt(selectedFlatId);
            } 
            else if (selectedFlatId === '') {
                 residentPayload.flat = null;
            }

            await dispatch(editResident({ 
                id: id, 
                data: residentPayload 
            })).unwrap();

            alert("Resident updated successfully!");
            navigate('/admin/directory', { state: { activeTab: returnTab, currentPage: returnPage } });

        } catch (err) {
            console.error("Failed to update:", err);
            const errorMsg = err?.flat?.[0] || err?.detail || err?.error || "Failed to update resident.";
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };
    
    if (!userToEdit) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="max-w-2xl p-6 mx-auto mt-10 bg-white rounded-lg shadow-md">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">Edit Resident Profile</h2>
            
            {error && <div className="p-3 mb-4 text-red-700 bg-red-100 rounded">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* --- BASE USER FIELDS --- */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required 
                               className="w-full p-2 mt-1 border rounded focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required 
                               className="w-full p-2 mt-1 border rounded focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required 
                           className="w-full p-2 mt-1 border rounded focus:ring-2 focus:ring-blue-500" />
                </div>

                <hr className="my-6" />

                {/* --- RESIDENT PROFILE FIELDS --- */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Assigned Flat</label>
                    <select 
                        value={selectedFlatId} 
                        onChange={(e) => setSelectedFlatId(e.target.value)} 
                        className="w-full p-2 mt-1 bg-white border rounded focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">-- Unassigned --</option>
                        
                        {selectedFlatId === 'KEEP_CURRENT' && (
                            <option value="KEEP_CURRENT">
                                Flat {userToEdit.flat} (Currently Assigned)
                            </option>
                        )}
                        
                        {flats.map((flatItem) => (
                            <option 
                                key={flatItem.id} 
                                value={flatItem.id}
                            >
                                {flatItem.name} 
                            </option>
                        ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                        Current Block: <span className="font-semibold">{userToEdit.block || 'None'}</span>
                    </p>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button type="button" 
                            onClick={() => navigate('/admin/directory', { state: { activeTab: returnTab, currentPage: returnPage } })}
                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading}
                            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditResident;