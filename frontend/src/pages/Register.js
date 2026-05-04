import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '', full_name: '', department: '', year: '' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register({ ...form, year: parseInt(form.year) });
      navigate('/login');
    } catch (err) {
      setError('Registration failed.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="card p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 gradient-text">Create Account</h2>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="full_name" placeholder="Full Name" onChange={handleChange} className="input-field" required />
          <input name="username" placeholder="Username" onChange={handleChange} className="input-field" required />
          <input name="email" type="email" placeholder="Email" onChange={handleChange} className="input-field" required />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} className="input-field" required />
          <input name="department" placeholder="Department" onChange={handleChange} className="input-field" required />
          <input name="year" type="number" placeholder="Year (1-4)" onChange={handleChange} className="input-field" required />
          <button type="submit" className="btn-gradient w-full py-3">Register</button>
        </form>
        <p className="text-center mt-4 text-sm text-gray-600">Have account? <Link to="/login" className="text-primary-500 hover:underline">Login</Link></p>
      </div>
    </div>
  );
};

export default Register;
