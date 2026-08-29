

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../features/auth/authSlice";
import { useNavigate, Link, useLocation } from "react-router-dom";

import NotificationBell from "./NotificationBell"; 
import UserMeetings from "./UserMeetings";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [unreadSupportCount, setUnreadSupportCount] = useState(0);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/auth/login");
  };

  // useEffect(() => {
  //   if (!isAuthenticated || !user) return;

  //   const wsProtocol = window.location.protocol === "https:" ? "wss://" : "ws://";
    
  //   const targetUserId = user.role === "SUPER_ADMIN" ? "superadmin" : (user.community?.id || user.community);
    
  //   if (!targetUserId || String(targetUserId).includes('[object')) return;

  //   // const alertSocket = new WebSocket(`${wsProtocol}localhost:8000/ws/notification/${targetUserId}/`);
  //   const alertSocket = new WebSocket(`${wsProtocol}localhost:8000/ws/notification/${targetUserId}/`);

  //   alertSocket.onmessage = (event) => {
  //       try {
  //           const data = JSON.parse(event.data);
  //           console.log("🔔 Background Support Push Alert Captured: ", data);

  //           if (location.pathname !== "/admin/hq-chat" && location.pathname !== "/super-admin/admin-chats") {
  //               setUnreadSupportCount(prev => prev + 1);
  //           }
  //       } catch (err) {
  //           console.error("Failed unpacking global telemetry notice", err);
  //       }
  //   };

  //   return () => alertSocket.close();
  // }, [user, isAuthenticated, location.pathname]);

  // Flush the pending count cache to zero immediately when they tap open the target console viewport tab

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const wsProtocol = window.location.protocol === "https:" ? "wss://" : "ws://";
    
    const targetId = user.role === "SUPER_ADMIN" ? "superadmin" : (user.community?.id || user.community);
    
    if (!targetId || String(targetId).includes('[object')) return;

   
    const alertSocket = new WebSocket(`${wsProtocol}localhost:8000/ws/chat/support/${targetId}/`);

    alertSocket.onopen = () => {
        console.log(`📡 Navbar Background Support link open for Room: support/${targetId}`);
    };

    alertSocket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            console.log("🔔 Background Support Push Alert Captured: ", data);

            if (location.pathname !== "/admin/hq-chat" && location.pathname !== "/super-admin/admin-chats") {
                setUnreadSupportCount(prev => prev + 1);
            }
        } catch (err) {
            console.error("Failed unpacking global telemetry notice", err);
        }
    };

    alertSocket.onclose = () => {
        console.log("🔴 Navbar Background Support link closed");
    };

    return () => alertSocket.close();
  }, [user, isAuthenticated, location.pathname]);


  useEffect(() => {
    if (location.pathname === "/admin/hq-chat" || location.pathname === "/super-admin/admin-chats") {
        setUnreadSupportCount(0);
    }
  }, [location.pathname]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-2.5 border-b bg-slate-900/95 backdrop-blur-md border-slate-800/80 shadow-lg shadow-black/30 h-14">
      
      {/* LEFT CONTENT AREA */}
      <div className="flex items-center gap-6 min-w-0 flex-1">
        
        {/* Slender Logo */}
        <span className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 shrink-0">
          ApartCare
        </span>

        {!isAuthenticated && (
          <Link to="/auth/login" className="text-xs font-medium transition-colors text-slate-300 hover:text-cyan-400 shrink-0">
            Login
          </Link>
        )}

        {/* NARROW SCROLLABLE LINKS WRAPPER ROW */}
        <div className="flex gap-5 text-xs font-medium text-slate-400 items-center overflow-x-auto whitespace-nowrap scrollbar-none py-1 min-w-0 pr-4">
            
            {/* 🏢 SUPER ADMIN ROUTE CHANNELS */}
            {user?.role === "SUPER_ADMIN" && (
            <>
                <Link to="/super-admin/Dashboard" className="transition-colors hover:text-cyan-400">📊 Dashboard</Link>
                <Link to="/super-admin/create-community" className="transition-colors hover:text-cyan-400">Community</Link>
                <Link to="/super-admin/sassrate" className="transition-colors hover:text-cyan-400">SaaSRate</Link>
                <Link to="/super-admin/announcements" className="transition-colors hover:text-cyan-400">📢 Broadcast</Link>
                
                {/* 🎯 SUPER ADMIN: LIVE MESSAGES TARGET ICON WITH REAL-TIME INDICATOR PING BUTTON */}
                <Link to="/super-admin/admin-chats" className="transition-colors text-cyan-400 font-bold border border-cyan-500/20 px-2 py-0.5 rounded-lg bg-cyan-500/5 hover:bg-cyan-500/10 relative flex items-center gap-1.5">
                  💬 Admin Messages
                  {unreadSupportCount > 0 && (
                    <span className="flex items-center justify-center bg-rose-500 text-white font-black text-[9px] h-4 min-w-4 px-1 rounded-full border border-slate-950 animate-bounce shadow-[0_0_10px_#f43f5e]">
                      {unreadSupportCount}
                    </span>
                  )}
                </Link>
            </>
            )}

            {/* 🏢 COMMUNITY ADMIN ROUTE CHANNELS */}
            {user?.role === "ADMIN" && (
            <>
                <Link to="/admin/dashboard" className="transition-colors hover:text-cyan-400">Dashboard</Link>
                <Link to="/admin/directory" className="transition-colors hover:text-cyan-400">Directory</Link>
                <Link to="/admin/setup" className="transition-colors hover:text-cyan-400">Community</Link>
                <Link to="/admin/manage-venues" className="transition-colors hover:text-cyan-400">Venues</Link>
                <Link to="/admin/issues" className="transition-colors hover:text-cyan-400">Issues</Link>
                <Link to="/admin/bills/generate" className="transition-colors hover:text-cyan-400">Generate Bills</Link>
                <Link to="/admin/finance" className="transition-colors hover:text-cyan-400">Finance & Salaries</Link>
                <Link to="/admin/announcements" className="transition-colors hover:text-cyan-400">Announcements</Link>
                <Link to="/admin/meetings" className="transition-colors hover:text-cyan-400">Meetings</Link>
                <Link to="/admin/subscription" className="transition-colors hover:text-cyan-400 font-bold text-purple-400">Subscription</Link>
                <Link to="/admin/hq-updates" className="transition-colors hover:text-cyan-400 border px-1.5 py-0.5 border-purple-500/20 rounded bg-purple-500/5">🛡️ HQ Notices</Link>
                <Link to="/admin/reports/payments" className="transition-colors hover:text-cyan-400">📊 Payments</Link>
                
                {/* 🎯 LOCAL ADMIN: CONTACT HQ TARGET ICON WITH REAL-TIME INDICATOR PING BUTTON */}
                <Link to="/admin/hq-chat" className="transition-colors text-purple-400 font-bold border border-purple-500/20 px-2 py-0.5 rounded-lg bg-purple-500/5 hover:bg-purple-500/10 relative flex items-center gap-1.5">
                  💬 Contact HQ
                  {unreadSupportCount > 0 && (
                    <span className="flex items-center justify-center bg-rose-500 text-white font-black text-[9px] h-4 min-w-4 px-1 rounded-full border border-slate-950 animate-bounce shadow-[0_0_10px_#f43f5e]">
                      {unreadSupportCount}
                    </span>
                  )}
                </Link>
            </>
            )}

            {/* RESIDENT ROUTE CHANNELS */}
            {user?.role === "RESIDENT" && (
            <>
                <Link to="/resident/dashboard" className="transition-colors hover:text-cyan-400">Dashboard</Link>
                <Link to="/resident/issues" className="transition-colors hover:text-cyan-400">Issues</Link>
                <Link to="/resident/bills" className="transition-colors hover:text-cyan-400">My Bills</Link>
                <Link to="/resident/venues" className="transition-colors hover:text-cyan-400">Book Venue</Link>
            </>
            )}
            
            {/* STAFF ROUTE CHANNELS */}
            {user?.role === "STAFF" && (
            <>
                <Link to="/staff/dashboard" className="transition-colors hover:text-cyan-400">Staff Portal</Link>
                <Link to="/staff/issues" className="transition-colors hover:text-cyan-400">Issues Tracker</Link>
                <Link to="/staff/salaries" className="transition-colors hover:text-cyan-400">My Payslips</Link>
            </>
            )}

            {isAuthenticated && user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN" && (
              <Link to="/meetings" className="transition-colors hover:text-cyan-400">
                Meetings
              </Link>
            )}
        </div>
      </div>

      {/* RIGHT AUTHENTICATED SYSTEM HUB ITEMS */}
      {isAuthenticated && (
        <div className="flex items-center gap-4 shrink-0 pl-2">
          <NotificationBell />
          
          {user.role !== "SUPER_ADMIN" && (
            <Link to="/profile" className="text-xs font-semibold transition text-slate-300 hover:text-cyan-400">
              My Profile
            </Link>
          )}

          <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
            <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase border rounded-full text-purple-300 bg-purple-500/10 border-purple-500/20">
              {user?.role?.replace('_', ' ')}
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 text-xs font-bold text-white transition-all rounded-md bg-gradient-to-r from-red-500 to-rose-600 hover:brightness-110 active:scale-95"
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