
// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchCommunities, toggleDeactivate } from "../../features/community/communitySlice";
// import EditCommunityModal from "../../components/EditCommunityModal";

// const CommunityList = () => {
//     const dispatch = useDispatch();
//     const { communities, loading } = useSelector((state) => state.community);
//     const [selectedCommunity, setSelectedCommunity] = useState(null);

//     useEffect(() => { dispatch(fetchCommunities()); }, [dispatch]);

//     if (loading) return <p className="p-10 text-center text-slate-400">Loading communities...</p>;

//     return (
//         <div className="max-w-7xl p-6 mx-auto mt-8">
//             <h1 className="mb-8 text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Communities Network</h1>

//             <div className="overflow-hidden border shadow-2xl bg-slate-900/50 border-slate-800 rounded-2xl backdrop-blur-sm">
//                 <div className="overflow-x-auto">
//                     <table className="w-full text-left border-collapse">
//                         <thead className="text-sm tracking-wider uppercase border-b text-slate-400 border-slate-800 bg-slate-900/80">
//                             <tr>
//                                 <th className="p-5 font-bold">Community</th>
//                                 <th className="p-5 font-bold">Address</th>
//                                 <th className="p-5 font-bold">Admin Name</th>
//                                 <th className="p-5 font-bold">Admin Contact</th>
//                                 <th className="p-5 font-bold text-center">Status</th>
//                                 <th className="p-5 font-bold text-right">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-800/50">
//                             {communities.map((community) => (
//                                 <tr key={community.id} className="transition-colors hover:bg-slate-800/40">
//                                     <td className="p-5 font-bold text-slate-200">{community.name}</td>
//                                     <td className="p-5 text-sm text-slate-400">{community.address}</td>
//                                     <td className="p-5 text-sm font-medium text-slate-300">{community.admin.name}</td>
//                                     <td className="p-5 text-sm text-slate-400">
//                                         <div className="text-slate-300">{community.admin.email}</div>
//                                         <div className="text-slate-500">{community.admin.phone || 'N/A'}</div>
//                                     </td>
//                                     <td className="p-5 text-center">
//                                         {community.is_active ? (
//                                             <span className="px-2.5 py-1 text-xs font-bold tracking-wider rounded border text-emerald-400 bg-emerald-500/10 border-emerald-500/20">Active</span>
//                                         ) : (
//                                             <span className="px-2.5 py-1 text-xs font-bold tracking-wider rounded border text-rose-400 bg-rose-500/10 border-rose-500/20">Inactive</span>
//                                         )}
//                                     </td>
//                                     <td className="p-5 text-right">
//                                         <div className="flex items-center justify-end gap-3">
//                                             <button 
//                                                 onClick={() => setSelectedCommunity(community)}
//                                                 className="px-3 py-1.5 text-xs font-bold transition-colors border rounded-lg text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
//                                             >
//                                                 Edit
//                                             </button>
//                                             <button
//                                                 onClick={() => dispatch(toggleDeactivate({ id: community.id, is_active: community.is_active }))}
//                                                 className={`px-3 py-1.5 text-xs font-bold transition-colors border rounded-lg ${
//                                                     community.is_active 
//                                                     ? "text-rose-400 border-rose-500/30 hover:bg-rose-500/10" 
//                                                     : "text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
//                                                 }`}
//                                             >
//                                                 {community.is_active ? "Deactivate" : "Activate"}
//                                             </button>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//             {/* Note: Ensure EditCommunityModal handles its own dark mode wrapper internally! */}
//         </div>
//     );
// };

// export default CommunityList;