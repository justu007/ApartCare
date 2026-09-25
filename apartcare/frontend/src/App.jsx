import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from './components/Navbar'
import Login from "./pages/Auth/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import CreateCommunity from "./pages/superadmin/CreateCommunity";
import AdminDashboard from "./pages/admin/Dashboard";
import CommunityDirectory from "./pages/admin/CommunityDirectory";
import ManageCommunity from "./pages/admin/ManageCommunity";
import ResidentDashboard from "./pages/Resident/Dashboard";
import StaffDashboard from "./pages/Staff/Dashboard";
import Profile from "./pages/Profile/Profile";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "./features/auth/authSlice";
import EditStaff from "./pages/admin/EditStaff";
import EditResident from "./pages/admin/EditResident";
import ResetPasswordConfirm from './pages/Auth/ResetPasswordConfirm';
import IssueDashboard from "./pages/Resident/IssueDashboard";
import AdminIssues from "./pages/admin/AdminIssue";
import StaffIssues from "./pages/Staff/StaffIssues";
import AdminGenerateBills from "./pages/admin/AdminGenerateBills";
import ResidentBills from "./pages/Resident/ResidentBills";
import StaffSalaries from "./pages/Staff/StaffSalaries";
import AdminFinanceHub from "./pages/admin/AdminSalaries";
import AdminManageHalls from "./pages/admin/AdminManageHalls";
import ResidentHallBooking from "./pages/Resident/ResidentHallBooking";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminMeetings from "./pages/admin/AdminMeetings";
import UserMeetings from "./components/UserMeetings";
import GlobalChat from "./components/GlobalChat";
import AdminPaymentReports from "./pages/admin/AdminPaymentReports";
import Dashboard_SuperAdmin from "./pages/superadmin/Dashboard_SuperAdmin";
import SuperAdminRates from "./pages/superadmin/SuperAdminRates";
import CommunitySubscriptionView from "./pages/admin/CommunitySubscriptionView";
import AdminSuperAdminChat from "./components/AdminSuperAdminChat";
import SuperAdminChatDashboard from "./pages/superadmin/SuperAdminChatDashboard";
import SuperAdminAnnouncements from "./components/SuperAdminAnnouncements";
import GlobalOperatorAnnouncements from "./components/GlobalOperatorAnnouncements";

