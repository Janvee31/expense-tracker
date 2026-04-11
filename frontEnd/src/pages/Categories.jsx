import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { categoryColors } from "../utils/categoryColors";

export default function Categories() {

    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🔥 ANIMATION STATE
    const [displayTotals, setDisplayTotals] = useState({});

    useEffect(() => {
        axios.get("http://localhost:8080/expenses")
            .then(res => {
                setExpenses(res.data.content || res.data || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // 🔥 CATEGORY AGGREGATION
    const categoryData = useMemo(() => {
        const map = {};

        expenses.forEach(e => {
            const cat = e.category || "Other";
            map[cat] = (map[cat] || 0) + (e.amount || 0);
        });

        return Object.keys(map).map(cat => ({
            name: cat,
            total: map[cat]
        }));

    }, [expenses]);

    // 🔥 TOTAL SPENDING
    const totalSpent = useMemo(() =>
            categoryData.reduce((sum, c) => sum + c.total, 0),
        [categoryData]
    );

    // 🔥 NUMBER ANIMATION
    useEffect(() => {

        let temp = {};
        categoryData.forEach(cat => temp[cat.name] = 0);

        setDisplayTotals(temp);

        const interval = setInterval(() => {

            let done = true;
            let updated = { ...temp };

            categoryData.forEach(cat => {

                const step = Math.ceil(cat.total / 30);

                if (updated[cat.name] < cat.total) {
                    updated[cat.name] += step;

                    if (updated[cat.name] > cat.total) {
                        updated[cat.name] = cat.total;
                    }

                    done = false;
                }

            });

            temp = updated;
            setDisplayTotals(updated);

            if (done) clearInterval(interval);

        }, 20);

        return () => clearInterval(interval);

    }, [categoryData]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <div className="animate-pulse text-indigo-400 text-lg font-medium tracking-wide">
                    Loading Categories...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-2 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* HEADER */}
            <div className="mb-10">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                    Categories
                </h1>
                <p className="text-cyan-400 text-lg mt-1 font-medium tracking-wide">
                    Where your money goes
                </p>
            </div>

            {/* TOTAL CARD */}
            <motion.div whileHover={{ y: -5 }} className="relative overflow-hidden backdrop-blur-xl bg-slate-900/50 border border-slate-700/50 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] group max-w-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-indigo-500/20" />
                <div className="relative z-10">
                    <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-2">Total Categorized Spending</p>
                    <h2 className="text-5xl font-black text-indigo-400">
                        ₹{totalSpent}
                    </h2>
                </div>
            </motion.div>

            {/* CATEGORY GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">

                {categoryData.length === 0 ? (
                    <div className="col-span-full text-center py-10 bg-slate-800/30 rounded-3xl border border-dashed border-slate-700">
                        <p className="text-slate-500">No categories recorded yet.</p>
                    </div>
                ) : categoryData.map((cat, i) => {

                    const percentage = totalSpent === 0
                        ? 0
                        : ((cat.total / totalSpent) * 100).toFixed(1);

                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="relative overflow-hidden p-6 rounded-3xl shadow-lg backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 group"
                        >
                            <div 
                                className="absolute top-0 left-0 w-2 h-full opacity-80"
                                style={{ backgroundColor: categoryColors[cat.name] || "#6366f1" }} 
                            />
                            
                            {/* Ambient Glow matching category color */}
                            <div 
                                className="absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[40px] opacity-10 transition-opacity group-hover:opacity-20 pointer-events-none"
                                style={{ backgroundColor: categoryColors[cat.name] || "#6366f1" }}
                            />

                            <div className="flex justify-between items-start mb-6 relative z-10 pl-2">
                                <h2 className="text-xl font-bold text-slate-200">
                                    {cat.name}
                                </h2>

                                <span
                                    className="text-xs font-bold px-3 py-1 rounded-full shadow-inner border border-white/10"
                                    style={{
                                        backgroundColor: categoryColors[cat.name] || "#6366f1",
                                        color: "#fff"
                                    }}
                                >
                                    {percentage}%
                                </span>
                            </div>

                            {/* 🔥 ANIMATED VALUE */}
                            <p className="text-4xl font-black mt-2 text-slate-100 relative z-10 pl-2">
                                ₹{displayTotals[cat.name] || 0}
                            </p>

                        </motion.div>
                    );
                })}

            </div>

        </div>
    );
}