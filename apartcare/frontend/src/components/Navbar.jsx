// import { useSelector, useDispatch } from "react-redux";
// import { logoutUser } from "../features/auth/authSlice";
// import { useNavigate,Link } from "react-router-dom";

// const Navbar = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const { user, isAuthenticated } = useSelector((state) => state.auth);

//   const handleLogout = async () => {
//     await dispatch(logoutUser());
//     navigate("/auth/login");
//   };

//   return (
//     <nav className="flex items-center justify-between p-4 text-white bg-gray-800 shadow-md">
//       <div className="flex items-center gap-6">
//         <span className="text-xl font-bold">ApartCare</span>

//         {!isAuthenticated && (
//           <Link to="/auth/login" className="transition hover:text-blue-300">
//             Login
//           </Link>
//         )}

//         {user?.role === "SUPER_ADMIN" && (
//           <>
//             <Link to="/super-admin/create-community" className="hover:text-blue-300">
//               Create Community
//             </Link>

//             <Link to="/super-admin/communities" className="hover:text-blue-300">
//               Communities
//             </Link>
//           </>
//         )}

//         {user?.role === "ADMIN" && (
//           <>
//             <Link to="/admin/dashboard" className="transition hover:text-blue-300">
//               Dashboard
//             </Link>
//             <Link to="/admin/directory" className="transition hover:text-blue-300">
//               Directory
//             </Link>
//             <Link to="/admin/setup" className="transition hover:text-blue-300">
//               Community Setup
//             </Link>
//           </>
//         )}

//         {user?.role === "RESIDENT" && (
//           <>
//             <Link to="/resident/dashboard" className="transition hover:text-blue-300">
//               My Dashboard
//             </Link>
            
//             <Link to="/resident/issues" className="transition hover:text-blue-300">
//               Issues
//             </Link>
//           </>
//         )}

//         {user?.role === "STAFF" && (
//           <Link to="/staff/dashboard" className="transition hover:text-blue-300">
//             Staff Portal
//           </Link>
//         )}
//       </div>

//       {isAuthenticated && (
//         <div className="flex items-center gap-4">
//           {user.role!== "SUPER_ADMIN" &&(
//             <Link to="/profile" className="text-sm font-semibold transition hover:text-blue-300">
//             My Profile
//           </Link>
//           )}

//           <span className="pl-4 text-sm text-gray-400 border-l border-gray-600">
//             Role: {user?.role}
//           </span>
//           <button
//             onClick={handleLogout}
//             className="px-3 py-1 text-sm transition bg-red-600 rounded hover:bg-red-700"
//           >
//             Logout
//           </button>
//         </div>
//       )}
//     </nav>
//   );
// };

// export default Navbar

import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../features/auth/authSlice";
import { useNavigate, Link } from "react-router-dom";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/auth/login");
  };

  return (
    
    <nav className="sticky top-0 z-50 flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 shadow-lg shadow-black/20">
      <div className="flex items-center gap-8">
        
        {/* Colorful Gradient Logo */}
        <span className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">
          ApartCare
        </span>

        {!isAuthenticated && (
          <Link to="/auth/login" className="font-medium text-slate-300 transition-colors hover:text-cyan-400">
            Login
          </Link>
        )}

        <div className="flex gap-6 text-sm font-medium text-slate-400">
            {user?.role === "SUPER_ADMIN" && (
            <>
                <Link to="/super-admin/create-community" className="transition-colors hover:text-cyan-400">Create Community</Link>
                <Link to="/super-admin/communities" className="transition-colors hover:text-cyan-400">Communities</Link>
            </>
            )}

            {user?.role === "ADMIN" && (
            <>
                <Link to="/admin/dashboard" className="transition-colors hover:text-cyan-400">Dashboard</Link>
                <Link to="/admin/directory" className="transition-colors hover:text-cyan-400">Directory</Link>
                <Link to="/admin/setup" className="transition-colors hover:text-cyan-400">Community</Link>
                <Link to="/admin/issues" className="transition-colors hover:text-cyan-400 ">Issues</Link>
            </>
            )}
            {/* text-cyan-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)] */}

            {user?.role === "RESIDENT" && (
            <>
                <Link to="/resident/dashboard" className="transition-colors hover:text-cyan-400">Dashboard</Link>
                <Link to="/resident/issues" className="transition-colors hover:text-cyan-400">Issues</Link>
            </>
            )}

            {user?.role === "STAFF" && (
            <>
                <Link to="/staff/dashboard" className="transition-colors hover:text-cyan-400">Staff Portal</Link>
                <Link to="/staff/issues" className="transition-colors hover:text-cyan-400">Issues Tracker</Link>
            </>
            )}
        </div>
      </div>

      {isAuthenticated && (
        <div className="flex items-center gap-5">
          {user.role !== "SUPER_ADMIN" && (
            <Link to="/profile" className="text-sm font-semibold text-slate-300 transition hover:text-cyan-400">
              My Profile
            </Link>
          )}

          <div className="flex items-center gap-3 pl-5 border-l border-slate-700">
            <span className="px-3 py-1 text-xs font-bold tracking-wider text-purple-300 uppercase bg-purple-500/10 border border-purple-500/20 rounded-full">
              {user?.role}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-1.5 text-sm font-bold text-white transition-all bg-gradient-to-r from-red-500 to-rose-600 rounded-lg hover:shadow-[0_0_15px_rgba(225,29,72,0.4)] hover:-translate-y-0.5"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;