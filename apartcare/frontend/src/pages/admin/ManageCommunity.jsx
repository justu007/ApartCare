import React, { useEffect, useState } from 'react';
import { getCommunityDetails, addBlock, addFlat } from '../../api/admin';

const ManageCommunity = () => {
    const [community, setCommunity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal States
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
    const [isFlatModalOpen, setIsFlatModalOpen] = useState(false);
    
    // Form States
    const [newBlockName, setNewBlockName] = useState('');
    const [newFlatName, setNewFlatName] = useState('');
    const [selectedBlockId, setSelectedBlockId] = useState(null); // Knows which block gets the flat
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCommunityData();
    }, []);

    const fetchCommunityData = async () => {
        try {
            const data = await getCommunityDetails();
            setCommunity(data);
        } catch (err) {
            setError('Failed to load community details.');
        } finally {
            setLoading(false);
        }
    };

    // --- HANDLERS ---
    const handleAddBlock = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await addBlock({ name: newBlockName });
            setNewBlockName('');
            setIsBlockModalOpen(false);
            fetchCommunityData(); 
        } catch (err) {
            alert(err.response?.data?.error || "Failed to add block.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddFlat = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await addFlat({ name: newFlatName, block: selectedBlockId });
            setNewFlatName('');
            setIsFlatModalOpen(false);
            fetchCommunityData(); // Refresh the page data!
        } catch (err) {
            alert(err.response?.data?.error || "Failed to add flat.");
        } finally {
            setSubmitting(false);
        }
    };

    const openFlatModal = (blockId) => {
        setSelectedBlockId(blockId);
        setIsFlatModalOpen(true);
    };

    if (loading) return <div className="mt-20 text-xl font-semibold text-center text-gray-600">Loading Community...</div>;
    if (error) return <div className="mt-20 text-center text-red-500">{error}</div>;
    if (!community) return null;

    return (
        <div className="max-w-6xl p-6 mx-auto mt-8">
            {/* Header Section */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-200">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{community.name}</h1>
                    <p className="mt-1 text-gray-600">{community.address}</p>
                </div>
                <button 
                    onClick={() => setIsBlockModalOpen(true)}
                    className="px-5 py-2 font-semibold text-white transition bg-blue-600 rounded shadow hover:bg-blue-700"
                >
                    + Add New Block
                </button>
            </div>

            {/* Blocks & Flats Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {community.blocks && community.blocks.length > 0 ? (
                    community.blocks.map((block) => (
                        <div key={block.id} className="p-5 bg-white border border-gray-200 rounded-lg shadow-sm">
                            <div className="flex items-center justify-between mb-4 border-b pb-2">
                                <h3 className="text-xl font-bold text-gray-800">Block {block.name}</h3>
                                <button 
                                    onClick={() => openFlatModal(block.id)}
                                    className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                                >
                                    + Add Flat
                                </button>
                            </div>
                            
                            {/* Flats List */}
                            <div className="flex flex-wrap gap-2 mt-2">
                                {block.flats && block.flats.length > 0 ? (
                                    block.flats.map((flat) => (
                                        <span key={flat.id} className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded">
                                            {flat.name}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-sm text-gray-400">No flats added yet.</span>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full p-10 text-center text-gray-500 bg-white border border-gray-200 rounded-lg">
                        No blocks found. Click "+ Add New Block" to get started!
                    </div>
                )}
            </div>

            {/* --- ADD BLOCK MODAL --- */}
            {isBlockModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-xl">
                        <h2 className="mb-4 text-xl font-bold text-gray-800">Add New Block</h2>
                        <form onSubmit={handleAddBlock}>
                            <input 
                                type="text" 
                                value={newBlockName} 
                                onChange={(e) => setNewBlockName(e.target.value)} 
                                placeholder="e.g. A, B, North Tower"
                                required 
                                className="w-full p-2 mb-4 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setIsBlockModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
                                <button type="submit" disabled={submitting} className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50">
                                    {submitting ? 'Saving...' : 'Save Block'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- ADD FLAT MODAL --- */}
            {isFlatModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-xl">
                        <h2 className="mb-4 text-xl font-bold text-gray-800">Add New Flat</h2>
                        <form onSubmit={handleAddFlat}>
                            <input 
                                type="text" 
                                value={newFlatName} 
                                onChange={(e) => setNewFlatName(e.target.value)} 
                                placeholder="e.g. 101, 204B"
                                required 
                                className="w-full p-2 mb-4 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setIsFlatModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
                                <button type="submit" disabled={submitting} className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50">
                                    {submitting ? 'Saving...' : 'Save Flat'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageCommunity;