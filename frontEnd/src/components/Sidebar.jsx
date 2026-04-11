import { NavLink } from "react-router-dom";
import { LogOut, LayoutDashboard, Receipt, BarChart3, Tags } from "lucide-react";

export default function Sidebar() {
    const navItems = [
        { name: "Dashboard", path: "/", icon: LayoutDashboard },
        { name: "Expenses", path: "/expenses", icon: Receipt },
        { name: "Analytics", path: "/analytics", icon: BarChart3 },
        { name: "Categories", path: "/categories", icon: Tags }
    ];

    return (
        <div className="w-72 h-screen backdrop-blur-2xl bg-slate-900/50 border-r border-slate-800 p-6 flex flex-col shadow-2xl">

            {/* LOGO */}
            <div className="mb-10 px-2 space-y-1">
                <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
                    <span className="text-3xl">✦</span> Tracker
                </h1>
                <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">
                    Smart Finance
                </p>
            </div>

            {/* NAV ITEMS */}
            <div className="flex flex-col gap-2 flex-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path} to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 font-medium
    ${
                                isActive
                                    ? "bg-slate-800 text-cyan-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-slate-700/50"
                                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border border-transparent"
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={20} className={isActive ? "text-cyan-400" : "text-slate-500"} />
                                <span>{item.name}</span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_2px_rgba(34,211,238,0.5)]" />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </div>

            {/* FOOTER */}
            <div className="mt-auto pt-8 border-t border-slate-800/50">
                <button
                    onClick={() => {
                        localStorage.removeItem("token");
                        window.location.href = "/login";
                    }}
                    className="w-full flex items-center justify-center gap-2 mb-6 bg-slate-800/50 text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 py-3.5 rounded-2xl transition-all font-medium text-sm border border-slate-700/50 hover:border-rose-500/20 group"
                >
                    <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Sign Out
                </button>
                <div className="text-xs text-center text-slate-500/80">
                    © 2026 Tracker App
                </div>
            </div>

        </div>
    );
}