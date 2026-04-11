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

    const topCategory = Object.keys(categoryMap).length > 0 ? Object.keys(categoryMap).reduce(
        (a, b) => (categoryMap[a] > categoryMap[b] ? a : b),
        ""
    ) : "N/A";

    const recentExpenses = expenses.slice(0, 5);

    const AnimatedNumber = ({ value }) => {
        const [display, setDisplay] = useState(0);

        useEffect(() => {
            let start = 0;
            const step = Math.ceil(value / 30);
            if (value === 0) return setDisplay(0);

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
            <div className="p-10 flex items-center justify-center animate-pulse text-indigo-400 text-lg">
                Loading dashboard...
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* HEADER */}
            <div className="mb-10">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                    Premium Dashboard
                </h1>
                <p className="text-cyan-400 text-lg mt-1 font-medium tracking-wide">
                    Track your money like a pro
                </p>
            </div>

            {/* CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* TOTAL */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="relative overflow-hidden backdrop-blur-xl bg-slate-900/50 border border-slate-700/50 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-indigo-500/20" />
                    <div className="flex justify-between items-center relative z-10">
                        <div className="p-3 bg-indigo-500/20 rounded-2xl">
                            <Wallet className="text-indigo-400" size={24} />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total</span>
                    </div>

                    <h2 className="text-4xl font-black mt-6 text-slate-100 relative z-10">
                        ₹<AnimatedNumber value={totalExpense} />
                    </h2>
                    <p className="text-slate-400 text-sm mt-2 relative z-10">
                        All time spending
                    </p>
                </motion.div>

                {/* MONTH */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="relative overflow-hidden backdrop-blur-xl bg-slate-900/50 border border-slate-700/50 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-emerald-500/20" />
                    <div className="flex justify-between items-center relative z-10">
                        <div className="p-3 bg-emerald-500/20 rounded-2xl">
                            <TrendingUp className="text-emerald-400" size={24} />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Month</span>
                    </div>

                    <h2 className="text-4xl font-black mt-6 text-slate-100 relative z-10">
                        ₹<AnimatedNumber value={thisMonthExpense} />
                    </h2>
                    <p className="text-slate-400 text-sm mt-2 relative z-10">
                        This month spending
                    </p>
                </motion.div>

                {/* TOP CATEGORY */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="relative overflow-hidden backdrop-blur-xl bg-slate-900/50 border border-slate-700/50 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-amber-500/20" />
                    <div className="flex justify-between items-center relative z-10">
                        <div className="p-3 bg-amber-500/20 rounded-2xl">
                            <Trophy className="text-amber-400" size={24} />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Top</span>
                    </div>

                    <h2 className="text-3xl font-black mt-6 text-slate-100 relative z-10">
                        {topCategory}
                    </h2>
                    <p className="text-slate-400 text-sm mt-2 relative z-10">
                        Highest spending category
                    </p>
                </motion.div>

            </div>

            {/* RECENT */}
            <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 p-8 rounded-3xl shadow-xl mt-8">
                <h2 className="text-2xl font-bold mb-6 text-slate-100 flex items-center gap-2">
                    <span className="text-cyan-400">📋</span> Recent Expenses
                </h2>

                {recentExpenses.length === 0 ? (
                    <div className="text-center py-10 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
                        <p className="text-slate-500">No expenses yet</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {recentExpenses.map((exp, i) => (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={exp.id}
                                className="flex justify-between items-center p-4 bg-slate-800/40 rounded-2xl hover:bg-slate-800/70 transition-colors border border-slate-700/30"
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-inner"
                                        style={{
                                            backgroundColor: `${categoryColors[exp.category] || "#64748b"}20`,
                                        }}
                                    >
                                        <div 
                                            className="w-4 h-4 rounded-full" 
                                            style={{ backgroundColor: categoryColors[exp.category] || "#64748b" }} 
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-lg font-semibold text-slate-200">
                                            {exp.category}
                                        </span>
                                        <span className="text-sm text-slate-500">
                                            {exp.description || 'Transaction'}
                                        </span>
                                    </div>
                                </div>

                                <span className="font-bold text-slate-100 text-xl bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-700">
                                    ₹{exp.amount}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}