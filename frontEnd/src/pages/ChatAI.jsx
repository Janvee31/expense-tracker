import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, MessageSquare, BarChart3, PiggyBank, Wallet } from "lucide-react";

export default function ChatAI() {
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Hello! I'm your AI financial assistant. Ask me anything about your spending or for saving tips!" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [expenses, setExpenses] = useState([]);
    const scrollRef = useRef(null);

    const promptStarters = [
        { label: "Analyze Spending", text: "Analyze my expenses and tell me where I spent the most.", icon: BarChart3 },
        { label: "Saving Strategies", text: "Give me 3 realistic tips to save money this month.", icon: PiggyBank },
        { label: "Budget Check", text: "How is my budget looking based on recent logs?", icon: Wallet }
    ];

    useEffect(() => {
        // Fetch expenses to provide context to the AI
        axios.get("http://localhost:8080/expenses")
            .then(res => setExpenses(res.data))
            .catch(err => console.error("Error fetching expenses for context:", err));
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (customText = "") => {
        const textToSend = customText || input;
        if (!textToSend.trim()) return;

        const userMessage = { role: "user", content: textToSend };
        setMessages(prev => [...prev, userMessage]);
        if (!customText) setInput("");
        setLoading(true);

        try {
            const response = await axios.post("http://localhost:5000/ai/chat", {
                message: textToSend,
                expenses: expenses
            });

            setMessages(prev => [...prev, { role: "assistant", content: response.data.response }]);
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting to my brain right now. Is the AI service running?" }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex w-12 h-12 bg-emerald-50 rounded-xl items-center justify-center text-emerald-600 border border-emerald-100">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold text-black">
                            AI Assistant
                        </h1>
                        <p className="text-emerald-500 text-sm mt-1 font-semibold tracking-wide flex items-center gap-2">
                            <Sparkles size={14} className="animate-pulse" /> Powered by Gemini
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
                
                {/* MESSAGES AREA */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                    
                    {/* Prompt suggestions only shown when chat has just welcome message */}
                    {messages.length === 1 && (
                        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
                            {promptStarters.map((ps, idx) => {
                                const IconComponent = ps.icon;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleSend(ps.text)}
                                        className="flex flex-col text-left p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-200/80 transition-all group"
                                    >
                                        <div className="p-2 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl w-fit mb-3 group-hover:scale-105 transition-transform">
                                            <IconComponent size={16} />
                                        </div>
                                        <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-1">{ps.label}</span>
                                        <span className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">{ps.text}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    <AnimatePresence initial={false}>
                        {messages.map((msg, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                        msg.role === 'user' 
                                            ? 'bg-slate-100 text-slate-600 border border-slate-200' 
                                            : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                    }`}>
                                        {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                                    </div>
                                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                                        msg.role === 'user' 
                                            ? 'bg-emerald-500 text-white rounded-tr-none shadow-sm font-semibold' 
                                            : 'bg-slate-50 text-slate-800 border border-slate-250/50 rounded-tl-none font-medium'
                                    }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {loading && (
                        <div className="flex justify-start">
                            <div className="flex gap-3 max-w-[80%]">
                                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center animate-pulse">
                                    <Bot size={18} />
                                </div>
                                <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl rounded-tl-none flex gap-1 items-center">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* INPUT AREA */}
                <div className="p-6 bg-slate-50/50 border-t border-slate-200/60">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Ask about your budget, savings, or spending..."
                            className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-6 pr-16 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend("")}
                        />
                        <button
                            onClick={() => handleSend("")}
                            disabled={loading || !input.trim()}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 transition-all shadow-sm flex items-center justify-center"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                    <p className="text-[9px] text-center text-slate-400 mt-3 uppercase tracking-widest font-extrabold">
                        AI-powered by Gemini 1.5 Flash
                    </p>
                </div>
            </div>
        </div>
    );
}
