import React from 'react';
import { useDispatch } from "react-redux";
import { toggleDeactivate } from "../features/users/userSlice";


function ToggleUserStatus({ user, onToggleSuccess }) {
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
      alert("Failed to change user status. Check the browser console!");
      console.error("Toggle Error from Django:", error);
    }
  };

  return (
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
  );
}

export default ToggleUserStatus;