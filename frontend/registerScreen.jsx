import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './assets/registerScreen.css';

export default function RegisterScreen() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const handleRegister = async () => {
        if (!email || !username || !password || !confirmPassword) {
            setMessage("Please fill out all fields.");
        } else if (password !== confirmPassword) {
            setMessage("Passwords do not match!");
        } else if (!emailRegex.test(email)) {
            setMessage("Please enter a valid email address.");
        } else {
            try {
                const response = await fetch("/auth/register", {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        username,
                        password
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    setMessage("Registration successful!");
                    setTimeout(() => navigate('/login'), 1500); // Optional auto-redirect after success
                } else {
                    setMessage(data.error || "Registration failed.");
                }
            } catch (error) {
                console.error("Error during registration:", error);
                setMessage("Server error. Please try again later.");
            }
        }
    };

    return (
        <div className="register-container">
            <h1>Register</h1>
            <input className="input" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="input" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <input className="input" type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            <button className="button" onClick={handleRegister}>Register</button>
            <div className="message">{message}</div>
            <div className="link" onClick={() => navigate('/login')}>
                Already have an account? Login here
            </div>
        </div>
    );
}