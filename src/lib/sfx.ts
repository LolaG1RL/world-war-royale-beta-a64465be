// Web Audio API sound effect system — no external dependencies needed

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

// Settings ref so we don't need React context in a plain module
let _sfxEnabled = true;
let _sfxVolume = 0.7;

export function updateSfxSettings(enabled: boolean, volume: number) {
  _sfxEnabled = enabled;
  _sfxVolume = volume;
}

function gain(ctx: AudioContext, vol: number): GainNode {
  const g = ctx.createGain();
  g.gain.value = vol * _sfxVolume;
  g.connect(ctx.destination);
  return g;
}

// ─── Individual SFX ───

export function playCardDeploy() {
  if (!_sfxEnabled) return;
  const ctx = getCtx();
  const g = gain(ctx, 0.3);
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
  osc.connect(g);
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
}

export function playCardTap() {
  if (!_sfxEnabled) return;
  const ctx = getCtx();
  const g = gain(ctx, 0.15);
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.05);
  osc.connect(g);
  osc.start();
  osc.stop(ctx.currentTime + 0.06);
}

export function playAttack() {
  if (!_sfxEnabled) return;
  const ctx = getCtx();
  const g = gain(ctx, 0.25);
  // White noise burst
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.06, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.connect(g);
  src.start();
}

export function playExplosion() {
  if (!_sfxEnabled) return;
  const ctx = getCtx();
  const g = gain(ctx, 0.35);
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.connect(g);
  src.start();
}

export function playUnitDeath() {
  if (!_sfxEnabled) return;
  const ctx = getCtx();
  const g = gain(ctx, 0.2);
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(300, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.2);
  osc.connect(g);
  osc.start();
  osc.stop(ctx.currentTime + 0.25);
}

export function playTowerHit() {
  if (!_sfxEnabled) return;
  const ctx = getCtx();
  const g = gain(ctx, 0.3);
  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(150, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.15);
  osc.connect(g);
  osc.start();
  osc.stop(ctx.currentTime + 0.18);
}

export function playTowerDestroyed() {
  if (!_sfxEnabled) return;
  const ctx = getCtx();
  // Chain of explosions
  for (let i = 0; i < 3; i++) {
    const g = gain(ctx, 0.3);
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let j = 0; j < d.length; j++) d[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / d.length, 1.5);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(g);
    src.start(ctx.currentTime + i * 0.1);
  }
}

export function playVictory() {
  if (!_sfxEnabled) return;
  const ctx = getCtx();
  const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
  notes.forEach((freq, i) => {
    const g = gain(ctx, 0.2);
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
    osc.connect(g);
    osc.start(ctx.currentTime + i * 0.15);
    osc.stop(ctx.currentTime + i * 0.15 + 0.2);
  });
}

export function playDefeat() {
  if (!_sfxEnabled) return;
  const ctx = getCtx();
  const notes = [400, 350, 300, 200];
  notes.forEach((freq, i) => {
    const g = gain(ctx, 0.2);
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.2);
    osc.connect(g);
    osc.start(ctx.currentTime + i * 0.2);
    osc.stop(ctx.currentTime + i * 0.2 + 0.25);
  });
}

export function playElixirFull() {
  if (!_sfxEnabled) return;
  const ctx = getCtx();
  const g = gain(ctx, 0.15);
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.08);
  osc.connect(g);
  osc.start();
  osc.stop(ctx.currentTime + 0.12);
}

export function playChestOpen() {
  if (!_sfxEnabled) return;
  const ctx = getCtx();
  const g = gain(ctx, 0.25);
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(300, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3);
  osc.connect(g);
  osc.start();
  osc.stop(ctx.currentTime + 0.35);
}

export function playButtonClick() {
  if (!_sfxEnabled) return;
  const ctx = getCtx();
  const g = gain(ctx, 0.1);
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(700, ctx.currentTime);
  osc.connect(g);
  osc.start();
  osc.stop(ctx.currentTime + 0.04);
}

export function playCoinCollect() {
  if (!_sfxEnabled) return;
  const ctx = getCtx();
  const g = gain(ctx, 0.2);
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.08);
  osc.connect(g);
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
}

export function playLevelUp() {
  if (!_sfxEnabled) return;
  const ctx = getCtx();
  const notes = [440, 554, 659, 880, 1108];
  notes.forEach((freq, i) => {
    const g = gain(ctx, 0.2);
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
    osc.connect(g);
    osc.start(ctx.currentTime + i * 0.1);
    osc.stop(ctx.currentTime + i * 0.1 + 0.15);
  });
}

// Card-type specific SFX
export function playCardSfx(cardType: string, rarity: string) {
  if (!_sfxEnabled) return;
  const ctx = getCtx();

  if (cardType === 'spell') {
    // Magical whoosh
    const g = gain(ctx, 0.25);
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.15);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
    osc.connect(g);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } else if (cardType === 'building') {
    // Construction thud
    const g = gain(ctx, 0.3);
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
    osc.connect(g);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } else {
    // Troop deploy — pitch based on rarity
    const baseFreq = rarity === 'legendary' ? 250 : rarity === 'epic' ? 350 : rarity === 'rare' ? 450 : 500;
    const g = gain(ctx, 0.25);
    const osc = ctx.createOscillator();
    osc.type = rarity === 'legendary' || rarity === 'champion' ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 2, ctx.currentTime + 0.1);
    osc.connect(g);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);

    // Legendary/champion extra sparkle
    if (rarity === 'legendary' || rarity === 'champion') {
      const g2 = gain(ctx, 0.15);
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1200, ctx.currentTime + 0.05);
      osc2.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.15);
      osc2.connect(g2);
      osc2.start(ctx.currentTime + 0.05);
      osc2.stop(ctx.currentTime + 0.2);
    }
  }
}
