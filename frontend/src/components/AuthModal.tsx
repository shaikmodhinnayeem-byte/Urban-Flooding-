import React, { useState } from 'react';
import { X, Shield, User, LifeBuoy, Users, CheckCircle2, Lock, Mail } from 'lucide-react';
import { apiClient } from '../services/api';
import { User as UserType } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserType) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('USER');
  const [department, setDepartment] = useState('Citizen / Public');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isRegister) {
        await apiClient.post('/auth/register', {
          email,
          password,
          full_name: fullName,
          role,
          department,
        });
      }
      const data = await apiClient.post('/auth/login', { email, password });
      apiClient.setToken(data.access_token);
      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (quickEmail: string, quickPass: string) => {
    setError(null);
    setLoading(true);
    try {
      const data = await apiClient.post('/auth/login', { email: quickEmail, password: quickPass });
      apiClient.setToken(data.access_token);
      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div>
            <h3 className="font-extrabold text-lg text-white font-['Outfit'] flex items-center gap-2">
              <span>DRAIN-X Authorization</span>
            </h3>
            <p className="text-xs text-slate-400">Role-based Access for Chennai Disaster Control</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Quick Demo Sign-In Buttons */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-2">
              ⚡ 1-Click Evaluation Accounts
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@drainx.gov.in', 'Admin@123')}
                disabled={loading}
                className="flex items-center gap-2 p-2.5 bg-purple-950/50 hover:bg-purple-900/60 border border-purple-700/60 rounded-xl text-left transition group"
              >
                <Shield className="w-4 h-4 text-purple-400 shrink-0 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="text-xs font-bold text-purple-200">Admin Command</div>
                  <div className="text-[10px] text-purple-300">TNSDMA Lead</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('user@chennaicorp.gov.in', 'User@123')}
                disabled={loading}
                className="flex items-center gap-2 p-2.5 bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-700/60 rounded-xl text-left transition group"
              >
                <User className="w-4 h-4 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="text-xs font-bold text-cyan-200">Zonal Engineer</div>
                  <div className="text-[10px] text-cyan-300">GCC Ward 179</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('rescue.lead@ndrf.gov.in', 'Rescue@123')}
                disabled={loading}
                className="flex items-center gap-2 p-2.5 bg-amber-950/50 hover:bg-amber-900/60 border border-amber-700/60 rounded-xl text-left transition group"
              >
                <LifeBuoy className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="text-xs font-bold text-amber-200">NDRF Rescue</div>
                  <div className="text-[10px] text-amber-300">4th Battalion</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('citizen@chennai.in', 'Citizen@123')}
                disabled={loading}
                className="flex items-center gap-2 p-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-left transition group"
              >
                <Users className="w-4 h-4 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="text-xs font-bold text-slate-200">Citizen / Public</div>
                  <div className="text-[10px] text-slate-400">Resident Lead</div>
                </div>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-800"></div>
            <span className="text-[11px] text-slate-400 uppercase font-medium">Or enter credentials</span>
            <div className="h-px flex-1 bg-slate-800"></div>
          </div>

          {error && (
            <div className="p-3 bg-red-950/80 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name & Title</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Er. Anbarasu K"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@drainx.gov.in"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/20 transition active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : isRegister ? 'Register Account' : 'Sign In'}
            </button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs text-cyan-400 hover:underline"
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
