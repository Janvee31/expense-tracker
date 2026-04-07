import { motion } from 'framer-motion';
import { Plus, Eye, Wallet, User, ShoppingBag, Plane, Utensils, Receipt, MoreHorizontal, TrendingUp, PiggyBank, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useState } from 'react';

export default function App() {
  const [totalExpenses] = useState(5000);
  const [totalIncome] = useState(8000);
  const [totalSavings] = useState(3000);

  const categories = [
    { name: 'Food', amount: 1200, icon: Utensils, color: 'from-pink-200 to-pink-300' },
    { name: 'Travel', amount: 2500, icon: Plane, color: 'from-blue-200 to-blue-300' },
    { name: 'Shopping', amount: 800, icon: ShoppingBag, color: 'from-purple-200 to-purple-300' },
    { name: 'Bills', amount: 500, icon: Receipt, color: 'from-green-200 to-green-300' },
    { name: 'Miscellaneous', amount: 300, icon: MoreHorizontal, color: 'from-yellow-200 to-yellow-300' },
  ];

  const recentTransactions = [
    { name: 'Grocery Store', amount: 450, category: 'Food', date: 'Today', type: 'expense' },
    { name: 'Salary Credited', amount: 8000, category: 'Income', date: 'Yesterday', type: 'income' },
    { name: 'Flight Booking', amount: 1200, category: 'Travel', date: 'Yesterday', type: 'expense' },
    { name: 'Online Shopping', amount: 350, category: 'Shopping', date: '2 days ago', type: 'expense' },
    { name: 'Freelance Payment', amount: 2000, category: 'Income', date: '3 days ago', type: 'income' },
  ];

  return (
      <div className="size-full min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 font-['Inter',sans-serif]">
        {/* Top Navigation */}
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
          <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="bg-gradient-to-br from-blue-500 to-purple-600 p-2.5 rounded-xl shadow-lg"
              >
                <Wallet className="size-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Expense Tracker
                </h1>
                <p className="text-xs text-gray-500 font-medium">Your financial companion</p>
              </div>
            </div>
            <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-full hover:from-blue-50 hover:to-purple-50 transition-all shadow-md hover:shadow-lg border border-gray-200/50"
            >
              <User className="size-5 text-gray-700" />
            </motion.button>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-8 py-10 space-y-10">
          {/* Financial Overview Cards - Income, Expenses, Savings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Income Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <div className="bg-white/60 backdrop-blur-xl border border-green-200/50 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden rounded-2xl">
                <div className="p-8 relative">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full blur-3xl"></div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-3 rounded-xl">
                        <TrendingUp className="size-6 text-green-600" />
                      </div>
                      <div className="bg-green-100 px-3 py-1 rounded-full">
                        <span className="text-green-700 text-xs font-bold">+12%</span>
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm font-semibold mb-2 tracking-wide uppercase">Total Income</p>
                    <p className="text-4xl font-bold text-gray-900 mb-1">₹{totalIncome.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 font-medium">This month</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Total Expense Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <div className="bg-white/60 backdrop-blur-xl border border-red-200/50 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden rounded-2xl">
                <div className="p-8 relative">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-red-400/20 to-pink-500/20 rounded-full blur-3xl"></div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="bg-gradient-to-br from-red-100 to-pink-100 p-3 rounded-xl">
                        <Wallet className="size-6 text-red-600" />
                      </div>
                      <div className="bg-red-100 px-3 py-1 rounded-full">
                        <span className="text-red-700 text-xs font-bold">+8%</span>
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm font-semibold mb-2 tracking-wide uppercase">Total Expenses</p>
                    <p className="text-4xl font-bold text-gray-900 mb-1">₹{totalExpenses.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 font-medium">This month</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Total Savings Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <div className="bg-white/60 backdrop-blur-xl border border-blue-200/50 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden rounded-2xl">
                <div className="p-8 relative">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl"></div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-3 rounded-xl">
                        <PiggyBank className="size-6 text-blue-600" />
                      </div>
                      <div className="bg-blue-100 px-3 py-1 rounded-full">
                        <span className="text-blue-700 text-xs font-bold">+37.5%</span>
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm font-semibold mb-2 tracking-wide uppercase">Total Savings</p>
                    <p className="text-4xl font-bold text-gray-900 mb-1">₹{totalSavings.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 font-medium">This month</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <button
                  className="w-full h-16 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg shadow-xl hover:shadow-2xl rounded-2xl transition-all"
              >
                <Plus className="size-6" />
                Add Expense
              </button>
            </motion.div>

            <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <button
                  className="w-full h-16 flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm border-2 border-gray-300 hover:bg-white hover:border-purple-300 text-gray-800 hover:text-purple-700 font-bold text-lg shadow-lg hover:shadow-xl rounded-2xl transition-all"
              >
                <Eye className="size-6" />
                View All Expenses
              </button>
            </motion.div>
          </div>

          {/* Categories */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
                <p className="text-sm text-gray-500 font-medium mt-1">Your spending breakdown</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
              {categories.map((category, index) => (
                  <motion.div
                      key={category.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08 }}
                      whileHover={{ scale: 1.08, y: -8 }}
                      whileTap={{ scale: 0.95 }}
                  >
                    <div className={`bg-gradient-to-br ${category.color} border-0 shadow-lg hover:shadow-2xl rounded-2xl overflow-hidden cursor-pointer transition-all duration-300`}>
                      <div className="p-6">
                        <div className="bg-white/70 backdrop-blur-sm w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-md">
                          <category.icon className="size-7 text-gray-700" />
                        </div>
                        <p className="text-gray-700 text-sm font-bold mb-2">{category.name}</p>
                        <p className="text-gray-900 text-2xl font-bold">₹{category.amount}</p>
                        <div className="mt-3 w-full bg-white/40 rounded-full h-1.5">
                          <div className="bg-white/80 h-1.5 rounded-full" style={{ width: `${(category.amount / 2500) * 100}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Recent Transactions</h2>
                <p className="text-sm text-gray-500 font-medium mt-1">Last 5 activities</p>
              </div>
              <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-purple-600 hover:text-purple-700 font-bold text-sm flex items-center gap-1"
              >
                View All
                <ArrowUpRight className="size-4" />
              </motion.button>
            </div>
            <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-xl rounded-2xl overflow-hidden">
              <div>
                {recentTransactions.map((transaction, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.08 }}
                        whileHover={{ backgroundColor: 'rgba(249, 250, 251, 1)', x: 4 }}
                        className="p-6 flex items-center justify-between cursor-pointer transition-all border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-5">
                        <div className={`${transaction.type === 'income' ? 'bg-gradient-to-br from-green-100 to-emerald-100' : 'bg-gradient-to-br from-purple-100 to-pink-100'} p-4 rounded-2xl shadow-sm`}>
                          {transaction.type === 'income' ? (
                              <ArrowDownRight className="size-6 text-green-600" />
                          ) : (
                              <ArrowUpRight className="size-6 text-purple-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-base mb-1">{transaction.name}</p>
                          <p className="text-sm text-gray-500 font-medium">{transaction.category} • {transaction.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-xl ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                        </p>
                      </div>
                    </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}