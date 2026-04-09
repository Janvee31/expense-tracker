import { User } from "lucide-react";

export default function Navbar() {
    return (
        <div className="bg-white shadow p-4 flex justify-between items-center">

            <h2 className="font-semibold">Expense Tracker</h2>

            <User className="text-gray-600" />

        </div>
    );
}