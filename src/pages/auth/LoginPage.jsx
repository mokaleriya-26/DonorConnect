import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DEMO_PASSWORD } from '../../services/mockAuthService';
import { EventSphereLogo } from '../../components/common/EventSphereLogo';
import {
  Eye,
  EyeOff,
  LogIn,
  Building2,
  User,
  Shield,
  ArrowRight
} from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect');

  const { login, demoAccounts } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const navigateAfterLogin = (loggedUser) => {
    if (redirectTarget) {
      navigate(redirectTarget);
      return;
    }
    if (loggedUser.role === 'organizer') navigate('/organizer/events');
    else if (loggedUser.role === 'admin') navigate('/admin/dashboard');
    else navigate('/attendee/dashboard');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const loggedUser = await login(email, password);
      showToast(`Welcome back, ${loggedUser.name}!`, 'success');
      navigateAfterLogin(loggedUser);
    } catch (err) {
      setError(err.message || 'Login failed.');
      showToast(err.message || 'Login failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    setError('');
    setIsSubmitting(true);
    try {
      const loggedUser = await login(demoEmail, DEMO_PASSWORD);
      showToast(`Logged in as ${loggedUser.role.toUpperCase()}: ${loggedUser.name}`, 'success');
      navigateAfterLogin(loggedUser);
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 180px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div
        className="card-surface"
        style={{
          width: '100%',
          maxWidth: 480,
          borderRadius: 24,
          padding: '40px 36px',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <EventSphereLogo size="lg" variant="dark" to="/" />
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: 6 }}>
            Welcome to EventSphere
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            {redirectTarget
              ? 'Sign in to complete your event registration.'
              : 'Sign in to access your dashboard, bookings or published events.'}
          </p>
        </div>

        {/* Demo Fast Access Box */}
        <div
          style={{
            background: 'var(--accent-lavender)',
            borderRadius: 16,
            padding: '16px',
            marginBottom: 24,
            border: '1px solid rgba(117, 65, 200, 0.2)'
          }}
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--dark-purple)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
            ⚡ 1-Click Demo Accounts
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('organizer@eventsphere.demo')}
              style={{
                background: '#FFFFFF',
                borderRadius: 10,
                padding: '8px 6px',
                textAlign: 'center',
                border: '1px solid #D8B4FE',
                color: 'var(--dark-purple)',
                fontWeight: 600,
                fontSize: '0.78rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4
              }}
            >
              <Building2 size={16} /> Organizer
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('attendee@eventsphere.demo')}
              style={{
                background: '#FFFFFF',
                borderRadius: 10,
                padding: '8px 6px',
                textAlign: 'center',
                border: '1px solid #D8B4FE',
                color: 'var(--dark-purple)',
                fontWeight: 600,
                fontSize: '0.78rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4
              }}
            >
              <User size={16} /> Attendee
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin@eventsphere.demo')}
              style={{
                background: '#FFFFFF',
                borderRadius: 10,
                padding: '8px 6px',
                textAlign: 'center',
                border: '1px solid #D8B4FE',
                color: 'var(--dark-purple)',
                fontWeight: 600,
                fontSize: '0.78rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4
              }}
            >
              <Shield size={16} /> Admin
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              background: '#FEE2E2',
              color: '#B91C1C',
              padding: '10px 14px',
              borderRadius: 12,
              fontSize: '0.86rem',
              marginBottom: 18
            }}
          >
            {error}
          </div>
        )}

        {/* Regular Login Form */}
        <form onSubmit={handleLoginSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label className="form-label">Email Address</label>
            <input
              type="email"
              placeholder="e.g. organizer@eventsphere.demo"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Demo: EventSphere123!</span>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-secondary)'
                }}
                aria-label="Toggle password view"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '0.96rem', marginBottom: 20 }}
          >
            <LogIn size={16} />
            <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary-purple)', fontWeight: 700 }}>
            Sign up now
          </Link>
        </div>
      </div>
    </div>
  );
};
