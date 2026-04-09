import Sidebar from "./Sidebar";

export default function Layout({ children }) {
    return (
        <div className="flex bg-gray-100 min-h-screen">

            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 p-6">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>

        </div>
    );
}