import { motion } from "framer-motion";
import { Plus, Eye, Wallet, TrendingUp, PiggyBank, Trash2, Edit } from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Expenses() {

    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    const [income, setIncome] = useState(8000);

    const [displayTotal, setDisplayTotal] = useState(0);
    const [displayIncome, setDisplayIncome] = useState(0);
    const [displaySavings, setDisplaySavings] = useState(0);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);

    const [selectedId, setSelectedId] = useState(null);

    const [newExpense, setNewExpense] = useState({ category: "", amount: "", date: "" });
    const [editExpense, setEditExpense] = useState({ category: "", amount: "", date: "" });

    const API_URL = "http://localhost:8080/expenses";

    /* ================= FETCH (NO JWT) ================= */
    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = () => {
        axios.get(API_URL)
            .then(res => {
                setExpenses(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Fetch Error:", err);
                setLoading(false);
            });
    };

    const totalExpenses = expenses.reduce(
        (sum, item) => sum + (item.amount || 0),
        0
    );

    const totalSavings = income - totalExpenses;

    /* ================= ANIMATION LOGIC (SAME) ================= */
    useEffect(() => {
        let a = 0, b = 0, c = 0;
        const step1 = Math.ceil(totalExpenses / 30) || 1;
        const step2 = Math.ceil(income / 30) || 1;
        const step3 = Math.ceil(totalSavings / 30) || 1;

        const interval = setInterval(() => {
            a += step1; b += step2; c += step3;

            if (a >= totalExpenses) a = totalExpenses;
            if (b >= income) b = income;
            if (c >= totalSavings) c = totalSavings;

            setDisplayTotal(a);
            setDisplayIncome(b);
            setDisplaySavings(c);

            if (a === totalExpenses && b === income && c === totalSavings) {
                clearInterval(interval);
            }
        }, 20);

        return () => clearInterval(interval);
    }, [totalExpenses, income, totalSavings]);

    /* ================= ADD (NO JWT) ================= */
    const handleAddExpense = () => {
        if (!newExpense.category || !newExpense.amount) return;

        axios.post(API_URL, {
            category: newExpense.category,
            amount: Number(newExpense.amount),
            date: newExpense.date || new Date().toISOString().split("T")[0]
        })
            .then(res => {
                setExpenses(prev => [...prev, res.data]);
                setNewExpense({ category: "", amount: "", date: "" });
                setShowAddModal(false);
            })
            .catch(err => console.error("Add Error:", err));
    };

    /* ================= DELETE (NO JWT) ================= */
    const handleDelete = (id) => {
        axios.delete(`${API_URL}/${id}`)
            .then(() => {
                setExpenses(prev => prev.filter(e => e.id !== id));
            })
            .catch(err => console.error("Delete Error:", err));
    };

    /* ================= EDIT (NO JWT) ================= */
    const handleEditClick = (item) => {
        setSelectedId(item.id);
        setEditExpense({
            category: item.category,
            amount: item.amount,
            date: item.date || ""
        });
        setShowEditModal(true);
    };

    const handleUpdateExpense = () => {
        axios.put(`${API_URL}/${selectedId}`, {
            category: editExpense.category,
            amount: Number(editExpense.amount),
            date: editExpense.date || new Date().toISOString().split("T")[0]
        })
            .then(() => {
                setExpenses(prev =>
                    prev.map(e =>
                        e.id === selectedId
                            ? {
                                ...e,
                                category: editExpense.category,
                                amount: Number(editExpense.amount),
                                date: editExpense.date
                            }
                            : e
                    )
                );
                setShowEditModal(false);
                setSelectedId(null);
                setEditExpense({ category: "", amount: "", date: "" });
            })
            .catch(err => console.error("Update Error:", err));
    };

    const formatDate = (date) => {
        if (!date) return "No date";
        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500 text-lg">Loading Expenses...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-2">
            <div className="max-w-6xl mx-auto space-y-10">
                {/* HEADER */}
                <div>
                    <h1 className="text-4xl font-bold">💰 Expenses Dashboard</h1>
                    <p className="text-gray-500">Track your spending</p>
                </div>

                {/* CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <motion.div className="bg-white/70 p-6 rounded-2xl shadow-lg">
                        <Wallet className="text-indigo-600 mb-2" />
                        <h2 className="text-3xl font-bold">₹{displayTotal}</h2>
                        <p className="text-gray-500 text-sm">Total Expenses</p>
                    </motion.div>
                    <motion.div className="bg-white/70 p-6 rounded-2xl shadow-lg">
                        <TrendingUp className="text-green-600 mb-2" />
                        <h2 className="text-3xl font-bold">₹{displayIncome}</h2>
                        <p className="text-gray-500 text-sm">Monthly Income</p>
                    </motion.div>
                    <motion.div className="bg-white/70 p-6 rounded-2xl shadow-lg">
                        <PiggyBank className="text-purple-600 mb-2" />
                        <h2 className="text-3xl font-bold">₹{displaySavings}</h2>
                        <p className="text-gray-500 text-sm">Total Savings</p>
                    </motion.div>
                </div>

                {/* BUTTONS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-indigo-600 text-white p-4 rounded-xl hover:scale-105 transition shadow-md"
                    >
                        <Plus className="inline mr-2" />
                        Add Expense
                    </button>
                    <button
                        onClick={() => setShowViewModal(true)}
                        className="bg-white/70 p-4 rounded-xl border hover:bg-white transition shadow-sm"
                    >
                        <Eye className="inline mr-2" />
                        View Expenses
                    </button>
                </div>

                {/* LIST */}
                <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl shadow-lg">
                    <h2 className="text-xl font-bold mb-4 text-indigo-900">Recent Expenses</h2>
                    {expenses.length === 0 ? (
                        <p className="text-gray-400 text-center py-4">No expenses found.</p>
                    ) : (
                        expenses.slice(0, 6).map((item) => (
                            <div key={item.id} className="flex justify-between items-center border-b py-3 last:border-0">
                                <div>
                                    <p className="font-medium text-gray-800">{item.category}</p>
                                    <p className="text-xs text-gray-500">{formatDate(item.date)}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-bold text-indigo-700">₹{item.amount}</span>
                                    <button onClick={() => handleEditClick(item)} className="text-blue-500 hover:text-blue-700 transition">
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-600 transition">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* ADD MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-2xl">
                        <h2 className="font-bold text-xl mb-4 text-gray-800">Add Expense</h2>
                        <select
                            className="border w-full p-2 mb-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={newExpense.category}
                            onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                        >
                            <option value="">Select Category</option>
                            <option value="Food">Food</option>
                            <option value="Travel">Travel</option>
                            <option value="Shopping">Shopping</option>
                            <option value="Bills">Bills</option>
                            <option value="Entertainment">Entertainment</option>
                            <option value="Other">Other</option>
                        </select>
                        <input
                            type="number"
                            placeholder="Amount"
                            className="border w-full p-2 mb-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={newExpense.amount}
                            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                        />
                        <input
                            type="date"
                            className="border w-full p-2 mb-4 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={newExpense.date}
                            onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                        />
                        <button onClick={handleAddExpense} className="bg-indigo-600 text-white w-full p-2 rounded-lg font-semibold hover:bg-indigo-700 transition">
                            Save Expense
                        </button>
                        <button onClick={() => setShowAddModal(false)} className="mt-3 w-full text-gray-500 hover:text-gray-700 transition">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* VIEW EXPENSES MODAL */}
            {showViewModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"><div className="bg-white p-6 rounded-xl w-full max-w-2xl shadow-2xl max-h-[80vh] overflow-y-auto">

                        <h2 className="font-bold text-xl mb-4 text-gray-800">
                            All Expenses
                        </h2>

                        {expenses.length === 0 ? (
                            <p className="text-gray-400 text-center">No expenses found.</p>
                        ) : (
                            expenses.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex justify-between items-center border-b py-3 last:border-0"
                                >
                                    <div>
                                        <p className="font-medium">{item.category}</p>
                                        <p className="text-xs text-gray-500">
                                            {formatDate(item.date)}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4">
                            <span className="font-bold text-indigo-700">
                                ₹{item.amount}
                            </span>

                                        <button
                                            onClick={() => handleEditClick(item)}
                                            className="text-blue-500"
                                        >
                                            <Edit size={18} />
                                        </button>

                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-red-500"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}

                        {/* CLOSE BUTTON */}
                        <button
                            onClick={() => setShowViewModal(false)}
                            className="mt-4 w-full text-gray-600 hover:text-black"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}