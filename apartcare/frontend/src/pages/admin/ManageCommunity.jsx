
// import React, { useEffect, useState } from 'react';
// import { getCommunityDetails, addBlock, addFlat } from '../../api/admin';

// const ManageCommunity = () => {
//     const [community, setCommunity] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
//     const [isFlatModalOpen, setIsFlatModalOpen] = useState(false);
//     const [newBlockName, setNewBlockName] = useState('');
//     const [newFlatName, setNewFlatName] = useState('');
//     const [selectedBlockId, setSelectedBlockId] = useState(null); 
//     const [submitting, setSubmitting] = useState(false);

//     useEffect(() => { fetchCommunityData(); }, []);

//     const fetchCommunityData = async () => {
//         try {
//             const data = await getCommunityDetails();
//             setCommunity(data);
//         } catch (err) { setError('Failed to load community details.'); } 
//         finally { setLoading(false); }
//     };

//     const handleAddBlock = async (e) => {
//         e.preventDefault(); setSubmitting(true);
//         try {
//             await addBlock({ name: newBlockName });
//             setNewBlockName(''); setIsBlockModalOpen(false); fetchCommunityData(); 
//         } catch (err) { alert(err.response?.data?.error || "Failed to add block."); } 
//         finally { setSubmitting(false); }
//     };

//     const handleAddFlat = async (e) => {
//         e.preventDefault(); setSubmitting(true);
//         try {
//             await addFlat({ name: newFlatName, block: selectedBlockId });
//             setNewFlatName(''); setIsFlatModalOpen(false); fetchCommunityData(); 
//         } catch (err) { alert(err.response?.data?.error || "Failed to add flat."); } 
//         finally { setSubmitting(false); }
//     };

//     const openFlatModal = (blockId) => { setSelectedBlockId(blockId); setIsFlatModalOpen(true); };

//     if (loading) return <div className="mt-20 text-xl font-semibold text-center text-slate-400">Loading Community...</div>;
//     if (error) return <div className="mt-20 text-center text-rose-500">{error}</div>;
//     if (!community) return null;

//     return (
//         <div className="max-w-6xl p-6 mx-auto mt-8">
//             <div className="flex items-center justify-between pb-4 mb-8 border-b border-slate-800">
//                 <div>
//                     <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{community.name}</h1>
//                     <p className="mt-1 text-slate-400">{community.address}</p>
//                 </div>
//                 <button onClick={() => setIsBlockModalOpen(true)} className="px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 transform rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:-translate-y-0.5">
//                     + Add New Block
//                 </button>
//             </div>

//             <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
//                 {community.blocks && community.blocks.length > 0 ? (
//                     community.blocks.map((block) => (
//                         <div key={block.id} className="p-6 transition-all duration-300 border shadow-lg bg-slate-900 border-slate-800 rounded-2xl hover:shadow-cyan-900/20">
//                             <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
//                                 <h3 className="text-xl font-bold text-slate-100">Block {block.name}</h3>
//                                 <button onClick={() => openFlatModal(block.id)} className="text-sm font-semibold transition-colors text-cyan-400 hover:text-cyan-300">
//                                     + Add Flat
//                                 </button>
//                             </div>
//                             <div className="flex flex-wrap gap-2 mt-2">
//                                 {block.flats && block.flats.length > 0 ? (
//                                     block.flats.map((flat) => (
//                                         <span key={flat.id} className="px-3 py-1.5 text-xs font-bold tracking-wider rounded border text-slate-300 bg-slate-800/50 border-slate-700">
//                                             {flat.name}
//                                         </span>
//                                     ))
//                                 ) : (
//                                     <span className="text-sm text-slate-500">No flats added yet.</span>
//                                 )}
//                             </div>
//                         </div>
//                     ))
//                 ) : (
//                     <div className="p-10 text-center border shadow-lg col-span-full text-slate-400 bg-slate-900 border-slate-800 rounded-2xl">
//                         No blocks found. Click "+ Add New Block" to get started!
//                     </div>
//                 )}
//             </div>

//             {/* Dark Mode Modals */}
//             {(isBlockModalOpen || isFlatModalOpen) && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
//                     <div className="w-full max-w-sm p-6 border shadow-2xl bg-slate-900 border-slate-800 rounded-2xl">
//                         <h2 className="mb-4 text-xl font-bold text-slate-100">{isBlockModalOpen ? 'Add New Block' : 'Add New Flat'}</h2>
//                         <form onSubmit={isBlockModalOpen ? handleAddBlock : handleAddFlat}>
//                             <input 
//                                 type="text" 
//                                 value={isBlockModalOpen ? newBlockName : newFlatName} 
//                                 onChange={(e) => isBlockModalOpen ? setNewBlockName(e.target.value) : setNewFlatName(e.target.value)} 
//                                 placeholder={isBlockModalOpen ? "e.g. A, B, North Tower" : "e.g. 101, 204B"}
//                                 required 
//                                 className="w-full p-3 mb-5 transition-all duration-200 border outline-none bg-slate-800/50 border-slate-700 text-slate-100 rounded-xl focus:bg-slate-800 focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-slate-500"
//                             />
//                             <div className="flex justify-end gap-3">
//                                 <button type="button" onClick={() => isBlockModalOpen ? setIsBlockModalOpen(false) : setIsFlatModalOpen(false)} className="px-5 py-2.5 text-sm font-bold transition-all duration-300 border rounded-xl text-slate-300 border-slate-700 bg-slate-800/50 hover:bg-slate-700 hover:text-white">Cancel</button>
//                                 <button type="submit" disabled={submitting} className="px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 transform rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:-translate-y-0.5 disabled:opacity-50">
//                                     {submitting ? 'Saving...' : 'Save'}
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ManageCommunity;
import React, { useEffect, useState } from 'react';
import { getCommunityDetails, addBlock, addFlat } from '../../api/admin';

