import { motion } from "framer-motion";
import { Plus, Eye, Wallet, User, TrendingUp, PiggyBank } from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    date: ""
  });

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

  const handleAddExpense = async () => {
    if (!formData.amount || !formData.category) {
      alert("Please fill all required fields");
      return;
    }

    try {
      let res;

      if (editId) {
        res = await axios.put(
            `http://localhost:8080/expenses/${editId}`,
            {
              amount: Number(formData.amount),
              category: formData.category,
              date: formData.date || null
            }
        );

        setExpenses((prev) =>
            prev.map((item) =>
                item.id === editId
                    ? {
                      ...item,
                      amount: Number(formData.amount),
                      category: formData.category,
                      date: formData.date
                    }
                    : item
            )
        );
      } else {
        res = await axios.post(
            "http://localhost:8080/expenses",
            {
              amount: Number(formData.amount),
              category: formData.category,
              date: formData.date || null
            }
        );

        setExpenses((prev) => [res.data, ...prev]);
      }

      setFormData({
        amount: "",
        category: "",
        date: ""
      });

      setEditId(null);
      setShowModal(false);

    } catch (error) {
      alert("Error saving expense");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/expenses/${id}`);
      setExpenses((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      alert("Error deleting expense");
    }
  };

  const handleEdit = (item) => {
    setFormData({
      amount: item.amount,
      category: item.category,
      date: item.date ? item.date.split("T")[0] : ""
    });

    setEditId(item.id);
    setShowModal(true);
  };

  const totalExpenses = expenses.reduce(
      (sum, item) => sum + (item.amount || 0),
      0
  );

  const totalIncome = 8000;
  const totalSavings = totalIncome - totalExpenses;

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">

        <nav className="bg-white/80 backdrop-blur-xl shadow-sm p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
              <Wallet className="text-white" />
            </div>
            <h1 className="font-bold text-xl">Expense Tracker</h1>
          </div>
          <User />
        </nav>

        <div className="p-8 space-y-8">

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <button
                onClick={() => {
                  setShowModal(true);
                  setEditId(null);
                  setFormData({ amount: "", category: "", date: "" });
                }}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl transition"
            >
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
                <p className="text-gray-400">Loading transactions...</p>
            ) : expenses.length === 0 ? (
                <p>No Expenses Found</p>
            ) : (
                expenses.slice(0, 5).map((item, index) => (
                    <motion.div
                        key={item.id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-between items-center border-b py-3 hover:bg-gray-50 px-2 rounded-lg transition"
                    >
                      <div>
                        <p className="font-semibold capitalize">{item.category}</p>
                        <p className="text-sm text-gray-400">Expense</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <p className="text-red-500 font-semibold">
                          ₹{(item.amount || 0).toLocaleString()}
                        </p>

                        <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-500 hover:text-blue-700"
                        >
                          ✏️
                        </button>

                        <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-500 hover:text-red-700"
                        >
                          🗑️
                        </button>
                      </div>
                    </motion.div>
                ))
            )}
          </div>

        </div>

        {showModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
              <div className="bg-white p-6 rounded-2xl w-96 shadow-lg">

                <h2 className="text-xl font-semibold mb-4">
                  {editId ? "Edit Expense" : "Add Expense"}
                </h2>

                <input
                    type="number"
                    placeholder="Amount"
                    value={formData.amount}
                    onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                    }
                    className="w-full mb-3 p-2 border rounded"
                />

                <select
                    value={formData.category}
                    onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full mb-3 p-2 border rounded"
                >
                  <option value="">Select Category</option>
                  <option value="Food">Food</option>
                  <option value="Travel">Travel</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>

                <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full mb-4 p-2 border rounded"
                />

                <div className="flex justify-end gap-2">
                  <button
                      onClick={() => setShowModal(false)}
                      className="px-3 py-1 border rounded"
                  >
                    Cancel
                  </button>

                  <button
                      onClick={handleAddExpense}
                      className="px-4 py-1 bg-blue-600 text-white rounded"
                  >
                    {editId ? "Update" : "Submit"}
                  </button>
                </div>

              </div>
            </div>
        )}

      </div>
  );
}