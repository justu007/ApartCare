// // import { useSelector, useDispatch } from "react-redux";
// // import { logoutUser } from "../features/auth/authSlice";
// // import { useNavigate, Link } from "react-router-dom";

// // const Navbar = () => {
// //   const dispatch = useDispatch();
// //   const navigate = useNavigate();
// //   const { user, isAuthenticated } = useSelector((state) => state.auth);

// //   const handleLogout = async () => {
// //     await dispatch(logoutUser());
// //     navigate("/auth/login");
// //   };

// //   return (
// //     <nav className="sticky top-0 z-50 flex items-center justify-between p-4 border-b bg-slate-900/80 backdrop-blur-md border-slate-800 shadow-lg shadow-black/20">
// //       <div className="flex items-center gap-8">
        
// //         {/* Colorful Gradient Logo */}
// //         <span className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">
// //           ApartCare
// //         </span>

// //         {!isAuthenticated && (
// //           <Link to="/auth/login" className="font-medium transition-colors text-slate-300 hover:text-cyan-400">
// //             Login
// //           </Link>
// //         )}

// //         <div className="flex gap-6 text-sm font-medium text-slate-400">
// //             {user?.role === "SUPER_ADMIN" && (
// //             <>
// //                 <Link to="/super-admin/create-community" className="transition-colors hover:text-cyan-400">Create Community</Link>
// //                 <Link to="/super-admin/communities" className="transition-colors hover:text-cyan-400">Communities</Link>
// //             </>
// //             )}

// //             {user?.role === "ADMIN" && (
// //             <>
// //                 <Link to="/admin/dashboard" className="transition-colors hover:text-cyan-400">Dashboard</Link>
// //                 <Link to="/admin/directory" className="transition-colors hover:text-cyan-400">Directory</Link>
// //                 <Link to="/admin/setup" className="transition-colors hover:text-cyan-400">Community</Link>
// //                 <Link to="/admin/issues" className="transition-colors hover:text-cyan-400 ">Issues</Link>
// //                 <Link to="/admin/bills/generate" className="transition-colors hover:text-cyan-400 ">Generate Bills</Link>
// //             </>
// //             )}

// //             {user?.role === "RESIDENT" && (
// //             <>
// //                 <Link to="/resident/dashboard" className="transition-colors hover:text-cyan-400">Dashboard</Link>
// //                 <Link to="/resident/issues" className="transition-colors hover:text-cyan-400">Issues</Link>
// //                 {/* ✅ NEW BILLS LINK FOR RESIDENTS ONLY */}
// //                 <Link to="/resident/bills" className="transition-colors hover:text-cyan-400">My Bills</Link>
// //             </>
// //             )}

// //             {user?.role === "STAFF" && (
// //             <>
// //                 <Link to="/staff/dashboard" className="transition-colors hover:text-cyan-400">Staff Portal</Link>
// //                 <Link to="/staff/issues" className="transition-colors hover:text-cyan-400">Issues Tracker</Link>
// //             </>
// //             )}
// //         </div>
// //       </div>

// //       {isAuthenticated && (
// //         <div className="flex items-center gap-5">
// //           {user.role !== "SUPER_ADMIN" && (
// //             <Link to="/profile" className="text-sm font-semibold transition text-slate-300 hover:text-cyan-400">
// //               My Profile
// //             </Link>
// //           )}

// //           <div className="flex items-center gap-3 pl-5 border-l border-slate-700">
// //             <span className="px-3 py-1 text-xs font-bold tracking-wider uppercase border rounded-full text-purple-300 bg-purple-500/10 border-purple-500/20">
// //               {user?.role}
// //             </span>
// //             <button
// //               onClick={handleLogout}
// //               className="px-4 py-1.5 text-sm font-bold text-white transition-all rounded-lg bg-gradient-to-r from-red-500 to-rose-600 hover:shadow-[0_0_15px_rgba(225,29,72,0.4)] hover:-translate-y-0.5"
// //             >
// //               Logout
// //             </button>
// //           </div>
// //         </div>
// //       )}
// //     </nav>
// //   );
// // };

// // export default Navbar;
// import { useSelector, useDispatch } from "react-redux";
// import { logoutUser } from "../features/auth/authSlice";
// import { useNavigate, Link } from "react-router-dom";

// const Navbar = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { user, isAuthenticated } = useSelector((state) => state.auth);

//   const handleLogout = async () => {
//     await dispatch(logoutUser());
//     navigate("/auth/login");
//   };

//   return (
//     <nav className="sticky top-0 z-50 flex items-center justify-between p-4 border-b bg-slate-900/80 backdrop-blur-md border-slate-800 shadow-lg shadow-black/20">
//       <div className="flex items-center gap-8">
        
//         {/* Colorful Gradient Logo */}
//         <span className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">
//           ApartCare
//         </span>

//         {!isAuthenticated && (
//           <Link to="/auth/login" className="font-medium transition-colors text-slate-300 hover:text-cyan-400">
//             Login
//           </Link>
//         )}

