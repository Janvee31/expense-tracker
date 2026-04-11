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
            <div className="min-h-screen flex items-center justify-center animate-pulse text-indigo-400 text-lg">
                Loading Expenses...
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 p-2">
            
            {/* HEADER */}
            <div className="mb-10">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                    Expenses
                </h1>
                <p className="text-cyan-400 text-lg mt-1 font-medium tracking-wide">
                    Manage your spending
                </p>
            </div>

            {/* CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div whileHover={{ y: -5 }} className="relative overflow-hidden backdrop-blur-xl bg-slate-900/50 border border-slate-700/50 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-indigo-500/20" />
                    <div className="flex justify-between items-center relative z-10">
                        <div className="p-3 bg-indigo-500/20 rounded-2xl">
                            <Wallet className="text-indigo-400" size={24} />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Expenses</span>
                    </div>
                    <h2 className="text-4xl font-black mt-6 text-slate-100 relative z-10">₹{displayTotal}</h2>
                    <p className="text-slate-400 text-sm mt-2 relative z-10">Total spend</p>
                </motion.div>
                
                <motion.div whileHover={{ y: -5 }} className="relative overflow-hidden backdrop-blur-xl bg-slate-900/50 border border-slate-700/50 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-emerald-500/20" />
                    <div className="flex justify-between items-center relative z-10">
                        <div className="p-3 bg-emerald-500/20 rounded-2xl">
                            <TrendingUp className="text-emerald-400" size={24} />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Income</span>
                    </div>
                    <h2 className="text-4xl font-black mt-6 text-slate-100 relative z-10">₹{displayIncome}</h2>
                    <p className="text-slate-400 text-sm mt-2 relative z-10">Monthly income</p>
                </motion.div>
                
                <motion.div whileHover={{ y: -5 }} className="relative overflow-hidden backdrop-blur-xl bg-slate-900/50 border border-slate-700/50 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-purple-500/20" />
                    <div className="flex justify-between items-center relative z-10">
                        <div className="p-3 bg-purple-500/20 rounded-2xl">
                            <PiggyBank className="text-purple-400" size={24} />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Savings</span>
                    </div>
                    <h2 className="text-4xl font-black mt-6 text-slate-100 relative z-10">₹{displaySavings}</h2>
                    <p className="text-slate-400 text-sm mt-2 relative z-10">Total savings</p>
                </motion.div>
            </div>

            {/* BUTTONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <button
                    onClick={() => setShowAddModal(true)}
                    className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-slate-950 font-bold py-4 px-6 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all flex items-center justify-center group"
                >
                    <Plus className="mr-2 group-hover:rotate-90 transition-transform" />
                    Add Expense
                </button>
                <button
                    onClick={() => setShowViewModal(true)}
                    className="w-full bg-slate-800/50 border border-slate-700 hover:bg-slate-800 text-slate-100 font-medium py-4 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center group"
                >
                    <Eye className="mr-2 text-cyan-400 group-hover:scale-110 transition-transform" />
                    View All Expenses
                </button>
            </div>

            {/* LIST */}
            <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 p-8 rounded-3xl shadow-xl mt-8">
                <h2 className="text-2xl font-bold mb-6 text-slate-100 flex items-center gap-2">
                    <span className="text-cyan-400">📋</span> Recent Expenses
                </h2>
                {expenses.length === 0 ? (
                    <div className="text-center py-10 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
                        <p className="text-slate-500">No expenses found.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {expenses.slice(0, 6).map((item, i) => (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={item.id} 
                                className="flex justify-between items-center p-4 bg-slate-800/40 rounded-2xl hover:bg-slate-800/70 transition-colors border border-slate-700/30 group"
                            >
                                <div className="flex flex-col">
                                    <p className="font-semibold text-slate-200 text-lg">{item.category}</p>
                                    <p className="text-sm text-slate-500">{formatDate(item.date)}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-bold text-slate-100 text-xl bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-700">₹{item.amount}</span>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                        <button onClick={() => handleEditClick(item)} className="p-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 rounded-lg transition-colors">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 rounded-lg transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* ADD / EDIT / VIEW MODALS */}
            {/* ADD MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 border border-slate-700 p-8 rounded-3xl w-full max-w-sm shadow-2xl">
                        <h2 className="font-black text-2xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Add Expense</h2>
                        
                        <div className="space-y-4">
                            <select
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
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
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                value={newExpense.amount}
                                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                            />
                            <input
                                type="date"
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors [color-scheme:dark]"
                                value={newExpense.date}
                                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                            />
                        </div>

                        <div className="flex flex-col gap-3 mt-8">
                            <button onClick={handleAddExpense} className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold p-3.5 rounded-xl transition-colors">
                                Save Expense
                            </button>
                            <button onClick={() => setShowAddModal(false)} className="w-full text-slate-400 hover:text-slate-200 p-3.5 rounded-xl transition-colors">
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* EDIT MODAL */}
            {showEditModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 border border-slate-700 p-8 rounded-3xl w-full max-w-sm shadow-2xl">
                        <h2 className="font-black text-2xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Edit Expense</h2>
                        
                        <div className="space-y-4">
                            <select
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                                value={editExpense.category}
                                onChange={(e) => setEditExpense({ ...editExpense, category: e.target.value })}
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
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                                value={editExpense.amount}
                                onChange={(e) => setEditExpense({ ...editExpense, amount: e.target.value })}
                            />
                            <input
                                type="date"
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors [color-scheme:dark]"
                                value={editExpense.date}
                                onChange={(e) => setEditExpense({ ...editExpense, date: e.target.value })}
                            />
                        </div>

                        <div className="flex flex-col gap-3 mt-8">
                            <button onClick={handleUpdateExpense} className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold p-3.5 rounded-xl transition-colors">
                                Update Expense
                            </button>
                            <button onClick={() => setShowEditModal(false)} className="w-full text-slate-400 hover:text-slate-200 p-3.5 rounded-xl transition-colors">
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* VIEW EXPENSES MODAL */}
            {showViewModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 border border-slate-700 p-8 rounded-3xl w-full max-w-2xl shadow-2xl max-h-[85vh] flex flex-col">
                        <h2 className="font-bold text-2xl mb-6 text-slate-100">
                            All Expenses
                        </h2>

                        <div className="overflow-y-auto pr-2 flex-col space-y-3">
                            {expenses.length === 0 ? (
                                <p className="text-slate-500 text-center py-6">No expenses found.</p>
                            ) : (
                                expenses.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex justify-between items-center p-4 bg-slate-800/40 rounded-2xl border border-slate-700/30 group"
                                    >
                                        <div>
                                            <p className="font-medium text-slate-200">{item.category}</p>
                                            <p className="text-xs text-slate-500">
                                                {formatDate(item.date)}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <span className="font-bold text-slate-100 bg-slate-900/50 px-3 py-1 rounded-lg border border-slate-700">
                                                ₹{item.amount}
                                            </span>

                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEditClick(item)}
                                                    className="p-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 active:scale-95 rounded-lg transition-all"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 active:scale-95 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* CLOSE BUTTON */}
                        <div className="mt-8 pt-4 border-t border-slate-800">
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="w-full p-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}