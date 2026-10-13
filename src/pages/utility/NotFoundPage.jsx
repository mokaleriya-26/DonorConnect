import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Sparkles, Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '40px 24px'
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 24,
          background: 'var(--accent-lavender)',
          color: 'var(--dark-purple)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20
        }}
      >
        <Compass size={40} />
      </div>

      <h1 style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.04em', margin: 0 }}>
        404
      </h1>

      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 8, marginBottom: 12 }}>
        Page Not Found
      </h2>

      <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: 440, lineHeight: 1.6, marginBottom: 28 }}>
        The page you are looking for doesn't exist or may have been moved. Let's get you back to discovering experiences.
      </p>

      <div style={{ display: 'flex', gap: 12 }}>
        <Link to="/" className="btn-primary" style={{ padding: '10px 22px' }}>
          <Home size={16} /> Return to Home
        </Link>
        <Link to="/events" className="btn-secondary" style={{ padding: '10px 22px' }}>
          <Compass size={16} /> Explore Events
        </Link>
      </div>
    </div>
  );
};
