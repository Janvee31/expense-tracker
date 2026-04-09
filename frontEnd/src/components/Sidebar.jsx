import { NavLink } from "react-router-dom";

export default function Sidebar() {
    return (
        <div className="w-64 h-screen bg-white shadow-lg p-5 fixed">

            <h1 className="text-xl font-bold mb-8">💰 Expense Tracker</h1>

            <nav className="flex flex-col gap-4">

                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        isActive ? "text-blue-600 font-bold" : "text-gray-600"
                    }
                >
                    Dashboard
                </NavLink>

                <NavLink
                    to="/expenses"
                    className={({ isActive }) =>
                        isActive ? "text-blue-600 font-bold" : "text-gray-600"
                    }
                >
                    Expenses
                </NavLink>

                <NavLink
                    to="/analytics"
                    className={({ isActive }) =>
                        isActive ? "text-blue-600 font-bold" : "text-gray-600"
                    }
                >
                    Analytics
                </NavLink>

                <NavLink
                    to="/categories"
                    className={({ isActive }) =>
                        isActive ? "text-blue-600 font-bold" : "text-gray-600"
                    }
                >
                    Categories
                </NavLink>

            </nav>
        </div>
    );
}