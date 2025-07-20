import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AnalyticsDashboard() {
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            setError('');
            console.log('Fetching analytics...');

            const response = await fetch('/api/admin/analytics', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            console.log('Analytics response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Analytics data:', data);
                setAnalytics(data);
            } else {
                const errorText = await response.text();
                console.error('Analytics error:', errorText);
                setError(`Failed to fetch analytics data (${response.status})`);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
            setError('Error connecting to server');
        } finally {
            setLoading(false);
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

    const styles = {
        container: {
            padding: '2rem',
            maxWidth: '1200px',
            margin: '0 auto',
            backgroundColor: '#f8f9fa',
            minHeight: '100vh'
        },
        header: {
            color: '#333',
            marginBottom: '2rem',
            textAlign: 'center'
        },
        buttonGroup: {
            marginBottom: '2rem',
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center'
        },
        button: {
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
        },
        backButton: {
            backgroundColor: '#6c757d',
            color: 'white'
        },
        logoutButton: {
            backgroundColor: '#dc3545',
            color: 'white'
        },
        retryButton: {
            backgroundColor: '#007bff',
            color: 'white'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem',
            marginTop: '2rem'
        },
        card: {
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e9ecef'
        },
        cardTitle: {
            color: '#495057',
            marginBottom: '1rem',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            borderBottom: '2px solid #007bff',
            paddingBottom: '0.5rem'
        },
        statNumber: {
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#007bff',
            margin: '1rem 0'
        },
        list: {
            listStyle: 'none',
            padding: 0,
            margin: '1rem 0'
        },
        listItem: {
            padding: '0.5rem 0',
            borderBottom: '1px solid #f1f3f4',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        badge: {
            backgroundColor: '#e9ecef',
            color: '#495057',
            padding: '0.25rem 0.75rem',
            borderRadius: '12px',
            fontSize: '0.875rem',
            fontWeight: 'bold'
        },
        errorBox: {
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #f5c6cb',
            textAlign: 'center',
            margin: '2rem 0'
        },
        loadingBox: {
            textAlign: 'center',
            padding: '3rem',
            color: '#6c757d'
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <h1 style={styles.header}>📊 Analytics Dashboard</h1>
                <div style={styles.loadingBox}>
                    <h3>Loading analytics data...</h3>
                    <div style={{ marginTop: '1rem' }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            border: '4px solid #f3f3f3',
                            borderTop: '4px solid #007bff',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto'
                        }}></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <h1 style={styles.header}>📊 Analytics Dashboard</h1>
                <div style={styles.buttonGroup}>
                    <button
                        onClick={() => navigate("/admin-dashboard")}
                        style={{...styles.button, ...styles.backButton}}
                    >
                        ← Back to Dashboard
                    </button>
                    <button
                        onClick={handleLogout}
                        style={{...styles.button, ...styles.logoutButton}}
                    >
                        Logout
                    </button>
                </div>
                <div style={styles.errorBox}>
                    <h3>⚠️ Error Loading Analytics</h3>
                    <p>{error}</p>
                    <button
                        onClick={fetchAnalytics}
                        style={{...styles.button, ...styles.retryButton, marginTop: '1rem'}}
                    >
                        🔄 Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>📊 Analytics Dashboard</h1>

            <div style={styles.buttonGroup}>
                <button
                    onClick={() => navigate("/admin-dashboard")}
                    style={{...styles.button, ...styles.backButton}}
                >
                    ← Back to Dashboard
                </button>
                <button
                    onClick={handleLogout}
                    style={{...styles.button, ...styles.logoutButton}}
                >
                    Logout
                </button>
            </div>

            {analytics && (
                <div style={styles.grid}>
                    {/* User Statistics */}
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>👥 User Statistics</h3>
                        <div style={styles.statNumber}>
                            {analytics.users?.total || 0}
                        </div>
                        <p style={{ color: '#6c757d', margin: 0 }}>Total Users</p>

                        {analytics.users?.by_role && Object.keys(analytics.users.by_role).length > 0 && (
                            <div style={{ marginTop: '1.5rem' }}>
                                <h4 style={{ color: '#495057', marginBottom: '1rem' }}>By Role:</h4>
                                <ul style={styles.list}>
                                    {Object.entries(analytics.users.by_role).map(([role, count]) => (
                                        <li key={role} style={styles.listItem}>
                                            <span style={{ textTransform: 'capitalize' }}>{role}</span>
                                            <span style={styles.badge}>{count}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Clothing Statistics */}
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>👕 Clothing Statistics</h3>
                        <div style={styles.statNumber}>
                            {analytics.clothing?.total || 0}
                        </div>
                        <p style={{ color: '#6c757d', margin: 0 }}>Total Items</p>

                        {analytics.clothing?.by_category && Object.keys(analytics.clothing.by_category).length > 0 && (
                            <div style={{ marginTop: '1.5rem' }}>
                                <h4 style={{ color: '#495057', marginBottom: '1rem' }}>By Category:</h4>
                                <ul style={styles.list}>
                                    {Object.entries(analytics.clothing.by_category).map(([category, count]) => (
                                        <li key={category} style={styles.listItem}>
                                            <span style={{ textTransform: 'capitalize' }}>{category}</span>
                                            <span style={styles.badge}>{count}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Posts Statistics */}
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>📝 Content Statistics</h3>
                        <div style={styles.statNumber}>
                            {analytics.posts?.total || 0}
                        </div>
                        <p style={{ color: '#6c757d', margin: 0 }}>Total Posts</p>

                        {analytics.posts?.by_status && Object.keys(analytics.posts.by_status).length > 0 && (
                            <div style={{ marginTop: '1.5rem' }}>
                                <h4 style={{ color: '#495057', marginBottom: '1rem' }}>By Status:</h4>
                                <ul style={styles.list}>
                                    {Object.entries(analytics.posts.by_status).map(([status, count]) => (
                                        <li key={status} style={styles.listItem}>
                                            <span style={{ textTransform: 'capitalize' }}>{status}</span>
                                            <span style={{
                                                ...styles.badge,
                                                backgroundColor: status === 'approved' ? '#d4edda' : '#fff3cd',
                                                color: status === 'approved' ? '#155724' : '#856404'
                                            }}>{count}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Summary Card */}
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>📈 Summary</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={styles.listItem}>
                                <span>Total Users:</span>
                                <span style={styles.badge}>{analytics.users?.total || 0}</span>
                            </div>
                            <div style={styles.listItem}>
                                <span>Total Clothing:</span>
                                <span style={styles.badge}>{analytics.clothing?.total || 0}</span>
                            </div>
                            <div style={styles.listItem}>
                                <span>Total Posts:</span>
                                <span style={styles.badge}>{analytics.posts?.total || 0}</span>
                            </div>
                            <div style={styles.listItem}>
                                <span>Admin Users:</span>
                                <span style={styles.badge}>{analytics.users?.by_role?.admin || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}