import Sidebar from "./Sidebar";

export default function Layout({ children }) {
    return (
        <div className="flex bg-slate-950 text-slate-100 min-h-screen selection:bg-purple-500/30 font-sans">
            
            {/* Ambient Background Glow */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/10 blur-[120px]" />
            </div>

            {/* Sidebar */}
            <div className="relative z-20">
                <Sidebar />
            </div>

            {/* Main Content */}
            <main className="flex-1 p-6 lg:p-10 relative z-10 h-screen overflow-y-auto w-full">
                <div className="max-w-6xl mx-auto w-full">
                    {children}
                </div>
            </main>

        </div>
    );
}