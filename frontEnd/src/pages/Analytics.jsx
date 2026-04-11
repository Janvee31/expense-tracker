import {
    PieChart, Pie, Cell,
    LineChart, Line, XAxis, YAxis,
    Tooltip, BarChart, Bar,
    CartesianGrid, ResponsiveContainer
} from "recharts";

import { categoryColors } from "../utils/categoryColors";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function Analytics() {

    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(new Date().getMonth());

    // 🆕 INFO STATE
    const [info, setInfo] = useState(null);

    // 🆕 INFO CONTENT
    const infoContent = {
        insight: `AI Insight Logic:

1. If growth > 20% → "🚨 Spending increased sharply this month!"
2. If growth < -10% → "🎉 Great! You reduced spending."
3. If Top Category is Food → "🍔 Food is your highest expense."
4. Otherwise → "📊 Spending pattern is stable."

This is a rule-based system (not real AI).`,

        growth: "Growth shows % change between this month's spending and last month.",
        current: "Total amount spent in selected month.",
        previous: "Total amount spent in previous month.",
        top: "Category where you spent the most this month."
    };

    useEffect(() => {
        axios.get("http://localhost:8080/expenses")
            .then((res) => {
                const allData = res.data.content || res.data || [];
                setExpenses(allData.filter(e => e.type !== 'INCOME'));
            })
            .finally(() => setLoading(false));
    }, []);

    const currentExpenses = useMemo(() => {
        return expenses.filter(e => {
            if (!e.date) return false;
            return new Date(e.date).getMonth() === month;
        });
    }, [expenses, month]);

    const prevExpenses = useMemo(() => {
        return expenses.filter(e => {
            if (!e.date) return false;
            return new Date(e.date).getMonth() === month - 1;
        });
    }, [expenses, month]);

    const currentTotal = useMemo(() =>
            currentExpenses.reduce((s, e) => s + (e.amount || 0), 0),
        [currentExpenses]
    );

    const prevTotal = useMemo(() =>
            prevExpenses.reduce((s, e) => s + (e.amount || 0), 0),
        [prevExpenses]
    );

    const growth = useMemo(() => {
        if (prevTotal === 0) return 100;
        return ((currentTotal - prevTotal) / prevTotal) * 100;
    }, [currentTotal, prevTotal]);

    const categoryData = useMemo(() => {
        const map = {};
        currentExpenses.forEach(e => {
            const c = e.category || "Other";
            map[c] = (map[c] || 0) + (e.amount || 0);
        });

        return Object.keys(map).map(k => ({
            name: k,
            value: map[k]
        }));
    }, [currentExpenses]);

    const topCategory = useMemo(() => {
        if (!categoryData.length) return null;
        return categoryData.reduce((a, b) => a.value > b.value ? a : b);
    }, [categoryData]);

    const weeklyData = useMemo(() => {
        const weeks = {};
        currentExpenses.forEach(e => {
            const d = new Date(e.date);
            const w = Math.ceil(d.getDate() / 7);
            weeks[w] = (weeks[w] || 0) + (e.amount || 0);
        });

        return Object.keys(weeks).map(w => ({
            week: `W${w}`,
            amount: weeks[w]
        }));
    }, [currentExpenses]);

    const predictionData = useMemo(() => {
        const base = currentTotal;
        return [
            { day: "Now", amount: base },
            { day: "Pred +1w", amount: base * 1.05 },
            { day: "Pred +2w", amount: base * 1.12 },
            { day: "Pred +3w", amount: base * 1.18 }
        ];
    }, [currentTotal]);

    const months = [
        "Jan","Feb","Mar","Apr","May","Jun",
        "Jul","Aug","Sep","Oct","Nov","Dec"
    ];

    const insight = () => {
        if (growth > 20) return "🚨 Spending increased sharply this month!";
        if (growth < -10) return "🎉 Great! You reduced spending.";
        if (topCategory?.name === "Food") return "🍔 Food is your highest expense.";
        return "📊 Spending pattern is stable.";
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    return (
        <div className="space-y-8 p-2 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                        Smart Analytics
                    </h1>
                    <p className="text-cyan-400 text-lg mt-1 font-medium tracking-wide">
                        AI powered insights
                    </p>
                </div>

                <select
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="bg-slate-800 border border-slate-700 text-slate-100 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-medium cursor-pointer"
                >
                    {months.map((m, i) => (
                        <option key={i} value={i}>{m}</option>
                    ))}
                </select>
            </div>

            {/* INSIGHT */}
            <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 p-6 rounded-3xl shadow-xl border-l-4 border-l-cyan-400">
                <div className="flex justify-between items-center mb-2">
                    <p className="font-bold text-slate-100 flex items-center gap-2">
                        <span className="text-cyan-400">🧠</span> AI Insight
                    </p>
                    <button onClick={() => setInfo("insight")} className="text-slate-400 hover:text-cyan-400 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    </button>
                </div>
                <p className="text-slate-300 font-medium">{insight()}</p>
            </div>

            {/* KPI CARDS */}
            <div className="grid md:grid-cols-4 gap-6">

                <div className="backdrop-blur-xl bg-slate-900/50 border border-slate-700/50 p-6 rounded-3xl shadow-lg relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
                    <div className="flex justify-between items-center relative z-10 mb-4">
                        <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Current Month</p>
                        <button onClick={() => setInfo("current")} className="text-slate-500 hover:text-indigo-400">ℹ️</button>
                    </div>
                    <h2 className="text-3xl font-black text-indigo-400 relative z-10">
                        ₹{currentTotal}
                    </h2>
                </div>

                <div className="backdrop-blur-xl bg-slate-900/50 border border-slate-700/50 p-6 rounded-3xl shadow-lg relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-500/10 rounded-full blur-2xl group-hover:bg-slate-500/20 transition-all"></div>
                    <div className="flex justify-between items-center relative z-10 mb-4">
                        <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Previous Month</p>
                        <button onClick={() => setInfo("previous")} className="text-slate-500 hover:text-slate-400">ℹ️</button>
                    </div>
                    <h2 className="text-3xl font-black text-slate-300 relative z-10">
                        ₹{prevTotal}
                    </h2>
                </div>

                <div className="backdrop-blur-xl bg-slate-900/50 border border-slate-700/50 p-6 rounded-3xl shadow-lg relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all"></div>
                    <div className="flex justify-between items-center relative z-10 mb-4">
                        <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Growth</p>
                        <button onClick={() => setInfo("growth")} className="text-slate-500 hover:text-rose-400">ℹ️</button>
                    </div>
                    <h2 className={`text-3xl font-black relative z-10 ${growth >= 0 ? "text-rose-400" : "text-emerald-400"}`}>
                        {growth.toFixed(1)}%
                    </h2>
                </div>

                <div className="backdrop-blur-xl bg-slate-900/50 border border-slate-700/50 p-6 rounded-3xl shadow-lg relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
                    <div className="flex justify-between items-center relative z-10 mb-4">
                        <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Top Category</p>
                        <button onClick={() => setInfo("top")} className="text-slate-500 hover:text-amber-400">ℹ️</button>
                    </div>
                    <h2 className="text-2xl font-black text-amber-400 relative z-10 truncate">
                        {topCategory?.name || "N/A"}
                    </h2>
                </div>

            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* PIE */}
                <div className="backdrop-blur-xl bg-slate-900/50 border border-slate-700/50 p-8 rounded-3xl shadow-lg">
                    <h2 className="mb-6 font-bold text-slate-100 text-xl tracking-wide">Category Breakdown</h2>

                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Tooltip 
                                formatter={(value) => `₹${value}`} 
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                                itemStyle={{ color: '#f8fafc' }}
                            />
                            <Pie
                                data={categoryData}
                                dataKey="value"
                                innerRadius={80}
                                outerRadius={120}
                                paddingAngle={5}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                labelLine={false}
                            >
                                {categoryData.map((e, i) => (
                                    <Cell key={i} fill={categoryColors[e.name] || "#818cf8"} stroke="#0f172a" strokeWidth={2} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* WEEKLY */}
                <div className="backdrop-blur-xl bg-slate-900/50 border border-slate-700/50 p-8 rounded-3xl shadow-lg">
                    <h2 className="mb-6 font-bold text-slate-100 text-xl tracking-wide">{months[month]} Weekly Spend</h2>

                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={weeklyData}>
                            <XAxis dataKey="week" stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <Tooltip 
                                formatter={(value) => `₹${value}`}
                                cursor={{ fill: '#1e293b' }}
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                                itemStyle={{ color: '#2dd4bf' }}
                            />
                            <Bar dataKey="amount" fill="#2dd4bf" radius={[6,6,0,0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* PREDICTION */}
            <div className="backdrop-blur-xl bg-slate-900/50 border border-slate-700/50 p-8 rounded-3xl shadow-lg">
                <h2 className="mb-6 font-bold text-slate-100 text-xl tracking-wide flex items-center gap-2">
                    <span className="text-emerald-400">📈</span> AI Spending Prediction
                </h2>

                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={predictionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="day" stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <Tooltip 
                            formatter={(value) => `₹${value.toFixed(0)}`}
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                            itemStyle={{ color: '#34d399' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="amount"
                            stroke="#34d399"
                            strokeWidth={4}
                            strokeDasharray="8 8"
                            dot={{ fill: '#34d399', strokeWidth: 2, r: 6, stroke: '#0f172a' }}
                            activeDot={{ r: 8, stroke: '#34d399', strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* 🆕 INFO MODAL */}
            {info && (
                <div className="fixed inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm z-50 p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 border border-slate-700 p-8 rounded-3xl w-full max-w-sm shadow-2xl text-center">
                        <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-cyan-400 border border-cyan-500/30">
                            <span className="text-2xl">ℹ️</span>
                        </div>
                        <h2 className="font-bold text-xl mb-4 text-slate-100">Info</h2>
                        <div className="text-sm text-slate-400 mb-8 whitespace-pre-wrap text-left bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                            {infoContent[info]}
                        </div>

                        <button
                            onClick={() => setInfo(null)}
                            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition-colors w-full"
                        >
                            Close
                        </button>
                    </motion.div>
                </div>
            )}

        </div>
    );
}