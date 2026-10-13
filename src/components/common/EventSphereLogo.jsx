import React from 'react';
import { Link } from 'react-router-dom';

/**
 * EventSphereLogo
 * Custom minimal geometric vector logo combining an orbit/sphere with directional arrow and integrated S-stroke.
 * Supports size variants ('sm', 'md', 'lg'), compact mode (icon only), and theme variants ('light', 'dark', 'auto').
 */
export const EventSphereLogo = ({
  size = 'md',
  variant = 'auto', // 'auto', 'light' (on violet/dark bg), 'dark' (on light bg)
  compact = false,
  to = '/',
  style = {},
  className = ''
}) => {
  // Dimensions map
  const dims = {
    sm: { icon: 28, text: '1.05rem', sub: '0.62rem' },
    md: { icon: 36, text: '1.25rem', sub: '0.72rem' },
    lg: { icon: 48, text: '1.65rem', sub: '0.82rem' }
  };
  const currentDim = dims[size] || dims.md;

  // Colors based on variant
  const isLight = variant === 'light';
  const textColor = isLight ? '#FFFFFF' : 'var(--text-main, #252438)';
  const sphereColor = isLight ? '#E9E0FF' : 'var(--primary-purple, #7541C8)';
  const gradId = `es-logo-grad-${Math.random().toString(36).substr(2, 6)}`;

  const logoContent = (
    <div
      className={`eventsphere-logo-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size === 'sm' ? 8 : 12,
        textDecoration: 'none',
        userSelect: 'none',
        ...style
      }}
    >
      {/* Geometric Sphere + S-Orbit SVG */}
      <svg
        width={currentDim.icon}
        height={currentDim.icon}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, overflow: 'visible' }}
        aria-label="EventSphere Symbol"
      >
        <defs>
          <linearGradient id={`${gradId}-orbit`} x1="4" y1="4" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isLight ? '#FFFFFF' : '#A855F7'} />
            <stop offset="60%" stopColor={isLight ? '#E9E0FF' : '#7541C8'} />
            <stop offset="100%" stopColor={isLight ? '#C4B5FD' : '#5730A6'} />
          </linearGradient>
          <linearGradient id={`${gradId}-s`} x1="12" y1="10" x2="32" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isLight ? '#FFFFFF' : '#9333EA'} />
            <stop offset="100%" stopColor={isLight ? '#DDD6FE' : '#6B21A8'} />
          </linearGradient>
          <filter id={`${gradId}-glow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor={isLight ? 'rgba(0,0,0,0.2)' : 'rgba(117,65,200,0.35)'} />
          </filter>
        </defs>

        {/* Outer subtle orbital guide ring */}
        <circle
          cx="22"
          cy="22"
          r="18"
          stroke={isLight ? 'rgba(255, 255, 255, 0.25)' : 'rgba(117, 65, 200, 0.15)'}
          strokeWidth="1.5"
          strokeDasharray="2 3"
        />

        {/* Dynamic Orbital Path Sweeping into Arrow */}
        <g filter={`url(#${gradId}-glow)`}>
          {/* Main sweeping orbital trajectory */}
          <path
            d="M 22 4 A 18 18 0 1 1 5 26.5"
            stroke={`url(#${gradId}-orbit)`}
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Directional Arrow Head at the apex of the orbit */}
          <path
            d="M 20 1.5 L 26 4 L 20 7.5 Z"
            fill={isLight ? '#FFFFFF' : '#7541C8'}
          />

          {/* Integrated S-shaped curved flow traversing through the sphere center */}
          <path
            d="M 26 12 C 18 12 15 17 21 21 C 28 25 25 32 16 32 C 12 32 9.5 29.5 9 27"
            stroke={`url(#${gradId}-s)`}
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Core pivot node representing connection & events hub */}
          <circle
            cx="21"
            cy="21"
            r="2.2"
            fill={isLight ? '#FFFFFF' : '#A855F7'}
          />
        </g>
      </svg>

      {/* Brand Wordmark (hidden if compact) */}
      {!compact && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <div
            style={{
              fontSize: currentDim.text,
              fontWeight: 700,
              color: textColor,
              letterSpacing: '-0.025em',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <span>Event</span>
            <span
              style={{
                fontWeight: 800,
                color: isLight ? '#FFFFFF' : 'var(--primary-purple, #7541C8)',
                marginLeft: 1
              }}
            >
              Sphere
            </span>
          </div>
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} style={{ textDecoration: 'none' }}>
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};
