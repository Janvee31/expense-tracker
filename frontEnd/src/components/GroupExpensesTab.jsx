import { useState, useEffect } from "react";
import axios from "axios";
import { PlusCircle, Trash2, Info, Percent, Coins, DollarSign, Calendar, FileText } from "lucide-react";

export default function GroupExpensesTab({ groupId }) {
    const [expenses, setExpenses] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);

    // Form states
    const [description, setDescription] = useState("");
    const [totalAmount, setTotalAmount] = useState("");
    const [currency, setCurrency] = useState("INR");
    const [rate, setRate] = useState("1.0");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [payerEmail, setPayerEmail] = useState("");
    const [splitType, setSplitType] = useState("EQUAL");
    const [splitShares, setSplitShares] = useState({}); // userEmail -> splitValue (exact or percentage)

    const fetchExpensesAndMembers = async () => {
        try {
            setLoading(true);
            const expRes = await axios.get(`http://localhost:8080/family/${groupId}/shared-expenses`);
            setExpenses(expRes.data || []);

            const memRes = await axios.get(`http://localhost:8080/family/${groupId}/memberships`);
            const activeMems = memRes.data.filter(m => m.leftDate === null);
            setMembers(activeMems);

            if (activeMems.length > 0) {
                setPayerEmail(activeMems[0].email);
            }
        } catch (err) {
            console.error("Error loading expenses/members:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpensesAndMembers();
    }, [groupId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description.trim() || !totalAmount || parseFloat(totalAmount) <= 0) return;

        // Build splits request array
        const splits = members.map(m => {
            const val = parseFloat(splitShares[m.email]) || 0;
            return {
                email: m.email,
                splitType: splitType,
                splitValue: splitType === "EQUAL" ? 0.0 : val
            };
        });

        // Validate percentage splits sum to 100% or exact sums match total
        if (splitType === "PERCENT") {
            const sum = splits.reduce((acc, curr) => acc + curr.splitValue, 0);
            if (Math.abs(sum - 100) > 0.1) {
                alert("Percentages must sum up to exactly 100%. Total entered: " + sum + "%");
                return;
            }
        } else if (splitType === "EXACT") {
            const sum = splits.reduce((acc, curr) => acc + curr.splitValue, 0);
            if (Math.abs(sum - parseFloat(totalAmount)) > 1) {
                alert(`Exact amounts must sum up to the total expense amount (₹${totalAmount}). Total entered: ₹${sum}`);
                return;
            }
        }

        try {
            setLoading(true);
            await axios.post(`http://localhost:8080/family/${groupId}/shared-expenses/create`, {
                description,
                totalAmount: parseFloat(totalAmount),
                currency,
                exchangeRateToBase: parseFloat(rate) || 1.0,
                date,
                payerEmail,
                splits
            });

            // Reset form
            setDescription("");
            setTotalAmount("");
            setCurrency("INR");
            setRate("1.0");
            setDate(new Date().toISOString().split("T")[0]);
            setSplitType("EQUAL");
            setSplitShares({});
            setShowAddForm(false);

            fetchExpensesAndMembers();
        } catch (err) {
            console.error("Failed to save expense:", err);
            alert("Error creating shared expense. Check active memberships.");
        } finally {
            setLoading(false);
        }
    };

    if (loading && expenses.length === 0) {
        return <div className="text-center py-6 text-slate-400">Loading shared expenses...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <div>
                    <h3 className="text-lg font-bold text-slate-100">Group Expense Ledger</h3>
                    <p className="text-xs text-slate-400 mt-1">
                        Displaying and creating shared roommate expenses.
                    </p>
                </div>
                {!showAddForm && (
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-650 text-white font-bold text-xs shadow-lg transition-all"
                    >
                        + Add Shared Expense
                    </button>
                )}
            </div>

            {/* ADD EXPENSE FORM MODAL / PANEL */}
            {showAddForm && (
                <form onSubmit={handleSubmit} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl space-y-4 max-w-2xl mx-auto">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                        <span className="font-bold text-slate-200 text-sm">Create Split Bill</span>
                        <button
                            type="button"
                            onClick={() => setShowAddForm(false)}
                            className="text-xs font-semibold text-slate-500 hover:text-slate-300"
                        >
                            Cancel
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Description / Item</label>
                            <input
                                type="text"
                                placeholder="e.g. Electricity, Trip Groceries"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-3 py-2 text-xs text-slate-200"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Payer</label>
                            <select
                                value={payerEmail}
                                onChange={(e) => setPayerEmail(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-3 py-2 text-xs text-slate-200"
                            >
                                {members.map(m => (
                                    <option key={m.email} value={m.email}>{m.email.split("@")[0]} ({m.email})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Total Amount</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={totalAmount}
                                onChange={(e) => setTotalAmount(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-3 py-2 text-xs text-slate-200"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Currency</label>
                            <select
                                value={currency}
                                onChange={(e) => {
                                    setCurrency(e.target.value);
                                    setRate(e.target.value === "USD" ? "83.0" : "1.0");
                                }}
                                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-3 py-2 text-xs text-slate-200"
                            >
                                <option value="INR">INR (₹)</option>
                                <option value="USD">USD ($)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Exchange Rate (to INR)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={rate}
                                onChange={(e) => setRate(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-3 py-2 text-xs text-slate-200"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-3 py-2 text-xs text-slate-200"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Split Type</label>
                            <select
                                value={splitType}
                                onChange={(e) => {
                                    setSplitType(e.target.value);
                                    setSplitShares({});
                                }}
                                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-3 py-2 text-xs text-slate-200"
                            >
                                <option value="EQUAL">Split Equally</option>
                                <option value="EXACT">Exact Shares (INR/USD)</option>
                                <option value="PERCENT">Percentages (%)</option>
                            </select>
                        </div>
                    </div>

                    {splitType !== "EQUAL" && (
                        <div className="bg-slate-950/40 p-4 border border-slate-900 rounded-2xl space-y-3">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block">Enter Shares:</span>
                            {members.map(m => (
                                <div key={m.email} className="flex items-center justify-between text-xs gap-4">
                                    <span className="text-slate-300">{m.email.split("@")[0]}</span>
                                    <div className="flex items-center gap-1.5 w-32">
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={splitShares[m.email] || ""}
                                            onChange={(e) => setSplitShares({
                                                ...splitShares,
                                                [m.email]: e.target.value
                                            })}
                                            className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1 text-right text-slate-200"
                                        />
                                        <span className="text-slate-500 font-bold">
                                            {splitType === "PERCENT" ? "%" : currency === "USD" ? "$" : "₹"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-650 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-xs transition-all shadow-md"
                    >
                        Save Split Expense
                    </button>
                </form>
            )}

            {/* EXPENSES LIST GRID */}
            {expenses.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/40 border border-dashed border-slate-850 rounded-2xl text-slate-500 text-xs font-semibold">
                    No shared expenses entered. Upload a CSV or enter one manually above.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {expenses.map((e) => {
                        const isUSD = e.currency === "USD";
                        return (
                            <div key={e.id} className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-3 flex flex-col justify-between hover:border-slate-700 transition-all">
                                <div>
                                    <div className="flex justify-between items-center gap-2">
                                        <h4 className="font-extrabold text-slate-200 text-sm truncate">{e.description}</h4>
                                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                            isUSD ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                        }`}>
                                            {isUSD ? `USD ($ ${e.totalAmount})` : `INR (₹${e.totalAmount})`}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Paid by: <b>{e.payer.email.split("@")[0]}</b> on {e.date}
                                    </p>
                                    {isUSD && (
                                        <p className="text-[10px] text-amber-500 font-semibold mt-1">
                                            Converted value: ₹{(e.totalAmount * e.exchangeRateToBase).toFixed(2)} (Exchange rate: ₹{e.exchangeRateToBase}/$)
                                        </p>
                                    )}
                                </div>

                                <div className="border-t border-slate-800/60 pt-3">
                                    <span className="text-[10px] uppercase font-bold text-slate-550 block mb-1.5">Shared splits:</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {e.splits.map((split) => (
                                            <div key={split.id} className="text-[10px] font-semibold bg-slate-950/60 border border-slate-850 px-2.5 py-1 rounded-lg text-slate-350">
                                                {split.user.email.split("@")[0]}: ₹{split.shareAmount.toFixed(2)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
