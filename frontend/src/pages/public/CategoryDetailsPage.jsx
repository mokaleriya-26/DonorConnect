import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';
import { eventService } from '../../services/eventService';
import { EventCard } from '../../components/events/EventCard';
import { EmptyState } from '../../components/common/EmptyState';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { ArrowLeft, Search, Filter } from 'lucide-react';

export const CategoryDetailsPage = () => {
  const { slug } = useParams();
  const category = categoryService.getCategoryBySlug(slug);

  const [search, setSearch] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');

  if (!category) {
    return (
      <div className="app-container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 12 }}>
          Category Not Found
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
          The requested category does not exist or has been modified.
        </p>
        <Link to="/categories" className="btn-primary">
          <ArrowLeft size={16} /> Return to All Categories
        </Link>
      </div>
    );
  }

  // Get events in this category
  const allEvents = eventService.getPublicEvents().filter(e => e.categoryId === category.id);
  const filteredEvents = allEvents.filter(e => {
    const matchesSearch = !search.trim() ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.city.toLowerCase().includes(search.toLowerCase());
    const matchesPrice = priceFilter === 'all' || e.priceType === priceFilter;
    return matchesSearch && matchesPrice;
  });

  return (
    <div className="app-container" style={{ padding: '36px 24px 80px 24px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
        <Link to="/categories" style={{ color: 'var(--text-secondary)' }}>Categories</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{category.name}</span>
      </div>

      {/* Category Hero Banner */}
      <div
        style={{
          position: 'relative',
          borderRadius: 24,
          overflow: 'hidden',
          padding: '48px 36px',
          background: 'linear-gradient(135deg, var(--dark-purple) 0%, var(--primary-purple) 100%)',
          color: '#FFFFFF',
          marginBottom: 36,
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 12 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}
          >
            <CategoryIcon name={category.iconName} size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
              {category.name}
            </h1>
          </div>
        </div>
        <p style={{ fontSize: '1.05rem', color: 'rgba(255, 255, 255, 0.9)', maxWidth: 650, lineHeight: 1.6 }}>
          {category.shortDescription}
        </p>
      </div>

      {/* Filter Controls */}
      <div
        className="card-surface"
        style={{
          padding: '14px 20px',
          borderRadius: 16,
          marginBottom: 28,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 240 }}>
          <Search size={18} color="var(--primary-purple)" />
          <input
            type="text"
            placeholder={`Search within ${category.name}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.92rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Price:</span>
          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            className="form-control"
            style={{ padding: '6px 14px', width: 'auto', borderRadius: 9999, fontSize: '0.85rem' }}
          >
            <option value="all">All Prices</option>
            <option value="free">Free Events</option>
            <option value="paid">Paid Events</option>
          </select>
        </div>
      </div>

      {/* Event List */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          title={`No events found in ${category.name}`}
          description="There are currently no matching events for this search. Check back soon or explore other categories!"
          actionText="Browse All Events"
          onAction={() => window.location.assign('/events')}
        />
      ) : (
        <div className="grid-4">
          {filteredEvents.map(evt => (
            <EventCard key={evt.id} event={evt} />
          ))}
        </div>
      )}
    </div>
  );
};
