import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

export default function AddClothes() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        bodyPart: '',
        imagePath: ''
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.type || !formData.bodyPart || !formData.imagePath) {
            setMessage('Please fill in all fields');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const response = await fetch('/user/add-clothing', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    type: formData.type,
                    body_part: formData.bodyPart,
                    image_path: formData.imagePath
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Clothing item added successfully!');
                setFormData({
                    name: '',
                    type: '',
                    bodyPart: '',
                    imagePath: ''
                });
            } else {
                setMessage(data.error || 'Failed to add clothing item');
            }
        } catch (error) {
            console.error('Error adding clothing:', error);
            setMessage('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: {
            paddingTop: '80px', // Account for fixed header
            padding: '2rem',
            maxWidth: '600px',
            margin: '0 auto'
        },
        form: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            backgroundColor: '#f8f9fa',
            padding: '2rem',
            borderRadius: '8px'
        },
        label: {
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: 'bold',
            color: '#333'
        },
        input: {
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px',
            boxSizing: 'border-box'
        },
        select: {
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px',
            boxSizing: 'border-box'
        },
        button: {
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            padding: '1rem',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
        },
        message: {
            marginTop: '1rem',
            padding: '1rem',
            borderRadius: '4px',
            backgroundColor: message.includes('successfully') ? '#d4edda' : '#f8d7da',
            color: message.includes('successfully') ? '#155724' : '#721c24',
            border: `1px solid ${message.includes('successfully') ? '#c3e6cb' : '#f5c6cb'}`
        },
        small: {
            color: '#666',
            fontSize: '14px',
            marginTop: '0.25rem'
        }
    };

    return (
        <div>
            <Header />
            <div style={styles.container}>
                <h1>➕ Add New Clothing Item</h1>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div>
                        <label style={styles.label}>
                            Item Name:
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g., Blue Denim Jacket"
                            style={styles.input}
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label style={styles.label}>
                            Type:
                        </label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            style={styles.select}
                            disabled={loading}
                        >
                            <option value="">Select Type</option>
                            <option value="shirt">Shirt</option>
                            <option value="pants">Pants</option>
                            <option value="dress">Dress</option>
                            <option value="skirt">Skirt</option>
                            <option value="shorts">Shorts</option>
                            <option value="jacket">Jacket</option>
                            <option value="sweater">Sweater</option>
                            <option value="sneakers">Sneakers</option>
                            <option value="boots">Boots</option>
                            <option value="sandals">Sandals</option>
                            <option value="casual">Casual Shoes</option>
                            <option value="dress">Dress Shoes</option>
                        </select>
                    </div>

                    <div>
                        <label style={styles.label}>
                            Body Part:
                        </label>
                        <select
                            name="bodyPart"
                            value={formData.bodyPart}
                            onChange={handleInputChange}
                            style={styles.select}
                            disabled={loading}
                        >
                            <option value="">Select Body Part</option>
                            <option value="top">Top</option>
                            <option value="bottom">Bottom</option>
                            <option value="shoes">Shoes</option>
                        </select>
                    </div>

                    <div>
                        <label style={styles.label}>
                            Image Path:
                        </label>
                        <input
                            type="text"
                            name="imagePath"
                            value={formData.imagePath}
                            onChange={handleInputChange}
                            placeholder="e.g., tops/blue-jacket.jpg"
                            style={styles.input}
                            disabled={loading}
                        />
                        <div style={styles.small}>
                            Path relative to /clothes/ directory (e.g., tops/shirt1.jpg)
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={styles.button}
                    >
                        {loading ? 'Adding...' : 'Add Clothing Item'}
                    </button>
                </form>

                {message && (
                    <div style={styles.message}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}