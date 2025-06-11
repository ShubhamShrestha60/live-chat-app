import { useState } from 'react';
import axios from 'axios';
import './Auth.css';

export default function Login({ setToken, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <main className="auth-box" aria-label="Login form">
        <h1 className="auth-title">Welcome Back</h1>

        <form className="auth-form" onSubmit={handleLogin} noValidate>
          {error && (
            <div role="alert" aria-live="assertive" className="auth-error" tabIndex={-1}>
              {error}
            </div>
          )}

          <label htmlFor="email" className="auth-label">
            Email
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              disabled={loading}
              className="auth-input"
            />
          </label>

          <label htmlFor="password" className="auth-label">
            Password
            <input
              id="password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={loading}
              className="auth-input"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
            aria-busy={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{' '}
          <button
            type="button"
            className="auth-switch-link"
            onClick={onSwitchToRegister}
          >
            Register
          </button>
        </p>
      </main>
    </div>
  );
}