export default function App() {
  const dispatch = useDispatch();
  const {user,authChecked} = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchProfile());
  }, []);
  if(!authChecked){
    return(
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-slate-500 font-mono text-xs tracking-widest uppercase">
        Verifying session...
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* 🎯 Shell Layout Box Wrapper */}
      <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#020617] text-slate-200 selection:bg-purple-500/30">
        
        {/* Cyberpunk background accent glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-600/20 blur-[120px] pointer-events-none z-0"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-700/10 blur-[150px] pointer-events-none z-0"></div>

        {/* 1. Fixed narrow navigation row layer (Locked to h-14) */}
        <Navbar />
        

        <main className="flex-1 w-full pt-20 pb-12 flex flex-col relative z-10 min-w-0">
          <Routes>
            <Route 
              path="/" 
              element={
                user ? (
                  user.role === 'SUPER_ADMIN' ? <Navigate to="/super-admin/Dashboard" replace /> :
                  user.role === 'ADMIN' ? <Navigate to="/admin/dashboard" replace /> :
                  user.role === 'RESIDENT' ? <Navigate to="/resident/dashboard" replace /> :
                  user.role === 'STAFF' ? <Navigate to="/staff/dashboard" replace /> :
                  <Navigate to="/profile" replace />
                ) : (
                  <Navigate to="/auth/login/" replace />
                )
              } 
            />
            <Route path="/auth/login/" element={<Login />} />
            <Route path="/reset-password-confirm/:uid/:token" element={<ResetPasswordConfirm />} />

            {/* 🏢 SUPER ADMIN CORE CONTROL PANELS */}
            <Route path="/super-admin/Dashboard" element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]}><Dashboard_SuperAdmin /></ProtectedRoute>} />
            <Route path="/super-admin/create-community" element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]}><CreateCommunity /></ProtectedRoute>} />
            <Route path="/super-admin/sassrate" element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]}><SuperAdminRates /></ProtectedRoute>} />
            <Route path="/super-admin/announcements" element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]}><SuperAdminAnnouncements /></ProtectedRoute>} />
            {/* 🎯 Ensure your new Super Admin chat routing entry link is registered here: */}
            <Route path="/super-admin/admin-chats" element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]}><SuperAdminChatDashboard /></ProtectedRoute>} />

            {/* 🏢 COMMUNITY ADMIN PANELS */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/hq-chat" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminSuperAdminChat /></ProtectedRoute>} />
            <Route path="/admin/subscription" element={<ProtectedRoute allowedRoles={["ADMIN"]}><CommunitySubscriptionView /></ProtectedRoute>} />
            <Route path="/admin/hq-updates" element={<ProtectedRoute allowedRoles={["ADMIN"]}><GlobalOperatorAnnouncements /></ProtectedRoute>} />
            <Route path="/admin/bills/generate" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminGenerateBills /></ProtectedRoute>} />
            <Route path="/admin/issues" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminIssues /></ProtectedRoute>} />
            <Route path="/admin/meetings" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminMeetings /></ProtectedRoute>} />
            <Route path="/admin/reports/payments" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminPaymentReports /></ProtectedRoute>} />
            <Route path="/admin/directory" element={<ProtectedRoute allowedRoles={["ADMIN"]}><CommunityDirectory /></ProtectedRoute>} />
            <Route path="/admin/manage-venues" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminManageHalls /></ProtectedRoute>} />
            <Route path="/edit-staff/:id" element={<ProtectedRoute allowedRoles={['ADMIN']}><EditStaff /></ProtectedRoute>} />
            <Route path="/admin/finance" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminFinanceHub /></ProtectedRoute>} />
            <Route path="/admin/announcements" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminAnnouncements /></ProtectedRoute>} />
            <Route path="/edit-resident/:id" element={<ProtectedRoute allowedRoles={['ADMIN']}><EditResident /></ProtectedRoute>} />
            <Route path="/admin/setup" element={<ProtectedRoute allowedRoles={["ADMIN"]}><ManageCommunity /></ProtectedRoute>} />

            {/* 👥 RESIDENTS & STAFFS PORTALS */}
            <Route path="/meetings" element={<ProtectedRoute allowedRoles={["RESIDENT", "STAFF"]}><UserMeetings /></ProtectedRoute>} />
            <Route path="/resident/dashboard" element={<ProtectedRoute allowedRoles={["RESIDENT"]}><ResidentDashboard /></ProtectedRoute>} />
            <Route path="/staff/dashboard" element={<ProtectedRoute allowedRoles={["STAFF"]}><StaffDashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN", "RESIDENT", "STAFF"]}><Profile /></ProtectedRoute>} />
            <Route path="/resident/issues" element={<ProtectedRoute allowedRoles={["RESIDENT"]}><IssueDashboard /></ProtectedRoute>} />
            <Route path="/staff/issues" element={<ProtectedRoute allowedRoles={["STAFF"]}><StaffIssues /></ProtectedRoute>} />
            <Route path="/staff/salaries" element={<ProtectedRoute allowedRoles={['STAFF']}><StaffSalaries /></ProtectedRoute>} />
            <Route path="/resident/bills" element={<ProtectedRoute allowedRoles={['RESIDENT']}><ResidentBills /></ProtectedRoute>} />
            <Route path="/resident/venues" element={<ProtectedRoute allowedRoles={['RESIDENT']}><ResidentHallBooking /></ProtectedRoute>} />

            <Route path="*" element={<div className="text-2xl font-bold text-center mt-10">404 - Page Not Found</div>} />
            <Route path="/resident/subscription" element={<ProtectedRoute allowedRoles={["RESIDENT"]}><CommunitySubscriptionView /></ProtectedRoute>} />

          </Routes>
        </main>
      </div>

      {user && ["ADMIN", "RESIDENT", "STAFF"].includes(user.role) && (
        <GlobalChat 
            currentUserName={user.name} 
            currentUserRole={user.role} 
            communityId={user.community?.id || user.community_id} 
        />
      )}   
    </BrowserRouter>
  );
}