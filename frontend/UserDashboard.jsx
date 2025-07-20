import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

export default function UserDashboard() {
    const navigate = useNavigate();
    const [recentOutfits, setRecentOutfits] = useState([]);
    const [clothingCount, setClothingCount] = useState(0);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Use relative URL instead of absolute
            const response = await fetch('/filter');
            const data = await response.json();
            setClothingCount(data.length);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    return (
        <div>
            <Header />
            <div style={{ padding: '2rem' }}>
                <h1>👋 Welcome to DressEZ!</h1>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1rem',
                    marginTop: '2rem'
                }}>
                    <div style={{
                        backgroundColor: '#f8f9fa',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <h3>👕 Your Closet</h3>
                        <p style={{ fontSize: '2rem', color: '#007bff' }}>{clothingCount}</p>
                        <p>items in your wardrobe</p>
                    </div>

                    <div style={{
                        backgroundColor: '#f8f9fa',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <h3>💾 Saved Outfits</h3>
                        <p style={{ fontSize: '2rem', color: '#28a745' }}>{recentOutfits.length}</p>
                        <p>outfit combinations saved</p>
                    </div>
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <h2>Quick Actions</h2>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => navigate('/pick')}
                            style={{
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                padding: '1rem 2rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '16px'
                            }}
                        >
                            👕 Pick an Outfit
                        </button>
                        <button
                            onClick={() => navigate('/filter')}
                            style={{
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                padding: '1rem 2rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '16px'
                            }}
                        >
                            🔍 Browse Closet
                        </button>
                        <button
                            onClick={() => navigate('/add-clothes')}
                            style={{
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                padding: '1rem 2rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '16px'
                            }}
                        >
                            ➕ Add Clothes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}