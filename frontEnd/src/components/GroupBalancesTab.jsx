import { useState, useEffect } from "react";
import axios from "axios";
import { IndianRupee, ArrowRight, RefreshCw, CheckCircle, Info, FileText } from "lucide-react";

export default function GroupBalancesTab({ groupId }) {
    const [balances, setBalances] = useState({});
    const [settlements, setSettlements] = useState([]);
    const [ledger, setLedger] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Repayment Form
    const [debtor, setDebtor] = useState("");
    const [creditor, setCreditor] = useState("");
    const [amount, setAmount] = useState("");

    const fetchData = async () => {
        try {
            setLoading(true);
            const balRes = await axios.get(`http://localhost:8080/family/${groupId}/shared-expenses/balances`);
            setBalances(balRes.data || {});

            const setRes = await axios.get(`http://localhost:8080/family/${groupId}/shared-expenses/settlements`);
            setSettlements(setRes.data || []);

            const ledRes = await axios.get(`http://localhost:8080/family/${groupId}/shared-expenses/ledger`);
            setLedger(ledRes.data || {});
            
            // Prefill repayments selectors
            const users = Object.keys(balRes.data || {});
            if (users.length > 1) {
                setDebtor(users[0]);
                setCreditor(users[1]);
            }
        } catch (err) {
            console.error("Error fetching balance data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [groupId]);

    const handleSettle = async (e) => {
        e.preventDefault();
        if (!debtor || !creditor || !amount || parseFloat(amount) <= 0) return;
        if (debtor === creditor) {
            alert("Payer and Receiver must be different.");
            return;
        }

        try {
            setSubmitting(true);
            await axios.post(`http://localhost:8080/family/${groupId}/shared-expenses/settle`, {
                debtorEmail: debtor,
                creditorEmail: creditor,
                amount: parseFloat(amount)
            });
            setAmount("");
            fetchData();
        } catch (err) {
            console.error("Error recording settlement:", err);
            alert("Failed to record settlement");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRecordQuickSettle = async (debEmail, credEmail, amt) => {
        try {
            setLoading(true);
            await axios.post(`http://localhost:8080/family/${groupId}/shared-expenses/settle`, {
                debtorEmail: debEmail,
                creditorEmail: credEmail,
                amount: amt
            });
            fetchData();
        } catch (err) {
            console.error("Quick settle failed:", err);
            alert("Settlement failed");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-6 text-slate-400">Loading ledger balances...</div>;
    }

    const userList = Object.keys(balances);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* DEBT MINIMIZATION VIEW & QUICK SETTLES */}
            <div className="space-y-6 lg:col-span-2">
                <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-4">
                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                        <span className="text-emerald-400">📊</span> Settlement Summary
                    </h3>
                    <p className="text-xs text-slate-400">
                        Optimized payment paths to settle all debts with the minimum number of transactions.
                    </p>

                    {settlements.length === 0 ? (
                        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs font-semibold">
                            <CheckCircle size={16} /> All flatmates are completely settled! No debts outstanding.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {settlements.map((s, idx) => (
                                <div key={idx} className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-bold text-rose-450">{s.debtor.split("@")[0]}</span>
                                        <ArrowRight size={14} className="text-slate-500" />
                                        <span className="font-bold text-emerald-400">{s.creditor.split("@")[0]}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-black text-slate-100 text-sm">₹{s.amount.toFixed(2)}</span>
                                        <button
                                            onClick={() => handleRecordQuickSettle(s.debtor, s.creditor, s.amount)}
                                            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-all"
                                        >
                                            Record Payment
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* DETAILED LEDGER */}
                <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                            <span className="text-indigo-400">🔍</span> Audit Ledgers
                        </h3>
                        <span className="text-[10px] uppercase font-bold text-slate-500">Click a user to audit</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {userList.map(u => (
                            <button
                                key={u}
                                onClick={() => setSelectedUser(selectedUser === u ? null : u)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                                    selectedUser === u 
                                        ? "bg-indigo-500/25 border-indigo-500 text-indigo-400" 
                                        : "bg-slate-950/60 border-slate-850 text-slate-400 hover:text-slate-200"
                                }`}
                            >
                                {u.split("@")[0]} (₹{balances[u] >= 0 ? "+" : ""}{balances[u].toFixed(2)})
                            </button>
                        ))}
                    </div>

                    {selectedUser ? (
                        <div className="space-y-3 pt-2">
                            <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wider flex items-center gap-1.5">
                                <FileText size={13} className="text-indigo-400" /> Account Audit for {selectedUser.split("@")[0]}
                            </h4>

                            {!ledger[selectedUser] || ledger[selectedUser].length === 0 ? (
                                <p className="text-xs text-slate-500 py-4">No logged records for this user.</p>
                            ) : (
                                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                    {ledger[selectedUser].map((item, idx) => {
                                        const isPositive = item.amount > 0;
                                        return (
                                            <div key={idx} className="bg-slate-950/40 border border-slate-900 p-3 rounded-xl flex items-center justify-between text-xs gap-3">
                                                <div>
                                                    <span className="text-[10px] text-slate-500 font-semibold block">{item.date}</span>
                                                    <span className="text-slate-300 font-medium">{item.description}</span>
                                                </div>
                                                <span className={`font-bold ${isPositive ? "text-emerald-400" : "text-rose-450"}`}>
                                                    {isPositive ? "+" : ""}₹{item.amount.toFixed(2)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 bg-slate-950/40 p-4 rounded-xl border border-slate-900 text-xs text-slate-500">
                            <Info size={16} /> Click on any flatmate's name button above to trace and view every single split expense share contributing to their balance.
                        </div>
                    )}
                </div>
            </div>

            {/* DIRECT RECORD PAYMENT FORM */}
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl h-fit space-y-4">
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <span className="text-cyan-400">💸</span> Record Payment
                </h3>
                <p className="text-xs text-slate-400">
                    Record a direct cash/UPI repayment from one flatmate to another.
                </p>

                <form onSubmit={handleSettle} className="space-y-4">
                    <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Who Paid?</label>
                        <select
                            value={debtor}
                            onChange={(e) => setDebtor(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-3 py-2.5 text-xs text-slate-200"
                        >
                            {userList.map(u => (
                                <option key={u} value={u}>{u.split("@")[0]} ({u})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Who Received?</label>
                        <select
                            value={creditor}
                            onChange={(e) => setCreditor(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-3 py-2.5 text-xs text-slate-200"
                        >
                            {userList.map(u => (
                                <option key={u} value={u}>{u.split("@")[0]} ({u})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Amount Paid (₹)</label>
                        <input
                            type="number"
                            placeholder="Repayment amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-xs shadow-lg transition-all"
                    >
                        {submitting ? "Saving Repayment..." : "Submit Settlement"}
                    </button>
                </form>
            </div>
        </div>
    );
}
