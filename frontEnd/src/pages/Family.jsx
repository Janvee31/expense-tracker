import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, LogIn, LogOut, Copy, Check, Wallet, TrendingUp, BarChart3, Award, Sparkles, User, Settings, MessageSquare, Send, RefreshCw } from "lucide-react";
import { categoryColors } from "../utils/categoryColors";

import GroupMembershipsTab from "../components/GroupMembershipsTab";
import GroupBalancesTab from "../components/GroupBalancesTab";
import GroupExpensesTab from "../components/GroupExpensesTab";
import CsvImporterTab from "../components/CsvImporterTab";

const AVAILABLE_ICONS = ["👤", "👨‍💻", "👩‍💻", "🦁", "🦊", "🐼", "🐨", "🦄", "🚀", "🍕", "🎸", "🏆", "🌟", "🔥"];

export default function Family() {
    const [groups, setGroups] = useState([]);
    const [activeGroupId, setActiveGroupId] = useState(null);
    const [activeGroup, setActiveGroup] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Group Form state
    const [showFormModal, setShowFormModal] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [inviteCode, setInviteCode] = useState("");
    const [copied, setCopied] = useState(false);
    
    // Active Tab: "dashboard", "expenses", "chat"
    const [activeTab, setActiveTab] = useState("dashboard");
    
    // Icon selection state
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [currentUserEmail, setCurrentUserEmail] = useState("");

    // Chat scroll ref
    const chatEndRef = useRef(null);

    // Fetch user groups
    const fetchGroupsList = async (selectNewId = null) => {
        try {
            const token = localStorage.getItem("token");
            if (token) {
                const payload = JSON.parse(atob(token.split(".")[1]));
                setCurrentUserEmail(payload.sub || payload.email || "");
            }

            const res = await axios.get("http://localhost:8080/family/list");
            setGroups(res.data || []);
            
            if (res.data && res.data.length > 0) {
                // If a new group id is specified, select it; otherwise select first group if none active
                if (selectNewId) {
                    setActiveGroupId(selectNewId);
                } else if (!activeGroupId || !res.data.find(g => g.id === activeGroupId)) {
                    setActiveGroupId(res.data[0].id);
                }
            } else {
                setActiveGroupId(null);
                setActiveGroup(null);
                setExpenses([]);
                setChatMessages([]);
            }
        } catch (err) {
            console.error("Error fetching family groups list:", err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch details for active group (expenses, chat)
    const fetchActiveGroupData = async () => {
        if (!activeGroupId) return;
        const currentSelectedGroup = groups.find(g => g.id === activeGroupId);
        if (currentSelectedGroup) {
            setActiveGroup(currentSelectedGroup);
        }

        try {
            const expRes = await axios.get(`http://localhost:8080/family/${activeGroupId}/shared-expenses`);
            setExpenses(expRes.data || []);
            
            const chatRes = await axios.get(`http://localhost:8080/family/${activeGroupId}/chat`);
            setChatMessages(chatRes.data || []);
        } catch (err) {
            console.error("Error fetching group data:", err);
        }
    };

    // Initial load
    useEffect(() => {
        fetchGroupsList();
    }, []);

    // Fetch data when active group changes
    useEffect(() => {
        if (activeGroupId) {
            fetchActiveGroupData();
        }
    }, [activeGroupId, groups]);

    // Chat message polling (every 5 seconds when chat tab is active)
    useEffect(() => {
        if (!activeGroupId || activeTab !== "chat") return;
        
        const interval = setInterval(async () => {
            try {
                const chatRes = await axios.get(`http://localhost:8080/family/${activeGroupId}/chat`);
                setChatMessages(chatRes.data || []);
            } catch (err) {
                console.error("Polling chat failed:", err);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [activeGroupId, activeTab]);

    // Auto-scroll chat to bottom
    useEffect(() => {
        if (activeTab === "chat") {
            chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatMessages, activeTab]);

    // Create Group
    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!groupName.trim()) return;
        try {
            setSubmitting(true);
            const res = await axios.post("http://localhost:8080/family/create", { name: groupName });
            setGroupName("");
            setShowFormModal(false);
            await fetchGroupsList(res.data.id);
        } catch (err) {
            console.error("Create group error:", err);
            const msg = err.response?.data?.message || err.response?.data || err.message || "Failed to create group";
            alert(`Error: ${msg}`);
        } finally {
            setSubmitting(false);
        }
    };

    // Join Group
    const handleJoinGroup = async (e) => {
        e.preventDefault();
        if (!inviteCode.trim()) return;
        try {
            setSubmitting(true);
            const res = await axios.post("http://localhost:8080/family/join", { inviteCode });
            setInviteCode("");
            setShowFormModal(false);
            await fetchGroupsList(res.data.id);
        } catch (err) {
            console.error("Join group error:", err);
            const msg = err.response?.data?.message || err.response?.data || err.message || "Invalid invite code or already joined";
            alert(`Error: ${msg}`);
        } finally {
            setSubmitting(false);
        }
    };

    // Leave specific Group
    const handleLeaveGroup = async () => {
        if (!activeGroupId || !activeGroup) return;
        if (!window.confirm(`Are you sure you want to leave the group "${activeGroup.name}"?`)) return;
        try {
            setLoading(true);
            await axios.post(`http://localhost:8080/family/${activeGroupId}/leave`);
            const remainingId = groups.find(g => g.id !== activeGroupId)?.id || null;
            setActiveGroupId(remainingId);
            await fetchGroupsList();
        } catch (err) {
            console.error("Leave group error:", err);
            alert("Failed to leave family group");
        } finally {
            setLoading(false);
        }
    };

    // Update profile icon
    const handleUpdateIcon = async (icon) => {
        try {
            const res = await axios.post("http://localhost:8080/family/update-icon", { profileIcon: icon });
            // Refresh groups list to reflect the updated member icon
            await fetchGroupsList();
            setShowIconPicker(false);
        } catch (err) {
            console.error("Update profile icon error:", err);
            alert("Failed to update profile icon");
        }
    };

    // Send chat message
    const handleSendChatMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeGroupId) return;
        try {
            const contentToSend = newMessage;
            setNewMessage(""); // Clear text box immediately
            const res = await axios.post(`http://localhost:8080/family/${activeGroupId}/chat`, { content: contentToSend });
            setChatMessages(prev => [...prev, res.data]);
        } catch (err) {
            console.error("Send chat message error:", err);
            alert("Failed to send message");
        }
    };

    const handleCopyCode = () => {
        if (!activeGroup?.inviteCode) return;
        navigator.clipboard.writeText(activeGroup.inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading && groups.length === 0) {
        return (
            <div className="p-10 flex items-center justify-center animate-pulse text-indigo-400 text-lg">
                Loading family dashboard...
            </div>
        );
    }

    // Calculations for shared dashboard
    const expenseOnly = expenses.filter(e => e.type !== 'INCOME');
    const totalSpending = expenseOnly.reduce((sum, item) => sum + (item.amount || 0), 0);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthSpending = expenseOnly.filter(e => {
        if (!e.date) return false;
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).reduce((sum, item) => sum + (item.amount || 0), 0);

    // Calculate spending per user email
    const memberSpendingMap = expenseOnly.reduce((acc, curr) => {
        acc[curr.userEmail] = (acc[curr.userEmail] || 0) + (curr.amount || 0);
        return acc;
    }, {});

    // Find member details
    const getMemberDetails = (email) => {
        const member = activeGroup?.members.find(m => m.email === email);
        return member || { email, profileIcon: "👤" };
    };

    // Find top spender
    const topSpenderEmail = Object.keys(memberSpendingMap).length > 0 
        ? Object.keys(memberSpendingMap).reduce((a, b) => (memberSpendingMap[a] > memberSpendingMap[b] ? a : b), "") 
        : "N/A";

    const topSpenderDetails = topSpenderEmail !== "N/A" ? getMemberDetails(topSpenderEmail) : null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10 p-2">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex w-12 h-12 bg-emerald-50 rounded-xl items-center justify-center text-emerald-600 border border-emerald-100">
                        <Users size={24} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold text-black">
                            Family Track Hub
                        </h1>
                        <p className="text-emerald-500 text-sm mt-1 font-semibold tracking-wide">
                            Manage joint expenses and chat in real-time across family circles
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Active Group Selector */}
                    {groups.length > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Group:</span>
                            <select
                                value={activeGroupId || ""}
                                onChange={(e) => {
                                    setActiveGroupId(Number(e.target.value));
                                    setActiveTab("dashboard");
                                }}
                                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-sm cursor-pointer"
                            >
                                {groups.map(g => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button
                        onClick={() => setShowFormModal(true)}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 hover:border-emerald-300 transition-all font-bold text-xs"
                    >
                        <Plus size={14} />
                        Join/Create Group
                    </button>
                </div>
            </div>

            {/* UNJOINED STATE */}
            {groups.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                    {/* CREATE FAMILY CARD */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="backdrop-blur-xl bg-slate-900/50 border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden group flex flex-col justify-between"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-indigo-500/20" />
                        <div>
                            <div className="p-4 bg-indigo-500/20 rounded-2xl w-fit mb-6">
                                <Plus className="text-indigo-400" size={28} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-100 mb-2">Create Family Group</h2>
                            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                                Form a new family financial circle. You will get an invitation code that your family members can use to join and share their logs.
                            </p>
                        </div>
                        <form onSubmit={handleCreateGroup} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Group Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. The Smiths, Cozy Apartment"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500/50 rounded-2xl px-5 py-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-indigo-500/25 transition-all duration-300 disabled:opacity-50"
                            >
                                <Plus size={18} />
                                {submitting ? "Creating..." : "Create Group"}
                            </button>
                        </form>
                    </motion.div>

                    {/* JOIN FAMILY CARD */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="backdrop-blur-xl bg-slate-900/50 border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden group flex flex-col justify-between"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-cyan-500/20" />
                        <div>
                            <div className="p-4 bg-cyan-500/20 rounded-2xl w-fit mb-6">
                                <LogIn className="text-cyan-400" size={28} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-100 mb-2">Join Existing Group</h2>
                            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                                Enter the invitation code shared by your family organizer to instantly synchronize your charts, categories, and logs.
                            </p>
                        </div>
                        <form onSubmit={handleJoinGroup} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Invite Code</label>
                                <input
                                    type="text"
                                    placeholder="Enter 6-digit code"
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value)}
                                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500/50 rounded-2xl px-5 py-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all font-medium uppercase tracking-wider text-center"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-cyan-500/25 transition-all duration-300 disabled:opacity-50"
                            >
                                <LogIn size={18} />
                                {submitting ? "Joining..." : "Join Group"}
                            </button>
                        </form>
                    </motion.div>
                </div>
            ) : (
                /* ACTIVE FAMILY PANEL */
                <div className="space-y-8">
                    {/* STATS OVERVIEW CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* TOTAL SHARED */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="relative overflow-hidden backdrop-blur-xl bg-slate-900/50 border border-slate-800 p-8 rounded-3xl shadow-xl group"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-indigo-500/20" />
                            <div className="flex justify-between items-center relative z-10">
                                <div className="p-3 bg-indigo-500/20 rounded-2xl">
                                    <Wallet className="text-indigo-400" size={24} />
                                </div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Group Total Spent</span>
                            </div>
                            <h2 className="text-4xl font-black mt-6 text-slate-100 relative z-10">
                                ₹{Number(totalSpending).toFixed(2)}
                            </h2>
                            <p className="text-slate-400 text-sm mt-2 relative z-10">
                                Shared spending in {activeGroup?.name}
                            </p>
                        </motion.div>

                        {/* MONTH SHARED */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="relative overflow-hidden backdrop-blur-xl bg-slate-900/50 border border-slate-800 p-8 rounded-3xl shadow-xl group"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-emerald-500/20" />
                            <div className="flex justify-between items-center relative z-10">
                                <div className="p-3 bg-emerald-500/20 rounded-2xl">
                                    <TrendingUp className="text-emerald-400" size={24} />
                                </div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">This Month</span>
                            </div>
                            <h2 className="text-4xl font-black mt-6 text-slate-100 relative z-10">
                                ₹{Number(thisMonthSpending).toFixed(2)}
                            </h2>
                            <p className="text-slate-400 text-sm mt-2 relative z-10">
                                Group expenses this month
                            </p>
                        </motion.div>

                        {/* TOP FAMILY SPENDER */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="relative overflow-hidden backdrop-blur-xl bg-slate-900/50 border border-slate-800 p-8 rounded-3xl shadow-xl group"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-amber-500/20" />
                            <div className="flex justify-between items-center relative z-10">
                                <div className="p-3 bg-amber-500/20 rounded-2xl">
                                    <Award className="text-amber-400" size={24} />
                                </div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Top Spender</span>
                            </div>
                            
                            {topSpenderDetails ? (
                                <div className="flex items-center gap-3 mt-6 relative z-10">
                                    <span className="text-3xl bg-slate-850 px-2 py-1.5 rounded-xl border border-slate-750">
                                        {topSpenderDetails.profileIcon || "👤"}
                                    </span>
                                    <div className="flex flex-col truncate">
                                        <span className="text-lg font-bold text-slate-100 truncate">{topSpenderDetails.email.split('@')[0]}</span>
                                        <span className="text-xs text-slate-400">Spent: ₹{Number(memberSpendingMap[topSpenderEmail] || 0).toFixed(2)}</span>
                                    </div>
                                </div>
                            ) : (
                                <h2 className="text-3xl font-black mt-6 text-slate-100 relative z-10">
                                    N/A
                                </h2>
                            )}
                            <p className="text-slate-400 text-sm mt-2 relative z-10">
                                Highest contributor in active group
                            </p>
                        </motion.div>
                    </div>

                    {/* SETTINGS CARD ROW (GROUP INFO + MEMBERS LIST + ICON PICKER) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* INVITE CODE INFO CARD */}
                        <div className="backdrop-blur-xl bg-slate-900/50 border border-slate-800 p-8 rounded-3xl shadow-xl flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-slate-100 mb-2 flex items-center gap-2">
                                    <span className="text-cyan-400">🏠</span> Group Info
                                </h3>
                                <p className="text-slate-400 text-sm mb-6">
                                    Share this invite code to bring family members into <b>{activeGroup?.name}</b>.
                                </p>
                            </div>

                            <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center space-y-4 mb-6">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Invite Code</span>
                                <span className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 select-all">
                                    {activeGroup?.inviteCode}
                                </span>
                                <button
                                    onClick={handleCopyCode}
                                    className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-400 bg-slate-900 transition-all"
                                >
                                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                    {copied ? "Copied!" : "Copy Code"}
                                </button>
                            </div>

                            <button
                                onClick={handleLeaveGroup}
                                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/40 transition-all font-semibold text-xs"
                            >
                                <LogOut size={14} />
                                Leave This Group
                            </button>
                        </div>

                        {/* MEMBERS LIST WITH AVATAR CONTROLLER */}
                        <div className="backdrop-blur-xl bg-slate-900/50 border border-slate-800 p-8 rounded-3xl shadow-xl lg:col-span-2 relative">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                                    <span className="text-indigo-400">👥</span> Group Members
                                </h3>
                                <button
                                    onClick={() => setShowIconPicker(!showIconPicker)}
                                    className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-indigo-400 hover:bg-slate-800 border border-slate-750 transition-all"
                                >
                                    <Settings size={14} />
                                    Change My Icon
                                </button>
                            </div>

                            {/* AVATAR PICKER POPUP */}
                            <AnimatePresence>
                                {showIconPicker && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute top-16 right-8 z-25 bg-slate-950 border border-slate-800 p-6 rounded-2xl shadow-2xl max-w-sm"
                                    >
                                        <h4 className="text-sm font-bold text-slate-200 mb-3">Choose profile avatar:</h4>
                                        <div className="grid grid-cols-7 gap-3">
                                            {AVAILABLE_ICONS.map(icon => (
                                                <button
                                                    key={icon}
                                                    onClick={() => handleUpdateIcon(icon)}
                                                    className="w-10 h-10 text-2xl flex items-center justify-center rounded-xl bg-slate-900 hover:bg-indigo-500/20 border border-slate-800 hover:border-indigo-500/30 transition-all transform hover:scale-105"
                                                >
                                                    {icon}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[260px] overflow-y-auto pr-1">
                                {activeGroup?.members.map((member) => {
                                    const isSelf = member.email === currentUserEmail;
                                    const userSpend = memberSpendingMap[member.email] || 0;
                                    const percentage = totalSpending > 0 ? Math.round((userSpend / totalSpending) * 100) : 0;

                                    return (
                                        <div 
                                            key={member.email}
                                            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                                                isSelf 
                                                    ? "bg-indigo-500/5 border-indigo-500/20 hover:border-indigo-500/30" 
                                                    : "bg-slate-800/30 border-slate-800 hover:border-slate-700/50"
                                            }`}
                                        >
                                            <span className="text-3xl bg-slate-900/60 p-2.5 rounded-xl border border-slate-770">
                                                {member.profileIcon || "👤"}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-semibold text-slate-200 truncate">
                                                        {member.email.split('@')[0]}
                                                    </span>
                                                    {isSelf && (
                                                        <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                                                            You
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-slate-500 block truncate">{member.email}</span>
                                                <div className="mt-2 flex items-center justify-between text-xs">
                                                    <span className="text-slate-400 font-medium">₹{Number(userSpend).toFixed(2)} spent</span>
                                                    <span className="text-slate-500 font-bold">{percentage}%</span>
                                                </div>
                                                <div className="w-full bg-slate-950 rounded-full h-1.5 mt-1 border border-slate-850">
                                                    <div 
                                                        className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-1.5 rounded-full" 
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* DYNAMIC TABS PANEL */}
                    <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-800 rounded-3xl shadow-xl mt-8 overflow-hidden">
                        {/* Tab Headers */}
                        <div className="flex flex-wrap border-b border-slate-800 bg-slate-950/40">
                            {[
                                { id: "dashboard", name: "Spender Rankings", icon: BarChart3 },
                                { id: "expenses", name: "Group Split Bills", icon: Wallet },
                                { id: "balances", name: "Balances & Audit", icon: Wallet },
                                { id: "memberships", name: "Memberships Timeline", icon: User },
                                { id: "importer", name: "CSV Importer", icon: MessageSquare },
                                { id: "chat", name: "Group Chat Board", icon: MessageSquare }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-4.5 text-sm font-semibold border-b-2 transition-all ${
                                        activeTab === tab.id
                                            ? "border-cyan-400 text-cyan-400 bg-slate-900/50"
                                            : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/20"
                                    }`}
                                >
                                    <tab.icon size={16} />
                                    {tab.name}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="p-8">
                            {/* TAB 1: DASHBOARD & COMPARISON */}
                            {activeTab === "dashboard" && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-slate-100">Relative Member Contribution</h3>
                                    {activeGroup?.members.length === 0 ? (
                                        <p className="text-slate-500 text-sm">No members inside this family circle.</p>
                                    ) : (
                                        <div className="space-y-5">
                                            {activeGroup?.members.map(member => {
                                                const spend = memberSpendingMap[member.email] || 0;
                                                const percentage = totalSpending > 0 ? (spend / totalSpending) * 100 : 0;
                                                return (
                                                    <div key={member.email} className="space-y-2">
                                                        <div className="flex justify-between items-center text-sm font-medium">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xl">{member.profileIcon || "👤"}</span>
                                                                <span className="text-slate-300">{member.email.split('@')[0]}</span>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-slate-100">₹{Number(spend).toFixed(2)}</span>
                                                                <span className="text-slate-500 ml-2">({Math.round(percentage)}%)</span>
                                                            </div>
                                                        </div>
                                                        <div className="h-3.5 bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${percentage}%` }}
                                                                transition={{ duration: 1 }}
                                                                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB 2: EXPENSES COMPONENT */}
                            {activeTab === "expenses" && (
                                <GroupExpensesTab groupId={activeGroupId} />
                            )}

                            {/* TAB 3: BALANCES COMPONENT */}
                            {activeTab === "balances" && (
                                <GroupBalancesTab groupId={activeGroupId} />
                            )}

                            {/* TAB 4: MEMBERSHIPS COMPONENT */}
                            {activeTab === "memberships" && (
                                <GroupMembershipsTab groupId={activeGroupId} />
                            )}

                            {/* TAB 5: CSV IMPORTER COMPONENT */}
                            {activeTab === "importer" && (
                                <CsvImporterTab groupId={activeGroupId} onImportSuccess={fetchActiveGroupData} />
                            )}

                            {/* TAB 3: CHAT BOARD */}
                            {activeTab === "chat" && (
                                <div className="space-y-4 flex flex-col h-[480px]">
                                    {/* Chat history list */}
                                    <div className="flex-1 overflow-y-auto bg-slate-950/40 border border-slate-850 p-6 rounded-2xl space-y-4 max-h-[380px]">
                                        {chatMessages.length === 0 ? (
                                            <div className="h-full flex items-center justify-center flex-col text-slate-600 gap-2">
                                                <MessageSquare size={36} />
                                                <p className="text-sm">No messages sent in this circle. Say hi!</p>
                                            </div>
                                        ) : (
                                            chatMessages.map(msg => {
                                                const isSelf = msg.senderEmail === currentUserEmail;
                                                return (
                                                    <div 
                                                        key={msg.id}
                                                        className={`flex gap-3 max-w-[75%] ${isSelf ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                                                    >
                                                        {/* Avatar Icon */}
                                                        <span className="text-2xl bg-slate-900 border border-slate-800 w-10 h-10 flex items-center justify-center rounded-xl self-end">
                                                            {msg.senderIcon || "👤"}
                                                        </span>
                                                        <div className="space-y-1">
                                                            <div className={`text-[10px] text-slate-500 font-semibold ${isSelf ? "text-right" : "text-left"}`}>
                                                                {isSelf ? "You" : msg.senderEmail.split('@')[0]}
                                                            </div>
                                                            <div className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                                                                isSelf 
                                                                    ? "bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-500/10" 
                                                                    : "bg-slate-800 text-slate-200 rounded-bl-none border border-slate-750"
                                                            }`}>
                                                                {msg.content}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                        <div ref={chatEndRef} />
                                    </div>

                                    {/* Message input */}
                                    <form onSubmit={handleSendChatMessage} className="flex gap-3">
                                        <input
                                            type="text"
                                            placeholder="Write message to group..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            className="flex-1 bg-slate-950/80 border border-slate-800 focus:border-indigo-500/50 rounded-2xl px-5 py-3.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium text-sm"
                                        />
                                        <button
                                            type="submit"
                                            className="flex items-center justify-center p-4 bg-indigo-500 hover:bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-500/15 transition-all transform hover:scale-105"
                                        >
                                            <Send size={18} />
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* JOIN/CREATE GROUP MODAL */}
            <AnimatePresence>
                {showFormModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                            onClick={() => setShowFormModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8"
                        >
                            {/* Create side */}
                            <div>
                                <h3 className="text-xl font-bold text-slate-100 mb-2 flex items-center gap-2">
                                    <Plus className="text-indigo-400" size={20} /> Create New Circle
                                </h3>
                                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                                    Create a new expense group and get a code to invite other family members.
                                </p>
                                <form onSubmit={handleCreateGroup} className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Group name..."
                                        value={groupName}
                                        onChange={(e) => setGroupName(e.target.value)}
                                        className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm font-medium"
                                    />
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm transition-all"
                                    >
                                        Create Group
                                    </button>
                                </form>
                            </div>

                            {/* Join side */}
                            <div className="border-t md:border-t-0 md:border-l border-slate-800 pt-6 md:pt-0 md:pl-8">
                                <h3 className="text-xl font-bold text-slate-100 mb-2 flex items-center gap-2">
                                    <LogIn className="text-cyan-400" size={20} /> Join with Code
                                </h3>
                                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                                    Enter the 6-digit invite code generated by another family member.
                                </p>
                                <form onSubmit={handleJoinGroup} className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Enter code..."
                                        value={inviteCode}
                                        onChange={(e) => setInviteCode(e.target.value)}
                                        className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500/50 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm font-medium uppercase tracking-wider text-center"
                                    />
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-sm transition-all"
                                    >
                                        Join Group
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
