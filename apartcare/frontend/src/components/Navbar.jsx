import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../features/auth/authSlice";
import { useNavigate,Link } from "react-router-dom";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/auth/login");
  };

  return (
    <nav className="flex items-center justify-between p-4 text-white bg-gray-800 shadow-md">
      <div className="flex items-center gap-6">
        <span className="text-xl font-bold">ApartCare</span>

        {!isAuthenticated && (
          <Link to="/auth/login" className="transition hover:text-blue-300">
            Login
          </Link>
        )}

        {user?.role === "SUPER_ADMIN" && (
          <>
            <Link to="/super-admin/create-community" className="hover:text-blue-300">
              Create Community
            </Link>

            <Link to="/super-admin/communities" className="hover:text-blue-300">
              Communities
            </Link>
          </>
        )}

        {user?.role === "ADMIN" && (
          <>
            <Link to="/admin/dashboard" className="transition hover:text-blue-300">
              Dashboard
            </Link>
            <Link to="/admin/directory" className="transition hover:text-blue-300">
              Directory
            </Link>
            <Link to="/admin/setup" className="transition hover:text-blue-300">
              Community Setup
            </Link>
          </>
        )}

        {user?.role === "RESIDENT" && (
          <Link to="/resident/dashboard" className="transition hover:text-blue-300">
            My Dashboard
          </Link>
        )}

        {user?.role === "STAFF" && (
          <Link to="/staff/dashboard" className="transition hover:text-blue-300">
            Staff Portal
          </Link>
        )}
      </div>

      {isAuthenticated && (
        <div className="flex items-center gap-4">
          {user.role!== "SUPER_ADMIN" &&(
            <Link to="/profile" className="text-sm font-semibold transition hover:text-blue-300">
            My Profile
          </Link>
          )}

          <span className="pl-4 text-sm text-gray-400 border-l border-gray-600">
            Role: {user?.role}
          </span>
          <button
            onClick={handleLogout}
            className="px-3 py-1 text-sm transition bg-red-600 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar