import Sidebar from "./Sidebar";

export default function Layout({ children }) {
    return (
        <div className="flex">

            {/* Left Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="ml-64 w-full min-h-screen bg-gray-50 p-6">
                {children}
            </div>

        </div>
    );
}