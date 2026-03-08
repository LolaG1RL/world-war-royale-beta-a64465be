import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  username: string | null;
  playerTag: string | null;
  loading: boolean;
  needsUsername: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  setUsername: (username: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthState | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [username, setUsernameState] = useState<string | null>(null);
  const [playerTag, setPlayerTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsUsername, setNeedsUsername] = useState(false);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('username, player_tag')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (data?.username) {
      setUsernameState(data.username);
      setPlayerTag(data.player_tag);
      setNeedsUsername(false);
    } else {
      setUsernameState(null);
      setPlayerTag(null);
      setNeedsUsername(true);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => fetchProfile(session.user.id), 0);
      } else {
        setUsernameState(null);
        setPlayerTag(null);
        setNeedsUsername(false);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    return { error: error?.message ?? null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUsernameState(null);
    setPlayerTag(null);
    setNeedsUsername(false);
  };

  const setUsername = async (name: string) => {
    if (!user) return { error: 'Not logged in' };

    const trimmed = name.trim();
    if (trimmed.length < 3 || trimmed.length > 20) {
      return { error: 'Username must be 3-20 characters' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      return { error: 'Only letters, numbers, and underscores allowed' };
    }

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .ilike('username', trimmed)
      .maybeSingle();

    if (existing) {
      return { error: 'Username is already taken forever! Choose another.' };
    }

    // Insert without player_tag - the DB trigger auto-generates it
    const { error } = await supabase
      .from('profiles')
      .insert({ user_id: user.id, username: trimmed } as any);

    if (error) {
      if (error.code === '23505') return { error: 'Username is already taken!' };
      return { error: error.message };
    }

    // Fetch the generated player tag
    await fetchProfile(user.id);
    setNeedsUsername(false);
    return { error: null };
  };

  return (
    <AuthContext.Provider value={{ user, session, username, playerTag, loading, needsUsername, signUp, signIn, signOut, setUsername }}>
      {children}
    </AuthContext.Provider>
  );
};
