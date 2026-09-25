import React, { useState } from 'react';
import { useDispatch } from "react-redux";
import { toggleDeactivate } from "../features/users/userSlice";


function ToggleUserStatus({ user, onToggleSuccess }) {
  const [popup, setPopup] = useState({ isOpen: false, status: '', message: '' });
  const dispatch = useDispatch();

  const isUserActive = user.is_active === true || user.status === 'ACTIVE' || user.status === 'Active';

  const handleToggle = async () => {
    try {
      await dispatch(
        toggleDeactivate({
          id: user.id,
          is_active: isUserActive
        })
      ).unwrap();


      if (onToggleSuccess) {
        onToggleSuccess(user.id, !isUserActive);
      }

    } catch (error) {
        const errorMsg = error?.response?.data?.error || error?.message || "Failed to change user status.";
        setPopup({ isOpen: true, status: 'error', message: errorMsg });
    }
  };

  return (
    <>
      <button
        onClick={handleToggle}
        className={`px-3 py-1 rounded font-medium transition ${
          isUserActive
            ? "bg-red-500 hover:bg-red-600 text-white"   
            : "bg-green-500 hover:bg-green-600 text-white" 
        }`}
      >
        {isUserActive ? "Deactivate" : "Activate"}
      </button>
      {popup.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className={`relative w-full max-w-sm p-8 text-center border shadow-2xl rounded-3xl bg-slate-900 ${popup.status === 'success' ? 'border-emerald-500/30' : 'border-rose-500/30'}`}>
            <h3 className={`text-2xl font-black mb-2 ${popup.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {popup.status === 'success' ? 'Success!' : 'Oops!'}
            </h3>
            <p className="mb-6 text-slate-300">{popup.message}</p>
            <button 
              onClick={() => setPopup({ isOpen: false, status: '', message: '' })} 
              className={`w-full py-3 font-bold rounded-xl ${popup.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>

  );
}

export default ToggleUserStatus;