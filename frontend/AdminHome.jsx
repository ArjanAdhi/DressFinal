import React from "react";
import { useNavigate } from "react-router-dom";
import "./assets/adminDashboard.css";

export default function AdminHome({ clearAuthState }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await fetch("/auth/logout", {
                method: "POST",
                credentials: "include",
            });
        } catch (error) {
            console.error("Logout failed:", error);
        }

        // Clear all local storage
        localStorage.clear();
        sessionStorage.clear();

        // Clear the app's auth state
        if (clearAuthState) {
            clearAuthState();
        }

        // Force navigation to login
        window.location.href = "/login";
    };

    return (
        <div className="admin-container">
            <h1 className="admin-header">Dress EZ Admin Dashboard</h1>
            <p className="admin-welcome">Welcome, Admin. Choose an action:</p>
            <div className="admin-actions">
                <button className="admin-button" onClick={() => navigate("/admin/users")}>
                    Manage Users
                </button>
                <button className="admin-button" onClick={() => navigate("/admin/content")}>
                    Manage Content
                </button>
                <button className="admin-button" onClick={() => navigate("/admin/data-entry")}>
                    Data Entry
                </button>
                <button className="admin-button" onClick={() => navigate("/admin/analytics")}>
                    Analytics Dashboard
                </button>
                <button className="admin-button" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </div>
    );
}