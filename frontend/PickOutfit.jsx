import React, { useState, useEffect } from 'react';
import Header from './Header';

export default function PickOutfit() {
    const [tops, setTops] = useState([]);
    const [bottoms, setBottoms] = useState([]);
    const [shoes, setShoes] = useState([]);

    const [topIndex, setTopIndex] = useState(0);
    const [bottomIndex, setBottomIndex] = useState(0);
    const [shoesIndex, setShoesIndex] = useState(0);
    const [saveMessage, setSaveMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchClothingItems();
    }, []);

    const fetchClothingItems = async () => {
        try {
            setLoading(true);
            setError('');

            // Use relative URLs
            const topsResponse = await fetch('/filter?part=top');
            const topsData = await topsResponse.json();

            const bottomsResponse = await fetch('/filter?part=bottom');
            const bottomsData = await bottomsResponse.json();

            const shoesResponse = await fetch('/filter?part=shoes');
            const shoesData = await shoesResponse.json();

            if (topsData.length === 0 && bottomsData.length === 0 && shoesData.length === 0) {
                setError('No clothing items found in database. Please add some items first.');
            } else {
                setTops(topsData);
                setBottoms(bottomsData);
                setShoes(shoesData);
            }
        } catch (error) {
            console.error('Error fetching clothing items:', error);
            setError('Failed to load clothing items. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const saveCombination = async () => {
        if (tops.length === 0 || bottoms.length === 0 || shoes.length === 0) {
            setSaveMessage('Cannot save incomplete outfit!');
            setTimeout(() => setSaveMessage(''), 2000);
            return;
        }

        const outfit = {
            top: tops[topIndex],
            bottom: bottoms[bottomIndex],
            shoes: shoes[shoesIndex],
            saved_at: new Date().toISOString()
        };

        try {
            // Use relative URL
            const response = await fetch('/save-outfit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(outfit)
            });

            setSaveMessage('Outfit saved! ❤️');
            setTimeout(() => setSaveMessage(''), 2000);
        } catch (error) {
            console.error('Error saving outfit:', error);
            setSaveMessage('Failed to save outfit. Please try again.');
            setTimeout(() => setSaveMessage(''), 2000);
        }
    };

    const getNextIndex = (currentIndex, arrayLength) => {
        return (currentIndex + 1) % arrayLength;
    };

    const getPrevIndex = (currentIndex, arrayLength) => {
        return (currentIndex - 1 + arrayLength) % arrayLength;
    };

    if (loading) {
        return (
            <div>
                <Header />
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <h2>Loading clothing items...</h2>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <Header />
                <div style={{ padding: '2rem' }}>
                    <h2>Pick Your Outfit</h2>
                    <div style={{ color: 'red', textAlign: 'center', padding: '2rem' }}>
                        <p>{error}</p>
                        <button
                            onClick={fetchClothingItems}
                            style={{
                                marginTop: '1rem',
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
                </div>
            </div>
        );
    }

    return (
        <div>
            <Header />
            <div style={{ padding: '2rem' }}>
                <h2>Pick Your Outfit</h2>

                {/* Tops Section */}
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h3>Top {tops.length > 0 && `(${topIndex + 1}/${tops.length})`}</h3>
                    {tops.length > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                            <button
                                onClick={() => setTopIndex(getPrevIndex(topIndex, tops.length))}
                                disabled={tops.length <= 1}
                                style={{ fontSize: '24px', padding: '0.5rem' }}
                            >
                                ◀️
                            </button>
                            <div style={{ textAlign: 'center' }}>
                                <img
                                    src={tops[topIndex].image_path}
                                    alt={tops[topIndex].name}
                                    style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'cover' }}
                                />
                                <p style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>
                                    {tops[topIndex].name}
                                </p>
                            </div>
                            <button
                                onClick={() => setTopIndex(getNextIndex(topIndex, tops.length))}
                                disabled={tops.length <= 1}
                                style={{ fontSize: '24px', padding: '0.5rem' }}
                            >
                                ▶️
                            </button>
                        </div>
                    ) : (
                        <p style={{ color: '#666' }}>No tops available</p>
                    )}
                </div>

                {/* Bottoms Section */}
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h3>Bottom {bottoms.length > 0 && `(${bottomIndex + 1}/${bottoms.length})`}</h3>
                    {bottoms.length > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                            <button
                                onClick={() => setBottomIndex(getPrevIndex(bottomIndex, bottoms.length))}
                                disabled={bottoms.length <= 1}
                                style={{ fontSize: '24px', padding: '0.5rem' }}
                            >
                                ◀️
                            </button>
                            <div style={{ textAlign: 'center' }}>
                                <img
                                    src={bottoms[bottomIndex].image_path}
                                    alt={bottoms[bottomIndex].name}
                                    style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'cover' }}
                                />
                                <p style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>
                                    {bottoms[bottomIndex].name}
                                </p>
                            </div>
                            <button
                                onClick={() => setBottomIndex(getNextIndex(bottomIndex, bottoms.length))}
                                disabled={bottoms.length <= 1}
                                style={{ fontSize: '24px', padding: '0.5rem' }}
                            >
                                ▶️
                            </button>
                        </div>
                    ) : (
                        <p style={{ color: '#666' }}>No bottoms available</p>
                    )}
                </div>

                {/* Shoes Section */}
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h3>Shoes {shoes.length > 0 && `(${shoesIndex + 1}/${shoes.length})`}</h3>
                    {shoes.length > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                            <button
                                onClick={() => setShoesIndex(getPrevIndex(shoesIndex, shoes.length))}
                                disabled={shoes.length <= 1}
                                style={{ fontSize: '24px', padding: '0.5rem' }}
                            >
                                ◀️
                            </button>
                            <div style={{ textAlign: 'center' }}>
                                <img
                                    src={shoes[shoesIndex].image_path}
                                    alt={shoes[shoesIndex].name}
                                    style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'cover' }}
                                />
                                <p style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>
                                    {shoes[shoesIndex].name}
                                </p>
                            </div>
                            <button
                                onClick={() => setShoesIndex(getNextIndex(shoesIndex, shoes.length))}
                                disabled={shoes.length <= 1}
                                style={{ fontSize: '24px', padding: '0.5rem' }}
                            >
                                ▶️
                            </button>
                        </div>
                    ) : (
                        <p style={{ color: '#666' }}>No shoes available</p>
                    )}
                </div>

                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <button
                        onClick={saveCombination}
                        style={{
                            fontSize: '18px',
                            padding: '1rem 2rem',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                        disabled={tops.length === 0 || bottoms.length === 0 || shoes.length === 0}
                    >
                        💾 Save Outfit
                    </button>
                    {saveMessage && (
                        <p style={{
                            marginTop: '1rem',
                            color: saveMessage.includes('Failed') ? 'red' : 'green',
                            fontWeight: 'bold'
                        }}>
                            {saveMessage}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}