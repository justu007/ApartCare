import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, isAuthenticated, authChecked } = useSelector(
    (state) => state.auth
    );

    if (!authChecked) {
    return <div className="text-center mt-20">Loading...</div>;
    }

    if (!isAuthenticated) {
    return <Navigate to="/auth/login/" replace />;
    }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="text-center mt-20 text-red-600">
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;