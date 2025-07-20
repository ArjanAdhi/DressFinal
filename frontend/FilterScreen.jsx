import React, { useState, useEffect } from 'react';
import Header from './Header';

export default function FilterScreen() {
    const [type, setType] = useState('');
    const [part, setPart] = useState('');
    const [name, setName] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    // Load all items on component mount
    useEffect(() => {
        loadAllItems();
    }, []);

    const loadAllItems = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/filter');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setResults(data);
            setHasSearched(true);
        } catch (error) {
            console.error('Error fetching all items:', error);
            setError('Failed to load items. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = async () => {
        setLoading(true);
        setError('');
        setHasSearched(true);

        const params = new URLSearchParams();
        if (type) params.append('type', type);
        if (part) params.append('part', part);
        if (name) params.append('name', name);

        try {
            const response = await fetch(`/filter?${params.toString()}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setResults(data);
        } catch (error) {
            console.error('Error fetching filter results:', error);
            setError('Failed to fetch results. Please try again.');
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setType('');
        setPart('');
        setName('');
        loadAllItems();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    };

    return (
        <div>
            <Header />
            <div style={{ padding: '1rem' }}>
                <h2>🔍 Filter Your Closet</h2>

                <div className="filter-bar">
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        disabled={loading}
                    >
                        <option value="">All Types</option>
                        <option value="shirt">Shirt</option>
                        <option value="pants">Pants</option>
                        <option value="casual">Casual Shoes</option>
                        <option value="dress">Dress Shoes</option>
                        <option value="jacket">Jacket</option>
                        <option value="sweater">Sweater</option>
                        <option value="dress">Dress</option>
                        <option value="skirt">Skirt</option>
                        <option value="shorts">Shorts</option>
                        <option value="sneakers">Sneakers</option>
                        <option value="boots">Boots</option>
                        <option value="sandals">Sandals</option>
                    </select>

                    <select
                        value={part}
                        onChange={(e) => setPart(e.target.value)}
                        disabled={loading}
                    >
                        <option value="">All Body Parts</option>
                        <option value="top">Top</option>
                        <option value="bottom">Bottom</option>
                        <option value="shoes">Shoes</option>
                    </select>

                    <input
                        placeholder="Search by name..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={loading}
                        style={{ minWidth: '200px' }}
                    />

                    <button
                        onClick={applyFilters}
                        disabled={loading}
                        style={{
                            backgroundColor: loading ? '#ccc' : '#007bff',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? '⏳' : '🔍'} {loading ? 'Searching...' : 'Search'}
                    </button>

                    <button
                        onClick={clearFilters}
                        disabled={loading}
                        style={{
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Clear
                    </button>
                </div>

                {error && (
                    <div style={{
                        color: 'red',
                        backgroundColor: '#ffe6e6',
                        padding: '1rem',
                        borderRadius: '4px',
                        margin: '1rem 0',
                        border: '1px solid #ffcccc'
                    }}>
                        <strong>Error:</strong> {error}
                        <button
                            onClick={loadAllItems}
                            style={{
                                marginLeft: '1rem',
                                padding: '0.5rem 1rem',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Retry
                        </button>
                    </div>
                )}

                <div style={{ marginTop: '1rem' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <p>Loading items...</p>
                        </div>
                    ) : !hasSearched ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                            <p>Use the filters above to search for clothing items, or view all items below.</p>
                        </div>
                    ) : results.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <p style={{ color: '#666', fontSize: '18px' }}>🔍 No matching items found.</p>
                            <p style={{ color: '#999' }}>Try adjusting your filters or check if items exist in the database.</p>
                        </div>
                    ) : (
                        <div>
                            <p style={{ marginBottom: '1rem', color: '#666' }}>
                                Found {results.length} item{results.length !== 1 ? 's' : ''}
                            </p>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                                gap: '1rem'
                            }}>
                                {results.map((item, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            border: '1px solid #ddd',
                                            borderRadius: '8px',
                                            padding: '1rem',
                                            backgroundColor: '#fff',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                            transition: 'transform 0.2s ease',
                                            cursor: 'pointer'
                                        }}
                                        onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                                        onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                                    >
                                        <div style={{ textAlign: 'center' }}>
                                            <img
                                                src={item.image_path}
                                                style={{
                                                    maxWidth: '100%',
                                                    maxHeight: '150px',
                                                    objectFit: 'cover',
                                                    borderRadius: '4px',
                                                    marginBottom: '0.5rem'
                                                }}
                                                alt={item.name}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'block';
                                                }}
                                            />
                                            <div
                                                style={{
                                                    display: 'none',
                                                    backgroundColor: '#f8f9fa',
                                                    height: '150px',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#666',
                                                    border: '2px dashed #ddd',
                                                    borderRadius: '4px',
                                                    marginBottom: '0.5rem'
                                                }}
                                            >
                                                📷 Image not found
                                            </div>
                                        </div>
                                        <div>
                                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>
                                                {item.name}
                                            </h4>
                                            <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                                                <strong>Type:</strong> {item.type}<br/>
                                                <strong>Category:</strong> {item.body_part}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}