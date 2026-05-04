# fix_auth_final.py
path = r'frontend\src\contexts\AuthContext.js'

new_content = """import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    console.log('Stored token:', token);
    console.log('Stored user:', userData);
    if (token && userData) {
      try { setUser(JSON.parse(userData)); } catch (e) {
        console.error('Parse error:', e);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    console.log('Logging in with:', email, password);
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    console.log('Login response:', response.data);
    
    const data = response.data;
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    toast.success('Welcome back!');
  };

  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    console.log('Register response:', response.data);
    toast.success('Registration successful! Please login.');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out');
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
};
"""

with open(path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print('AuthContext fixed with debug logs!')