
import React, { useState } from 'react';
import { User } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
  onSwitchToRegister: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // --- ADMIN LOGIN LOGIC ---
    if (email === 'abc' && password === '1245') {
      const adminUser: User = {
        id: 'admin_master',
        name: 'Master Admin',
        email: 'admin@officebu.com',
        isAdmin: true
      };
      onLogin(adminUser);
      return;
    }

    // --- STANDARD USER LOGIN LOGIC ---
    const storedUsers = localStorage.getItem('officeBuApp_users');
    const users: (User & { password: string })[] = storedUsers ? JSON.parse(storedUsers) : [];

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      // Login success
      onLogin({ id: user.id, name: user.name, email: user.email });
    } else {
      setError('Invalid credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-4xl w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Panel: Branding */}
        <div className="md:w-1/2 bg-gradient-to-br from-emerald-600 to-teal-700 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-building text-white"></i>
                </div>
                <span className="font-bold tracking-widest text-sm uppercase opacity-80">Office Portal</span>
            </div>
            <h1 className="text-4xl font-extrabold leading-tight mb-4">Manage your office expenses efficiently.</h1>
            <p className="text-emerald-100 text-lg">Track tea, coffee, and snacks with the all-new Office BU App.</p>
          </div>
          
          <div className="relative z-10 mt-12">
             <div className="flex gap-2">
                <div className="h-1 w-8 bg-white rounded-full"></div>
                <div className="h-1 w-2 bg-white/30 rounded-full"></div>
                <div className="h-1 w-2 bg-white/30 rounded-full"></div>
             </div>
          </div>
        </div>

        {/* Right Panel: Form */}
        <div className="md:w-1/2 p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
            <p className="text-gray-500">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
              <input 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            
            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

            <button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/30 transition-all active:scale-95"
            >
              Sign In
            </button>
          </form>

          <p className="mt-8 text-center text-gray-500">
            Don't have an account?{' '}
            <button onClick={onSwitchToRegister} className="text-emerald-600 font-bold hover:underline">
              Create free account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
