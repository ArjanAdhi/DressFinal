import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import LoginScreen from "./loginScreen";
import RegisterScreen from "./registerScreen";
import AdminHome from "./AdminHome.jsx";
import ManageUsers from "./ManageUsers.jsx";
import ManageContent from "./ManageContent.jsx";
import AdminDataEntry from "./AdminDataEntry.jsx";
import FilterScreen from "./FilterScreen.jsx";
import PickOutfit from "./PickOutfit.jsx";
import SettingsScreen from "./SettingsScreen.jsx";
import UserDashboard from "./UserDashboard.jsx";
import AnalyticsDashboard from "./AnalyticsDashboard.jsx";
import AddClothes from "./AddClothes.jsx";

function App() {
    const [authState, setAuthState] = useState({
        isLoggedIn: false,
        userRole: null,
        loading: false
    });

    useEffect(() => {
        // Start with logged out state - no complex auth checks
        setAuthState({
            isLoggedIn: false,
            userRole: null,
            loading: false
        });
    }, []);

    // Function to update auth state from child components
    const updateAuthState = (isLoggedIn, role = null) => {
        setAuthState({
            isLoggedIn,
            userRole: role,
            loading: false
        });
    };

    // Function to clear auth state (for logout)
    const clearAuthState = () => {
        localStorage.clear();
        sessionStorage.clear();
        setAuthState({
            isLoggedIn: false,
            userRole: null,
            loading: false
        });
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
            <Routes>
                {/* Root redirect */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Public routes */}
                <Route path="/login" element={<LoginScreen updateAuthState={updateAuthState} />} />
                <Route path="/register" element={<RegisterScreen />} />

                {/* Admin routes */}
                <Route path="/admin-dashboard" element={<AdminHome clearAuthState={clearAuthState} />} />
                <Route path="/admin/users" element={<ManageUsers />} />
                <Route path="/admin/content" element={<ManageContent />} />
                <Route path="/admin/data-entry" element={<AdminDataEntry />} />
                <Route path="/admin/analytics" element={<AnalyticsDashboard />} />

                {/* User routes - no authentication check for now to test */}
                <Route path="/filter" element={<FilterScreen />} />
                <Route path="/pick" element={<PickOutfit />} />
                <Route path="/settings" element={<SettingsScreen clearAuthState={clearAuthState} />} />
                <Route path="/user-dashboard" element={<UserDashboard />} />
                <Route path="/add-clothes" element={<AddClothes />} />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </div>
    );
}

export default App;