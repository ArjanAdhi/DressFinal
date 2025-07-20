import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ManageUsers() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await fetch("/auth/admin/users", {
                method: "GET",
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                setError('Failed to fetch users');
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const toggleActive = async (id) => {
        try {
            const response = await fetch(`/auth/admin/users/${id}/toggle_active`, {
                method: "POST",
                credentials: "include",
            });

            if (response.ok) {
                fetchUsers(); // Refresh the list
            } else {
                alert('Failed to update user status');
            }
        } catch (error) {
            console.error("Error toggling user status:", error);
            alert('Error connecting to server');
        }
    };

    const deleteUser = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                const response = await fetch(`/auth/admin/users/${id}/delete`, {
                    method: "POST",
                    credentials: "include",
                });

                if (response.ok) {
                    fetchUsers(); // Refresh the list
                } else {
                    alert('Failed to delete user');
                }
            } catch (error) {
                console.error("Error deleting user:", error);
                alert('Error connecting to server');
            }
        }
    };

    const handleLogout = async () => {
        try {
            await fetch("/auth/logout", {
                method: "POST",
                credentials: "include",
            });
        } catch (error) {
            console.error("Logout failed:", error);
        }
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/login";
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem' }}>
                <h1>Manage Users</h1>
                <p>Loading users...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '2rem' }}>
                <h1>Manage Users</h1>
                <button onClick={() => navigate("/admin-dashboard")}>Back to Dashboard</button>
                <div style={{ color: 'red', marginTop: '2rem' }}>
                    <p>{error}</p>
                    <button onClick={fetchUsers}>Retry</button>
                </div>
            </div>
        );
    }

    const styles = {
        container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
        header: { color: '#333', marginBottom: '2rem' },
        buttonGroup: { marginBottom: '2rem', display: 'flex', gap: '1rem' },
        button: {
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px'
        },
        backButton: { backgroundColor: '#6c757d', color: 'white' },
        logoutButton: { backgroundColor: '#dc3545', color: 'white' },
        table: { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' },
        th: { padding: '1rem', textAlign: 'left', backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' },
        td: { padding: '1rem', borderBottom: '1px solid #dee2e6' },
        actionButton: {
            padding: '0.25rem 0.5rem',
            margin: '0 0.25rem',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px'
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Manage Users</h1>

            <div style={styles.buttonGroup}>
                <button
                    onClick={() => navigate("/admin-dashboard")}
                    style={{...styles.button, ...styles.backButton}}
                >
                    Back to Dashboard
                </button>
                <button
                    onClick={handleLogout}
                    style={{...styles.button, ...styles.logoutButton}}
                >
                    Logout
                </button>
            </div>

            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>ID</th>
                        <th style={styles.th}>Email</th>
                        <th style={styles.th}>Username</th>
                        <th style={styles.th}>Active</th>
                        <th style={styles.th}>Role</th>
                        <th style={styles.th}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td style={styles.td}>{user.id}</td>
                            <td style={styles.td}>{user.email}</td>
                            <td style={styles.td}>{user.username}</td>
                            <td style={styles.td}>{user.active ? "Yes" : "No"}</td>
                            <td style={styles.td}>{user.role}</td>
                            <td style={styles.td}>
                                <button
                                    onClick={() => toggleActive(user.id)}
                                    style={{
                                        ...styles.actionButton,
                                        backgroundColor: user.active ? '#ffc107' : '#28a745',
                                        color: user.active ? 'black' : 'white'
                                    }}
                                >
                                    {user.active ? "Deactivate" : "Activate"}
                                </button>
                                <button
                                    onClick={() => deleteUser(user.id)}
                                    style={{
                                        ...styles.actionButton,
                                        backgroundColor: '#dc3545',
                                        color: 'white'
                                    }}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {users.length === 0 && (
                <p style={{ textAlign: 'center', marginTop: '2rem' }}>No users found.</p>
            )}
        </div>
    );
}