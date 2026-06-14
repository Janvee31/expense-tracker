import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Plus, Trash2, ArrowRight, ArrowLeft, Check, 
    Coins, AlertCircle, RefreshCw, CheckCircle2, 
    Calendar, User, ArrowUpRight, Scale, IndianRupee,
    PlusCircle
} from "lucide-react";

export default function Hisab() {
    const [outings, setOutings] = useState([]);
    const [selectedOutingId, setSelectedOutingId] = useState(null);
    const [outingDetail, setOutingDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    
    // Wizard State
    const [isCreating, setIsCreating] = useState(false);
    const [step, setStep] = useState(1);
    
    // Step 1 State: Outing Details
    const [outingName, setOutingName] = useState("");
    const [participants, setParticipants] = useState(["Self"]);
    const [newParticipant, setNewParticipant] = useState("");
    
    // Step 2 State: Events
    const [events, setEvents] = useState([]);
    const [eventName, setEventName] = useState("");
    const [eventAmount, setEventAmount] = useState("");
    const [payerMode, setPayerMode] = useState("single"); // "single" or "multiple"
    const [singlePayer, setSinglePayer] = useState("Self");
    const [multiplePayers, setMultiplePayers] = useState({}); // name -> amount
    const [sharedBy, setSharedBy] = useState(["Self"]);
    
    // Step 3 State: Leftover Debts
    const [debts, setDebts] = useState([]);
    const [debtor, setDebtor] = useState("");
    const [creditor, setCreditor] = useState("");
    const [debtAmount, setDebtAmount] = useState("");

    // Inline Add Expense / Debt for existing Outing
    const [showDetailAddExpense, setShowDetailAddExpense] = useState(false);
    const [showDetailAddDebt, setShowDetailAddDebt] = useState(false);

    // Detail View Event Form State
    const [detailEventName, setDetailEventName] = useState("");
    const [detailEventAmount, setDetailEventAmount] = useState("");
    const [detailPayerMode, setDetailPayerMode] = useState("single");
    const [detailSinglePayer, setDetailSinglePayer] = useState("Self");
    const [detailMultiplePayers, setDetailMultiplePayers] = useState({});
    const [detailSharedBy, setDetailSharedBy] = useState([]);

    // Detail View Debt Form State
    const [detailDebtor, setDetailDebtor] = useState("");
    const [detailCreditor, setDetailCreditor] = useState("");
    const [detailDebtAmount, setDetailDebtAmount] = useState("");

    // Fetch list of outings
    const fetchOutings = async () => {
        try {
            setLoading(true);
            const res = await axios.get("http://localhost:8080/split/outings");
            setOutings(res.data || []);
        } catch (err) {
            console.error("Error fetching outings:", err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch details for selected outing
    const fetchOutingDetail = async (id) => {
        try {
            setDetailLoading(true);
            const res = await axios.get(`http://localhost:8080/split/outing/${id}`);
            setOutingDetail(res.data);
            setSelectedOutingId(id);
            
            // Prefill detail forms using fetched participants
            if (res.data && res.data.outing) {
                const parts = res.data.outing.participants || [];
                setDetailSinglePayer(parts[0] || "Self");
                setDetailSharedBy([...parts]);
            }
        } catch (err) {
            console.error("Error fetching outing detail:", err);
        } finally {
            setDetailLoading(false);
        }
    };

    // Submit new event to existing outing
    const handleDetailAddEvent = async () => {
        if (!detailEventName.trim() || !detailEventAmount || parseFloat(detailEventAmount) <= 0) {
            alert("Please enter a valid expense name and amount.");
            return;
        }
        if (detailSharedBy.length === 0) {
            alert("At least one person must share this expense.");
            return;
        }

        let paidMap = {};
        if (detailPayerMode === "single") {
            paidMap[detailSinglePayer] = parseFloat(detailEventAmount);
        } else {
            let sum = 0;
            outingDetail.outing.participants.forEach(p => {
                const amt = parseFloat(detailMultiplePayers[p]) || 0;
                if (amt > 0) {
                    paidMap[p] = amt;
                    sum += amt;
                }
            });
            if (Math.abs(sum - parseFloat(detailEventAmount)) > 1) {
                alert(`Payer shares sum (₹${sum}) must match the total amount (₹${detailEventAmount}).`);
                return;
            }
        }

        try {
            const newEvent = {
                name: detailEventName,
                totalAmount: parseFloat(detailEventAmount),
                paidBy: paidMap,
                sharedBy: [...detailSharedBy]
            };

            const res = await axios.post(`http://localhost:8080/split/outing/${selectedOutingId}/event`, newEvent);
            setOutingDetail(res.data); // Update detail view
            setShowDetailAddExpense(false); // Close form
            // Reset fields
            setDetailEventName("");
            setDetailEventAmount("");
            setDetailPayerMode("single");
            setDetailSinglePayer(res.data.outing.participants[0] || "Self");
            setDetailMultiplePayers({});
            setDetailSharedBy([...res.data.outing.participants]);
        } catch (err) {
            console.error("Error adding event to outing:", err);
            alert("Failed to add expense.");
        }
    };

    // Submit new debt to existing outing
    const handleDetailAddDebt = async () => {
        if (!detailDebtor || !detailCreditor || !detailDebtAmount || parseFloat(detailDebtAmount) <= 0) {
            alert("Please fill in debtor, creditor, and a valid amount.");
            return;
        }
        if (detailDebtor === detailCreditor) {
            alert("Debtor and Creditor must be different people.");
            return;
        }

        try {
            const newDebt = {
                debtor: detailDebtor,
                creditor: detailCreditor,
                amount: parseFloat(detailDebtAmount)
            };

            const res = await axios.post(`http://localhost:8080/split/outing/${selectedOutingId}/debt`, newDebt);
            setOutingDetail(res.data); // Update detail view
            setShowDetailAddDebt(false); // Close form
            // Reset fields
            setDetailDebtor("");
            setDetailCreditor("");
            setDetailDebtAmount("");
        } catch (err) {
            console.error("Error adding debt to outing:", err);
            alert("Failed to add debt.");
        }
    };

    // Delete event from existing outing
    const handleDetailDeleteEvent = async (eventId) => {
        if (!confirm("Are you sure you want to delete this event?")) return;
        try {
            const res = await axios.delete(`http://localhost:8080/split/outing/${selectedOutingId}/event/${eventId}`);
            setOutingDetail(res.data);
        } catch (err) {
            console.error("Error deleting event:", err);
            alert("Failed to delete event.");
        }
    };

    // Delete debt from existing outing
    const handleDetailDeleteDebt = async (debtId) => {
        if (!confirm("Are you sure you want to delete this debt?")) return;
        try {
            const res = await axios.delete(`http://localhost:8080/split/outing/${selectedOutingId}/debt/${debtId}`);
            setOutingDetail(res.data);
        } catch (err) {
            console.error("Error deleting debt:", err);
            alert("Failed to delete debt.");
        }
    };

    useEffect(() => {
        fetchOutings();
    }, []);

    // Add friend to participant list
    const handleAddParticipant = () => {
        const name = newParticipant.trim();
        if (name && !participants.includes(name)) {
            setParticipants([...participants, name]);
            setNewParticipant("");
        }
    };

    // Remove friend from participant list
    const handleRemoveParticipant = (name) => {
        if (name === "Self") return; // Keep creator
        setParticipants(participants.filter(p => p !== name));
    };

    // Add single event expense
    const handleAddEvent = () => {
        if (!eventName.trim() || !eventAmount || parseFloat(eventAmount) <= 0) {
            alert("Please enter a valid event name and amount.");
            return;
        }
        if (sharedBy.length === 0) {
            alert("At least one person must share this expense.");
            return;
        }

        let paidMap = {};
        if (payerMode === "single") {
            paidMap[singlePayer] = parseFloat(eventAmount);
        } else {
            // Validate multiple payers sum matches total amount
            let sum = 0;
            participants.forEach(p => {
                const amt = parseFloat(multiplePayers[p]) || 0;
                if (amt > 0) {
                    paidMap[p] = amt;
                    sum += amt;
                }
            });
            if (Math.abs(sum - parseFloat(eventAmount)) > 1) {
                alert(`Payer shares sum (₹${sum}) must match the total amount (₹${eventAmount}).`);
                return;
            }
        }

        const newEvent = {
            name: eventName,
            totalAmount: parseFloat(eventAmount),
            paidBy: paidMap,
            sharedBy: [...sharedBy]
        };

        setEvents([...events, newEvent]);
        // Reset sub-form
        setEventName("");
        setEventAmount("");
        setPayerMode("single");
        setSinglePayer("Self");
        setMultiplePayers({});
        setSharedBy([...participants]);
    };

    // Remove an event
    const handleRemoveEvent = (index) => {
        setEvents(events.filter((_, i) => i !== index));
    };

    // Add Leftover Debt
    const handleAddDebt = () => {
        if (!debtor || !creditor || !debtAmount || parseFloat(debtAmount) <= 0) {
            alert("Please fill in debtor, creditor, and a valid amount.");
            return;
        }
        if (debtor === creditor) {
            alert("Debtor and Creditor must be different people.");
            return;
        }

        const newDebt = {
            debtor,
            creditor,
            amount: parseFloat(debtAmount)
        };

        setDebts([...debts, newDebt]);
        setDebtor("");
        setCreditor("");
        setDebtAmount("");
    };

    // Remove Leftover Debt
    const handleRemoveDebt = (index) => {
        setDebts(debts.filter((_, i) => i !== index));
    };

    // Submit Outing creation to backend
    const handleSubmitOuting = async () => {
        if (!outingName.trim()) {
            alert("Please provide an outing name.");
            return;
        }
        try {
            const payload = {
                name: outingName,
                participants,
                events,
                leftoverDebts: debts
            };

            const res = await axios.post("http://localhost:8080/split/create", payload);
            setIsCreating(false);
            resetWizard();
            fetchOutings();
            // Automatically view the newly created outing details
            if (res.data && res.data.id) {
                fetchOutingDetail(res.data.id);
            }
        } catch (err) {
            console.error("Error creating outing:", err);
            alert("Failed to create outing. Check console for details.");
        }
    };

    // Reset Wizard fields
    const resetWizard = () => {
        setStep(1);
        setOutingName("");
        setParticipants(["Self"]);
        setEvents([]);
        setDebts([]);
        setEventName("");
        setEventAmount("");
        setPayerMode("single");
        setSinglePayer("Self");
        setMultiplePayers({});
        setSharedBy(["Self"]);
        setDebtor("");
        setCreditor("");
        setDebtAmount("");
    };

    // Settle & Sync ledger call
    const handleSettle = async (id) => {
        try {
            const res = await axios.post(`http://localhost:8080/split/outing/${id}/settle`);
            if (res.data.status === "success" || res.data.status === "already_settled") {
                // Refresh detail
                fetchOutingDetail(id);
                fetchOutings();
            }
        } catch (err) {
            console.error("Error settling outing:", err);
            alert("Failed to settle outing.");
        }
    };

    // Delete Outing
    const handleDeleteOuting = async (id, e) => {
        e.stopPropagation(); // Avoid triggering selection
        if (!confirm("Are you sure you want to delete this outing and all its splits?")) return;
        try {
            await axios.delete(`http://localhost:8080/split/outing/${id}`);
            if (selectedOutingId === id) {
                setSelectedOutingId(null);
                setOutingDetail(null);
            }
            fetchOutings();
        } catch (err) {
            console.error("Error deleting outing:", err);
            alert("Failed to delete outing.");
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6 text-slate-100 min-h-screen">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-2">
                        Hisab(Split) <span className="text-lg text-emerald-500 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full">Split Bills</span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Calculate shared bills with friends and split costs instantly using an optimized transaction path.
                    </p>
                </div>
                {!isCreating && !selectedOutingId && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 px-5 py-3 rounded-2xl text-slate-900 font-bold shadow-lg shadow-emerald-500/20 hover:scale-102 transition-all"
                    >
                        <Plus size={18} />
                        New Outing Split
                    </button>
                )}
            </div>

            {/* MAIN DASHBOARD LAYOUT */}
            <AnimatePresence mode="wait">
                {isCreating ? (
                    // ==================== WIZARD VIEW ====================
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-8 shadow-xl max-w-3xl mx-auto"
                    >
                        {/* Step Indicators */}
                        <div className="flex items-center justify-center gap-4 mb-10">
                            {[1, 2, 3].map((s) => (
                                <div key={s} className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                                        step >= s 
                                        ? "bg-emerald-500 text-slate-900 shadow-md shadow-emerald-500/20" 
                                        : "bg-slate-800 text-slate-500"
                                    }`}>
                                        {s}
                                    </div>
                                    <span className={`text-sm font-medium ${step >= s ? "text-emerald-400" : "text-slate-500"}`}>
                                        {s === 1 ? "Outing Details" : s === 2 ? "Expenses" : "Previous Debts"}
                                    </span>
                                    {s < 3 && <div className={`w-12 h-0.5 rounded ${step > s ? "bg-emerald-500" : "bg-slate-800"}`} />}
                                </div>
                            ))}
                        </div>

                        {/* STEP 1: OUTING DETAILS */}
                        {step === 1 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">Outing Name</label>
                                    <input
                                        type="text"
                                        value={outingName}
                                        onChange={(e) => setOutingName(e.target.value)}
                                        placeholder="e.g. Weekend Trip to Goa"
                                        className="w-full bg-slate-950/80 border border-slate-800 focus:border-teal-500/50 rounded-2xl px-4 py-3.5 text-slate-100 outline-none transition-all placeholder:text-slate-600"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-sm font-semibold text-slate-300">Add Participants</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newParticipant}
                                            onChange={(e) => setNewParticipant(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleAddParticipant()}
                                            placeholder="Enter friend's name"
                                            className="flex-1 bg-slate-950/80 border border-slate-800 focus:border-teal-500/50 rounded-2xl px-4 py-3 text-slate-100 outline-none transition-all placeholder:text-slate-600"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddParticipant}
                                            className="bg-slate-800 hover:bg-slate-700 px-5 rounded-2xl text-slate-200 transition-all font-semibold flex items-center gap-1"
                                        >
                                            <Plus size={18} /> Add
                                        </button>
                                    </div>
                                    
                                    {/* Participants Chip List */}
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {participants.map((p) => (
                                            <div key={p} className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/50 text-slate-200 px-3.5 py-1.5 rounded-full text-sm font-semibold">
                                                <User size={14} className="text-emerald-500" />
                                                <span>{p}</span>
                                                {p !== "Self" && (
                                                    <button 
                                                        onClick={() => handleRemoveParticipant(p)}
                                                        className="text-slate-500 hover:text-rose-400 transition-all"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-between pt-6 border-t border-slate-800/80 mt-8">
                                    <button
                                        onClick={() => { setIsCreating(false); resetWizard(); }}
                                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-6 py-3 rounded-2xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (!outingName.trim()) {
                                                alert("Please enter an outing name.");
                                                return;
                                            }
                                            setSharedBy([...participants]); // pre-select all in Step 2
                                            setStep(2);
                                        }}
                                        className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-900 font-black px-6 py-3 rounded-2xl hover:opacity-90 transition-all"
                                    >
                                        Next <ArrowRight size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: EVENT-BY-EVENT EXPENSES */}
                        {step === 2 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <div className="bg-slate-950/40 p-6 rounded-3xl border border-slate-800/80 space-y-4">
                                    <h3 className="text-md font-bold text-emerald-400">Add Event/Expense Item</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-400 mb-1">Expense Name</label>
                                            <input
                                                type="text"
                                                value={eventName}
                                                onChange={(e) => setEventName(e.target.value)}
                                                placeholder="e.g. Dinner at Beach, Cab Fare"
                                                className="w-full bg-slate-950/80 border border-slate-800 focus:border-teal-500/50 rounded-2xl px-4 py-3 text-slate-100 outline-none transition-all placeholder:text-slate-600"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-400 mb-1">Total Amount Spent (₹)</label>
                                            <input
                                                type="number"
                                                value={eventAmount}
                                                onChange={(e) => setEventAmount(e.target.value)}
                                                placeholder="Amount in INR"
                                                className="w-full bg-slate-950/80 border border-slate-800 focus:border-teal-500/50 rounded-2xl px-4 py-3 text-slate-100 outline-none transition-all placeholder:text-slate-600"
                                            />
                                        </div>
                                    </div>

                                    {/* Payer Configuration */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-xs font-semibold text-slate-400">Who Paid?</label>
                                            <div className="flex gap-2 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
                                                <button
                                                    type="button"
                                                    onClick={() => setPayerMode("single")}
                                                    className={`px-3 py-1.5 rounded-md font-semibold transition-all ${payerMode === "single" ? "bg-emerald-500 text-slate-900" : "text-slate-400"}`}
                                                >
                                                    Single Payer
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setPayerMode("multiple")}
                                                    className={`px-3 py-1.5 rounded-md font-semibold transition-all ${payerMode === "multiple" ? "bg-emerald-500 text-slate-900" : "text-slate-400"}`}
                                                >
                                                    Multiple Payers
                                                </button>
                                            </div>
                                        </div>

                                        {payerMode === "single" ? (
                                            <select
                                                value={singlePayer}
                                                onChange={(e) => setSinglePayer(e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500/50 rounded-2xl px-4 py-3 text-slate-100 outline-none transition-all"
                                            >
                                                {participants.map(p => (
                                                    <option key={p} value={p}>{p}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="bg-slate-950/50 p-4 border border-slate-900 rounded-2xl space-y-3">
                                                <p className="text-xs text-slate-500">Enter how much each person paid (Sum must equal ₹{eventAmount || 0})</p>
                                                {participants.map(p => (
                                                    <div key={p} className="flex items-center justify-between gap-4">
                                                        <span className="text-sm font-medium text-slate-300">{p}</span>
                                                        <div className="relative w-36">
                                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-semibold">₹</span>
                                                            <input
                                                                type="number"
                                                                placeholder="0"
                                                                value={multiplePayers[p] || ""}
                                                                onChange={(e) => setMultiplePayers({
                                                                    ...multiplePayers,
                                                                    [p]: e.target.value
                                                                })}
                                                                className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-7 pr-3 py-1.5 text-right text-sm text-slate-100 outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Shares / Participant Checkboxes */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-semibold text-slate-400">Who Participated? (Cost split among checked)</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-950/50 border border-slate-900 rounded-2xl">
                                            {participants.map(p => {
                                                const isChecked = sharedBy.includes(p);
                                                return (
                                                    <label key={p} className="flex items-center gap-2 cursor-pointer py-1.5 px-2 hover:bg-slate-800/30 rounded-lg">
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={() => {
                                                                if (isChecked) {
                                                                    setSharedBy(sharedBy.filter(name => name !== p));
                                                                } else {
                                                                    setSharedBy([...sharedBy, p]);
                                                                }
                                                            }}
                                                            className="accent-emerald-500 rounded border-slate-800"
                                                        />
                                                        <span className="text-sm text-slate-300 font-semibold">{p}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleAddEvent}
                                        className="w-full bg-slate-800 hover:bg-slate-700 hover:text-emerald-400 border border-slate-750 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all mt-4"
                                    >
                                        <PlusCircle size={16} /> Add Event to Outing
                                    </button>
                                </div>

                                {/* List of Added Events */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-bold text-slate-300">Added Events ({events.length})</h4>
                                    {events.length === 0 ? (
                                        <div className="text-center py-6 bg-slate-950/30 border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs font-medium">
                                            No events added yet. Add at least one event expense.
                                        </div>
                                    ) : (
                                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                            {events.map((ev, idx) => (
                                                <div key={idx} className="flex items-center justify-between bg-slate-950/40 p-4 border border-slate-850 rounded-2xl">
                                                    <div>
                                                        <h5 className="font-bold text-sm text-slate-200">{ev.name}</h5>
                                                        <p className="text-xs text-slate-400 mt-1">
                                                            Paid by: {Object.keys(ev.paidBy).map(k => `${k} (₹${ev.paidBy[k]})`).join(", ")} | Shared by {ev.sharedBy.length} friends
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="font-black text-emerald-400">₹{ev.totalAmount}</span>
                                                        <button
                                                            onClick={() => handleRemoveEvent(idx)}
                                                            className="text-slate-500 hover:text-rose-400 transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between pt-6 border-t border-slate-800/80 mt-8">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-6 py-3 rounded-2xl transition-all"
                                    >
                                        <ArrowLeft size={16} /> Back
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (events.length === 0) {
                                                alert("Please add at least one event before proceeding.");
                                                return;
                                            }
                                            setStep(3);
                                        }}
                                        className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-900 font-black px-6 py-3 rounded-2xl hover:opacity-90 transition-all"
                                    >
                                        Next <ArrowRight size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: PREVIOUS LEFTOVER DEBTS */}
                        {step === 3 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <div className="bg-slate-950/40 p-6 rounded-3xl border border-slate-800/80 space-y-4">
                                    <div>
                                        <h3 className="text-md font-bold text-emerald-400">Previous Leftover Debt</h3>
                                        <p className="text-xs text-slate-500 mt-1">Add any pre-existing debts from before the outing to settle everything together.</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-400 mb-1">Who owes?</label>
                                            <select
                                                value={debtor}
                                                onChange={(e) => setDebtor(e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500/50 rounded-2xl px-4 py-3 text-slate-100 outline-none text-sm transition-all"
                                            >
                                                <option value="">Select debtor</option>
                                                {participants.map(p => (
                                                    <option key={p} value={p}>{p}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-400 mb-1">Who is owed?</label>
                                            <select
                                                value={creditor}
                                                onChange={(e) => setCreditor(e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500/50 rounded-2xl px-4 py-3 text-slate-100 outline-none text-sm transition-all"
                                            >
                                                <option value="">Select creditor</option>
                                                {participants.map(p => (
                                                    <option key={p} value={p}>{p}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-400 mb-1">Debt Amount (₹)</label>
                                            <input
                                                type="number"
                                                value={debtAmount}
                                                onChange={(e) => setDebtAmount(e.target.value)}
                                                placeholder="Debt in INR"
                                                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500/50 rounded-2xl px-4 py-3 text-slate-100 outline-none text-sm transition-all placeholder:text-slate-650"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleAddDebt}
                                        className="w-full bg-slate-800 hover:bg-slate-700 hover:text-emerald-400 border border-slate-750 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all mt-4"
                                    >
                                        <PlusCircle size={16} /> Add Debts
                                    </button>
                                </div>

                                {/* List of Added Debts */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-bold text-slate-300">Added Previous Debts ({debts.length})</h4>
                                    {debts.length === 0 ? (
                                        <div className="text-center py-6 bg-slate-950/30 border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs font-medium">
                                            No pre-existing debts entered. (Optional)
                                        </div>
                                    ) : (
                                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                            {debts.map((debt, idx) => (
                                                <div key={idx} className="flex items-center justify-between bg-slate-950/40 p-4 border border-slate-850 rounded-2xl">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-sm text-slate-200">{debt.debtor}</span>
                                                        <span className="text-slate-500 text-xs font-semibold">owes</span>
                                                        <span className="font-bold text-sm text-slate-200">{debt.creditor}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="font-black text-rose-400">₹{debt.amount}</span>
                                                        <button
                                                            onClick={() => handleRemoveDebt(idx)}
                                                            className="text-slate-500 hover:text-rose-400 transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between pt-6 border-t border-slate-800/80 mt-8">
                                    <button
                                        onClick={() => setStep(2)}
                                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-6 py-3 rounded-2xl transition-all"
                                    >
                                        <ArrowLeft size={16} /> Back
                                    </button>
                                    <button
                                        onClick={handleSubmitOuting}
                                        className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-900 font-black px-8 py-3.5 rounded-2xl hover:opacity-90 transition-all shadow-md shadow-emerald-500/20"
                                    >
                                        <Check size={18} /> Calculate & Save Outing
                                    </button>
                                </div>
                            </motion.div>
                        )}

                    </motion.div>
                ) : selectedOutingId && outingDetail ? (
                    // ==================== DETAIL DASHBOARD VIEW ====================
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="space-y-6"
                    >
                        {/* Detail Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-2xl">
                            <div className="flex items-start gap-4">
                                <div className="bg-emerald-500/10 p-3.5 rounded-2xl text-emerald-400 border border-emerald-500/10">
                                    <Scale size={24} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2.5">
                                        <h2 className="text-xl font-bold text-slate-100">{outingDetail.outing.name}</h2>
                                        {outingDetail.outing.settled ? (
                                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/10">
                                                <CheckCircle2 size={11} /> Settled & Synced
                                            </span>
                                        ) : (
                                            <span className="text-[11px] font-bold text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/10">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-slate-400 text-xs mt-1">
                                        Created Outing Split • {outingDetail.outing.participants.length} Friends Participating
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => { setSelectedOutingId(null); setOutingDetail(null); fetchOutings(); }}
                                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2.5 rounded-xl text-sm transition-all"
                                >
                                    Back to Outings
                                </button>
                                
                                {!outingDetail.outing.settled && (
                                    <button
                                        onClick={() => handleSettle(outingDetail.outing.id)}
                                        className="flex items-center gap-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-900 font-bold px-4.5 py-2.5 rounded-xl text-sm transition-all hover:opacity-90 shadow-md shadow-emerald-500/10"
                                    >
                                        <Coins size={15} /> Settle & Sync to Ledger
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Detail Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            {/* LEFT SIDE: NET BALANCES & OPTIMIZED TRANSACTIONS */}
                            <div className="lg:col-span-2 space-y-6">
                                
                                {/* Optimized Settlement Paths */}
                                <div className="bg-slate-900/30 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-2xl">
                                    <h3 className="text-md font-bold text-emerald-400 flex items-center gap-2 mb-4">
                                        <Coins size={18} /> Optimized Settlement Instructions
                                    </h3>
                                    
                                    {outingDetail.settlements.length === 0 ? (
                                        <div className="flex items-center gap-2.5 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-emerald-400 text-xs font-semibold">
                                            <CheckCircle2 size={16} /> Everything is completely settled! No transactions needed.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {outingDetail.settlements.map((s, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-850 rounded-2xl">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                            <span className="font-bold text-slate-200 text-sm">{s.debtor}</span> 
                                                            <span>pays</span>
                                                        </div>
                                                        <div className="font-bold text-slate-200 text-sm">{s.creditor}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-lg font-black text-emerald-400 flex items-center justify-end">
                                                            ₹{s.amount.toFixed(2)}
                                                        </div>
                                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center justify-end gap-0.5">
                                                            Settle <ArrowUpRight size={10} className="text-emerald-500" />
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Detailed Breakdown Table */}
                                <div className="bg-slate-900/30 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-2xl">
                                    <h3 className="text-md font-bold text-slate-200 mb-4">Detailed Breakdown (Person-wise)</h3>
                                    
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-slate-800 text-xs text-slate-500 font-semibold uppercase tracking-wider">
                                                    <th className="pb-3 pl-2">Participant</th>
                                                    <th className="pb-3">Paid Total</th>
                                                    <th className="pb-3">Owes Total</th>
                                                    <th className="pb-3 pr-2 text-right">Net Balance</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-850 text-sm">
                                                {outingDetail.outing.participants.map((person) => {
                                                    const balance = outingDetail.netBalances[person] || 0;
                                                    
                                                    // Calculate total paid by this person
                                                    let paidVal = 0;
                                                    outingDetail.outing.events.forEach(ev => {
                                                        paidVal += ev.paidBy[person] || 0;
                                                    });
                                                    // Add debt contributions
                                                    let debtOwedBy = 0;
                                                    let debtOwedTo = 0;
                                                    outingDetail.outing.leftoverDebts.forEach(d => {
                                                        if (d.debtor === person) debtOwedBy += d.amount;
                                                        if (d.creditor === person) debtOwedTo += d.amount;
                                                    });

                                                    // Owes Total = Paid - Balance
                                                    const paidWithDebts = paidVal + debtOwedTo;
                                                    const owesTotal = paidWithDebts - balance;

                                                    return (
                                                        <tr key={person} className="hover:bg-slate-850/20 transition-all">
                                                            <td className="py-4 pl-2 font-bold text-slate-350">{person}</td>
                                                            <td className="py-4 font-semibold text-slate-300">₹{paidWithDebts.toFixed(2)}</td>
                                                            <td className="py-4 font-semibold text-slate-400">₹{owesTotal.toFixed(2)}</td>
                                                            <td className={`py-4 pr-2 text-right font-black ${
                                                                balance > 0.01 ? "text-emerald-400" : balance < -0.01 ? "text-rose-400" : "text-slate-500"
                                                            }`}>
                                                                {balance > 0.01 ? `+₹${balance.toFixed(2)}` : balance < -0.01 ? `-₹${Math.abs(balance).toFixed(2)}` : "₹0.00"}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT SIDE: NET BALANCES & EVENT LOG LIST */}
                            <div className="space-y-6">
                                
                                {/* Net Balances Summary Box */}
                                <div className="bg-slate-900/30 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-2xl">
                                    <h3 className="text-md font-bold text-slate-200 mb-4">Net Balances</h3>
                                    <div className="space-y-3">
                                        {outingDetail.outing.participants.map((person) => {
                                            const balance = outingDetail.netBalances[person] || 0;
                                            return (
                                                <div key={person} className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-slate-850 rounded-2xl">
                                                    <span className="font-semibold text-sm text-slate-300">{person}</span>
                                                    <span className={`text-sm font-black px-2.5 py-1 rounded-xl ${
                                                        balance > 0.01 
                                                        ? "text-emerald-400 bg-emerald-500/10" 
                                                        : balance < -0.01 
                                                        ? "text-rose-400 bg-rose-500/10" 
                                                        : "text-slate-500 bg-slate-850"
                                                    }`}>
                                                        {balance > 0.01 ? `+₹${balance.toFixed(2)}` : balance < -0.01 ? `-₹${Math.abs(balance).toFixed(2)}` : "₹0.00"}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Event & Debts Ledger List */}
                                <div className="bg-slate-900/30 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-2xl space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-md font-bold text-slate-200">Outing Log</h3>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => { setShowDetailAddExpense(!showDetailAddExpense); setShowDetailAddDebt(false); }}
                                                className="bg-slate-850 hover:bg-slate-800 text-[11px] font-bold text-emerald-400 border border-slate-800 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                                            >
                                                <Plus size={11} /> Expense
                                            </button>
                                            <button
                                                onClick={() => { setShowDetailAddDebt(!showDetailAddDebt); setShowDetailAddExpense(false); }}
                                                className="bg-slate-850 hover:bg-slate-800 text-[11px] font-bold text-teal-400 border border-slate-800 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                                            >
                                                <Plus size={11} /> Debt
                                            </button>
                                        </div>
                                    </div>

                                    {/* Inline Add Expense Form */}
                                    {showDetailAddExpense && (
                                        <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-emerald-400">Add New Expense</span>
                                                {outingDetail.outing.settled && (
                                                    <span className="text-[9px] font-semibold text-rose-400 bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10">Re-opens Split</span>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <input
                                                    type="text"
                                                    value={detailEventName}
                                                    onChange={(e) => setDetailEventName(e.target.value)}
                                                    placeholder="Expense Name (e.g. Snack)"
                                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-teal-500/50 text-slate-150"
                                                />
                                                <input
                                                    type="number"
                                                    value={detailEventAmount}
                                                    onChange={(e) => setDetailEventAmount(e.target.value)}
                                                    placeholder="Amount (₹)"
                                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-teal-500/50 text-slate-150"
                                                />
                                                
                                                <div className="flex items-center justify-between text-xs pt-1">
                                                    <span className="text-slate-500">Paid by:</span>
                                                    <select
                                                        value={detailSinglePayer}
                                                        onChange={(e) => setDetailSinglePayer(e.target.value)}
                                                        className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 outline-none text-xs text-slate-200"
                                                    >
                                                        {outingDetail.outing.participants.map(p => (
                                                            <option key={p} value={p}>{p}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="space-y-1">
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Split Shared By:</span>
                                                    <div className="grid grid-cols-2 gap-2 p-2 bg-slate-900/40 rounded-xl border border-slate-850">
                                                        {outingDetail.outing.participants.map(p => {
                                                            const isChecked = detailSharedBy.includes(p);
                                                            return (
                                                                <label key={p} className="flex items-center gap-1.5 cursor-pointer py-1 px-1.5 hover:bg-slate-850/40 rounded">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isChecked}
                                                                        onChange={() => {
                                                                            if (isChecked) {
                                                                                setDetailSharedBy(detailSharedBy.filter(name => name !== p));
                                                                            } else {
                                                                                setDetailSharedBy([...detailSharedBy, p]);
                                                                            }
                                                                        }}
                                                                        className="accent-emerald-500 scale-90"
                                                                    />
                                                                    <span className="text-[11px] text-slate-350 font-semibold line-clamp-1">{p}</span>
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 pt-2">
                                                    <button
                                                        onClick={() => setShowDetailAddExpense(false)}
                                                        className="flex-1 bg-slate-900 hover:bg-slate-855 text-slate-400 py-2 rounded-xl text-xs font-semibold"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handleDetailAddEvent}
                                                        className="flex-1 bg-emerald-500 text-slate-900 hover:opacity-90 py-2 rounded-xl text-xs font-bold"
                                                    >
                                                        Save Expense
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Inline Add Debt Form */}
                                    {showDetailAddDebt && (
                                        <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-teal-400">Add Pre-outing Debt</span>
                                                {outingDetail.outing.settled && (
                                                    <span className="text-[9px] font-semibold text-rose-400 bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10">Re-opens Split</span>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-[10px] text-slate-500 block mb-1">Debtor (owes)</label>
                                                        <select
                                                            value={detailDebtor}
                                                            onChange={(e) => setDetailDebtor(e.target.value)}
                                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-xs outline-none text-slate-200"
                                                        >
                                                            <option value="">Select</option>
                                                            {outingDetail.outing.participants.map(p => (
                                                                <option key={p} value={p}>{p}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-slate-500 block mb-1">Creditor (is owed)</label>
                                                        <select
                                                            value={detailCreditor}
                                                            onChange={(e) => setDetailCreditor(e.target.value)}
                                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-xs outline-none text-slate-200"
                                                        >
                                                            <option value="">Select</option>
                                                            {outingDetail.outing.participants.map(p => (
                                                                <option key={p} value={p}>{p}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <input
                                                    type="number"
                                                    value={detailDebtAmount}
                                                    onChange={(e) => setDetailDebtAmount(e.target.value)}
                                                    placeholder="Amount (₹)"
                                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-teal-500/50 text-slate-150"
                                                />
                                                <div className="flex gap-2 pt-2">
                                                    <button
                                                        onClick={() => setShowDetailAddDebt(false)}
                                                        className="flex-1 bg-slate-900 hover:bg-slate-855 text-slate-400 py-2 rounded-xl text-xs font-semibold"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handleDetailAddDebt}
                                                        className="flex-1 bg-teal-500 text-slate-900 hover:opacity-90 py-2 rounded-xl text-xs font-bold"
                                                    >
                                                        Save Debt
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                                        {/* Events */}
                                        <div className="space-y-2">
                                            <div className="text-xs text-slate-550 font-bold uppercase tracking-wider">Events</div>
                                            {outingDetail.outing.events.map((ev, idx) => (
                                                <div key={idx} className="p-3 bg-slate-950/50 border border-slate-900 rounded-xl space-y-1.5 group">
                                                    <div className="flex justify-between items-start">
                                                        <span className="font-bold text-sm text-slate-300">{ev.name}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-black text-emerald-400">₹{ev.totalAmount}</span>
                                                            {ev.id && (
                                                                <button
                                                                    onClick={() => handleDetailDeleteEvent(ev.id)}
                                                                    className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 font-semibold space-y-0.5">
                                                        <div>Paid by: {Object.keys(ev.paidBy).map(k => `${k} (₹${ev.paidBy[k]})`).join(", ")}</div>
                                                        <div>Split among: {ev.sharedBy.join(", ")}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Debts */}
                                        {outingDetail.outing.leftoverDebts.length > 0 && (
                                            <div className="space-y-2 pt-2">
                                                <div className="text-xs text-slate-555 font-bold uppercase tracking-wider">Previous Debts</div>
                                                {outingDetail.outing.leftoverDebts.map((d, idx) => (
                                                    <div key={idx} className="p-3 bg-slate-950/50 border border-slate-900 rounded-xl flex justify-between items-center text-xs group">
                                                        <div>
                                                            <span className="font-semibold text-slate-300">{d.debtor}</span> 
                                                            <span className="text-slate-500"> owes </span>
                                                            <span className="font-semibold text-slate-300">{d.creditor}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-black text-rose-400">₹{d.amount}</span>
                                                            {d.id && (
                                                                <button
                                                                    onClick={() => handleDetailDeleteDebt(d.id)}
                                                                    className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>

                    </motion.div>
                ) : (
                    // ==================== LIST VIEW ====================
                    <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                    >
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-3">
                                <RefreshCw className="animate-spin text-teal-400" size={32} />
                                <span className="text-slate-500 text-sm font-semibold">Loading Outing Splits...</span>
                            </div>
                        ) : outings.length === 0 ? (
                            <div className="text-center py-20 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl max-w-lg mx-auto p-8">
                                <Scale size={48} className="mx-auto text-slate-600 mb-4" />
                                <h3 className="text-lg font-bold text-slate-300">No Outings Recorded</h3>
                                <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
                                    Create a split list to easily compute balances for weekend trips, dinner parties, and shared cab fares!
                                </p>
                                <button
                                    onClick={() => setIsCreating(true)}
                                    className="mt-6 bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-slate-700/60 font-bold px-6 py-3 rounded-2xl text-sm transition-all"
                                >
                                    Get Started
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {outings.map((outing) => (
                                    <div
                                        key={outing.id}
                                        onClick={() => fetchOutingDetail(outing.id)}
                                        className="bg-slate-900/40 hover:bg-slate-900/60 border border-slate-800/80 hover:border-teal-500/30 rounded-3xl p-6 cursor-pointer hover:scale-101 transition-all flex flex-col justify-between h-48 backdrop-blur-2xl group shadow-lg"
                                    >
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-bold text-base text-slate-200 group-hover:text-emerald-400 transition-colors line-clamp-1">
                                                    {outing.name}
                                                </h3>
                                                {outing.settled ? (
                                                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/10">
                                                        Settled
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/10">
                                                        Active
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                <Calendar size={13} />
                                                <span>Outing ID #{outing.id}</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-end pt-4 border-t border-slate-850/60">
                                            <div>
                                                <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Friends</div>
                                                <div className="text-sm font-extrabold text-slate-300 mt-0.5">
                                                    {outing.participants.join(", ")}
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => handleDeleteOuting(outing.id, e)}
                                                className="text-slate-500 hover:text-rose-400 bg-slate-950/20 hover:bg-rose-500/10 p-2 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
