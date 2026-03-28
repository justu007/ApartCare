import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { BrowserRouter,Routes ,Route,Navigate} from "react-router-dom";
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
import { useSelector } from "react-redux";
import { fetchProfile } from "./features/auth/authSlice";
import CommunityList from "./pages/superadmin/CommunityList";
import EditStaff from "./pages/admin/EditStaff";
import EditResident from "./pages/admin/EditResident";
import ResetPasswordConfirm from './pages/Auth/ResetPasswordConfirm';
import IssueDashboard from "./pages/Resident/IssueDashboard";
import AdminIssues from "./pages/admin/AdminIssue";
import StaffIssues from "./pages/Staff/StaffIssues";

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {

      dispatch(fetchProfile());
    
  }, []);


  return (
    <BrowserRouter>
      <Navbar />
      <div className="relative min-h-screen overflow-hidden bg-[#020617] text-slate-200">
        
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-600/30 blur-[120px] pointer-events-none"></div>
        
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-700/20 blur-[150px] pointer-events-none"></div>

        <div className="relative z-10">

          <Routes>
            <Route path="/" element={<Navigate to="/auth/login/" replace />} />
            <Route path="/auth/login/" element={<Login />} />

            <Route path="/reset-password-confirm/:uid/:token" element={<ResetPasswordConfirm />} />

            <Route
              path="/super-admin/create-community"
              element={
                <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                  <CreateCommunity />
                </ProtectedRoute>
              }
            />

            <Route path="/super-admin/communities" 
              element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <CommunityList />
              </ProtectedRoute>
            } />

            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/admin/issues" 
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminIssues />
                </ProtectedRoute>    
              }
            />

            <Route
              path="/admin/directory"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <CommunityDirectory />
                </ProtectedRoute>
              }
            />
            
            <Route 
              path="/edit-staff/:id" 
            
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                    <EditStaff />
                </ProtectedRoute>
                } 
            />

            <Route 
              path="/edit-resident/:id" 
            
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                    <EditResident />
                </ProtectedRoute>
                } 
            />

            <Route
              path="/admin/setup"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <ManageCommunity />
                </ProtectedRoute>
              }
            />

            <Route
              path="/resident/dashboard"
              element={
                <ProtectedRoute allowedRoles={["RESIDENT"]}>
                  <ResidentDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/staff/dashboard"
              element={
                <ProtectedRoute allowedRoles={["STAFF"]}>
                  <StaffDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute
                  allowedRoles={["SUPER_ADMIN", "ADMIN", "RESIDENT", "STAFF"]}
                >
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route path="/resident/issues" 
              element={
                <ProtectedRoute
                  allowedRoles={[ "RESIDENT"]} >
                  <IssueDashboard />
                </ProtectedRoute>
              } 
            />

            <Route path="/staff/issues" 
              element={
                <ProtectedRoute
                  allowedRoles={[ "STAFF"]} >
                  <StaffIssues />
                </ProtectedRoute>
              } 
            />


            <Route
              path="*"
              element={
                <div className="mt-20 text-2xl font-bold text-center">
                  404 - Page Not Found
                </div>
              }
            />
            

            



          </Routes>
          </div>
      </div>
    </BrowserRouter>
  );
}