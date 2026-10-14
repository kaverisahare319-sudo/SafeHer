import React, { useState } from 'react';
import { Eye, EyeOff, Lock, ShieldCheck, Upload, MailCheck, Clock, XCircle, ArrowLeft } from 'lucide-react';
import { api } from '../utils/api';
import { COLLEGE_NAME } from '../config';
import { AdminLogin } from './admin/AdminLogin';

const inputCls = (err) =>
  `w-full h-11 bg-[#0D0E20] border rounded-xl text-[#F4F2FA] text-sm px-3.5 outline-none transition-all ${
    err ? 'border-[#FF5D73]' : 'border-[#2C2F55] focus:border-[#FF5D73] focus:ring-2 focus:ring-[#FF5D73]/20'
  }`;

function Field({ label, error, children }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-medium text-[#9491B4] mb-1.5">{label}</label>
      {children}
      {error && <div className="text-xs text-[#FF5D73] mt-1">{error}</div>}
    </div>
  );
}

// Shrinks the ID photo so it uploads fast on mobile data.
async function fileToDataUrl(file) {
  const img = await new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = URL.createObjectURL(file);
  });
  const scale = Math.min(1, 1280 / Math.max(img.width, img.height));
  const c = document.createElement('canvas');
  c.width = Math.round(img.width * scale);
  c.height = Math.round(img.height * scale);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.8);
}

