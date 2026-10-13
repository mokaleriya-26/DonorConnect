import React from 'react';

export const EventStatusBadge = ({ status }) => {
  let styleClass = 'badge-gray';
  let label = status;

  switch (status) {
    case 'published':
      styleClass = 'badge-mint';
      label = 'Published';
      break;
    case 'draft':
      styleClass = 'badge-amber';
      label = 'Draft';
      break;
    case 'cancelled':
      styleClass = 'badge-red';
      label = 'Cancelled';
      break;
    case 'past':
      styleClass = 'badge-gray';
      label = 'Past Event';
      break;
    default:
      styleClass = 'badge-lavender';
      label = status;
  }

  return (
    <span className={`badge-pill ${styleClass}`}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
      {label}
    </span>
  );
};

export const CategoryPill = ({ name, variant = 'corporate' }) => {
  // Variations inspired by the screenshot: Corporate, Entertainment, Cultural, Promotion, etc.
  let cls = 'badge-lavender';
  const lower = (name || '').toLowerCase();

  if (lower.includes('corporate') || lower.includes('tech') || lower.includes('business')) {
    cls = 'badge-blue';
  } else if (lower.includes('entertainment') || lower.includes('music') || lower.includes('concert')) {
    cls = 'badge-lavender';
  } else if (lower.includes('cultural') || lower.includes('art')) {
    cls = 'badge-mint';
  } else if (lower.includes('promotion') || lower.includes('sale') || lower.includes('food')) {
    cls = 'badge-amber';
  } else if (lower.includes('adventure') || lower.includes('sport')) {
    cls = 'badge-mint';
  }

  return (
    <span className={`badge-pill ${cls}`} style={{ fontSize: '0.72rem', padding: '3px 10px' }}>
      {name}
    </span>
  );
};
