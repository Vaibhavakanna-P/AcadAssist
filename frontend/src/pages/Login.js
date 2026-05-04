import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Login failed. Check credentials.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="card p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 gradient-text">Welcome Back!</h2>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Email/Username</label><input type="text" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" required /></div>
          <div><label className="block text-sm font-medium mb-1">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" required /></div>
          <button type="submit" className="btn-gradient w-full py-3">Login</button>
        </form>
        <p className="text-center mt-4 text-sm text-gray-600">No account? <Link to="/register" className="text-primary-500 hover:underline">Register</Link></p>
      </div>
    </div>
  );
};

export default Login;
