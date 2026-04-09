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
                <p className="text-gray-500">Loading categories...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-50 to-white">

            <div className="max-w-6xl mx-auto space-y-8">

                {/* HEADER */}
                <div>
                    <h1 className="text-3xl font-bold">📂 Categories Overview</h1>
                    <p className="text-gray-500">Where your money goes</p>
                </div>

                {/* TOTAL CARD */}
                <div className="bg-white/70 p-6 rounded-2xl shadow">
                    <p className="text-gray-500">Total Spending</p>
                    <h2 className="text-3xl font-bold text-indigo-600">
                        ₹{totalSpent}
                    </h2>
                </div>

                {/* CATEGORY GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

                    {categoryData.map((cat, i) => {

                        const percentage = totalSpent === 0
                            ? 0
                            : ((cat.total / totalSpent) * 100).toFixed(1);

                        return (
                            <motion.div
                                key={i}
                                whileHover={{ scale: 1.05 }}
                                className="p-5 rounded-2xl shadow bg-white/80 backdrop-blur"
                                style={{
                                    borderLeft: `6px solid ${categoryColors[cat.name] || "#6366f1"}`
                                }}
                            >

                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-semibold">
                                        {cat.name}
                                    </h2>

                                    <span
                                        className="text-sm px-2 py-1 rounded"
                                        style={{
                                            backgroundColor: categoryColors[cat.name] || "#6366f1",
                                            color: "#fff"
                                        }}
                                    >
                                        {percentage}%
                                    </span>
                                </div>

                                {/* 🔥 ANIMATED VALUE */}
                                <p className="text-2xl font-bold mt-3 text-indigo-600">
                                    ₹{displayTotals[cat.name] || 0}
                                </p>

                            </motion.div>
                        );
                    })}

                </div>

            </div>

        </div>
    );
}