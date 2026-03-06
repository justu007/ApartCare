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


export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {

      dispatch(fetchProfile());
    
  }, []);


  return (
    <BrowserRouter>
      <Navbar />
      <div className="min-h-screen pb-10 bg-gray-50">
        <Routes>
          <Route path="/" element={<Navigate to="/auth/login/" replace />} />
          <Route path="/auth/login/" element={<Login />} />

          <Route
            path="/super-admin/create-community"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <CreateCommunity />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboard />
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
    </BrowserRouter>
  );
}