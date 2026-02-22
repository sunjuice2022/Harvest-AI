/** Sign-up page — glassmorphism card with name, email, password, confirm-password form. */

import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import styles from './SignUpPage.module.css';

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function SignUpPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);

    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (!email || !validateEmail(email)) { setError('Please enter a valid email address.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      await signUp(name.trim(), email, password);
      void navigate('/');
    } catch {
      setError('Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link to="/" className={styles.logo}>
          <span>🌾</span>
          <span className={styles.logoText}>Harvest <span className={styles.logoAccent}>AI</span></span>
        </Link>

        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>Start growing smarter with AI-powered tools</p>

        <form onSubmit={(e) => void handleSubmit(e)} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>Full Name</label>
            <input
              id="name" type="text" autoComplete="name"
              placeholder="John Farmer"
              value={name} onChange={(e) => setName(e.target.value)}
              className={styles.input} disabled={loading}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              id="email" type="email" autoComplete="email"
              placeholder="farmer@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className={styles.input} disabled={loading}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              id="password" type="password" autoComplete="new-password"
              placeholder="Min. 8 characters"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className={styles.input} disabled={loading}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="confirm" className={styles.label}>Confirm Password</label>
            <input
              id="confirm" type="password" autoComplete="new-password"
              placeholder="••••••••"
              value={confirm} onChange={(e) => setConfirm(e.target.value)}
              className={styles.input} disabled={loading}
            />
          </div>

          {error && <p className={styles.error} role="alert">{error}</p>}

          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className={styles.switchText}>
          Already have an account?{' '}
          <Link to="/login" className={styles.switchLink}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
