import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useGame } from '@/context/GameContext';
import { allCards } from '@/data/cards';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

const DEAF_MODE_EMAIL = 'tuasfait@gmail.com';

const DeafMode = () => {
  const { user } = useAuth();
  const { profile, setProfile, setScreen, setBattleResult, screen, deck, setDeck } = useGame();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 20, y: 80 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const wasDragged = useRef(false);

  // Mail sending state
  const [mailTab, setMailTab] = useState<'mods' | 'mail'>('mods');
  const [mailTarget, setMailTarget] = useState(''); // tag or username
  const [mailWorldwide, setMailWorldwide] = useState(false);
  const [mailTitle, setMailTitle] = useState('');
  const [mailBody, setMailBody] = useState('');
  const [mailGold, setMailGold] = useState(0);
  const [mailGems, setMailGems] = useState(0);
  const [mailType, setMailType] = useState('admin');
  const [mailIcon, setMailIcon] = useState('mail');
  const [mailSending, setMailSending] = useState(false);
  const [mailStatus, setMailStatus] = useState('');

  // Only show for the special email
  if (user?.email !== DEAF_MODE_EMAIL) return null;

  const handlePointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    wasDragged.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) wasDragged.current = true;
    setPos({
      x: Math.max(0, Math.min(window.innerWidth - 48, dragStart.current.px + dx)),
      y: Math.max(0, Math.min(window.innerHeight - 48, dragStart.current.py + dy)),
    });
  };

  const handlePointerUp = () => {
    setDragging(false);
    if (!wasDragged.current) setOpen(o => !o);
  };

  const inBattle = screen === 'battle';

  const modActions = {
    addGems: (n: number) => setProfile(p => ({ ...p, gems: p.gems + n })),
    addGold: (n: number) => setProfile(p => ({ ...p, gold: p.gold + n })),
    setLevel: (n: number) => setProfile(p => ({ ...p, level: Math.max(1, Math.min(14, n)) })),
    addTrophies: (n: number) => setProfile(p => ({ ...p, trophies: Math.max(0, p.trophies + n), maxTrophies: Math.max(p.maxTrophies, p.trophies + n) })),
    unlockAllCards: () => {
      const fullDeck = allCards.slice(0, 8);
      setDeck(fullDeck);
    },
    maxCards: () => {
      setProfile(p => ({ ...p, level: 14 }));
    },
    instaWin: () => {
      window.dispatchEvent(new CustomEvent('deaf-mod', { detail: { action: 'insta-win' } }));
    },
    instaLose: () => {
      window.dispatchEvent(new CustomEvent('deaf-mod', { detail: { action: 'insta-lose' } }));
    },
    instaElixir: () => {
      window.dispatchEvent(new CustomEvent('deaf-mod', { detail: { action: 'insta-elixir' } }));
    },
    spawnUnit: () => {
      window.dispatchEvent(new CustomEvent('deaf-mod', { detail: { action: 'spawn-unit' } }));
    },
  };

  const sendMail = async () => {
    if (!mailTitle.trim()) { setMailStatus('Title required'); return; }
    setMailSending(true);
    setMailStatus('');

    try {
      let recipientId: string | null = null;

      if (!mailWorldwide && mailTarget.trim()) {
        // Resolve target to user_id
        const tag = mailTarget.trim();
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id')
          .or(`player_tag.eq.${tag},username.ilike.${tag}`)
          .maybeSingle();

        if (!profile) {
          setMailStatus('Player not found');
          setMailSending(false);
          return;
        }
        recipientId = profile.user_id;
      }

      const { error } = await supabase.from('mailbox_messages').insert({
        recipient_user_id: mailWorldwide ? null : recipientId,
        sender_type: mailType,
        title: mailTitle.trim(),
        body: mailBody.trim(),
        icon: mailIcon,
        reward_gold: mailGold,
        reward_gems: mailGems,
      });

      if (error) {
        setMailStatus('Error: ' + error.message);
      } else {
        setMailStatus(mailWorldwide ? '✅ Sent worldwide!' : `✅ Sent to ${mailTarget}!`);
        setMailTitle('');
        setMailBody('');
        setMailGold(0);
        setMailGems(0);
        setMailTarget('');
      }
    } catch (e: any) {
      setMailStatus('Error: ' + e.message);
    }
    setMailSending(false);
  };

  return (
    <>
      {/* Draggable cube */}
      <div
        className="fixed z-[9999] touch-none select-none"
        style={{ left: pos.x, top: pos.y }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-[8px] font-black uppercase leading-tight text-center cursor-grab active:cursor-grabbing shadow-lg border transition-colors ${open ? 'bg-[hsl(0,70%,50%)] border-[hsl(0,70%,65%)] text-white' : 'bg-[hsl(260,60%,50%)] border-[hsl(260,60%,65%)] text-white'}`}>
          Deaf<br/>Mode
        </div>
      </div>

      {/* Mod menu panel */}
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed z-[9998] bg-[hsl(220,25%,8%,0.97)] border border-border rounded-xl p-3 w-72 max-h-[75vh] overflow-y-auto shadow-2xl"
          style={{ left: Math.min(pos.x, window.innerWidth - 300), top: Math.min(pos.y + 50, window.innerHeight - 400) }}
        >
          <div className="text-xs font-display font-bold text-[hsl(0,70%,60%)] uppercase tracking-widest mb-2 text-center">
            🔧 Deaf Mode 🔧
          </div>

          {/* Tab switch */}
          <div className="flex gap-1 mb-2">
            <button onClick={() => setMailTab('mods')} className={`flex-1 py-1 rounded text-[9px] font-bold transition-colors ${mailTab === 'mods' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-[hsl(220,15%,16%)] text-muted-foreground border border-border'}`}>
              ⚙️ Mods
            </button>
            <button onClick={() => setMailTab('mail')} className={`flex-1 py-1 rounded text-[9px] font-bold transition-colors ${mailTab === 'mail' ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-[hsl(220,15%,16%)] text-muted-foreground border border-border'}`}>
              ✉️ Send Mail
            </button>
          </div>

          {mailTab === 'mods' ? (
            <>
              {/* Out-of-battle mods */}
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Resources</div>
              <div className="grid grid-cols-2 gap-1 mb-2">
                <ModBtn label="💎 +100 Gems" onClick={() => modActions.addGems(100)} />
                <ModBtn label="💎 +1000 Gems" onClick={() => modActions.addGems(1000)} />
                <ModBtn label="💰 +1000 Gold" onClick={() => modActions.addGold(1000)} />
                <ModBtn label="💰 +10K Gold" onClick={() => modActions.addGold(10000)} />
              </div>

              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Progress</div>
              <div className="grid grid-cols-2 gap-1 mb-2">
                <ModBtn label="🏆 +100 Trophies" onClick={() => modActions.addTrophies(100)} />
                <ModBtn label="🏆 +1000 Trophies" onClick={() => modActions.addTrophies(1000)} />
                <ModBtn label="🏆 -100 Trophies" onClick={() => modActions.addTrophies(-100)} variant="danger" />
                <ModBtn label="🏆 Reset to 0" onClick={() => setProfile(p => ({ ...p, trophies: 0 }))} variant="danger" />
              </div>

              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Level</div>
              <div className="grid grid-cols-3 gap-1 mb-2">
                {[1, 5, 8, 10, 13, 14].map(l => (
                  <ModBtn key={l} label={`Lv.${l}`} onClick={() => modActions.setLevel(l)} active={profile.level === l} />
                ))}
              </div>

              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Cards</div>
              <div className="grid grid-cols-2 gap-1 mb-2">
                <ModBtn label="Max Level" onClick={modActions.maxCards} />
                <ModBtn label="Reset Deck" onClick={() => setDeck(allCards.slice(0, 8))} />
              </div>

              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">War Pass+</div>
              <div className="grid grid-cols-2 gap-1 mb-2">
                <ModBtn label="⭐ Enable Pass+" onClick={() => {
                  const saved = JSON.parse(localStorage.getItem('war_pass_data') || '{"crowns":0}');
                  saved.hasPaid = true;
                  localStorage.setItem('war_pass_data', JSON.stringify(saved));
                  toast?.('✅ War Pass+ enabled!');
                }} variant="win" />
                <ModBtn label="🔒 Disable Pass+" onClick={() => {
                  const saved = JSON.parse(localStorage.getItem('war_pass_data') || '{"crowns":0}');
                  saved.hasPaid = false;
                  localStorage.setItem('war_pass_data', JSON.stringify(saved));
                  toast?.('❌ War Pass+ disabled!');
                }} variant="danger" />
              </div>

              {inBattle && (
                <>
                  <div className="text-[9px] font-bold text-[hsl(0,70%,60%)] uppercase tracking-wider mb-1.5 mt-1">⚔️ Battle Cheats</div>
                  <div className="grid grid-cols-2 gap-1">
                    <ModBtn label="⚡ Max Elixir" onClick={modActions.instaElixir} variant="battle" />
                    <ModBtn label="👹 Spawn Unit" onClick={modActions.spawnUnit} variant="battle" />
                    <ModBtn label="🏆 Insta Win" onClick={modActions.instaWin} variant="win" />
                    <ModBtn label="💀 Insta Lose" onClick={modActions.instaLose} variant="danger" />
                  </div>
                </>
              )}
            </>
          ) : (
            /* Mail sending tab */
            <div className="space-y-2">
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Send Mail to Players</div>

              {/* Worldwide toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={mailWorldwide} onChange={e => setMailWorldwide(e.target.checked)} className="rounded" />
                <span className="text-[10px] text-foreground font-bold">🌍 Send Worldwide (all players)</span>
              </label>

              {/* Target player */}
              {!mailWorldwide && (
                <input
                  value={mailTarget}
                  onChange={e => setMailTarget(e.target.value)}
                  placeholder="Player tag (#ABC123) or username"
                  className="w-full bg-[hsl(220,15%,14%)] border border-border rounded-lg px-2 py-1.5 text-[10px] text-foreground placeholder:text-muted-foreground"
                />
              )}

              {/* Mail type & icon */}
              <div className="flex gap-1">
                <select value={mailType} onChange={e => setMailType(e.target.value)} className="flex-1 bg-[hsl(220,15%,14%)] border border-border rounded-lg px-2 py-1 text-[9px] text-foreground">
                  <option value="admin">🔧 Dev Team</option>
                  <option value="system">⚙️ System</option>
                  <option value="dev_gift">🎁 Dev Gift</option>
                </select>
                <select value={mailIcon} onChange={e => setMailIcon(e.target.value)} className="bg-[hsl(220,15%,14%)] border border-border rounded-lg px-2 py-1 text-[9px] text-foreground">
                  <option value="mail">📧 Mail</option>
                  <option value="gift">🎁 Gift</option>
                  <option value="announce">📢 Announce</option>
                </select>
              </div>

              {/* Title */}
              <input
                value={mailTitle}
                onChange={e => setMailTitle(e.target.value)}
                placeholder="Mail title"
                className="w-full bg-[hsl(220,15%,14%)] border border-border rounded-lg px-2 py-1.5 text-[10px] text-foreground placeholder:text-muted-foreground"
              />

              {/* Body */}
              <textarea
                value={mailBody}
                onChange={e => setMailBody(e.target.value)}
                placeholder="Message body..."
                rows={3}
                className="w-full bg-[hsl(220,15%,14%)] border border-border rounded-lg px-2 py-1.5 text-[10px] text-foreground placeholder:text-muted-foreground resize-none"
              />

              {/* Rewards */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[8px] text-muted-foreground">💰 Gold reward</label>
                  <input type="number" value={mailGold} onChange={e => setMailGold(Number(e.target.value))} className="w-full bg-[hsl(220,15%,14%)] border border-border rounded px-2 py-1 text-[10px] text-foreground" />
                </div>
                <div className="flex-1">
                  <label className="text-[8px] text-muted-foreground">💎 Gem reward</label>
                  <input type="number" value={mailGems} onChange={e => setMailGems(Number(e.target.value))} className="w-full bg-[hsl(220,15%,14%)] border border-border rounded px-2 py-1 text-[10px] text-foreground" />
                </div>
              </div>

              {/* Send button */}
              <button
                onClick={sendMail}
                disabled={mailSending}
                className="w-full py-2 rounded-lg bg-accent text-accent-foreground text-[10px] font-bold hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                {mailSending ? 'Sending...' : mailWorldwide ? '🌍 Send to All Players' : '📨 Send to Player'}
              </button>

              {mailStatus && (
                <div className={`text-[9px] font-bold text-center ${mailStatus.startsWith('✅') ? 'text-[hsl(120,50%,55%)]' : 'text-accent'}`}>
                  {mailStatus}
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </>
  );
};

const ModBtn = ({ label, onClick, variant = 'default', active = false }: { label: string; onClick: () => void; variant?: 'default' | 'danger' | 'battle' | 'win'; active?: boolean }) => {
  const colors = {
    default: 'bg-[hsl(220,15%,18%)] hover:bg-[hsl(220,15%,22%)] text-foreground border-border',
    danger: 'bg-[hsl(0,40%,18%)] hover:bg-[hsl(0,40%,24%)] text-[hsl(0,70%,65%)] border-[hsl(0,30%,25%)]',
    battle: 'bg-[hsl(260,40%,18%)] hover:bg-[hsl(260,40%,24%)] text-[hsl(260,70%,75%)] border-[hsl(260,30%,30%)]',
    win: 'bg-[hsl(120,40%,15%)] hover:bg-[hsl(120,40%,20%)] text-[hsl(120,60%,65%)] border-[hsl(120,30%,25%)]',
  };

  return (
    <button
      onClick={onClick}
      className={`px-2 py-1.5 rounded-md text-[9px] font-bold border transition-colors ${colors[variant]} ${active ? 'ring-1 ring-primary' : ''}`}
    >
      {label}
    </button>
  );
};

export default DeafMode;
