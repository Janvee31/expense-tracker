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
                setExpenses(res.data.content || res.data || []);
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
                    className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 space-y-10 bg-gradient-to-br from-indigo-50 to-white">

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">📊 Smart Expense Dashboard</h1>

                <select
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="border p-2 rounded"
                >
                    {months.map((m, i) => (
                        <option key={i} value={i}>{m}</option>
                    ))}
                </select>
            </div>

            {/* INSIGHT */}
            <div className="bg-white p-5 rounded-xl shadow">
                <div className="flex justify-between items-center">
                    <p className="font-semibold">🧠 AI Insight</p>
                    <span onClick={() => setInfo("insight")} className="cursor-pointer">ℹ️</span>
                </div>
                <p>{insight()}</p>
            </div>

            {/* KPI CARDS */}
            <div className="grid md:grid-cols-4 gap-4">

                <div className="bg-white p-5 rounded-xl shadow">
                    <div className="flex justify-between">
                        <p>Current Month</p>
                        <span onClick={() => setInfo("current")} className="cursor-pointer">ℹ️</span>
                    </div>
                    <h2 className="text-xl font-bold text-indigo-600">
                        ₹{currentTotal}
                    </h2>
                </div>

                <div className="bg-white p-5 rounded-xl shadow">
                    <div className="flex justify-between">
                        <p>Previous Month</p>
                        <span onClick={() => setInfo("previous")} className="cursor-pointer">ℹ️</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-600">
                        ₹{prevTotal}
                    </h2>
                </div>

                <div className="bg-white p-5 rounded-xl shadow">
                    <div className="flex justify-between">
                        <p>Growth</p>
                        <span onClick={() => setInfo("growth")} className="cursor-pointer">ℹ️</span>
                    </div>
                    <h2 className={`text-xl font-bold ${growth >= 0 ? "text-red-500" : "text-green-500"}`}>
                        {growth.toFixed(1)}%
                    </h2>
                </div>

                <div className="bg-white p-5 rounded-xl shadow">
                    <div className="flex justify-between">
                        <p>Top Category</p>
                        <span onClick={() => setInfo("top")} className="cursor-pointer">ℹ️</span>
                    </div>
                    <h2 className="text-xl font-bold text-purple-600">
                        {topCategory?.name || "N/A"}
                    </h2>
                </div>

            </div>

            {/* PIE */}
            <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="mb-4 font-semibold">Category Breakdown</h2>

                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Tooltip formatter={(value) => `₹${value}`} />
                        <Pie
                            data={categoryData}
                            dataKey="value"
                            outerRadius={120}
                            label={({ name, percent }) =>
                                `${name} (${(percent * 100).toFixed(0)}%)`
                            }
                        >
                            {categoryData.map((e, i) => (
                                <Cell key={i} fill={categoryColors[e.name] || "#6366f1"} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* WEEKLY */}
            <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="mb-4 font-semibold">{months[month]} Weekly Spend</h2>

                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyData}>
                        <XAxis dataKey="week" />
                        <YAxis />
                        <Tooltip formatter={(value) => `₹${value}`} />
                        <Bar dataKey="amount" fill="#6366f1" radius={[8,8,0,0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* PREDICTION */}
            <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="mb-4 font-semibold">📉 AI Spending Prediction</h2>

                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={predictionData}>
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip formatter={(value) => `₹${value}`} />
                        <Line
                            type="monotone"
                            dataKey="amount"
                            stroke="#10b981"
                            strokeWidth={3}
                            strokeDasharray="5 5"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* 🆕 INFO MODAL */}
            {info && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="bg-white p-6 rounded-xl w-[300px] shadow-xl text-center">
                        <h2 className="font-bold mb-3">ℹ️ Info</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            {infoContent[info]}
                        </p>

                        <button
                            onClick={() => setInfo(null)}
                            className="bg-indigo-500 text-white px-4 py-2 rounded"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}