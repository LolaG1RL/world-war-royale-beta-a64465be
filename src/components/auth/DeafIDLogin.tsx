import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import splashImage from '@/assets/world-war-royale-splash.png';

const DeafIDLogin = () => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

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
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </p>
        </motion.div>

        {signupSuccess ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="text-3xl mb-3">📧</div>
            <h2 className="font-display font-bold text-foreground text-base mb-1">Check Your Email!</h2>
            <p className="text-xs text-muted-foreground">We sent a confirmation link to <span className="text-primary">{email}</span></p>
            <button onClick={() => { setSignupSuccess(false); setMode('login'); }} className="mt-4 text-xs text-primary font-bold">
              Back to Sign In
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
                placeholder="Email address"
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
                placeholder="Password"
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
              {loading ? '...' : mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
                className="text-xs text-muted-foreground"
              >
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <span className="text-primary font-bold">{mode === 'login' ? 'Sign Up' : 'Sign In'}</span>
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
