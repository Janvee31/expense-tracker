import { NavLink } from "react-router-dom";

export default function Sidebar() {
    const navItems = [
        { name: "Dashboard", path: "/" },
        { name: "Expenses", path: "/expenses" },
        { name: "Analytics", path: "/analytics" },
        { name: "Categories", path: "/categories" }
    ];

    return (
        <div className="w-64 min-h-screen bg-white shadow-lg p-5">

            {/* LOGO */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-indigo-600">
                    💰 ExpenseTracker
                </h1>
                <p className="text-xs text-gray-500">
                    Smart Finance Manager
                </p>
            </div>

            {/* NAV ITEMS */}
            <div className="flex flex-col gap-2">

                {navItems.map((item, index) => (
                    <NavLink
                        key={item.path} to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium
    ${
                                isActive
                                    ? "bg-indigo-500 text-white shadow-md"
                                    : "text-gray-600 hover:bg-gray-100"
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <span className="text-sm">{isActive ? "📌" : ""}</span>
                                {item.name}
                            </>
                        )}
                    </NavLink>
                ))}

            </div>

            {/* FOOTER */}
            <div className="absolute bottom-5 text-xs text-gray-400">
                © 2026 Expense Tracker
            </div>

        </div>
    );
}