import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Analytics from "./pages/Analytics";
import Categories from "./pages/Categories";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<Layout><Dashboard /></Layout>} />
                <Route path="/expenses" element={<Layout><Expenses /></Layout>} />
                <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
                <Route path="/categories" element={<Layout><Categories /></Layout>} />

            </Routes>
        </BrowserRouter>
    );
}