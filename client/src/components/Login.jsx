import { useState } from 'react';
import axios from 'axios';
import './Auth.css';

export default function Login({ setToken, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">Welcome Back</h2>
        <form className="auth-form" onSubmit={handleLogin}>
          {error && <div className="auth-error">{error}</div>}
          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="auth-button" type="submit">
            Sign In
          </button>
        </form>
        <div className="auth-switch">
          Don't have an account?{' '}
          <span className="auth-switch-link" onClick={onSwitchToRegister}>
            Register
          </span>
        </div>
      </div>
    </div>
  );
}
