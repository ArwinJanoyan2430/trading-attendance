import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { MenuIcon, XIcon, UserIcon, LogOutIcon, DollarSignIcon} from "lucide-react";

const Sidebar = () => {
  const [email, setEmail] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    getUser();
  }, []);

  async function getUser() {
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      setEmail(data.user.email);
    }
  }

  const handleCustomize = () => {
    // you can change this route later
    window.location.href = "/customize";
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const sidebarContent = (
    <>
      {/* Brand Header */}
      <div className="px-5 pt-6 pb-5 border-b border-white/6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSignIcon />
            <p className="font-bold text-[15px] text-white tracking-wide">
              Broker
            </p>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <XIcon size={20} />
          </button>
        </div>
      </div>

      {/* User Email */}
      {email && (
        <div className="flex gap-3 mx-3 mt-4 mb-2 p-3 rounded-lg bg-white/3 border border-white/4">
          <UserIcon /> <p className="text-[13px] text-slate-200 break-all">{email}</p>
        </div>
      )}


      {/* Logout */}
      <div className="mt-auto mx-5 p-3  border-t border-white/6">
      
        <button
          onClick={handleLogout}
          className="w-full text-left text-slate-400 hover:text-rose-400 text-sm"
        >
            <div className="flex gap-2 ">
                <LogOutIcon size={20}/>
                Log out
            </div>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg shadow-lg border border-white/10"
      >
        <MenuIcon size={20} />
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col h-full w-[260px] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white border-r border-white/4">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-slate-900 to-slate-950 text-white z-50 flex flex-col transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;