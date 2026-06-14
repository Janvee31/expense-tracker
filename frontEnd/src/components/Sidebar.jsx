import { NavLink } from "react-router-dom";
import { LogOut, LayoutDashboard, Receipt, BarChart3, Tags, Sparkles, Users, Percent, Wallet } from "lucide-react";

export default function Sidebar() {
    const navItems = [
        { name: "Dashboard", path: "/", icon: LayoutDashboard },
        { name: "Expenses", path: "/expenses", icon: Receipt },
        { name: "Analytics", path: "/analytics", icon: BarChart3 },
        { name: "Categories", path: "/categories", icon: Tags },
        { name: "AI Assistant", path: "/chat", icon: Sparkles, badge: "NEW", badgeType: "emerald" },
        { name: "Family Group", path: "/family", icon: Users },
        { name: "Hisab(Split)", path: "/hisab", icon: Percent, badge: "SPLIT", badgeType: "blue" }
    ];

    return (
        <div className="w-72 h-screen bg-white border-r border-slate-200 p-6 flex flex-col shadow-sm">

            {/* LOGO */}
            <div className="mb-10 px-2">
                <h1 className="text-2xl font-black text-black flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-sm">
                        <Wallet size={18} />
                    </div>
                    <span className="tracking-tight">Hisab<span className="text-emerald-500 font-medium">(Split)</span></span>
                </h1>
            </div>

            {/* NAV ITEMS */}
            <div className="flex flex-col gap-1.5 flex-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path} to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-bold text-base border
    ${
                                isActive
                                    ? "bg-emerald-50/80 border-emerald-100 text-emerald-600 shadow-sm"
                                    : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={20} className={isActive ? "text-emerald-500" : "text-slate-400"} />
                                <span>{item.name}</span>
                                {item.badge && (
                                    <span className={`ml-2 px-1.5 py-0.5 text-[8px] font-extrabold uppercase rounded-md tracking-wider border ${
                                        item.badgeType === "emerald"
                                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                            : "bg-blue-50 text-blue-600 border-blue-100"
                                    }`}>
                                        {item.badge}
                                    </span>
                                )}
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_1px_rgba(34,197,94,0.4)]" />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </div>

            {/* VISUAL WIDGET: DAILY LIMIT PANEL */}
            <div className="mt-4 mb-6 p-4 rounded-2xl bg-emerald-50/30 border border-emerald-100/60 relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
                <div className="relative z-10 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <span className="p-1 bg-emerald-500/20 text-emerald-600 rounded-md">
                            <Wallet size={12} className="animate-pulse" />
                        </span>
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Daily Budget</span>
                    </div>
                    <div className="flex justify-between items-baseline mt-0.5">
                        <span className="text-base font-black text-black">₹1,500.00</span>
                        <span className="text-[9px] text-emerald-600 font-extrabold bg-emerald-100/60 px-1.5 py-0.5 rounded-full uppercase">Safe</span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: "42%" }} />
                    </div>
                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">42% of daily limit spent</div>
                </div>
            </div>

            {/* FOOTER */}
            <div className="mt-auto pt-4 border-t border-slate-100">
                <button
                    onClick={() => {
                        localStorage.removeItem("token");
                        window.location.href = "/login";
                    }}
                    className="w-full flex items-center justify-center gap-2 mb-6 bg-slate-50 text-slate-600 hover:text-rose-600 hover:bg-rose-50 py-3.5 rounded-2xl transition-all font-semibold text-sm border border-slate-100 hover:border-rose-100 group"
                >
                    <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Sign Out
                </button>
                <div className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-wider">
                    © 2026 Hisab App
                </div>
            </div>

        </div>
    );
}