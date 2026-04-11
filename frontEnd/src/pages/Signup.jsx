import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, User, KeyRound, Mail } from "lucide-react";

export default function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");

        try {
            await axios.post("http://localhost:8080/auth/signup", {
                email,
                password
            });
            // On success, redirect to login page
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.message || "Signup failed. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden font-sans selection:bg-teal-500/30">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-teal-500/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/10 blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="max-w-md w-full relative z-10 backdrop-blur-2xl bg-slate-900/70 border border-slate-700/50 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.3)]"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mb-4 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.3)] border border-teal-500/30">
                        <UserPlus size={32} />
                    </div>
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300">Create Account</h2>
                    <p className="text-slate-400 mt-2 font-medium tracking-wide">Join to track your expenses</p>
                </div>

                {error && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="bg-rose-500/10 text-rose-400 p-3 rounded-xl mb-6 text-sm text-center border border-rose-500/30"
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSignup} className="space-y-5">
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={20} />
                        <input
                            type="text"
                            required
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3.5 px-12 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all font-medium"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={20} />
                        <input
                            type="email"
                            required
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3.5 px-12 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all font-medium"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="relative group">
                        <KeyRound className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={20} />
                        <input
                            type="password"
                            required
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3.5 px-12 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all font-medium"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold py-3.5 px-4 rounded-2xl shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all mt-4"
                    >
                        Sign Up
                    </motion.button>
                </form>

                <p className="mt-8 text-center text-slate-400 text-sm">
                    Already have an account?{" "}
                    <Link to="/login" className="text-teal-400 font-semibold hover:text-teal-300 transition-colors">
                        Log in here
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
