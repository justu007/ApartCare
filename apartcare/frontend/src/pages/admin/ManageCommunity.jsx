
import React, { useEffect, useState } from 'react';
import { getCommunityDetails, addBlock, addFlat } from '../../api/admin';

const ManageCommunity = () => {
    const [popup, setPopup] = useState({ isOpen: false, status: '', message: '' });
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
            setPopup({ isOpen: true, status: 'success', message: 'Complex Block registered successfully.' });
        } catch (err) { setPopup({ isOpen: true, status: 'error', message: err.response?.data?.error || "Failed to add block." }); } 
        finally { setSubmitting(false); }
    };

    const handleAddFlat = async (e) => {
        e.preventDefault(); setSubmitting(true);
        try {
            await addFlat({ name: newFlatName, block: selectedBlockId });
            setNewFlatName(''); setIsFlatModalOpen(false); fetchCommunityData(); 
            setPopup({ isOpen: true, status: 'success', message: 'Flat Unit asset created successfully.' });
        } catch (err) { setPopup({ isOpen: true, status: 'error', message: err.response?.data?.error || "Failed to add flat." }); } 
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
            {popup.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                    <div className={`relative w-full max-w-sm p-8 text-center transition-all transform border shadow-2xl rounded-3xl bg-slate-900 ${popup.status === 'success' ? 'border-emerald-500/30 shadow-emerald-900/20' : 'border-rose-500/30 shadow-rose-900/20'}`}>
                        <div className={`flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full border-4 ${popup.status === 'success' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-rose-500/10 border-rose-500 text-rose-400'}`}>
                            {popup.status === 'success' ? (
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                            ) : (
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
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

export default ManageCommunity;