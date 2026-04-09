import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function Dashboard() {
    const [expenses, setExpenses] = useState([]);

    useEffect(() => {
        axios
            .get("http://localhost:8080/expenses")
            .then((res) => setExpenses(res.data.content || res.data))
            .catch((err) => console.log(err));
    }, []);

    // 💰 Total Expense
    const totalExpense = expenses.reduce(
        (sum, item) => sum + (item.amount || 0),
        0
    );

    // 🏆 Top Category
    const categoryMap = {};
    expenses.forEach((e) => {
        categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
    });

    const topCategory = Object.keys(categoryMap).reduce(
        (a, b) => (categoryMap[a] > categoryMap[b] ? a : b),
        ""
    );

    // 📊 This Month Spending (simple logic)
    const thisMonth = totalExpense;

    // 📋 Recent Expenses
    const recentExpenses = expenses.slice(0, 5);

    return (
        <div className="space-y-8">

            <h1 className="text-2xl font-bold">🏠 Dashboard</h1>

            {/* CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white p-4 rounded-xl shadow">
                    <p className="text-gray-500">Total Expenses</p>
                    <h2 className="text-2xl font-bold">₹{totalExpense}</h2>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white p-4 rounded-xl shadow">
                    <p className="text-gray-500">This Month</p>
                    <h2 className="text-2xl font-bold">₹{thisMonth}</h2>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white p-4 rounded-xl shadow">
                    <p className="text-gray-500">Top Category</p>
                    <h2 className="text-2xl font-bold">{topCategory || "N/A"}</h2>
                </motion.div>

            </div>

            {/* RECENT EXPENSES */}
            <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="font-semibold mb-4">📋 Recent Expenses</h2>

                {recentExpenses.length === 0 ? (
                    <p className="text-gray-500">No expenses yet</p>
                ) : (
                    <div className="space-y-2">
                        {recentExpenses.map((exp) => (
                            <div
                                key={exp.id}
                                className="flex justify-between border-b py-2"
                            >
                                <span>{exp.category}</span>
                                <span className="font-bold">₹{exp.amount}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}