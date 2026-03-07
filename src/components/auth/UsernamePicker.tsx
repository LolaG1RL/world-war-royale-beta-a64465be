import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { User, AlertCircle } from 'lucide-react';
import splashImage from '@/assets/world-war-royale-splash.png';

const UsernamePicker = () => {
  const { setUsername } = useAuth();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await setUsername(name);
    if (error) setError(error);
    setLoading(false);
  };

  return (
    <div className="h-screen w-full max-w-md mx-auto flex flex-col bg-background relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={splashImage} alt="" className="w-full h-full object-cover opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220,30%,6%,0.8)] via-[hsl(220,25%,10%,0.9)] to-[hsl(220,30%,6%,0.95)]" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center mb-6">
          <div className="text-5xl mb-3">⚔️</div>
          <h1 className="font-display font-black text-xl text-foreground tracking-wider">CHOOSE YOUR NAME</h1>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-xs">
            This is your warrior name. Choose wisely — <span className="text-accent font-bold">once chosen, it's yours forever</span> and can never be used by anyone else!
          </p>
        </motion.div>

        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="w-full space-y-3">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
              placeholder="Enter username (3-20 characters)"
              maxLength={20}
              minLength={3}
              required
              className="w-full bg-secondary border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 font-bold tracking-wider"
            />
          </div>

          <div className="flex items-start gap-2 text-[9px] text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
            <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>Letters, numbers, and underscores only. This name is <strong className="text-foreground">permanent</strong>.</span>
          </div>

          {name.length > 0 && name.length < 3 && (
            <div className="text-[10px] text-accent">Minimum 3 characters</div>
          )}

          {error && (
            <div className="text-xs text-accent bg-accent/10 border border-accent/20 rounded-lg px-3 py-2">{error}</div>
          )}

          <button type="submit" disabled={loading || name.length < 3} className="btn-battle w-full text-sm disabled:opacity-50">
            {loading ? '...' : 'LOCK IN NAME'}
          </button>
        </motion.form>
      </div>
    </div>
  );
};

export default UsernamePicker;
