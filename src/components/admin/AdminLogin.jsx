import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  AlertCircle, 
  Key, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { api } from '../../utils/api';
import { COLLEGE_NAME } from '../../config';

export function AdminLogin({ onLogin, onBackToStudent }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMessage('Please provide both your official administrator email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const { ok, status, data } = await api('/api/auth/login', {
        method: 'POST',
        body: { email: cleanEmail, password }
      });

      if (!ok || !data.token) {
        setErrorMessage(data.message || 'Authentication failed. Please verify your credentials.');
        return;
      }

      // Check if user has administrative rights
      if (data.user?.role !== 'admin') {
        setErrorMessage('Access Denied: This account does not have administrative privileges. Please use the Student Portal.');
        return;
      }

      // Store token and trigger login
      localStorage.setItem('token', data.token);
      setSuccessNotice('Credentials verified. Redirecting to Admin Command Center…');

      setTimeout(() => {
        onLogin({ ...data.user, token: data.token });
      }, 500);

    } catch (err) {
      setErrorMessage('Could not connect to the authentication server. Please check your network and backend status.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = () => {
    setEmail('admin@safeher.edu');
    setPassword('Admin@12345');
    setErrorMessage('');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-x-hidden bg-[#0e1022] font-['Outfit']">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-[#FF5D73]/15 to-[#33D6A6]/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="stars opacity-40 pointer-events-none" />

      <div className="relative z-10 w-full max-w-[440px]">
        {/* Top Header / Brand */}
        <div className="flex flex-col items-center gap-3 mb-6 text-center">
          <div className="relative">
            <div className="w-[60px] h-[60px] rounded-2xl bg-gradient-to-br from-[#1B1E3D] to-[#12142A] border border-[#3B3F72] flex items-center justify-center shadow-[0_0_30px_rgba(255,93,115,0.25)]">
              <ShieldCheck className="w-8 h-8 text-[#FF5D73]" />
            </div>
            <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-[#FF5D73] text-[9px] font-black tracking-wider text-[#2A0A10] uppercase shadow-md">
              ADMIN
            </div>
          </div>

          <div>
            <div className="font-['Space_Grotesk'] font-bold text-3xl tracking-tight text-[#F4F2FA]">
              Safe<span className="text-[#FF5D73] drop-shadow-[0_0_12px_rgba(255,93,115,0.4)]">Her</span>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#9491B4] ml-2 px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                Command
              </span>
            </div>
            <p className="text-xs text-[#9491B4] mt-1">
              Campus Safety Authority & Incident Response Portal
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#14162E]/90 backdrop-blur-xl border border-[#2C2F55] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle top indicator bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF5D73] via-[#8B5CF6] to-[#33D6A6]" />

          {/* Back button */}
          {onBackToStudent && (
            <button
              type="button"
              onClick={onBackToStudent}
              className="flex items-center gap-1.5 text-xs text-[#9491B4] hover:text-white transition-colors mb-4 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Back to Student Login</span>
            </button>
          )}

          <div className="mb-6">
            <h1 className="font-['Space_Grotesk'] text-xl font-bold text-[#F4F2FA]">
              Administrator Sign In
            </h1>
            <p className="text-xs text-[#9491B4] mt-1 leading-relaxed">
              Authorized personnel only. Access grants management of student verification, campus escorts, and incident reports for {COLLEGE_NAME}.
            </p>
          </div>

          {/* Success Banner */}
          {successNotice && (
            <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-[#FF5D73]/10 border border-[#FF5D73]/60 rounded-xl text-xs text-[#FF5D73] font-medium flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1 leading-snug">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email Field */}
            <div>
              <label 
                htmlFor="admin-email-input" 
                className="block text-xs font-semibold text-[#9491B4] uppercase tracking-wider mb-1.5"
              >
                Official Admin Email
              </label>
              <div className="relative flex items-center">
                <input
                  id="admin-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@safeher.edu"
                  autoComplete="email"
                  required
                  className="w-full h-11 bg-[#0D0E20] border border-[#2C2F55] focus:border-[#FF5D73] focus:ring-2 focus:ring-[#FF5D73]/20 rounded-xl text-[#F4F2FA] text-sm pl-10 pr-3.5 outline-none transition-all placeholder:text-[#535070]"
                />
                <Mail className="w-4 h-4 text-[#635F87] absolute left-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label 
                  htmlFor="admin-password-input" 
                  className="block text-xs font-semibold text-[#9491B4] uppercase tracking-wider"
                >
                  Password
                </label>
              </div>
              <div className="relative flex items-center">
                <input
                  id="admin-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  autoComplete="current-password"
                  required
                  className="w-full h-11 bg-[#0D0E20] border border-[#2C2F55] focus:border-[#FF5D73] focus:ring-2 focus:ring-[#FF5D73]/20 rounded-xl text-[#F4F2FA] text-sm pl-10 pr-11 outline-none transition-all placeholder:text-[#535070]"
                />
                <Lock className="w-4 h-4 text-[#635F87] absolute left-3.5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  className="absolute right-3 p-1.5 text-[#635F87] hover:text-[#9491B4] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick Fill Demo Helper */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[#635F87] text-[11px]">Default dev account configured?</span>
              <button
                type="button"
                onClick={handleQuickFill}
                className="text-[#33D6A6] hover:underline flex items-center gap-1 font-medium text-[11px]"
              >
                <Sparkles className="w-3 h-3" /> Quick fill default credentials
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#FF5D73] to-[#ff4760] hover:from-[#ff7186] hover:to-[#FF5D73] text-[#2A0A10] font-bold text-sm shadow-[0_4px_20px_rgba(255,93,115,0.35)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all mt-2 active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#2A0A10] border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating…</span>
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>Sign In as Administrator</span>
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-5 border-t border-[#2C2F55]/60 flex items-start gap-2.5 text-[11px] text-[#635F87]">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-400/80 mt-0.5" />
            <p className="leading-relaxed">
              All administrative logins are monitored and cryptographically authenticated. Unauthorized attempts are logged.
            </p>
          </div>
        </div>

        {/* Bottom Switcher */}
        {onBackToStudent && (
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={onBackToStudent}
              className="text-xs text-[#9491B4] hover:text-white transition-colors underline decoration-[#2C2F55] hover:decoration-white"
            >
              Are you a student? Switch to Student Registration & Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminLogin;
