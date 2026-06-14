import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { categoryColors } from "../utils/categoryColors";
import { Tags, TrendingUp } from "lucide-react";

export default function Categories() {

    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🔥 ANIMATION STATE
    const [displayTotals, setDisplayTotals] = useState({});

    useEffect(() => {
        axios.get("http://localhost:8080/expenses")
            .then(res => {
                const allData = res.data.content || res.data || [];
                setExpenses(allData.filter(e => e.type !== 'INCOME'));
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
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex w-12 h-12 bg-emerald-50 rounded-xl items-center justify-center text-emerald-600 border border-emerald-100">
                        <Tags size={24} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold text-black">
                            Categories
                        </h1>
                        <p className="text-emerald-500 text-sm mt-1 font-semibold tracking-wide">
                            Where your money goes
                        </p>
                    </div>
                </div>
            </div>

            {/* TOTAL CARD */}
            <motion.div whileHover={{ y: -5 }} className="relative overflow-hidden bg-white border border-slate-200 p-8 rounded-3xl shadow-sm group max-w-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-emerald-500/20" />
                <div className="relative z-10 flex flex-col gap-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Categorized Spending</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-5xl font-black text-black">
                            ₹{Number(totalSpent).toFixed(2)}
                        </h2>
                    </div>
                    <div className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full w-fit mt-1 flex items-center gap-1">
                        <TrendingUp size={12} /> Active Budget Period
                    </div>
                </div>
            </motion.div>

            {/* CATEGORY GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">

                {categoryData.length === 0 ? (
                    <div className="col-span-full text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                        <p className="text-slate-400 font-semibold">No categories recorded yet.</p>
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
                            className="relative overflow-hidden p-6 rounded-3xl shadow-sm bg-white border border-slate-200 group"
                        >
                            <div 
                                className="absolute top-0 left-0 w-2 h-full opacity-80"
                                style={{ backgroundColor: categoryColors[cat.name] || "#22c55e" }} 
                            />
                            
                            {/* Ambient Glow matching category color */}
                            <div 
                                className="absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[40px] opacity-[0.03] transition-opacity group-hover:opacity-10 pointer-events-none"
                                style={{ backgroundColor: categoryColors[cat.name] || "#22c55e" }}
                            />

                            <div className="flex justify-between items-start mb-6 relative z-10 pl-2">
                                <h2 className="text-xl font-bold text-black">
                                    {cat.name}
                                </h2>

                                <span
                                    className="text-[10px] font-extrabold px-3 py-1 rounded-full shadow-sm border border-emerald-100"
                                    style={{
                                        backgroundColor: `${categoryColors[cat.name]}15` || "#22c55e15",
                                        color: categoryColors[cat.name] || "#22c55e"
                                    }}
                                >
                                    {percentage}%
                                </span>
                            </div>

                            {/* 🔥 ANIMATED VALUE */}
                            <p className="text-4xl font-black mt-2 text-black relative z-10 pl-2">
                                ₹{Number(displayTotals[cat.name] || 0).toFixed(2)}
                            </p>

                            {/* Minimal visual progress bar */}
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-4 relative z-10 pl-2 ml-2">
                                <div 
                                    className="h-full rounded-full transition-all duration-500" 
                                    style={{ 
                                        width: `${percentage}%`,
                                        backgroundColor: categoryColors[cat.name] || "#22c55e"
                                    }} 
                                />
                            </div>

                        </motion.div>
                    );
                })}

            </div>

        </div>
    );
}