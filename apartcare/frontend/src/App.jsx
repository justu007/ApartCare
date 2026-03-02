import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';

// Import all your pages
import CreateCommunity from './pages/SuperAdmin/CreateCommunity';
import AdminDashboard from './pages/Admin/Dashboard';
import CommunityDirectory from './pages/admin/CommunityDirectory'; 
import ManageCommunity from './pages/admin/ManageCommunity';
import Login from './pages/Auth/Login';
import Profile from './pages/Profile/Profile';
import ResidentDashboard from './pages/Resident/Dashboard';
import StaffDashboard from './pages/Staff/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

const Navbar = () => {
  const navigate = useNavigate();
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="flex items-center justify-between p-4 text-white bg-gray-800 shadow-md">
      <div className="flex items-center gap-6">
        <span className="text-xl font-bold">ApartCare</span>
        
        {!user && <Link to="/login" className="transition hover:text-blue-300">Login</Link>}

        {user?.role === 'SUPER_ADMIN' && (
          <Link to="/super-admin/create-community" className="transition hover:text-blue-300">Create Community</Link>
        )}
        
          {user?.role === 'ADMIN' && (
          <>
            <Link to="/admin/dashboard" className="transition hover:text-blue-300">Dashboard</Link>
            <Link to="/admin/directory" className="transition hover:text-blue-300">Directory</Link>
            <Link to="/admin/setup" className="transition hover:text-blue-300">Community Setup</Link>
          </>
        )}

        {user?.role === 'RESIDENT' && (
          <Link to="/resident/dashboard" className="transition hover:text-blue-300">My Dashboard</Link>
        )}

        {user?.role === 'STAFF' && (
          <Link to="/staff/dashboard" className="transition hover:text-blue-300">Staff Portal</Link>
        )}
      </div>

      {user && (
        <div className="flex items-center gap-4">
          <Link to="/profile" className="text-sm font-semibold transition hover:text-blue-300">
            My Profile
          </Link>
          <span className="pl-4 text-sm text-gray-400 border-l border-gray-600">Role: {user.role}</span>
          <button onClick={handleLogout} className="px-3 py-1 text-sm transition bg-red-600 rounded hover:bg-red-700">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

function App() {
  return (
    <Router>
      <Navbar />
      <div className="min-h-screen pb-10 bg-gray-50">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} /> 

          {/* Super Admin Routes */}
          <Route path="/super-admin/create-community" element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}><CreateCommunity /></ProtectedRoute>
          } />

          {/* Community Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>
          } />
          
          {/* 3. DIRECTORY ROUTE ADDED HERE */}
          <Route path="/admin/directory" element={
            <ProtectedRoute allowedRoles={['ADMIN']}><CommunityDirectory /></ProtectedRoute>
          } />

          <Route path="/admin/setup" element={
            <ProtectedRoute allowedRoles={['ADMIN']}><ManageCommunity /></ProtectedRoute>
          } />

          <Route path="/resident/dashboard" element={
            <ProtectedRoute allowedRoles={['RESIDENT']}><ResidentDashboard /></ProtectedRoute>
          } />

          {/* Staff Routes */}
          <Route path="/staff/dashboard" element={
            <ProtectedRoute allowedRoles={['STAFF']}><StaffDashboard /></ProtectedRoute>
          } />

         <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'RESIDENT', 'STAFF']}>
              <Profile />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<div className="mt-20 text-2xl font-bold text-center">404 - Page Not Found</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;