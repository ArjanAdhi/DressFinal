import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './assets/loginScreen.css';

export default function LoginScreen({ updateAuthState }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!username || !password) {
            setMessage('Enter username and password');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const response = await fetch('/auth/login', {
                method: 'POST',
                credentials: "include",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Clear any old session storage
                sessionStorage.clear();
                localStorage.removeItem("role");

                // Update the app's auth state
                if (updateAuthState) {
                    updateAuthState(true, data.role);
                }

                // Navigate to appropriate dashboard
                navigate(data.role === "admin" ? "/admin-dashboard" : "/user-dashboard");
            } else {
                setMessage(data.error || "Login failed.");
            }
        } catch (error) {
            console.error('Login error:', error);
            setMessage('Something went wrong connecting to the server.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div className="login-container">
            <h1>Login to DressEZ</h1>
            <input
                className="input"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
            />
            <input
                className="input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
            />
            <button className="button" onClick={handleLogin} disabled={loading}>
                {loading ? "Logging in..." : "Login"}
            </button>

            {message && (
                <div className="message" style={{
                    color: message.includes('failed') || message.includes('wrong') ? 'red' : 'green',
                    marginTop: '1rem',
                    padding: '0.5rem',
                    backgroundColor: message.includes('failed') || message.includes('wrong') ? '#ffe6e6' : '#e6ffe6',
                    borderRadius: '4px',
                    border: `1px solid ${message.includes('failed') || message.includes('wrong') ? '#ffcccc' : '#ccffcc'}`
                }}>
                    {message}
                </div>
            )}

            <div className="link" onClick={() => navigate('/register')}>
                Don't have an account? Register here
            </div>
        </div>
    );
}