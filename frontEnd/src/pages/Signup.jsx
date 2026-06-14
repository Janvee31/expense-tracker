import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, User, KeyRound, Mail, Wallet, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

export default function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await axios.post("http://localhost:8080/auth/signup", {
                email,
                password
            });
            // Redirect to login page on success
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.message || "Signup failed. Please try again with different credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-sans text-black selection:bg-emerald-500/20">
            {/* LEFT SIDE: Premium SaaS Product Showcase & Landing Page */}
            <div className="hidden lg:flex lg:w-3/5 bg-slate-50 relative overflow-hidden flex-col justify-between p-12 border-r border-slate-100">
                {/* Ambient Glows */}
                <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/5 blur-[120px] pointer-events-none" />

                {/* Logo Section */}
                <div className="flex items-center gap-2.5 z-10">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-sm">
                        <Wallet size={20} />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-black">Hisab</span>
                </div>

                {/* Main Hero & Money Growth Ecosystem Illustration */}
                <div className="my-auto z-10 flex flex-col space-y-8 items-center text-center">
                    <div className="space-y-4 max-w-xl flex flex-col items-center">
                        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-600 text-sm font-extrabold uppercase tracking-wider">
                            <Sparkles size={14} /> Premium Expense Manager
                        </div>
                        <h1 className="text-5xl font-extrabold tracking-tight text-black leading-tight">
                            Take Control of <br />
                            <span className="text-emerald-500">Your Money</span>
                        </h1>
                        <p className="text-slate-500 text-sm leading-relaxed font-medium">
                            A high-fidelity platform to track roommate shared bills, manage active membership timelines, settle balances optimally, and ingest messy statements with zero manual friction.
                        </p>
                    </div>

                    {/* Money Growth Ecosystem Graphic */}
                    <div className="relative w-[500px] h-[360px] bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex items-center justify-center overflow-hidden">
                        
                        {/* Budget Progress Rings SVG */}
                        <div className="absolute top-6 left-6 flex items-center gap-2 bg-slate-50/80 px-3 py-1.5 rounded-xl border border-slate-100">
                            <svg className="w-8 h-8 transform -rotate-90">
                                <circle cx="16" cy="16" r="12" fill="none" stroke="#e4e4e7" strokeWidth="3" />
                                <circle cx="16" cy="16" r="12" fill="none" stroke="#10b981" strokeWidth="3" 
                                    strokeDasharray="75" strokeDashoffset="20" strokeLinecap="round" />
                            </svg>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Budget Limit</span>
                                <span className="text-xs font-bold text-slate-800">73% Saved</span>
                            </div>
                        </div>

                        {/* Interactive Money Ecosystem SVG Illustration */}
                        <svg width="400" height="300" viewBox="0 0 400 300" className="z-10 mt-6">
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

                            {/* 1. SAVINGS JAR WITH GROWING PLANT & BANKNOTES (CENTER) */}
                            {/* Coins inside jar */}
                            <ellipse cx="200" cy="250" rx="30" ry="10" fill="url(#coinGrad)" opacity="0.9" />
                            <ellipse cx="185" cy="253" rx="18" ry="7" fill="url(#coinGrad)" opacity="0.8" />
                            <ellipse cx="215" cy="252" rx="18" ry="7" fill="url(#coinGrad)" opacity="0.8" />

                            {/* Glass Jar */}
                            <path d="M175,190 Q175,185 185,185 L215,185 Q225,185 225,190 L232,240 Q235,260 200,260 Q165,260 168,240 Z" 
                                  fill="url(#jarGrad)" stroke="#e4e4e7" strokeWidth="2" />
                            <rect x="187" y="181" width="26" height="5" rx="1.5" fill="#e4e4e7" />

                            {/* Plant Trunk */}
                            <path d="M200,185 Q200,140 170,120" fill="none" stroke="#047857" strokeWidth="3" strokeLinecap="round" />
                            <path d="M200,185 Q201,150 228,135" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                            <path d="M200,185 L200,90" fill="none" stroke="#065f46" strokeWidth="4" strokeLinecap="round" />

                            {/* Banknote Leaves */}
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

                            {/* Golden Coin Fruit */}
                            <circle cx="201" cy="72" r="7" fill="url(#coinGrad)" stroke="#d97706" strokeWidth="0.5" />
                            <circle cx="152" cy="100" r="6" fill="url(#coinGrad)" stroke="#d97706" strokeWidth="0.5" />
                            <circle cx="238" cy="116" r="6" fill="url(#coinGrad)" stroke="#d97706" strokeWidth="0.5" />


                            {/* 2. PIGGY BANK (LEFT MIDDLE) */}
                            <g transform="translate(10, -20)">
                                {/* Legs */}
                                <rect x="52" y="196" width="6" height="8" rx="2" fill="#fda4af" />
                                <rect x="68" y="196" width="6" height="8" rx="2" fill="#fda4af" />
                                {/* Body */}
                                <ellipse cx="65" cy="176" rx="24" ry="20" fill="#fecdd3" stroke="#fda4af" strokeWidth="1.5" />
                                {/* Snout */}
                                <rect x="85" y="171" width="7" height="10" rx="2" fill="#fda4af" />
                                <circle cx="89" cy="174" r="1.5" fill="#e11d48" />
                                <circle cx="89" cy="178" r="1.5" fill="#e11d48" />
                                {/* Ear */}
                                <polygon points="52,160 62,150 66,160" fill="#fda4af" />
                                {/* Eye */}
                                <circle cx="76" cy="169" r="1.5" fill="#4c0519" />
                                {/* Slot */}
                                <rect x="61" y="152" width="8" height="2" rx="0.5" fill="#4c0519" />
                                {/* Slot hovering coin */}
                                <circle cx="65" cy="140" r="4.5" fill="url(#coinGrad)" stroke="#d97706" strokeWidth="0.5" />
                            </g>


                            {/* 3. GOLD COINS STACKED BESIDE CARDS (LEFT BOTTOM) */}
                            <g transform="translate(15, 0)">
                                {/* Coin Stack 1 */}
                                <ellipse cx="95" cy="256" rx="14" ry="4.5" fill="url(#coinGrad)" stroke="#d97706" strokeWidth="0.5" />
                                <path d="M81,250 A14,4.5 0 0,0 109,250 L109,256 A14,4.5 0 0,1 81,256 Z" fill="#d97706" />
                                <ellipse cx="95" cy="250" rx="14" ry="4.5" fill="url(#coinGrad)" stroke="#d97706" strokeWidth="0.5" />
                                <path d="M81,244 A14,4.5 0 0,0 109,244 L109,250 A14,4.5 0 0,1 81,250 Z" fill="#d97706" />
                                <ellipse cx="95" cy="244" rx="14" ry="4.5" fill="url(#coinGrad)" stroke="#d97706" strokeWidth="0.5" />

                                {/* Coin Stack 2 (slightly offset) */}
                                <ellipse cx="115" cy="260" rx="14" ry="4.5" fill="url(#coinGrad)" stroke="#d97706" strokeWidth="0.5" />
                                <path d="M101,254 A14,4.5 0 0,0 129,254 L129,260 A14,4.5 0 0,1 101,260 Z" fill="#d97706" />
                                <ellipse cx="115" cy="254" rx="14" ry="4.5" fill="url(#coinGrad)" stroke="#d97706" strokeWidth="0.5" />

                                {/* Leaning Card */}
                                <g transform="translate(85, 230) rotate(-15)">
                                    <rect width="32" height="20" rx="2" fill="#1f2937" stroke="#374151" strokeWidth="0.5" />
                                    <rect x="4" y="4" width="6" height="5" rx="1" fill="#fbbf24" />
                                    <line x1="18" y1="14" x2="28" y2="14" stroke="#9ca3af" strokeWidth="1" />
                                </g>
                            </g>


                            {/* 4. BLACK LEATHER WALLET WITH CASH VISIBLE (RIGHT BOTTOM) */}
                            <g transform="translate(0, 0)">
                                {/* Sticking Cash */}
                                <rect x="294" y="212" width="20" height="32" rx="1" transform="rotate(-15 294 212)" fill="#10b981" stroke="#047857" strokeWidth="0.5" />
                                <rect x="308" y="210" width="20" height="32" rx="1" transform="rotate(8 308 210)" fill="#34d399" stroke="#059669" strokeWidth="0.5" />
                                
                                {/* Wallet Main Body */}
                                <rect x="282" y="228" width="64" height="42" rx="5" fill="#18181b" stroke="#27272a" strokeWidth="1" />
                                {/* Inner Flap Fold */}
                                <path d="M282,238 L328,238 Q338,238 338,246 L338,254 Q338,262 328,262 L282,262 Z" fill="#2d2d30" />
                                {/* Clasp lock */}
                                <rect x="325" y="244" width="8" height="9" rx="1.5" fill="#fbbf24" />
                            </g>


                            {/* 5. CALCULATOR & ROLLED RECEIPT (RIGHT MIDDLE) */}
                            <g transform="translate(10, 0)">
                                {/* Rolled Receipt Paper */}
                                <path d="M305,100 L323,100 L323,155 Q314,158 305,155 Z" fill="#ffffff" stroke="#e4e4e7" strokeWidth="0.75" />
                                <line x1="309" y1="110" x2="319" y2="110" stroke="#d4d4d8" strokeWidth="1" />
                                <line x1="309" y1="116" x2="317" y2="116" stroke="#d4d4d8" strokeWidth="1" />
                                <line x1="309" y1="122" x2="319" y2="122" stroke="#d4d4d8" strokeWidth="1" />
                                <line x1="309" y1="128" x2="315" y2="128" stroke="#d4d4d8" strokeWidth="1" />
                                <line x1="309" y1="134" x2="319" y2="134" stroke="#d4d4d8" strokeWidth="1" />
                                <line x1="309" y1="140" x2="316" y2="140" stroke="#10b981" strokeWidth="1" />

                                {/* Calculator */}
                                <rect x="330" y="110" width="38" height="54" rx="4" fill="#f4f4f5" stroke="#e4e4e7" strokeWidth="1.5" />
                                {/* Display Screen */}
                                <rect x="335" y="115" width="28" height="9" rx="1" fill="#18181b" />
                                <rect x="337" y="118" width="10" height="1.5" fill="#10b981" />
                                {/* Grid keys */}
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
                            {/* Floating Card Top Right */}
                            <g transform="translate(290, 40) rotate(-12)" className="animate-[bounce_3.5s_infinite]">
                                <rect width="52" height="32" rx="4" fill="url(#cardGrad)" stroke="#16a34a" strokeWidth="0.5" />
                                <circle cx="10" cy="10" r="3" fill="#ecfdf5" opacity="0.8" />
                                <rect x="34" y="20" width="12" height="6" rx="1" fill="#ecfdf5" opacity="0.6" />
                            </g>

                            {/* Floating Card Left Top */}
                            <g transform="translate(60, 50) rotate(15)" className="animate-[bounce_4.5s_infinite]">
                                <rect width="46" height="28" rx="4" fill="#1e2937" stroke="#374151" strokeWidth="0.5" />
                                <circle cx="8" cy="8" r="2.5" fill="#9ca3af" opacity="0.8" />
                                <rect x="30" y="18" width="10" height="5" rx="1" fill="#fbbf24" opacity="0.7" />
                            </g>

                            {/* Floating Money Bill Top Center */}
                            <g transform="translate(170, 25) rotate(5)" className="animate-[bounce_4s_infinite]">
                                <rect width="36" height="18" rx="2" fill="#d1fae5" stroke="#10b981" strokeWidth="0.75" />
                                <circle cx="18" cy="9" r="4.5" fill="#10b981" opacity="0.3" />
                                <line x1="4" y1="4" x2="32" y2="4" stroke="#10b981" strokeWidth="0.5" opacity="0.3" />
                                <line x1="4" y1="14" x2="32" y2="14" stroke="#10b981" strokeWidth="0.5" opacity="0.3" />
                            </g>
                        </svg>

                        {/* Floating Transaction Receipt A */}
                        <div className="absolute right-4 top-10 flex items-center gap-2.5 bg-white border border-slate-100 p-2.5 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.03)] animate-[bounce_4s_infinite]">
                            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 text-xs font-bold">
                                🍕
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-800">Pizza Split</span>
                                <span className="text-[9px] font-semibold text-slate-400">Member: -₹420</span>
                            </div>
                        </div>

                        {/* Floating Transaction Receipt B */}
                        <div className="absolute left-4 bottom-10 flex items-center gap-2.5 bg-white border border-slate-100 p-2.5 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.03)] animate-[bounce_5s_infinite]">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 text-xs font-bold">
                                💵
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-800">Trip Refund</span>
                                <span className="text-[9px] font-bold text-emerald-600">+$15 (₹1,245)</span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Empty buffer to balance space */}
                <div className="h-4 z-10" />
            </div>

            {/* RIGHT SIDE: Signup Form */}
            <div className="w-full lg:w-2/5 flex items-center justify-center p-8 relative">
                <div className="absolute inset-0 z-0 pointer-events-none lg:hidden">
                    <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] rounded-full bg-emerald-500/5 blur-[100px]" />
                </div>

                <div className="max-w-md w-full relative z-10 space-y-8">
                    {/* Header */}
                    <div className="flex flex-col space-y-2 text-left">
                        <div className="lg:hidden flex items-center gap-2.5 mb-4">
                            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                                <Wallet size={16} />
                            </div>
                            <span className="font-bold text-lg text-black">Hisab</span>
                        </div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-black">
                            Create Account
                        </h2>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed">
                            Sign up to start sharing and settling expenses.
                        </p>
                    </div>

                    {/* Error Alerts */}
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -5 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-2xl text-xs font-semibold"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-sm"
                                    placeholder="your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    className="w-full border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-sm"
                                    placeholder="name@domain.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                            <div className="relative group">
                                <KeyRound className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    className="w-full border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-sm"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-2xl shadow-sm hover:shadow transition-all mt-6 flex items-center justify-center gap-2 text-sm border border-emerald-600"
                        >
                            {loading ? "Creating Account..." : (
                                <>
                                    <span>Get Started Now</span>
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Navigation Link */}
                    <div className="text-center text-xs font-medium text-slate-400 pt-4 border-t border-slate-100">
                        Already have an account?{" "}
                        <Link to="/login" className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors">
                            Sign in here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