const ManageCommunity = () => {
    const [community, setCommunity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
    const [isFlatModalOpen, setIsFlatModalOpen] = useState(false);
    const [newBlockName, setNewBlockName] = useState('');
    const [newFlatName, setNewFlatName] = useState('');
    const [selectedBlockId, setSelectedBlockId] = useState(null); 
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => { fetchCommunityData(); }, []);

    const fetchCommunityData = async () => {
        try {
            const data = await getCommunityDetails(); setCommunity(data);
        } catch (err) { setError('Failed to load community details.'); } 
        finally { setLoading(false); }
    };

    const handleAddBlock = async (e) => {
        e.preventDefault(); setSubmitting(true);
        try {
            await addBlock({ name: newBlockName });
            setNewBlockName(''); setIsBlockModalOpen(false); fetchCommunityData(); 
        } catch (err) { alert(err.response?.data?.error || "Failed to add block."); } 
        finally { setSubmitting(false); }
    };

    const handleAddFlat = async (e) => {
        e.preventDefault(); setSubmitting(true);
        try {
            await addFlat({ name: newFlatName, block: selectedBlockId });
            setNewFlatName(''); setIsFlatModalOpen(false); fetchCommunityData(); 
        } catch (err) { alert(err.response?.data?.error || "Failed to add flat."); } 
        finally { setSubmitting(false); }
    };

    const openFlatModal = (blockId) => { setSelectedBlockId(blockId); setIsFlatModalOpen(true); };

    if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-base font-bold text-slate-500 font-mono animate-pulse">SYNCHRONIZING STRUCTURAL INVENTORY MODULE...</div>;
    if (error) return <div className="text-center font-mono py-10 text-xs font-bold text-rose-400">{error}</div>;
    if (!community) return null;

    return (
        <div className="w-full max-w-full px-6 lg:px-12 mx-auto space-y-6 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
                <div>
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 tracking-tight">{community.name}</h1>
                    <p className="mt-1 text-xs font-mono text-slate-400">📍 Location Reference: {community.address}</p>
                </div>
                <button onClick={() => setIsBlockModalOpen(true)} className="px-5 py-2.5 text-xs font-black tracking-widest uppercase shadow-lg rounded-xl text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:opacity-95 transform hover:-translate-y-0.5 transition-all">+ Add Complex Block</button>
            </div>

            {/* BLOCK SECTOR RENDERING GRID ROW GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {community.blocks?.length > 0 ? community.blocks.map((block) => (
                    <div key={block.id} className="p-6 bg-slate-900/40 border border-slate-800/90 rounded-2xl shadow-xl backdrop-blur-sm hover:border-slate-700 transition-all flex flex-col justify-between group">
                        <div>
                            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-4">
                                <h3 className="text-base font-black text-slate-100 group-hover:text-cyan-400 transition-colors">🏢 Block Segment: {block.name}</h3>
                                <button onClick={() => openFlatModal(block.id)} className="text-[10px] font-black tracking-widest uppercase bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 transition-all">+ Add Flat Unit</button>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-1 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                                {block.flats?.length > 0 ? block.flats.map((flat) => (
                                    <span key={flat.id} className="px-2.5 py-1 text-xs font-bold font-mono rounded border text-slate-300 bg-slate-950/40 border-slate-800/80 shadow-sm">
                                        🚪 {flat.name}
                                    </span>
                                )) : <span className="text-xs text-slate-600 font-mono italic p-1">No micro flat unit records logged inside this wing space.</span>}
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full p-12 text-center border border-dashed border-slate-800 bg-slate-950/20 text-slate-500 font-mono text-xs rounded-2xl">No complex blocks found mapped to this ecosystem token. Click "+ Add Complex Block" to populate layout tree.</div>
                )}
            </div>

            {/* DARK INFRASTRUCTURE SUB OVERLAY CONSOLE BOX MODALS */}
            {(isBlockModalOpen || isFlatModalOpen) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-sm overflow-hidden border shadow-2xl bg-slate-900 border-slate-800 rounded-2xl">
                        <div className="p-5 border-b border-slate-800 bg-slate-950/40">
                            <h2 className="text-sm font-black uppercase tracking-widest text-slate-200">{isBlockModalOpen ? 'Register Complex Block' : 'Register Flat Unit Asset'}</h2>
                        </div>
                        <form onSubmit={isBlockModalOpen ? handleAddBlock : handleAddFlat} className="p-6 space-y-4">
                            <input 
                                type="text" 
                                value={isBlockModalOpen ? newBlockName : newFlatName} 
                                onChange={(e) => isBlockModalOpen ? setNewBlockName(e.target.value) : setNewFlatName(e.target.value)} 
                                placeholder={isBlockModalOpen ? "e.g. Tower A, Phase II" : "e.g. 502, Penthouse-1"}
                                required 
                                className="w-full p-3 transition-colors text-xs font-bold border outline-none bg-slate-950 border-slate-800 text-slate-200 rounded-xl focus:border-cyan-500 placeholder-slate-700 font-mono"
                            />
                            <div className="flex gap-3 pt-3 border-t border-slate-800 text-xs font-bold">
                                <button type="button" onClick={() => isBlockModalOpen ? setIsBlockModalOpen(false) : setIsFlatModalOpen(false)} className="w-1/2 py-2.5 border text-slate-400 border-slate-800 bg-slate-950/40 rounded-xl">Cancel Run</button>
                                <button type="submit" disabled={submitting} className="w-1/2 py-2.5 text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl shadow-md uppercase tracking-wider">{submitting ? 'Saving...' : 'Commit Node'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageCommunity;