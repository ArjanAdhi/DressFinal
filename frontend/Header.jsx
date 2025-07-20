import React from 'react';
import { Link } from 'react-router-dom';
import './assets/styles.css';

export default function Header() {
    return (
        <div className="header">
            <Link to="/pick">👕 Pick Outfit</Link>
            <Link to="/filter">🔍 Filter Closet</Link>
            <Link to="/add-clothes">➕ Add Clothes</Link>
            <Link to="/settings">⚙️ Settings</Link>
        </div>
    );
}