import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { userService } from '../../services/userService';
import { categoryService } from '../../services/categoryService';
import {
  Users,
  Calendar,
  CheckCircle2,
  Layers,
  Shield,
  TrendingUp,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export const AdminDashboard = () => {
  const allEvents = eventService.getAllEvents();
  const allUsers = userService.getAllUsers();
  const allCategories = categoryService.getAllCategories();

  const metrics = useMemo(() => {
    const totalUsers = allUsers.length;
    const totalEvents = allEvents.length;
    const published = allEvents.filter(e => e.status === 'published').length;
    const totalRegistrations = allEvents.reduce((acc, e) => acc + (e.registeredCount || 0), 0);
    const organizersCount = allUsers.filter(u => u.role === 'organizer').length;
    const attendeesCount = allUsers.filter(u => u.role === 'attendee').length;

    return { totalUsers, totalEvents, published, totalRegistrations, organizersCount, attendeesCount };
  }, [allEvents, allUsers]);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
          Platform Administration
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: 2 }}>
          Global oversight of registered users, event moderation, and category taxonomy.
        </p>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        <div className="card-surface" style={{ padding: '22px 24px', borderRadius: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>TOTAL USERS</span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-lavender)', color: 'var(--dark-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {metrics.totalUsers}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            {metrics.organizersCount} hosts, {metrics.attendeesCount} attendees
          </div>
        </div>

        <div className="card-surface" style={{ padding: '22px 24px', borderRadius: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>PLATFORM EVENTS</span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-blue)', color: 'var(--accent-blue-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {metrics.totalEvents}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            {metrics.published} live published
          </div>
        </div>

        <div className="card-surface" style={{ padding: '22px 24px', borderRadius: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>TOTAL REGISTRATIONS</span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-mint)', color: 'var(--accent-mint-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {metrics.totalRegistrations}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 600, marginTop: 4 }}>
            Across all events
          </div>
        </div>

        <div className="card-surface" style={{ padding: '22px 24px', borderRadius: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>CATEGORIES</span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-amber)', color: 'var(--accent-amber-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {allCategories.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Active taxonomies
          </div>
        </div>
      </div>

      {/* Quick Navigation Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        <Link
          to="/admin/events"
          className="card-surface"
          style={{ padding: '24px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 16 }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent-lavender)', color: 'var(--dark-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Calendar size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 2px 0' }}>Moderate Events</h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Review, unpublish or cancel</span>
          </div>
        </Link>

        <Link
          to="/admin/users"
          className="card-surface"
          style={{ padding: '24px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 16 }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent-blue)', color: 'var(--accent-blue-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Users size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 2px 0' }}>Manage Users</h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>View roles & suspend accounts</span>
          </div>
        </Link>

        <Link
          to="/admin/categories"
          className="card-surface"
          style={{ padding: '24px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 16 }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent-mint)', color: 'var(--accent-mint-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Layers size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 2px 0' }}>Taxonomies</h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Add, edit & organize categories</span>
          </div>
        </Link>
      </div>

      {/* Recent Platform Events Table */}
      <div className="card-surface" style={{ borderRadius: 22, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Latest Events on Platform
          </h3>
          <Link to="/admin/events" style={{ fontSize: '0.85rem', color: 'var(--primary-purple)', fontWeight: 600 }}>
            View All ({allEvents.length})
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '14px 24px', fontWeight: 600 }}>Title</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Organizer</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '14px 24px', fontWeight: 600, textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {allEvents.slice(0, 6).map(e => (
                <tr key={e.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '14px 24px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {e.title}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                    {e.organizerName}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                    {e.categoryName}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className={`badge-pill ${e.status === 'published' ? 'badge-mint' : e.status === 'draft' ? 'badge-amber' : 'badge-red'}`}>
                      {e.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                    <Link to={`/events/${e.id}`} className="btn-secondary" style={{ padding: '5px 12px', fontSize: '0.78rem' }}>
                      Inspect
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
