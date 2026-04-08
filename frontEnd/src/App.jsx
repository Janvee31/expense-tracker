import { motion } from "framer-motion";
import {Plus, Eye, Wallet, User, TrendingUp, PiggyBank, } from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";

export default function App() {

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:8080/expenses")
        .then(res => {
          setExpenses(res.data.content);
          setLoading(false);
        })
        .catch(err => {
          console.log(err);
          setLoading(false);
        });
  }, []);
  const totalExpenses = expenses.reduce(
      (sum, item) => sum + (item.amount || 0),
      0
  );
  const totalIncome = 8000;
  const totalSavings = totalIncome - totalExpenses;

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">

        {/* 🔹 NAVBAR */}
        <nav className="bg-white/80 backdrop-blur-xl shadow-sm p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
              <Wallet className="text-white" />
            </div>
            <h1 className="font-bold text-xl">Expense Tracker</h1>
          </div>
          <User />
        </nav>

        {/* 🔹 MAIN */}
        <div className="p-8 space-y-8">

          {/* 🔥 CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <motion.div whileHover={{ scale: 1.05 }}>
              <div className="bg-white p-6 rounded-xl shadow">
                <TrendingUp className="text-green-600 mb-2" />
                <p className="text-gray-500">Total Income</p>
                <h2 className="text-2xl font-bold">₹{totalIncome}</h2>
              </div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }}>
              <div className="bg-white p-6 rounded-xl shadow">
                <Wallet className="text-red-600 mb-2" />
                <p className="text-gray-500">Total Expenses</p>
                <h2 className="text-2xl font-bold">₹{totalExpenses}</h2>
              </div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }}>
              <div className="bg-white p-6 rounded-xl shadow">
                <PiggyBank className="text-blue-600 mb-2" />
                <p className="text-gray-500">Total Savings</p>
                <h2 className="text-2xl font-bold">₹{totalSavings}</h2>
              </div>
            </motion.div>
          </div>

          {/* 🔥 BUTTONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl transition">
              <Plus />
              Add Expense
            </button>
            <button className="flex items-center justify-center gap-2 border p-4 rounded-xl hover:bg-gray-100 transition">
              <Eye />
              View Expenses
            </button>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>

            {loading ? (
                <p>Loading...</p>
            ) : expenses.length === 0 ? (
                <p>No Expenses Found</p>
            ) : (
                expenses.slice(0, 5).map((item, index) => (
                    <motion.div
                        key={item.id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-between border-b py-3"
                    >
                      <div>
                        <p className="font-semibold">{item.category}</p>
                      </div>

                      <p className="text-red-500 font-semibold">
                        ₹{item.amount}
                      </p>
                    </motion.div>
                ))
            )}
          </div>

        </div>
      </div>
  );
}