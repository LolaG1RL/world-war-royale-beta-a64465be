import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { lovable } from '@/integrations/lovable/index';
import splashImage from '@/assets/world-war-royale-splash.png';
import { t, Language } from '@/lib/i18n';

const DeafIDLogin = () => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const lang = (localStorage.getItem('game_settings') ? JSON.parse(localStorage.getItem('game_settings')!).language : 'en') as Language;
  const T = (key: string) => t(key, lang);

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    const result = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
    });
    if (result?.error) {
      setError(result.error.message || 'Google sign-in failed');
    }
    setGoogleLoading(false);
  };

  const handleAppleSignIn = async () => {
    setError('');
    setAppleLoading(true);
    const result = await lovable.auth.signInWithOAuth('apple', {
      redirect_uri: window.location.origin,
    });
    if (result?.error) {
      setError(result.error.message || 'Apple sign-in failed');
    }
    setAppleLoading(false);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    } else {
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password);
      if (error) {
        setError(error);
      } else {
        setSignupSuccess(true);
      }
    }
    setLoading(false);
  };

  return (
    <div className="h-screen w-full max-w-md mx-auto flex flex-col bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={splashImage} alt="" className="w-full h-full object-cover opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220,30%,6%,0.8)] via-[hsl(220,25%,10%,0.9)] to-[hsl(220,30%,6%,0.95)]" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/20 border-2 border-primary/40 flex items-center justify-center mx-auto mb-3 shadow-[0_0_30px_hsl(38,90%,50%,0.2)]">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display font-black text-xl text-foreground tracking-wider">DEAF ID</h1>
          <p className="text-[10px] text-muted-foreground mt-1 tracking-widest uppercase">
            {mode === 'login' ? T('auth.sign_in_account') : T('auth.create_your_account')}
          </p>
        </motion.div>

        {signupSuccess ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="text-3xl mb-3">📧</div>
            <h2 className="font-display font-bold text-foreground text-base mb-1">{T('auth.check_email')}</h2>
            <p className="text-xs text-muted-foreground">{T('auth.confirmation_sent')} <span className="text-primary">{email}</span></p>
            <button onClick={() => { setSignupSuccess(false); setMode('login'); }} className="mt-4 text-xs text-primary font-bold">
              {T('auth.back_sign_in')}
            </button>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="w-full space-y-3"
          >
            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={T('auth.email')}
                required
                className="w-full bg-secondary border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={T('auth.password')}
                required
                className="w-full bg-secondary border border-border rounded-xl pl-10 pr-10 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="text-xs text-accent bg-accent/10 border border-accent/20 rounded-lg px-3 py-2">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-battle w-full text-sm disabled:opacity-50"
            >
              {loading ? '...' : mode === 'login' ? T('auth.sign_in').toUpperCase() : T('auth.create_account')}
            </button>

            <div className="relative flex items-center my-2">
              <div className="flex-1 border-t border-border" />
              <span className="px-3 text-[10px] text-muted-foreground uppercase">{T('auth.or')}</span>
              <div className="flex-1 border-t border-border" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-2 bg-secondary border border-border rounded-xl py-3 text-sm text-foreground font-bold hover:bg-secondary/80 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {googleLoading ? '...' : T('auth.sign_in_google')}
            </button>

            <button
              type="button"
              onClick={handleAppleSignIn}
              disabled={appleLoading}
              className="w-full flex items-center justify-center gap-2 bg-secondary border border-border rounded-xl py-3 text-sm text-foreground font-bold hover:bg-secondary/80 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              {appleLoading ? '...' : T('auth.sign_in_apple')}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
                className="text-xs text-muted-foreground"
              >
                {mode === 'login' ? T('auth.no_account') : T('auth.have_account')}
                <span className="text-primary font-bold">{mode === 'login' ? T('auth.sign_up') : T('auth.sign_in')}</span>
              </button>
            </div>
          </motion.form>
        )}

        <div className="mt-8 text-center">
          <p className="text-[8px] text-muted-foreground/50 uppercase tracking-widest">World War Royale V1.0</p>
        </div>
      </div>
    </div>
  );
};

export default DeafIDLogin;
