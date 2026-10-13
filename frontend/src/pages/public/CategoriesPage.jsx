import React from 'react';
import { Link } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';
import { eventService } from '../../services/eventService';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { ArrowRight, Layers, Sparkles } from 'lucide-react';

export const CategoriesPage = () => {
  const categories = categoryService.getActiveCategories();
  const allEvents = eventService.getPublicEvents();

  return (
    <div className="app-container" style={{ padding: '48px 24px 80px 24px' }}>
      <div style={{ textAlign: 'center', maxWidth: 650, margin: '0 auto 48px auto' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--accent-lavender)',
            color: 'var(--dark-purple)',
            padding: '4px 14px',
            borderRadius: 9999,
            fontSize: '0.82rem',
            fontWeight: 600,
            marginBottom: 14
          }}
        >
          <Layers size={14} /> EXPLORE BY THEME
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: 12 }}>
          Event Categories
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
          Discover festivals, summits, masterclasses and sports challenges categorized for easy browsing.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 24
        }}
      >
        {categories.map((cat) => {
          const count = allEvents.filter(e => e.categoryId === cat.id).length;

          return (
            <Link
              key={cat.id}
              to={`/categories/${cat.slug}`}
              className="card-surface"
              style={{
                borderRadius: 20,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.25s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              {/* Category Cover Image Header */}
              <div style={{ position: 'relative', height: 140, overflow: 'hidden' }}>
                <img
                  src={cat.coverImage}
                  alt={cat.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 100%)'
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 12,
                    left: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: cat.color || 'var(--primary-purple)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                    }}
                  >
                    <CategoryIcon name={cat.iconName} size={18} />
                  </div>
                  <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '1.05rem', textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
                    {cat.name}
                  </span>
                </div>
              </div>

              {/* Description & Count */}
              <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: 16, flex: 1 }}>
                  {cat.shortDescription}
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 14,
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.85rem'
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--primary-purple)' }}>
                    {count} active {count === 1 ? 'event' : 'events'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)', fontWeight: 500 }}>
                    Browse <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
