import { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { useSettings } from '@/context/SettingsContext';
import { t } from '@/lib/i18n';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Gift, UserPlus, Megaphone, ArrowLeft, Trash2, Check, X } from 'lucide-react';
import { BottomNav } from './BottomNav';

interface MailMessage {
  id: string;
  sender_type: string;
  title: string;
  body: string;
  icon: string;
  reward_gold: number;
  reward_gems: number;
  is_read: boolean;
  is_claimed: boolean;
  created_at: string;
  recipient_user_id: string | null;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  mail: <Mail className="w-4 h-4" />,
  gift: <Gift className="w-4 h-4" />,
  friend: <UserPlus className="w-4 h-4" />,
  announce: <Megaphone className="w-4 h-4" />,
};

const SENDER_COLORS: Record<string, string> = {
  system: 'text-[hsl(210,60%,60%)]',
  admin: 'text-[hsl(0,70%,60%)]',
  friend_request: 'text-[hsl(120,50%,55%)]',
  dev_gift: 'text-[hsl(280,60%,65%)]',
};

const MailboxScreen = () => {
  const { setScreen, setProfile } = useGame();
  const { language } = useSettings();
  const { user } = useAuth();
  const [messages, setMessages] = useState<MailMessage[]>([]);
  const [selectedMsg, setSelectedMsg] = useState<MailMessage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadMessages();
  }, [user]);

  const loadMessages = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('mailbox_messages')
      .select('*')
      .or(`recipient_user_id.eq.${user.id},recipient_user_id.is.null`)
      .order('created_at', { ascending: false });
    setMessages((data as MailMessage[]) || []);
    setLoading(false);
  };

  const markRead = async (msg: MailMessage) => {
    if (!msg.is_read) {
      await supabase.from('mailbox_messages').update({ is_read: true }).eq('id', msg.id);
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m));
    }
    setSelectedMsg({ ...msg, is_read: true });
  };

  const claimReward = async (msg: MailMessage) => {
    if (msg.is_claimed) return;
    if (msg.reward_gold > 0 || msg.reward_gems > 0) {
      setProfile(p => ({
        ...p,
        gold: p.gold + msg.reward_gold,
        gems: p.gems + msg.reward_gems,
      }));
    }
    await supabase.from('mailbox_messages').update({ is_claimed: true }).eq('id', msg.id);
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_claimed: true } : m));
    setSelectedMsg(prev => prev ? { ...prev, is_claimed: true } : null);
  };

  const deleteMail = async (id: string) => {
    await supabase.from('mailbox_messages').delete().eq('id', id);
    setMessages(prev => prev.filter(m => m.id !== id));
    if (selectedMsg?.id === id) setSelectedMsg(null);
  };

  const unreadCount = messages.filter(m => !m.is_read).length;
  const hasRewards = (msg: MailMessage) => msg.reward_gold > 0 || msg.reward_gems > 0;

  const formatDate = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const senderLabel = (type: string) => {
    switch (type) {
      case 'system': return '⚙️ System';
      case 'admin': return '🔧 Dev Team';
      case 'friend_request': return '👋 Friend Request';
      case 'dev_gift': return '🎁 Dev Gift';
      default: return '📬 Mail';
    }
  };

  return (
    <div className="h-screen w-full max-w-md mx-auto flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-2.5 bg-[hsl(220,25%,10%)] border-b border-border">
        <button onClick={() => setScreen('menu')} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Mail className="w-5 h-5 text-primary" />
        <h1 className="font-display font-bold text-sm text-foreground flex-1">{t('mail.title', language)}</h1>
        {unreadCount > 0 && (
          <span className="bg-accent text-accent-foreground text-[9px] font-bold px-2 py-0.5 rounded-full">
            {unreadCount} new
          </span>
        )}
      </div>

      {/* Message detail overlay */}
      <AnimatePresence>
        {selectedMsg && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute inset-0 z-30 bg-background flex flex-col"
          >
            <div className="flex items-center gap-3 px-3 py-2.5 bg-[hsl(220,25%,10%)] border-b border-border">
              <button onClick={() => setSelectedMsg(null)} className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="font-display font-bold text-sm text-foreground flex-1 truncate">{selectedMsg.title}</h1>
              <button onClick={() => deleteMail(selectedMsg.id)} className="text-muted-foreground hover:text-accent">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${SENDER_COLORS[selectedMsg.sender_type] || 'text-muted-foreground'}`}>
                {senderLabel(selectedMsg.sender_type)}
              </div>
              <div className="text-[10px] text-muted-foreground mb-4">{formatDate(selectedMsg.created_at)}</div>

              <div className="bg-[hsl(220,15%,14%)] border border-border rounded-xl p-4 mb-4">
                <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{selectedMsg.body}</p>
              </div>

              {hasRewards(selectedMsg) && (
                <div className="bg-[hsl(40,30%,12%)] border border-[hsl(40,40%,25%)] rounded-xl p-3 mb-4">
                  <div className="text-[9px] font-bold text-primary uppercase tracking-wider mb-2">Rewards</div>
                  <div className="flex gap-3">
                    {selectedMsg.reward_gold > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-sm">💰</span>
                        <span className="text-xs font-bold text-foreground">{selectedMsg.reward_gold.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedMsg.reward_gems > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-sm">💎</span>
                        <span className="text-xs font-bold text-foreground">{selectedMsg.reward_gems}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Friend request actions - direct to social tab */}
              {selectedMsg.sender_type === 'friend_request' && (
                <div className="bg-[hsl(120,20%,12%)] border border-[hsl(120,30%,25%)] rounded-xl p-3 mb-4">
                  <p className="text-[10px] text-muted-foreground mb-2">Accept or deny this request in the Social tab → Friends section</p>
                  <button
                    onClick={() => { setSelectedMsg(null); setScreen('social'); }}
                    className="w-full py-2 rounded-lg bg-[hsl(120,40%,25%)] border border-[hsl(120,40%,35%)] text-[10px] font-bold text-foreground hover:bg-[hsl(120,40%,30%)] transition-colors"
                  >
                    Go to Social Tab →
                  </button>
                </div>
              )}

              {/* Claim button */}
              {hasRewards(selectedMsg) && (
                <button
                  onClick={() => claimReward(selectedMsg)}
                  disabled={selectedMsg.is_claimed}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-colors ${
                    selectedMsg.is_claimed
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg'
                  }`}
                >
                  {selectedMsg.is_claimed ? '✅ Claimed' : '🎁 Claim Rewards'}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-xs text-muted-foreground animate-pulse">Loading mail...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <Mail className="w-10 h-10 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">No messages yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {messages.map(msg => (
              <motion.button
                key={msg.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => markRead(msg)}
                className={`w-full text-left px-3 py-3 flex items-center gap-3 transition-colors ${
                  !msg.is_read ? 'bg-[hsl(210,20%,13%)]' : 'bg-background hover:bg-[hsl(220,15%,12%)]'
                }`}
              >
                {/* Icon */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  msg.sender_type === 'admin' || msg.sender_type === 'dev_gift'
                    ? 'bg-accent/20 text-accent'
                    : msg.sender_type === 'friend_request'
                    ? 'bg-[hsl(120,30%,18%)] text-[hsl(120,50%,55%)]'
                    : 'bg-primary/20 text-primary'
                }`}>
                  {ICON_MAP[msg.icon] || <Mail className="w-4 h-4" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold truncate ${!msg.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {msg.title}
                    </span>
                    {!msg.is_read && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                  </div>
                  <div className="text-[9px] text-muted-foreground truncate">{msg.body.slice(0, 60)}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[8px] ${SENDER_COLORS[msg.sender_type] || 'text-muted-foreground'}`}>
                      {senderLabel(msg.sender_type)}
                    </span>
                    <span className="text-[8px] text-muted-foreground">{formatDate(msg.created_at)}</span>
                  </div>
                </div>

                {/* Reward indicator */}
                {hasRewards(msg) && !msg.is_claimed && (
                  <div className="shrink-0 bg-primary/20 text-primary text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                    🎁
                  </div>
                )}
                {hasRewards(msg) && msg.is_claimed && (
                  <Check className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                )}
              </motion.button>
            ))}
          </div>
        )}
      </div>
      <BottomNav active="battle" setScreen={setScreen} />
    </div>
  );
};

export default MailboxScreen;