export function AuthScreen({ onLogin }) {
  const [isAdminMode, setIsAdminMode] = useState(() => {
    return window.location.hash === '#admin' || window.location.search.includes('portal=admin');
  });
  // 'signin' | 'signup' | 'verify' | 'forgot' | 'reset' | 'status'
  const [mode, setMode] = useState('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [idCard, setIdCard] = useState(null);
  const [declaration, setDeclaration] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [info, setInfo] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [statusScreen, setStatusScreen] = useState(null); // { kind: 'pending' | 'rejected', text }
  const [isLoading, setIsLoading] = useState(false);

  const go = (m) => { setMode(m); setErrors({}); setFormError(''); setInfo(''); };

  const pickFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) { setErrors(p => ({ ...p, idCard: 'Please choose a photo (JPG/PNG).' })); return; }
    try {
      setIdCard(await fileToDataUrl(f));
      setErrors(p => ({ ...p, idCard: '' }));
    } catch { setErrors(p => ({ ...p, idCard: 'Could not read this image.' })); }
  };

  const call = async (fn) => {
    setIsLoading(true); setFormError('');
    try { await fn(); } catch { setFormError('Could not reach the server. Check your internet and try again.'); }
    finally { setIsLoading(false); }
  };

  const submitSignin = () => {
    const er = {};
    if (!email.trim()) er.email = 'Enter your email.';
    if (!password) er.password = 'Enter your password.';
    setErrors(er); if (Object.keys(er).length) return;
    call(async () => {
      const { ok, data } = await api('/api/auth/login', { method: 'POST', body: { email: email.trim(), password } });
      if (ok && data.token) { localStorage.setItem('token', data.token); onLogin({ ...data.user, token: data.token }); return; }
      if (data.code === 'EMAIL_NOT_VERIFIED') {
        await api('/api/auth/resend-otp', { method: 'POST', body: { email: email.trim() } }).then(r => setDevOtp(r.data.devOtp || ''));
        go('verify'); setInfo('Verify your email first. We sent you a new code.'); return;
      }
      if (data.code === 'PENDING_APPROVAL') { setStatusScreen({ kind: 'pending', text: data.message }); go('status'); return; }
      if (data.code === 'REJECTED') { setStatusScreen({ kind: 'rejected', text: data.message }); go('status'); return; }
      setFormError(data.message || 'Invalid email or password.');
    });
  };

  const submitSignup = () => {
    const er = {};
    if (!name.trim()) er.name = 'Enter your full name (as on your ID card).';
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) er.email = 'Enter a valid email.';
    if (!/^\+?[0-9 ]{10,15}$/.test(phone.trim())) er.phone = 'Enter a valid phone number.';
    if (password.length < 8) er.password = 'At least 8 characters.';
    if (password !== confirmPassword) er.confirm = 'Passwords do not match.';
    if (!idCard) er.idCard = 'Upload a photo of your college ID card.';
    if (!declaration) er.declaration = 'Please confirm to continue.';
    setErrors(er); if (Object.keys(er).length) return;
    call(async () => {
      const { ok, data } = await api('/api/auth/signup', {
        method: 'POST',
        body: { name: name.trim(), email: email.trim(), phone: phone.trim(), password, idCardImage: idCard, declaration }
      });
      if (ok) { setDevOtp(data.devOtp || ''); go('verify'); setInfo(`We emailed a 6-digit code to ${email.trim()}.`); }
      else setFormError(data.message || 'Signup failed. Please try again.');
    });
  };

  const submitVerify = () => {
    if (!/^\d{6}$/.test(otp.trim())) { setErrors({ otp: 'Enter the 6-digit code.' }); return; }
    call(async () => {
      const { ok, data } = await api('/api/auth/verify-email', { method: 'POST', body: { email: email.trim(), otp: otp.trim() } });
      if (ok) {
        setStatusScreen({ kind: 'pending', text: 'Email verified. The admin will check your college ID card and approve your account. Please try signing in later.' });
        go('status');
      } else setFormError(data.message || 'Could not verify.');
    });
  };

  const resend = () => call(async () => {
    const { data } = await api('/api/auth/resend-otp', { method: 'POST', body: { email: email.trim() } });
    setDevOtp(data.devOtp || ''); setInfo('A new code was sent.');
  });

  const submitForgot = () => {
    if (!email.trim()) { setErrors({ email: 'Enter your email.' }); return; }
    call(async () => {
      const { data } = await api('/api/auth/forgot-password', { method: 'POST', body: { email: email.trim() } });
      setDevOtp(data.devOtp || ''); go('reset'); setInfo('If this email is registered, a reset code was sent.');
    });
  };

  const submitReset = () => {
    const er = {};
    if (!/^\d{6}$/.test(otp.trim())) er.otp = 'Enter the 6-digit code.';
    if (password.length < 8) er.password = 'At least 8 characters.';
    setErrors(er); if (Object.keys(er).length) return;
    call(async () => {
      const { ok, data } = await api('/api/auth/reset-password', { method: 'POST', body: { email: email.trim(), otp: otp.trim(), newPassword: password } });
      if (ok) { setPassword(''); setOtp(''); go('signin'); setInfo('Password updated. Please sign in.'); }
      else setFormError(data.message || 'Could not reset password.');
    });
  };

  const titles = {
    signin: ['Welcome back', 'Sign in to your campus safety circle.'],
    signup: ['Join SafeHer', `Only for female students of ${COLLEGE_NAME}. Your ID card is checked by the admin.`],
    verify: ['Verify your email', 'Enter the code we sent to your email.'],
    forgot: ['Forgot password', 'We will email you a reset code.'],
    reset: ['Reset password', 'Enter the code and choose a new password.'],
    status: ['Almost there', '']
  };
  const onSubmit = (e) => {
    e.preventDefault();
    ({ signin: submitSignin, signup: submitSignup, verify: submitVerify, forgot: submitForgot, reset: submitReset }[mode] || (() => {}))();
  };

  const btnLabel = { signin: 'Sign in', signup: 'Create account', verify: 'Verify email', forgot: 'Send reset code', reset: 'Update password' }[mode];

  if (isAdminMode) {
    return (
      <AdminLogin
        onLogin={onLogin}
        onBackToStudent={() => {
          setIsAdminMode(false);
          if (window.location.hash === '#admin') {
            window.history.replaceState(null, '', window.location.pathname);
          }
        }}
      />
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-x-hidden bg-[#12142A]">
      <div className="stars" />
      <div className="beacon-field" aria-hidden="true"><div className="ring ring--1" /><div className="ring ring--2" /><div className="ring ring--3" /></div>

      <div className="relative z-10 w-full max-w-[400px]">
        <div className="flex flex-col items-center gap-3 mb-6 text-center">
          <div className="w-[52px] h-[52px] rounded-full bg-[#1B1E3D] border border-[#2C2F55] flex items-center justify-center shadow-[0_0_20px_rgba(255,93,115,0.2)]">
            <div className="w-3.5 h-3.5 rounded-full bg-[#FF5D73] shadow-[0_0_0_4px_rgba(255,93,115,0.22)] animate-pulse" />
          </div>
          <div className="font-['Space_Grotesk'] font-bold text-3xl tracking-tight text-[#F4F2FA]">
            Safe<span className="text-[#FF5D73] drop-shadow-[0_0_12px_rgba(255,93,115,0.4)]">Her</span>
          </div>
          <div className="text-xs text-[#9491B4] tracking-wide font-medium">Campus safety app for girls</div>
        </div>

        <div className="bg-[#1B1E3D] border border-[#2C2F55] rounded-3xl p-7 shadow-2xl">
          {['verify', 'forgot', 'reset'].includes(mode) && (
            <button onClick={() => go('signin')} className="flex items-center gap-1 text-xs text-[#9491B4] hover:text-white mb-3">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
            </button>
          )}
          <h1 className="font-['Space_Grotesk'] text-xl font-semibold text-[#F4F2FA] mb-1">{titles[mode][0]}</h1>
          <p className="text-[13px] text-[#9491B4] mb-5">{titles[mode][1]}</p>

          {mode === 'status' ? (
            <div className="text-center py-3 space-y-4">
              {statusScreen?.kind === 'rejected'
                ? <XCircle className="w-12 h-12 text-[#FF5D73] mx-auto" />
                : <Clock className="w-12 h-12 text-amber-400 mx-auto" />}
              <p className="text-sm text-[#F4F2FA]">{statusScreen?.text}</p>
              <button onClick={() => go('signin')} className="w-full h-11 rounded-xl bg-[#FF5D73] text-[#2A0A10] font-semibold text-sm">Back to sign in</button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              {info && <div className="mb-4 p-3 bg-[#33D6A6]/10 border border-[#33D6A6]/40 rounded-xl text-xs text-[#33D6A6]">{info}</div>}
              {devOtp && <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/40 rounded-xl text-xs text-amber-300">Test mode (email not configured): your code is <b>{devOtp}</b></div>}
              {formError && <div className="mb-4 p-3 bg-[#FF5D73]/10 border border-[#FF5D73] rounded-xl text-xs text-[#FF5D73] font-medium">{formError}</div>}

              {mode === 'signup' && (
                <Field label="Full name (as on ID card)" error={errors.name}>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" className={inputCls(errors.name)} />
                </Field>
              )}

              {['signin', 'signup', 'forgot', 'verify', 'reset'].includes(mode) && (
                <Field label={mode === 'signup' ? 'College email' : 'Email'} error={errors.email}>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@college.edu" autoComplete="username"
                    readOnly={mode === 'verify' || mode === 'reset'} className={inputCls(errors.email)} />
                </Field>
              )}

              {mode === 'signup' && (
                <Field label="Phone number" error={errors.phone}>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="10-digit mobile number" className={inputCls(errors.phone)} />
                </Field>
              )}

              {(mode === 'verify' || mode === 'reset') && (
                <Field label="6-digit code" error={errors.otp}>
                  <input type="text" inputMode="numeric" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456" className={`${inputCls(errors.otp)} tracking-[0.4em] text-center font-['JetBrains_Mono']`} />
                </Field>
              )}

              {['signin', 'signup', 'reset'].includes(mode) && (
                <Field label={mode === 'reset' ? 'New password' : 'Password'} error={errors.password}>
                  <div className="relative flex items-center">
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                      placeholder={mode === 'signin' ? 'Enter your password' : 'At least 8 characters'}
                      autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} className={`${inputCls(errors.password)} pr-11`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password"
                      className="absolute right-3 p-1.5 text-[#635F87] hover:text-[#9491B4]">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </Field>
              )}

              {mode === 'signup' && (
                <>
                  <Field label="Confirm password" error={errors.confirm}>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter password" autoComplete="new-password" className={inputCls(errors.confirm)} />
                  </Field>

                  <Field label="College ID card photo" error={errors.idCard}>
                    <label className={`flex items-center gap-3 p-3 rounded-xl border border-dashed cursor-pointer ${errors.idCard ? 'border-[#FF5D73]' : 'border-[#3B3F72] hover:border-[#FF5D73]'} bg-[#0D0E20]`}>
                      {idCard ? <img src={idCard} alt="ID preview" className="w-16 h-11 object-cover rounded-md" /> : <Upload className="w-5 h-5 text-[#9491B4]" />}
                      <span className="text-xs text-[#9491B4]">{idCard ? 'Tap to change photo' : 'Tap to upload a clear photo of your ID card'}</span>
                      <input type="file" accept="image/*" capture="environment" onChange={pickFile} className="hidden" />
                    </label>
                    <p className="text-[11px] text-[#635F87] mt-1.5">Only the admin sees it, only to verify you. It is deleted right after approval or rejection.</p>
                  </Field>

                  <label className="flex items-start gap-2 text-xs text-[#9491B4] mb-4 cursor-pointer">
                    <input type="checkbox" checked={declaration} onChange={e => setDeclaration(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#FF5D73]" />
                    <span>I confirm that I am a female student of {COLLEGE_NAME} and the details I gave are true. Fake accounts will be blocked.</span>
                  </label>
                  {errors.declaration && <div className="text-xs text-[#FF5D73] -mt-3 mb-3">{errors.declaration}</div>}
                </>
              )}

              {mode === 'signin' && (
                <div className="flex justify-end mb-4 text-xs">
                  <button type="button" onClick={() => go('forgot')} className="text-[#9491B4] hover:text-white">Forgot password?</button>
                </div>
              )}

              <button type="submit" disabled={isLoading}
                className="w-full h-12 rounded-xl bg-[#FF5D73] hover:bg-[#ff7186] text-[#2A0A10] font-semibold text-sm shadow-[0_4px_16px_rgba(255,93,115,0.3)] disabled:opacity-70 flex items-center justify-center gap-2">
                {isLoading ? 'Please wait…' : btnLabel}
              </button>

              {mode === 'verify' && (
                <button type="button" onClick={resend} disabled={isLoading} className="w-full mt-3 text-xs text-[#33D6A6] hover:underline flex items-center justify-center gap-1.5">
                  <MailCheck className="w-3.5 h-3.5" /> Resend code
                </button>
              )}
            </form>
          )}

          {['signin', 'signup'].includes(mode) && (
            <p className="text-center text-xs text-[#9491B4] mt-5">
              {mode === 'signin' ? 'New here? ' : 'Already registered? '}
              <button onClick={() => go(mode === 'signin' ? 'signup' : 'signin')} className="text-[#33D6A6] font-medium hover:underline">
                {mode === 'signin' ? 'Create an account' : 'Sign in'}
              </button>
            </p>
          )}
        </div>

        <div className="flex flex-col items-center gap-3 mt-5 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-[#635F87]">
            <Lock className="w-3.5 h-3.5 flex-shrink-0" />
            <span>No background tracking. Location is shared only when you start an alert.</span>
          </div>

          <button
            type="button"
            onClick={() => setIsAdminMode(true)}
            className="inline-flex items-center gap-1.5 text-xs text-[#9491B4]/75 hover:text-[#FF5D73] transition-colors py-1.5 px-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-[#2C2F55] active:scale-95"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#FF5D73]" />
            <span>Campus Administration & Security Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
}
