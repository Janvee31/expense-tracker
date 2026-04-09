import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { categoryColors } from "../utils/categoryColors";
import { Wallet, TrendingUp, Trophy } from "lucide-react";

export default function Dashboard() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios
            .get("http://localhost:8080/expenses")
            .then((res) => {
                setExpenses(res.data.content || res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setLoading(false);
            });
    }, []);

    const totalExpense = expenses.reduce(
        (sum, item) => sum + (item.amount || 0),
        0
    );

    const thisMonthExpense = totalExpense; // (you can refine later)

    const categoryMap = expenses.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + (curr.amount || 0);
        return acc;
    }, {});

    const topCategory = Object.keys(categoryMap).reduce(
        (a, b) => (categoryMap[a] > categoryMap[b] ? a : b),
        ""
    );

    const recentExpenses = expenses.slice(0, 5);

    // 💡 simple animated number effect
    const AnimatedNumber = ({ value }) => {
        const [display, setDisplay] = useState(0);

        useEffect(() => {
            let start = 0;
            const step = Math.ceil(value / 30);

            const interval = setInterval(() => {
                start += step;
                if (start >= value) {
                    setDisplay(value);
                    clearInterval(interval);
                } else {
                    setDisplay(start);
                }
            }, 20);

            return () => clearInterval(interval);
        }, [value]);

        return <>{display}</>;
    };

    if (loading) {
        return (
            <div className="p-10 text-gray-500 text-lg">
                Loading dashboard...
            </div>
        );
    }

    return (
        <div className="space-y-10 p-2">

            {/* HEADER */}
            <div>
                <h1 className="text-4xl font-bold text-gray-800">
                    💰 Premium Dashboard
                </h1>
                <p className="text-gray-500 text-lg">
                    Track your money like a pro
                </p>
            </div>

            {/* CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* TOTAL */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="backdrop-blur-xl bg-white/70 border border-gray-200 p-8 rounded-2xl shadow-lg"
                >
                    <div className="flex justify-between items-center">
                        <Wallet className="text-indigo-500" />
                        <span className="text-xs text-gray-500">Total</span>
                    </div>

                    <h2 className="text-4xl font-bold mt-4 text-indigo-600">
                        ₹<AnimatedNumber value={totalExpense} />
                    </h2>

                    <p className="text-gray-500 text-sm mt-2">
                        All time spending
                    </p>
                </motion.div>

                {/* MONTH */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="backdrop-blur-xl bg-white/70 border border-gray-200 p-8 rounded-2xl shadow-lg"
                >
                    <div className="flex justify-between items-center">
                        <TrendingUp className="text-green-500" />
                        <span className="text-xs text-gray-500">Month</span>
                    </div>

                    <h2 className="text-4xl font-bold mt-4 text-green-600">
                        ₹<AnimatedNumber value={thisMonthExpense} />
                    </h2>

                    <p className="text-gray-500 text-sm mt-2">
                        This month spending
                    </p>
                </motion.div>

                {/* TOP CATEGORY */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="backdrop-blur-xl bg-white/70 border border-gray-200 p-8 rounded-2xl shadow-lg"
                >
                    <div className="flex justify-between items-center">
                        <Trophy className="text-yellow-500" />
                        <span className="text-xs text-gray-500">Top</span>
                    </div>

                    <h2 className="text-3xl font-bold mt-4 text-yellow-600">
                        {topCategory || "N/A"}
                    </h2>

                    <p className="text-gray-500 text-sm mt-2">
                        Highest spending category
                    </p>
                </motion.div>

            </div>

            {/* RECENT */}
            <div className="backdrop-blur-xl bg-white/70 border border-gray-200 p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-semibold mb-5">
                    📋 Recent Expenses
                </h2>

                {recentExpenses.length === 0 ? (
                    <p className="text-gray-500">No expenses yet</p>
                ) : (
                    <div className="space-y-4">
                        {recentExpenses.map((exp) => (
                            <div
                                key={exp.id}
                                className="flex justify-between items-center border-b pb-3"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{
                                            backgroundColor:
                                                categoryColors[exp.category] || "#64748b"
                                        }}
                                    />
                                    <span className="text-lg">
                                        {exp.category}
                                    </span>
                                </div>

                                <span className="font-bold text-gray-800 text-lg">
                                    ₹{exp.amount}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}