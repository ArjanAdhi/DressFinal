import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./assets/adminDashboard.css";

export default function ManageContent() {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editPostId, setEditPostId] = useState(null);
    const [editFilename, setEditFilename] = useState("");
    const [editLabel, setEditLabel] = useState("");

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await fetch("/auth/admin/posts", {
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();
                setPosts(data);
            } else {
                setError('Failed to fetch posts');
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const approvePosts = async (id) => {
        try {
            const response = await fetch(`/auth/admin/posts/${id}/approve`, {
                method: "POST",
                credentials: "include",
            });

            if (response.ok) {
                fetchPosts(); // Refresh the list
            } else {
                alert('Failed to approve post');
            }
        } catch (error) {
            console.error("Error approving post:", error);
            alert('Error connecting to server');
        }
    };

    const deletePost = async (id) => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            try {
                const response = await fetch(`/auth/admin/posts/${id}/delete`, {
                    method: "POST",
                    credentials: "include",
                });

                if (response.ok) {
                    fetchPosts(); // Refresh the list
                } else {
                    alert('Failed to delete post');
                }
            } catch (error) {
                console.error("Error deleting post:", error);
                alert('Error connecting to server');
            }
        }
    };

    const startEdit = (post) => {
        setEditPostId(post.id);
        setEditFilename(post.title || '');
        setEditLabel(post.body || '');
    };

    const cancelEdit = () => {
        setEditPostId(null);
        setEditFilename("");
        setEditLabel("");
    };

    const saveEdit = async () => {
        try {
            const response = await fetch(`/auth/admin/posts/${editPostId}/edit`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filename: editFilename, label: editLabel }),
            });

            if (response.ok) {
                setEditPostId(null);
                setEditFilename("");
                setEditLabel("");
                fetchPosts(); // Refresh the list
            } else {
                alert('Failed to update post');
            }
        } catch (error) {
            console.error("Error updating post:", error);
            alert('Error connecting to server');
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
        navigate("/login");
    };

    if (loading) {
        return (
            <div className="admin-container">
                <h1>Manage Content</h1>
                <p>Loading posts...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-container">
                <h1>Manage Content</h1>
                <button onClick={() => navigate("/admin-dashboard")}>Back to Dashboard</button>
                <div style={{ color: 'red', marginTop: '2rem' }}>
                    <p>{error}</p>
                    <button onClick={fetchPosts}>Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <h1>Manage Content</h1>
            <div style={{ marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate("/admin-dashboard")}
                    style={{
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '1rem'
                    }}
                >
                    Back to Dashboard
                </button>
                <button
                    onClick={handleLogout}
                    style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Logout
                </button>
            </div>

            {posts.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '2rem', padding: '2rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                    <h3>No Posts Found</h3>
                    <p>Posts will appear here when users create content that needs moderation.</p>
                    <p style={{ color: '#666', fontSize: '14px' }}>
                        This is where you can approve, edit, or delete user-generated content.
                    </p>
                </div>
            ) : (
                <table className="user-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>ID</th>
                            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Title</th>
                            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Body</th>
                            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Author</th>
                            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Status</th>
                            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.map((post) => (
                            <tr key={post.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                                <td style={{ padding: '1rem' }}>{post.id}</td>
                                <td style={{ padding: '1rem' }}>
                                    {editPostId === post.id ? (
                                        <input
                                            value={editFilename}
                                            onChange={(e) => setEditFilename(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '0.5rem',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px'
                                            }}
                                            placeholder="Enter title"
                                        />
                                    ) : (
                                        post.title || 'No title'
                                    )}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    {editPostId === post.id ? (
                                        <textarea
                                            value={editLabel}
                                            onChange={(e) => setEditLabel(e.target.value)}
                                            style={{
                                                width: '100%',
                                                height: '80px',
                                                padding: '0.5rem',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                resize: 'vertical'
                                            }}
                                            placeholder="Enter content"
                                        />
                                    ) : (
                                        <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {post.body || 'No content'}
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: '1rem' }}>{post.author || 'Unknown'}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px',
                                        backgroundColor: post.status === 'approved' ? '#d4edda' : '#fff3cd',
                                        color: post.status === 'approved' ? '#155724' : '#856404',
                                        fontSize: '12px'
                                    }}>
                                        {post.status || 'pending'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    {editPostId === post.id ? (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={saveEdit}
                                                style={{
                                                    backgroundColor: '#28a745',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                style={{
                                                    backgroundColor: '#6c757d',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <button
                                                onClick={() => approvePosts(post.id)}
                                                style={{
                                                    backgroundColor: '#007bff',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => startEdit(post)}
                                                style={{
                                                    backgroundColor: '#ffc107',
                                                    color: 'black',
                                                    border: 'none',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => deletePost(post.id)}
                                                style={{
                                                    backgroundColor: '#dc3545',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}