//         <div className="flex gap-6 text-sm font-medium text-slate-400">
//             {user?.role === "SUPER_ADMIN" && (
//             <>
//                 <Link to="/super-admin/create-community" className="transition-colors hover:text-cyan-400">Create Community</Link>
//                 <Link to="/super-admin/communities" className="transition-colors hover:text-cyan-400">Communities</Link>
//             </>
//             )}

//             {user?.role === "ADMIN" && (
//             <>
//                 <Link to="/admin/dashboard" className="transition-colors hover:text-cyan-400">Dashboard</Link>
//                 <Link to="/admin/directory" className="transition-colors hover:text-cyan-400">Directory</Link>
//                 <Link to="/admin/setup" className="transition-colors hover:text-cyan-400">Community</Link>
//                 <Link to="/admin/issues" className="transition-colors hover:text-cyan-400 ">Issues</Link>
//                 <Link to="/admin/bills/generate" className="transition-colors hover:text-cyan-400 ">Generate Bills</Link>
//             </>
//             )}

//             {user?.role === "RESIDENT" && (
//             <>
//                 <Link to="/resident/dashboard" className="transition-colors hover:text-cyan-400">Dashboard</Link>
//                 <Link to="/resident/issues" className="transition-colors hover:text-cyan-400">Issues</Link>
//                 <Link to="/resident/bills" className="transition-colors hover:text-cyan-400">My Bills</Link>
//             </>
//             )}

//             {user?.role === "STAFF" && (
//             <>
//                 <Link to="/staff/dashboard" className="transition-colors hover:text-cyan-400">Staff Portal</Link>
//                 <Link to="/staff/issues" className="transition-colors hover:text-cyan-400">Issues Tracker</Link>
//             </>
//             )}
//         </div>
//       </div>

//       {isAuthenticated && (
//         <div className="flex items-center gap-5">
//           {user.role !== "SUPER_ADMIN" && (
//             <Link to="/profile" className="text-sm font-semibold transition text-slate-300 hover:text-cyan-400">
//               My Profile
//             </Link>
//           )}

//           <div className="flex items-center gap-3 pl-5 border-l border-slate-700">
//             <span className="px-3 py-1 text-xs font-bold tracking-wider uppercase border rounded-full text-purple-300 bg-purple-500/10 border-purple-500/20">
//               {user?.role}
//             </span>
//             <button
//               onClick={handleLogout}
//               className="px-4 py-1.5 text-sm font-bold text-white transition-all rounded-lg bg-gradient-to-r from-red-500 to-rose-600 hover:shadow-[0_0_15px_rgba(225,29,72,0.4)] hover:-translate-y-0.5"
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// };

// export default Navbar;

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
    <nav className="sticky top-0 z-50 flex items-center justify-between p-4 border-b bg-slate-900/80 backdrop-blur-md border-slate-800 shadow-lg shadow-black/20">
      <div className="flex items-center gap-8">
        
        {/* Colorful Gradient Logo */}
        <span className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">
          ApartCare
        </span>

        {!isAuthenticated && (
          <Link to="/auth/login" className="font-medium transition-colors text-slate-300 hover:text-cyan-400">
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
                <Link to="/admin/bills/generate" className="transition-colors hover:text-cyan-400 ">Generate Bills</Link>
                <Link to="/admin/salaries/pay" className="transition-colors hover:text-cyan-400 ">Pay Staff</Link>
            </>
            )}

            {user?.role === "RESIDENT" && (
            <>
                <Link to="/resident/dashboard" className="transition-colors hover:text-cyan-400">Dashboard</Link>
                <Link to="/resident/issues" className="transition-colors hover:text-cyan-400">Issues</Link>
                <Link to="/resident/bills" className="transition-colors hover:text-cyan-400">My Bills</Link>
            </>
            )}

            
            {user?.role === "STAFF" && (
            <>
                <Link to="/staff/dashboard" className="transition-colors hover:text-cyan-400">Staff Portal</Link>
                <Link to="/staff/issues" className="transition-colors hover:text-cyan-400">Issues Tracker</Link>
                <Link to="/staff/salaries" className="transition-colors hover:text-cyan-400">My Payslips</Link>
            </>
            )}
        </div>
      </div>

      {isAuthenticated && (
        <div className="flex items-center gap-5">
          {user.role !== "SUPER_ADMIN" && (
            <Link to="/profile" className="text-sm font-semibold transition text-slate-300 hover:text-cyan-400">
              My Profile
            </Link>
          )}

          <div className="flex items-center gap-3 pl-5 border-l border-slate-700">
            <span className="px-3 py-1 text-xs font-bold tracking-wider uppercase border rounded-full text-purple-300 bg-purple-500/10 border-purple-500/20">
              {user?.role}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-1.5 text-sm font-bold text-white transition-all rounded-lg bg-gradient-to-r from-red-500 to-rose-600 hover:shadow-[0_0_15px_rgba(225,29,72,0.4)] hover:-translate-y-0.5"
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