import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./utils/axiosConfig"; // Import global axios interceptor

import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Analytics from "./pages/Analytics";
import Categories from "./pages/Categories";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ChatAI from "./pages/ChatAI";
import Family from "./pages/Family";
import Hisab from "./pages/Hisab";

// A wrapper for protected routes
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Protected Routes */}
                <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
                <Route path="/expenses" element={<ProtectedRoute><Layout><Expenses /></Layout></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><Layout><Analytics /></Layout></ProtectedRoute>} />
                <Route path="/categories" element={<ProtectedRoute><Layout><Categories /></Layout></ProtectedRoute>} />
                <Route path="/chat" element={<ProtectedRoute><Layout><ChatAI /></Layout></ProtectedRoute>} />
                <Route path="/family" element={<ProtectedRoute><Layout><Family /></Layout></ProtectedRoute>} />
                <Route path="/hisab" element={<ProtectedRoute><Layout><Hisab /></Layout></ProtectedRoute>} />

            </Routes>
        </BrowserRouter>
    );
}