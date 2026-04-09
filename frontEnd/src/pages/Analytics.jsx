import {
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    BarChart,
    Bar,
    CartesianGrid,
    Legend,
    ResponsiveContainer
} from "recharts";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function Analytics() {
    const [expenses, setExpenses] = useState([]);
    useEffect(() => {
        axios
            .get("http://localhost:8080/expenses")
            .then((res) => setExpenses(res.data.content || res.data))
            .catch((err) => console.log(err));
    }, []);

    const categoryData = Object.values(
        expenses.reduce((acc, curr) => {
            acc[curr.category] = acc[curr.category] || {
                name: curr.category,
                value: 0
            };
            acc[curr.category].value += curr.amount;
            return acc;
        }, {})
    );

    const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#ff6b6b"];

    const totalExpense = expenses.reduce(
        (sum, item) => sum + (item.amount || 0),
        0
    );

    const categoryCount = categoryData.length;

    // 📈 SAMPLE DATA (you can later replace with backend)
    const monthlyData = [
        { month: "Jan", amount: 4000 },
        { month: "Feb", amount: 3000 },
        { month: "Mar", amount: 5000 },
        { month: "Apr", amount: 2000 }
    ];

    const weeklyData = [
        { week: "Week 1", amount: 1200 },
        { week: "Week 2", amount: 1800 },
        { week: "Week 3", amount: 900 },
        { week: "Week 4", amount: 2200 }
    ];

    return (
        <div className="space-y-10">

            {/* 🧾 SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white p-4 rounded-xl shadow">
                    <p className="text-gray-500">Total Expenses</p>
                    <h2 className="text-2xl font-bold">₹{totalExpense}</h2>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white p-4 rounded-xl shadow">
                    <p className="text-gray-500">Categories Used</p>
                    <h2 className="text-2xl font-bold">{categoryCount}</h2>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white p-4 rounded-xl shadow">
                    <p className="text-gray-500">Transactions</p>
                    <h2 className="text-2xl font-bold">{expenses.length}</h2>
                </motion.div>

            </div>

            {/* 🍩 PIE CHART */}
            <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="font-semibold mb-4">Category Breakdown</h2>

                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={categoryData}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={120}
                            label={({ name, percent }) =>
                                `${name} ${(percent * 100).toFixed(0)}%`
                            }
                        >
                            {categoryData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* 📈 LINE CHART */}
            <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="font-semibold mb-4">Monthly Spending</h2>

                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="amount" stroke="#8884d8" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* 📊 BAR CHART */}
            <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="font-semibold mb-4">Weekly Spending</h2>

                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="amount" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

        </div>
    );
}