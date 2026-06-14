import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { categoryColors } from "../utils/categoryColors";
import { Wallet, TrendingUp, Trophy, Sparkles, LayoutDashboard } from "lucide-react";

export default function Dashboard() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios
            .get("http://localhost:8080/expenses")
            .then((res) => {
                setExpenses(res.data.content || res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setLoading(false);
            });
    }, []);

    const expenseOnly = expenses.filter(e => e.type !== 'INCOME');

    const totalExpense = expenseOnly.reduce(
        (sum, item) => sum + (item.amount || 0),
        0
    );

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthExpense = expenseOnly.filter(e => {
        if (!e.date) return false;
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).reduce((sum, item) => sum + (item.amount || 0), 0);

    const categoryMap = expenseOnly.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + (curr.amount || 0);
        return acc;
    }, {});

    const topCategory = Object.keys(categoryMap).length > 0 ? Object.keys(categoryMap).reduce(
        (a, b) => (categoryMap[a] > categoryMap[b] ? a : b),
        ""
    ) : "N/A";

    const recentExpenses = [...expenses].reverse().slice(0, 5);

    const AnimatedNumber = ({ value }) => {
        const [display, setDisplay] = useState(0);

        useEffect(() => {
            let start = 0;
            const step = value / 30;
            if (value === 0) {
                setDisplay(0);
                return;
            }

            const interval = setInterval(() => {
                start += step;
                if (start >= value) {
                    setDisplay(value);
                    clearInterval(interval);
                } else {
                    setDisplay(start);
                }
            }, 20);

            return () => clearInterval(interval);
        }, [value]);

        return <>{Number(display).toFixed(2)}</>;
    };

    if (loading) {
        return (
            <div className="p-10 flex items-center justify-center animate-pulse text-indigo-400 text-lg">
                Loading dashboard...
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex w-12 h-12 bg-emerald-50 rounded-xl items-center justify-center text-emerald-600 border border-emerald-100">
                        <LayoutDashboard size={24} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold text-black">
                            Premium Dashboard
                        </h1>
                        <p className="text-emerald-500 text-sm mt-1 font-semibold tracking-wide">
                            Track your personal cash flow and monthly limits
                        </p>
                    </div>
                </div>
            </div>

            {/* CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* TOTAL */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="relative overflow-hidden backdrop-blur-xl bg-slate-900/50 border border-slate-700/50 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-indigo-500/20" />
                    <div className="flex justify-between items-center relative z-10">
                        <div className="p-3 bg-indigo-500/20 rounded-2xl">
                            <Wallet className="text-indigo-400" size={24} />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total</span>
                    </div>

                    <h2 className="text-4xl font-black mt-6 text-slate-100 relative z-10">
                        ₹<AnimatedNumber value={totalExpense} />
                    </h2>
                    <p className="text-slate-400 text-sm mt-2 relative z-10">
                        All time spending
                    </p>
                </motion.div>

                {/* MONTH */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="relative overflow-hidden backdrop-blur-xl bg-slate-900/50 border border-slate-700/50 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-emerald-500/20" />
                    <div className="flex justify-between items-center relative z-10">
                        <div className="p-3 bg-emerald-500/20 rounded-2xl">
                            <TrendingUp className="text-emerald-400" size={24} />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Month</span>
                    </div>

                    <h2 className="text-4xl font-black mt-6 text-slate-100 relative z-10">
                        ₹<AnimatedNumber value={thisMonthExpense} />
                    </h2>
                    <p className="text-slate-400 text-sm mt-2 relative z-10">
                        This month spending
                    </p>
                </motion.div>

                {/* TOP CATEGORY */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="relative overflow-hidden backdrop-blur-xl bg-slate-900/50 border border-slate-700/50 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-amber-500/20" />
                    <div className="flex justify-between items-center relative z-10">
                        <div className="p-3 bg-amber-500/20 rounded-2xl">
                            <Trophy className="text-amber-400" size={24} />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Top</span>
                    </div>

                    <h2 className="text-3xl font-black mt-6 text-slate-100 relative z-10">
                        {topCategory}
                    </h2>
                    <p className="text-slate-400 text-sm mt-2 relative z-10">
                        Highest spending category
                    </p>
                </motion.div>

            </div>

            {/* BOTTOM SECTION: TWO COLUMNS (RECENT TRANSACTIONS + FINTECH ILLUSTRATION CARD) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                
                {/* RECENT EXPENSES */}
                <div className="lg:col-span-2 backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 p-8 rounded-3xl shadow-xl">
                    <h2 className="text-2xl font-bold mb-6 text-slate-100 flex items-center gap-2">
                        <span className="text-cyan-400">📋</span> Recent Expenses
                    </h2>

                    {recentExpenses.length === 0 ? (
                        <div className="text-center py-10 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
                            <p className="text-slate-500">No expenses yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentExpenses.map((exp, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    key={exp.id}
                                    className="flex justify-between items-center p-4 bg-slate-800/40 rounded-2xl hover:bg-slate-800/70 transition-colors border border-slate-700/30"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-inner"
                                            style={{
                                                backgroundColor: `${categoryColors[exp.category] || "#64748b"}20`,
                                            }}
                                        >
                                            <div 
                                                className="w-4 h-4 rounded-full" 
                                                style={{ backgroundColor: categoryColors[exp.category] || "#64748b" }} 
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-lg font-semibold text-slate-200">
                                                {exp.category}
                                            </span>
                                            <span className="text-sm text-slate-500">
                                                {exp.description || 'Transaction'}
                                            </span>
                                        </div>
                                    </div>

                                    <span className={`font-bold text-xl bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-700 ${exp.type === 'INCOME' ? 'text-emerald-400' : 'text-slate-100'}`}>
                                        {exp.type === 'INCOME' ? '+' : '-'}₹{Number(exp.amount).toFixed(2)}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* PREMIUM FINTECH ILLUSTRATION CARD */}
                <div className="lg:col-span-1 bg-white border border-slate-200 p-8 rounded-3xl shadow-sm flex flex-col justify-between overflow-hidden relative group">
                    <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-500/5 blur-[80px] pointer-events-none" />
                    <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-600/5 blur-[80px] pointer-events-none" />
                    
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-600 text-[10px] font-bold uppercase tracking-wider mb-3">
                            <Sparkles size={10} /> Wealth Growth
                        </div>
                        <h3 className="text-lg font-bold text-black">Money Ecosystem</h3>
                        <p className="text-slate-400 text-xs mt-1 leading-relaxed font-medium">
                            Watch your savings jar sprout banknotes and coins as you maintain split-bill budgets.
                        </p>
                    </div>

                    <div className="flex justify-center items-center py-4 relative">
                        <svg width="100%" height="210" viewBox="0 0 400 300">
                            <defs>
                                <linearGradient id="jarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="rgba(255, 255, 255, 0.7)" />
                                    <stop offset="100%" stopColor="rgba(167, 243, 208, 0.2)" />
                                </linearGradient>
                                <linearGradient id="coinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#fcd34d" />
                                    <stop offset="100%" stopColor="#f59e0b" />
                                </linearGradient>
                                <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#10b981" />
                                    <stop offset="100%" stopColor="#047857" />
                                </linearGradient>
                            </defs>

                            {/* 1. SAVINGS JAR WITH GROWING PLANT & BANKNOTES */}
                            <ellipse cx="200" cy="250" rx="30" ry="10" fill="url(#coinGrad)" opacity="0.9" />
                            <ellipse cx="185" cy="253" rx="18" ry="7" fill="url(#coinGrad)" opacity="0.8" />
                            <ellipse cx="215" cy="252" rx="18" ry="7" fill="url(#coinGrad)" opacity="0.8" />

                            <path d="M175,190 Q175,185 185,185 L215,185 Q225,185 225,190 L232,240 Q235,260 200,260 Q165,260 168,240 Z" 
                                  fill="url(#jarGrad)" stroke="#e4e4e7" strokeWidth="2" />
                            <rect x="187" y="181" width="26" height="5" rx="1.5" fill="#e4e4e7" />

                            <path d="M200,185 Q200,140 170,120" fill="none" stroke="#047857" strokeWidth="3" strokeLinecap="round" />
                            <path d="M200,185 Q201,150 228,135" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                            <path d="M200,185 L200,90" fill="none" stroke="#065f46" strokeWidth="4" strokeLinecap="round" />

                            <g transform="translate(150, 110) rotate(-15)">
                                <rect width="22" height="11" rx="2" fill="#10b981" stroke="#047857" strokeWidth="0.75" />
                                <circle cx="11" cy="5.5" r="2.5" fill="#ecfdf5" />
                            </g>
                            <g transform="translate(216, 122) rotate(20)">
                                <rect width="22" height="11" rx="2" fill="#34d399" stroke="#059669" strokeWidth="0.75" />
                                <circle cx="11" cy="5.5" r="2.5" fill="#ecfdf5" />
                            </g>
                            <g transform="translate(188, 80) rotate(-5)">
                                <rect width="26" height="13" rx="2" fill="#059669" stroke="#047857" strokeWidth="0.75" />
                                <circle cx="13" cy="6.5" r="3" fill="#ecfdf5" />
                            </g>

                            <circle cx="201" cy="72" r="7" fill="url(#coinGrad)" stroke="#d97706" strokeWidth="0.5" />
                            <circle cx="152" cy="100" r="6" fill="url(#coinGrad)" stroke="#d97706" strokeWidth="0.5" />
                            <circle cx="238" cy="116" r="6" fill="url(#coinGrad)" stroke="#d97706" strokeWidth="0.5" />

                            {/* 2. PIGGY BANK */}
                            <g transform="translate(10, -20)">
                                <rect x="52" y="196" width="6" height="8" rx="2" fill="#fda4af" />
                                <rect x="68" y="196" width="6" height="8" rx="2" fill="#fda4af" />
                                <ellipse cx="65" cy="176" rx="24" ry="20" fill="#fecdd3" stroke="#fda4af" strokeWidth="1.5" />
                                <rect x="85" y="171" width="7" height="10" rx="2" fill="#fda4af" />
                                <circle cx="89" cy="174" r="1.5" fill="#e11d48" />
                                <circle cx="89" cy="178" r="1.5" fill="#e11d48" />
                                <polygon points="52,160 62,150 66,160" fill="#fda4af" />
                                <circle cx="76" cy="169" r="1.5" fill="#4c0519" />
                                <rect x="61" y="152" width="8" height="2" rx="0.5" fill="#4c0519" />
                                <circle cx="65" cy="140" r="4.5" fill="url(#coinGrad)" stroke="#d97706" strokeWidth="0.5" />
                            </g>

                            {/* 3. GOLD COINS STACKED BESIDE CARDS */}
                            <g transform="translate(15, 0)">
                                <ellipse cx="95" cy="256" rx="14" ry="4.5" fill="url(#coinGrad)" stroke="#d97706" strokeWidth="0.5" />
                                <path d="M81,250 A14,4.5 0 0,0 109,250 L109,256 A14,4.5 0 0,1 81,256 Z" fill="#d97706" />
                                <ellipse cx="95" cy="250" rx="14" ry="4.5" fill="url(#coinGrad)" stroke="#d97706" strokeWidth="0.5" />
                                <path d="M81,244 A14,4.5 0 0,0 109,244 L109,250 A14,4.5 0 0,1 81,250 Z" fill="#d97706" />
                                <ellipse cx="95" cy="244" rx="14" ry="4.5" fill="url(#coinGrad)" stroke="#d97706" strokeWidth="0.5" />

                                <ellipse cx="115" cy="260" rx="14" ry="4.5" fill="url(#coinGrad)" stroke="#d97706" strokeWidth="0.5" />
                                <path d="M101,254 A14,4.5 0 0,0 129,254 L129,260 A14,4.5 0 0,1 101,260 Z" fill="#d97706" />
                                <ellipse cx="115" cy="254" rx="14" ry="4.5" fill="url(#coinGrad)" stroke="#d97706" strokeWidth="0.5" />

                                <g transform="translate(85, 230) rotate(-15)">
                                    <rect width="32" height="20" rx="2" fill="#1f2937" stroke="#374151" strokeWidth="0.5" />
                                    <rect x="4" y="4" width="6" height="5" rx="1" fill="#fbbf24" />
                                    <line x1="18" y1="14" x2="28" y2="14" stroke="#9ca3af" strokeWidth="1" />
                                </g>
                            </g>

                            {/* 4. BLACK LEATHER WALLET WITH CASH VISIBLE */}
                            <g transform="translate(0, 0)">
                                <rect x="294" y="212" width="20" height="32" rx="1" transform="rotate(-15 294 212)" fill="#10b981" stroke="#047857" strokeWidth="0.5" />
                                <rect x="308" y="210" width="20" height="32" rx="1" transform="rotate(8 308 210)" fill="#34d399" stroke="#059669" strokeWidth="0.5" />
                                <rect x="282" y="228" width="64" height="42" rx="5" fill="#18181b" stroke="#27272a" strokeWidth="1" />
                                <path d="M282,238 L328,238 Q338,238 338,246 L338,254 Q338,262 328,262 L282,262 Z" fill="#2d2d30" />
                                <rect x="325" y="244" width="8" height="9" rx="1.5" fill="#fbbf24" />
                            </g>

                            {/* 5. CALCULATOR & RECEIPT */}
                            <g transform="translate(10, 0)">
                                <path d="M305,100 L323,100 L323,155 Q314,158 305,155 Z" fill="#ffffff" stroke="#e4e4e7" strokeWidth="0.75" />
                                <line x1="309" y1="110" x2="319" y2="110" stroke="#d4d4d8" strokeWidth="1" />
                                <line x1="309" y1="116" x2="317" y2="116" stroke="#d4d4d8" strokeWidth="1" />
                                <line x1="309" y1="122" x2="319" y2="122" stroke="#d4d4d8" strokeWidth="1" />
                                <line x1="309" y1="128" x2="315" y2="128" stroke="#d4d4d8" strokeWidth="1" />
                                <line x1="309" y1="134" x2="319" y2="134" stroke="#d4d4d8" strokeWidth="1" />
                                <line x1="309" y1="140" x2="316" y2="140" stroke="#10b981" strokeWidth="1" />

                                <rect x="330" y="110" width="38" height="54" rx="4" fill="#f4f4f5" stroke="#e4e4e7" strokeWidth="1.5" />
                                <rect x="335" y="115" width="28" height="9" rx="1" fill="#18181b" />
                                <rect x="337" y="118" width="10" height="1.5" fill="#10b981" />
                                <circle cx="338" cy="130" r="1.5" fill="#d4d4d8" />
                                <circle cx="344" cy="130" r="1.5" fill="#d4d4d8" />
                                <circle cx="350" cy="130" r="1.5" fill="#d4d4d8" />
                                <circle cx="356" cy="130" r="1.5" fill="#d4d4d8" />
                                <circle cx="338" cy="137" r="1.5" fill="#d4d4d8" />
                                <circle cx="344" cy="137" r="1.5" fill="#d4d4d8" />
                                <circle cx="350" cy="137" r="1.5" fill="#d4d4d8" />
                                <circle cx="356" cy="137" r="1.5" fill="#d4d4d8" />
                                <circle cx="338" cy="144" r="1.5" fill="#d4d4d8" />
                                <circle cx="344" cy="144" r="1.5" fill="#d4d4d8" />
                                <circle cx="350" cy="144" r="1.5" fill="#10b981" />
                                <circle cx="356" cy="144" r="1.5" fill="#10b981" />
                            </g>

                            {/* 6. DECORATIVE FLOATING BILLS & CARDS */}
                            <g transform="translate(290, 40) rotate(-12)" className="animate-[bounce_3.5s_infinite]">
                                <rect width="52" height="32" rx="4" fill="url(#cardGrad)" stroke="#16a34a" strokeWidth="0.5" />
                                <circle cx="10" cy="10" r="3" fill="#ecfdf5" opacity="0.8" />
                                <rect x="34" y="20" width="12" height="6" rx="1" fill="#ecfdf5" opacity="0.6" />
                            </g>

                            <g transform="translate(60, 50) rotate(15)" className="animate-[bounce_4.5s_infinite]">
                                <rect width="46" height="28" rx="4" fill="#1e2937" stroke="#374151" strokeWidth="0.5" />
                                <circle cx="8" cy="8" r="2.5" fill="#9ca3af" opacity="0.8" />
                                <rect x="30" y="18" width="10" height="5" rx="1" fill="#fbbf24" opacity="0.7" />
                            </g>

                            <g transform="translate(170, 25) rotate(5)" className="animate-[bounce_4s_infinite]">
                                <rect width="36" height="18" rx="2" fill="#d1fae5" stroke="#10b981" strokeWidth="0.75" />
                                <circle cx="18" cy="9" r="4.5" fill="#10b981" opacity="0.3" />
                            </g>
                        </svg>
                    </div>

                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center mt-2 border-t border-slate-100 pt-3 flex justify-between">
                        <span>💰 Wealth tracker</span>
                        <span>💹 Live audit mode</span>
                    </div>
                </div>

            </div>

        </div>
    );
}