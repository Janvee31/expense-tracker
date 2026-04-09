import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function Categories() {
    const [expenses, setExpenses] = useState([]);

    useEffect(() => {
        axios
            .get("http://localhost:8080/expenses")
            .then((res) => setExpenses(res.data.content || res.data))
            .catch((err) => console.log(err));
    }, []);

    // 📌 GROUP BY CATEGORY
    const categoryMap = expenses.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
    }, {});

    const categories = Object.keys(categoryMap);

    return (
        <div className="space-y-6">

            <h1 className="text-2xl font-bold">🗂 Categories</h1>

            {/* EMPTY STATE */}
            {categories.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                    No categories found
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    {categories.map((cat, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ scale: 1.05 }}
                            className="bg-white p-4 rounded-xl shadow"
                        >
                            <p className="text-gray-500">{cat}</p>
                            <h2 className="text-2xl font-bold">
                                ₹{categoryMap[cat]}
                            </h2>
                        </motion.div>
                    ))}

                </div>
            )}
        </div>
    );
}