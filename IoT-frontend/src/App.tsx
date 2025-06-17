import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { isExpired } from "react-jwt";
import Login from "./componetns/Login";
import SignUpForm from "./componetns/SignUpForm";
import Dashboard from "./componetns/Dashboard";

function App() {
    const token = localStorage.getItem("token");
    const isTokenExpired = !token || isExpired(token);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/signup" element={<SignUpForm />} />
                <Route path="/dashboard" element={
                    isTokenExpired ? <Navigate replace to="/" /> : <Dashboard />
                } />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
