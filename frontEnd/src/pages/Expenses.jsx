import { motion } from "framer-motion";
import { Plus, Eye, Wallet, TrendingUp, PiggyBank, Trash2, Edit, Search, Filter } from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Expenses() {

    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    const [displayTotal, setDisplayTotal] = useState(0);
    const [displayIncome, setDisplayIncome] = useState(0);
    const [displaySavings, setDisplaySavings] = useState(0);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);

    const [selectedId, setSelectedId] = useState(null);

    const [newExpense, setNewExpense] = useState({ type: "EXPENSE", category: "", amount: "", date: "" });
    const [editExpense, setEditExpense] = useState({ type: "EXPENSE", category: "", amount: "", date: "" });

    // View Modal Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("ALL");

    const API_URL = "http://localhost:8080/expenses";

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

    // Calculations
    const totalIncome = expenses
        .filter(item => item.type === "INCOME")
        .reduce((sum, item) => sum + (item.amount || 0), 0);

    const totalExpenses = expenses
        .filter(item => item.type !== "INCOME")
        .reduce((sum, item) => sum + (item.amount || 0), 0);

    const currentBalance = totalIncome - totalExpenses;

    useEffect(() => {
        let a = 0, b = 0, c = 0;
        const step1 = Math.ceil(totalExpenses / 30) || 1;
        const step2 = Math.ceil(totalIncome / 30) || 1;
        
        // Balance might be negative, handle carefully for animation
        const isNeg = currentBalance < 0;
        const absBal = Math.abs(currentBalance);
        const step3 = Math.ceil(absBal / 30) || 1;

        const interval = setInterval(() => {
            a += step1; b += step2; c += step3;

            if (a >= totalExpenses) a = totalExpenses;
            if (b >= totalIncome) b = totalIncome;
            if (c >= absBal) c = absBal;

            setDisplayTotal(a);
            setDisplayIncome(b);
            setDisplaySavings(isNeg ? -c : c);

            if (a === totalExpenses && b === totalIncome && c === absBal) {
                clearInterval(interval);
            }
        }, 20);

        return () => clearInterval(interval);
    }, [totalExpenses, totalIncome, currentBalance]);

    const handleAddExpense = () => {
        if (!newExpense.category || !newExpense.amount) {
            alert("Please provide both a category and an amount.");
            return;
        }

        axios.post(API_URL, {
            type: newExpense.type,
            category: newExpense.category,
            amount: Number(newExpense.amount),
            date: newExpense.date || new Date().toISOString().split("T")[0]
        })
            .then(res => {
                setExpenses(prev => [...prev, res.data]);
                setNewExpense({ type: "EXPENSE", category: "", amount: "", date: "" });
                setShowAddModal(false);
            })
            .catch(err => {
                console.error("Add Error:", err);
                alert("Failed to save. Please check your backend is running properly.");
            });
    };

    const handleDelete = (id) => {
        axios.delete(`${API_URL}/${id}`)
            .then(() => {
                setExpenses(prev => prev.filter(e => e.id !== id));
            })
            .catch(err => console.error("Delete Error:", err));
    };

    const handleEditClick = (item) => {
        setSelectedId(item.id);
        setEditExpense({
            type: item.type || "EXPENSE",
            category: item.category,
            amount: item.amount,
            date: item.date || ""
        });
        setShowEditModal(true);
    };

    const handleUpdateExpense = () => {
        if (!editExpense.category || !editExpense.amount) {
            alert("Please provide both a category and an amount.");
            return;
        }

        axios.put(`${API_URL}/${selectedId}`, {
            type: editExpense.type,
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
                                type: editExpense.type,
                                category: editExpense.category,
                                amount: Number(editExpense.amount),
                                date: editExpense.date
                            }
                            : e
                    )
                );
                setShowEditModal(false);
                setSelectedId(null);
                setEditExpense({ type: "EXPENSE", category: "", amount: "", date: "" });
            })
            .catch(err => {
                console.error("Update Error:", err);
                alert("Failed to update. Please check your backend is running properly.");
            });
    };

    const formatDate = (date) => {
        if (!date) return "No date";
        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    // Filtered data for view modal
    const filteredExpenses = expenses.filter(item => {
        const matchesSearch = item.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === "ALL" || (filterType === "INCOME" && item.type === "INCOME") || (filterType === "EXPENSE" && item.type !== "INCOME");
        return matchesSearch && matchesType;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center animate-pulse text-indigo-400 text-lg">
                Loading Expenses...
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 p-2">
            
            <div className="mb-10">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                    Transactions
                </h1>
                <p className="text-cyan-400 text-lg mt-1 font-medium tracking-wide">
                    Manage your income & expenses
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div whileHover={{ y: -5 }} className="relative overflow-hidden backdrop-blur-xl bg-slate-900/50 border border-slate-700/50 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-emerald-500/20" />
                    <div className="flex justify-between items-center relative z-10">
                        <div className="p-3 bg-emerald-500/20 rounded-2xl">
                            <TrendingUp className="text-emerald-400" size={24} />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Income</span>
                    </div>
                    <h2 className="text-4xl font-black mt-6 text-slate-100 relative z-10">₹{displayIncome}</h2>
                </motion.div>
                
                <motion.div whileHover={{ y: -5 }} className="relative overflow-hidden backdrop-blur-xl bg-slate-900/50 border border-slate-700/50 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-rose-500/20" />
                    <div className="flex justify-between items-center relative z-10">
                        <div className="p-3 bg-rose-500/20 rounded-2xl">
                            <Wallet className="text-rose-400" size={24} />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Expenses</span>
                    </div>
                    <h2 className="text-4xl font-black mt-6 text-slate-100 relative z-10">₹{displayTotal}</h2>
                </motion.div>
                
                <motion.div whileHover={{ y: -5 }} className="relative overflow-hidden backdrop-blur-xl bg-slate-900/50 border border-slate-700/50 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] group">
                    <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 transition-all ${displaySavings >= 0 ? "bg-cyan-500/10 group-hover:bg-cyan-500/20" : "bg-red-500/10 group-hover:bg-red-500/20"}`} />
                    <div className="flex justify-between items-center relative z-10">
                        <div className={`p-3 rounded-2xl ${displaySavings >= 0 ? "bg-cyan-500/20" : "bg-red-500/20"}`}>
                            <PiggyBank className={displaySavings >= 0 ? "text-cyan-400" : "text-red-400"} size={24} />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Current Balance</span>
                    </div>
                    <h2 className={`text-4xl font-black mt-6 relative z-10 ${displaySavings >= 0 ? "text-slate-100" : "text-red-400"}`}>
                        ₹{displaySavings}
                    </h2>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <button
                    onClick={() => setShowAddModal(true)}
                    className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-slate-950 font-bold py-4 px-6 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all flex items-center justify-center group"
                >
                    <Plus className="mr-2 group-hover:rotate-90 transition-transform" />
                    New Transaction
                </button>
                <button
                    onClick={() => setShowViewModal(true)}
                    className="w-full bg-slate-800/50 border border-slate-700 hover:bg-slate-800 text-slate-100 font-medium py-4 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center group"
                >
                    <Eye className="mr-2 text-cyan-400 group-hover:scale-110 transition-transform" />
                    View All Transactions
                </button>
            </div>

            <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 p-8 rounded-3xl shadow-xl mt-8">
                <h2 className="text-2xl font-bold mb-6 text-slate-100 flex items-center gap-2">
                    <span className="text-cyan-400">📋</span> Recent Activity
                </h2>
                {expenses.length === 0 ? (
                    <div className="text-center py-10 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
                        <p className="text-slate-500">No transactions found.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {[...expenses].reverse().slice(0, 6).map((item, i) => (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={item.id} 
                                className="flex justify-between items-center p-4 bg-slate-800/40 rounded-2xl hover:bg-slate-800/70 transition-colors border border-slate-700/30 group"
                            >
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${item.type === 'INCOME' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                                        <p className="font-semibold text-slate-200 text-lg">{item.category}</p>
                                    </div>
                                    <p className="text-sm text-slate-500 ml-4">{formatDate(item.date)}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`font-bold text-xl px-4 py-2 rounded-xl border border-slate-700 ${item.type === 'INCOME' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-100 bg-slate-900/50'}`}>
                                        {item.type === 'INCOME' ? '+' : '-'}₹{item.amount}
                                    </span>
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

            {showAddModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 border border-slate-700 p-8 rounded-3xl w-full max-w-sm shadow-2xl">
                        <h2 className="font-black text-2xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Add Transaction</h2>
                        
                        <div className="space-y-4">
                            <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700">
                                <button 
                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${newExpense.type === 'EXPENSE' ? 'bg-rose-500/20 text-rose-400' : 'text-slate-400 hover:text-slate-200'}`}
                                    onClick={() => setNewExpense({...newExpense, type: 'EXPENSE'})}
                                >
                                    Expense
                                </button>
                                <button 
                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${newExpense.type === 'INCOME' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
                                    onClick={() => setNewExpense({...newExpense, type: 'INCOME'})}
                                >
                                    Income
                                </button>
                            </div>
                            
                            <select
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                                value={newExpense.category}
                                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                            >
                                <option value="">Select Category</option>
                                {newExpense.type === 'INCOME' ? (
                                    <>
                                        <option value="Salary">Salary</option>
                                        <option value="Pocket Money">Pocket Money</option>
                                        <option value="Freelance">Freelance</option>
                                        <option value="Investment">Investment</option>
                                        <option value="Other Income">Other Income</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="Food">Food</option>
                                        <option value="Travel">Travel</option>
                                        <option value="Shopping">Shopping</option>
                                        <option value="Bills">Bills</option>
                                        <option value="Entertainment">Entertainment</option>
                                        <option value="Other">Other</option>
                                    </>
                                )}
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
                                Save
                            </button>
                            <button onClick={() => setShowAddModal(false)} className="w-full text-slate-400 hover:text-slate-200 p-3.5 rounded-xl transition-colors">
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {showEditModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 border border-slate-700 p-8 rounded-3xl w-full max-w-sm shadow-2xl">
                        <h2 className="font-black text-2xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Edit Transaction</h2>
                        
                        <div className="space-y-4">
                            <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700">
                                <button 
                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${editExpense.type === 'EXPENSE' ? 'bg-rose-500/20 text-rose-400' : 'text-slate-400 hover:text-slate-200'}`}
                                    onClick={() => setEditExpense({...editExpense, type: 'EXPENSE'})}
                                >
                                    Expense
                                </button>
                                <button 
                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${editExpense.type === 'INCOME' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
                                    onClick={() => setEditExpense({...editExpense, type: 'INCOME'})}
                                >
                                    Income
                                </button>
                            </div>
                            
                            <select
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                                value={editExpense.category}
                                onChange={(e) => setEditExpense({ ...editExpense, category: e.target.value })}
                            >
                                <option value="">Select Category</option>
                                {editExpense.type === 'INCOME' ? (
                                    <>
                                        <option value="Salary">Salary</option>
                                        <option value="Pocket Money">Pocket Money</option>
                                        <option value="Freelance">Freelance</option>
                                        <option value="Investment">Investment</option>
                                        <option value="Other Income">Other Income</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="Food">Food</option>
                                        <option value="Travel">Travel</option>
                                        <option value="Shopping">Shopping</option>
                                        <option value="Bills">Bills</option>
                                        <option value="Entertainment">Entertainment</option>
                                        <option value="Other">Other</option>
                                    </>
                                )}
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
                                Update
                            </button>
                            <button onClick={() => setShowEditModal(false)} className="w-full text-slate-400 hover:text-slate-200 p-3.5 rounded-xl transition-colors">
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {showViewModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 border border-slate-700 p-8 rounded-3xl w-full max-w-2xl shadow-2xl max-h-[85vh] flex flex-col">
                        <h2 className="font-bold text-2xl mb-6 text-slate-100 flex items-center gap-2">
                            <Wallet className="text-cyan-400" /> All Transactions
                        </h2>

                        {/* Search & Filter Controls */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search categories..."
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="relative w-full md:w-48">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <select
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-10 pr-10 text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                >
                                    <option value="ALL">All Types</option>
                                    <option value="INCOME">Income</option>
                                    <option value="EXPENSE">Expense</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-y-auto pr-2 flex-col space-y-3">
                            {filteredExpenses.length === 0 ? (
                                <p className="text-slate-500 text-center py-10 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">No transactions match your search.</p>
                            ) : (
                                [...filteredExpenses].reverse().map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex justify-between items-center p-4 bg-slate-800/40 rounded-2xl border border-slate-700/30 group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.type === 'INCOME' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                                {item.type === 'INCOME' ? <TrendingUp size={18} /> : <Wallet size={18} />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-200">{item.category}</p>
                                                <p className="text-xs text-slate-500">
                                                    {formatDate(item.date)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <span className={`font-bold text-lg px-3 py-1 rounded-lg border border-slate-700 ${item.type === 'INCOME' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-100 bg-slate-900/50'}`}>
                                                {item.type === 'INCOME' ? '+' : '-'}₹{item.amount}
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