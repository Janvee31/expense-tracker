import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, MessageSquare } from "lucide-react";

export default function ChatAI() {
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Hello! I'm your AI financial assistant. Ask me anything about your spending or for saving tips!" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [expenses, setExpenses] = useState([]);
    const scrollRef = useRef(null);

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

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: "user", content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const response = await axios.post("http://localhost:5000/ai/chat", {
                message: input,
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
            
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                        AI Assistant
                    </h1>
                    <p className="text-cyan-400 text-lg mt-1 font-medium tracking-wide flex items-center gap-2">
                        <Sparkles size={18} /> Powered by Gemini
                    </p>
                </div>
            </div>

            <div className="flex-1 backdrop-blur-xl bg-slate-900/50 border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                
                {/* MESSAGES AREA */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                    <AnimatePresence initial={false}>
                        {messages.map((msg, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                                        {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                                    </div>
                                    <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                                        msg.role === 'user' 
                                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                                        : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
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
                                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center animate-pulse">
                                    <Bot size={20} />
                                </div>
                                <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl rounded-tl-none flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* INPUT AREA */}
                <div className="p-6 bg-slate-950/30 border-t border-slate-800/50">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Ask about your budget, savings, or spending..."
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 pl-6 pr-16 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-slate-950 rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-lg"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                    <p className="text-[10px] text-center text-slate-600 mt-3 uppercase tracking-widest font-bold">
                        AI-powered by Gemini 1.5 Flash
                    </p>
                </div>
            </div>
        </div>
    );
}
