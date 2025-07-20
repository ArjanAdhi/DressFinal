import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

export default function SettingsScreen({ clearAuthState }) {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');
    const [recommendations, setRecommendations] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const saved = localStorage.getItem('recommendations') === "true";
        setRecommendations(saved);
    }, []);

    const handleLogout = async () => {
        if (loggingOut) return;

        setLoggingOut(true);

        try {
            // Call logout endpoint
            await fetch("/auth/logout", {
                method: "POST",
                credentials: "include"
            });
        } catch (error) {
            console.error("Logout request failed:", error);
        }

        // Clear all storage
        localStorage.clear();
        sessionStorage.clear();

        // Clear auth state
        if (clearAuthState) {
            clearAuthState();
        }

        // Use window.location to force a complete page refresh and navigation
        window.location.href = "/login";
    };

    const changePassword = async (e) => {
        e.preventDefault();

        if (!oldPassword || !newPassword) {
            setPasswordMessage("Please fill in both password fields.");
            return;
        }

        if (oldPassword === newPassword) {
            setPasswordMessage("New password must be different from old password.");
            return;
        }

        try {
            const response = await fetch('/auth/change-password', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    oldPassword,
                    newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                setPasswordMessage("Password updated successfully!");
                setOldPassword('');
                setNewPassword('');
            } else {
                setPasswordMessage(data.error || "Failed to update password.");
            }
        } catch (error) {
            console.error('Password change error:', error);
            setPasswordMessage("Error connecting to server. Please try again.");
        }

        setTimeout(() => setPasswordMessage(''), 5000);
    };

    const toggleRecommendations = () => {
        const updated = !recommendations;
        setRecommendations(updated);
        localStorage.setItem('recommendations', updated.toString());
    };

    const styles = {
        container: {
            paddingTop: '80px', // Account for fixed header
            padding: '2rem',
            maxWidth: '800px',
            margin: '0 auto'
        },
        section: {
            marginBottom: '2rem',
            backgroundColor: '#f8f9fa',
            padding: '1.5rem',
            borderRadius: '8px'
        },
        title: {
            color: '#333',
            marginBottom: '1rem'
        },
        button: {
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            marginBottom: '1rem'
        },
        input: {
            width: '100%',
            maxWidth: '300px',
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            marginBottom: '1rem'
        },
        submitButton: {
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
        }
    };

    return (
        <div>
            <Header />
            <div style={styles.container}>
                <h1 style={styles.title}>⚙️ DressEZ Settings</h1>

                <div style={styles.section}>
                    <h2>Account</h2>
                    <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        style={{
                            ...styles.button,
                            backgroundColor: loggingOut ? '#ccc' : '#dc3545',
                            cursor: loggingOut ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loggingOut ? "Logging out..." : "🚪 Log Out"}
                    </button>

                    <h3>Change Password</h3>
                    <form onSubmit={changePassword}>
                        <div>
                            <input
                                type="password"
                                placeholder="Current Password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                required
                                style={styles.input}
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                style={styles.input}
                            />
                        </div>
                        <button type="submit" style={styles.submitButton}>
                            🔐 Update Password
                        </button>
                    </form>

                    {passwordMessage && (
                        <p style={{
                            marginTop: '1rem',
                            color: passwordMessage.includes('successfully') ? 'green' : 'red',
                            backgroundColor: passwordMessage.includes('successfully') ? '#e6ffe6' : '#ffe6e6',
                            padding: '0.5rem',
                            borderRadius: '4px',
                            border: passwordMessage.includes('successfully') ? '1px solid #ccffcc' : '1px solid #ffcccc'
                        }}>
                            {passwordMessage}
                        </p>
                    )}
                </div>

                <div style={styles.section}>
                    <h2>Preferences</h2>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={recommendations}
                            onChange={toggleRecommendations}
                            style={{ transform: 'scale(1.2)' }}
                        />
                        Enable Outfit Recommendations
                    </label>
                    <p style={{
                        marginTop: '0.5rem',
                        color: recommendations ? 'green' : '#666',
                        fontSize: '14px'
                    }}>
                        {recommendations ? "✅ Recommendations enabled" : "❌ Recommendations disabled"}
                    </p>
                </div>
            </div>
        </div>
    );
}