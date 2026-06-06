// import { useState } from "react";
// import { useDispatch } from "react-redux";
// import { editCommunity } from "../features/community/communitySlice";

// const EditCommunityModal = ({ community, onClose }) => {
//   const dispatch = useDispatch();

//   const [form, setForm] = useState({
//     name: community.name,
//     address: community.address,
//     admin: {
//       name: community.admin.name,
//       email: community.admin.email,
//       phone: community.admin.phone,
//     },
//   });

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleAdminChange = (e) => {
//     setForm({
//       ...form,
//       admin: { ...form.admin, [e.target.name]: e.target.value },
//     });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     dispatch(
//       editCommunity({
//         id: community.id,
//         data: form,
//       })
//     );

//     onClose();
//   };

//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">

//       <div className="w-96 p-6 bg-white rounded">

//         <h2 className="mb-4 text-xl font-bold">Edit Community</h2>

//         <form onSubmit={handleSubmit} className="space-y-3">

//           <input
//             type="text"
//             name="name"
//             value={form.name}
//             onChange={handleChange}
//             className="w-full p-2 border"
//             placeholder="Community Name"
//           />

//           <input
//             type="text"
//             name="address"
//             value={form.address}
//             onChange={handleChange}
//             className="w-full p-2 border"
//             placeholder="Address"
//           />

//           <h3 className="mt-4 font-semibold">Admin</h3>

//           <input
//             type="text"
//             name="name"
//             value={form.admin.name}
//             onChange={handleAdminChange}
//             className="w-full p-2 border"
//             placeholder="Admin Name"
//           />

//           <input
//             type="email"
//             name="email"
//             value={form.admin.email}
//             onChange={handleAdminChange}
//             className="w-full p-2 border"
//             placeholder="Admin Email"
//           />

//           <input
//             type="text"
//             name="phone"
//             value={form.admin.phone}
//             onChange={handleAdminChange}
//             className="w-full p-2 border"
//             placeholder="Admin Phone"
//           />

//           <div className="flex justify-end gap-2 mt-4">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-3 py-1 bg-gray-300 rounded"
//             >
//               Cancel
//             </button>

//             <button
//               type="submit"
//               className="px-3 py-1 text-white bg-blue-600 rounded"
//             >
//               Update
//             </button>
//           </div>

//         </form>
//       </div>
//     </div>
//   );
// };

// export default EditCommunityModal;
import { useState } from "react";
import { useDispatch } from "react-redux";
import { editCommunity } from "../features/community/communitySlice";

const EditCommunityModal = ({ community, onClose }) => {
  const dispatch = useDispatch();

  // Guard track initialization safely using fallback strings
  const [form, setForm] = useState({
    name: community?.name || '',
    address: community?.address || '',
    admin: {
      name: community?.admin?.name || '',
      email: community?.admin?.email || '',
      phone: community?.admin?.phone || '',
    },
  });

  // 🎯 NEW: Dynamic states for success tracking and error handling
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSuccessMessage(''); // Clear state variables on modification loops
  };

  const handleAdminChange = (e) => {
    setForm({
      ...form,
      admin: { ...form.admin, [e.target.name]: e.target.value },
    });
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Dispatch the core edit payload to Redux
      await dispatch(
        editCommunity({
          id: community.id,
          data: form,
        })
      );

   
      setSuccessMessage("✅ Community details updated successfully!");

      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err) {
      console.error("Failed to commit settings updates:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/60 animate-fade-in">

      <div className="relative w-full max-w-lg p-6 border shadow-2xl bg-slate-900 border-slate-800 rounded-2xl">

        {/* Modal Title Header Row */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            ✏️ Edit Community Settings
          </h2>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-slate-400 hover:text-white font-bold transition-colors text-sm px-2 py-1 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* 🎯 NEW: BEAUTIFUL SUCCESS MESSAGE ALERT WINDOW */}
        {successMessage && (
          <div className="p-4 mb-5 text-sm font-semibold border rounded-xl bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-xl shadow-emerald-950/20 transform animate-fade-in">
            <div className="flex items-center gap-2">
              <span>🎉</span>
              <p>{successMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">

          {/* SECTION A: COMMUNITY DATA */}
          <div>
            <label className="block mb-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Community Workspace Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full p-2.5 text-sm transition-all duration-200 border outline-none bg-slate-950/40 border-slate-700 text-slate-100 rounded-lg focus:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Community Name"
            />
          </div>

          <div>
            <label className="block mb-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Physical Mapping Address
            </label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              className="w-full p-2.5 text-sm transition-all duration-200 border outline-none bg-slate-950/40 border-slate-700 text-slate-100 rounded-lg focus:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Address"
            />
          </div>

          {/* SECTION B: ASSIGNED PROFILE CREDENTIALS */}
          <div className="pt-3 mt-4 border-t border-slate-800/80">
            <h3 className="mb-3 text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 uppercase tracking-wider">
              Community Admin Profile
            </h3>
          </div>

          <div>
            <label className="block mb-1.5 text-xs font-semibold text-slate-400 uppercase">
              Manager Full Name
            </label>
            <input
              type="text"
              name="name"
              value={form.admin.name}
              onChange={handleAdminChange}
              required
              className="w-full p-2.5 text-sm transition-all duration-200 border outline-none bg-slate-950/40 border-slate-700 text-slate-100 rounded-lg focus:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Admin Name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-slate-400 uppercase">
                Login Email
              </label>
              <input
                type="email"
                name="email"
                value={form.admin.email}
                onChange={handleAdminChange}
                required
                className="w-full p-2.5 text-sm transition-all duration-200 border outline-none bg-slate-950/40 border-slate-700 text-slate-100 rounded-lg focus:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Admin Email"
              />
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-semibold text-slate-400 uppercase">
                Contact Phone
              </label>
              <input
                type="text"
                name="phone"
                value={form.admin.phone}
                onChange={handleAdminChange}
                className="w-full p-2.5 text-sm transition-all duration-200 border outline-none bg-slate-950/40 border-slate-700 text-slate-100 rounded-lg focus:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Admin Phone"
              />
            </div>
          </div>

          {/* Action Controls Form Footer Area */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-slate-300 transition-colors border border-slate-700 rounded-lg hover:bg-slate-800 disabled:opacity-40"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || successMessage}
              className="px-5 py-2 text-xs font-bold text-white transition-all rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Configuration...' : successMessage ? 'Saved!' : 'Update Parameters'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditCommunityModal;