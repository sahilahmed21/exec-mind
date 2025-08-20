// src/App.js
import React, { useState } from 'react';
import './App.css';
import apiService from './apiService';
import { ExecMindAgent } from './ExecMindAgent';

function App() {
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));

  const handleLogin = async (credentials) => {
    try {
      const { data } = await apiService.login(credentials);
      localStorage.setItem('authToken', data.token);
      setAuthToken(data.token);
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, message: error.response?.data?.error || "Login failed." };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setAuthToken(null);
  };

  if (!authToken) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <ExecMindAgent onLogout={handleLogout} />;
}


function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('marc@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const result = await onLogin({ email, password });
    if (!result.success) {
      setError(result.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-header">
          <h1>Welcome to ExecMind</h1>
          <p>Your AI-powered executive companion.</p>
        </div>
        <div className="login-input-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="login-input-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button" disabled={isLoading}>
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
        {error && <p className="login-error">{error}</p>}
      </form>
    </div>
  );
}

export default App;