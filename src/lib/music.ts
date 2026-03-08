// Procedural music engine using Web Audio API — no external assets needed

let audioCtx: AudioContext | null = null;
let currentLoop: { stop: () => void } | null = null;
let _musicEnabled = true;
let _musicVolume = 0.5;

export function updateMusicSettings(enabled: boolean, volume: number) {
  _musicEnabled = enabled;
  _musicVolume = volume;
  if (masterGain) masterGain.gain.value = enabled ? volume : 0;
}

let masterGain: GainNode | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  if (!masterGain) {
    masterGain = audioCtx.createGain();
    masterGain.gain.value = _musicEnabled ? _musicVolume : 0;
    masterGain.connect(audioCtx.destination);
  }
  return audioCtx;
}

// Note frequencies
const NOTES: Record<string, number> = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99,
};

interface ArenaMusic {
  bpm: number;
  key: string[];
  bass: string[];
  lead: string[];
  waveType: OscillatorType;
  bassType: OscillatorType;
}

// Different music per arena tier
const ARENA_MUSIC: Record<number, ArenaMusic> = {
  1: { bpm: 100, key: ['C4', 'E4', 'G4', 'C5'], bass: ['C3', 'G3', 'C3', 'E3'], lead: ['E5', 'G5', 'C5', 'D5'], waveType: 'triangle', bassType: 'sine' },
  2: { bpm: 110, key: ['D4', 'F4', 'A4', 'D5'], bass: ['D3', 'A3', 'D3', 'F3'], lead: ['D5', 'F4', 'A4', 'D5'], waveType: 'triangle', bassType: 'sine' },
  3: { bpm: 115, key: ['E4', 'G4', 'B4', 'E5'], bass: ['E3', 'B3', 'E3', 'G3'], lead: ['E5', 'G4', 'B4', 'E5'], waveType: 'square', bassType: 'triangle' },
  4: { bpm: 120, key: ['F4', 'A4', 'C5', 'F4'], bass: ['F3', 'C3', 'F3', 'A3'], lead: ['C5', 'A4', 'F4', 'C5'], waveType: 'square', bassType: 'triangle' },
  5: { bpm: 125, key: ['G4', 'B4', 'D5', 'G4'], bass: ['G3', 'D3', 'G3', 'B3'], lead: ['D5', 'B4', 'G4', 'D5'], waveType: 'sawtooth', bassType: 'square' },
  6: { bpm: 128, key: ['A4', 'C5', 'E5', 'A4'], bass: ['A3', 'E3', 'A3', 'C3'], lead: ['E5', 'C5', 'A4', 'E5'], waveType: 'sawtooth', bassType: 'square' },
  7: { bpm: 130, key: ['C4', 'E4', 'G4', 'B4'], bass: ['C3', 'G3', 'E3', 'B3'], lead: ['G5', 'E5', 'C5', 'G5'], waveType: 'sawtooth', bassType: 'triangle' },
};

function getArenaMusic(arena: number): ArenaMusic {
  if (arena >= 7) return ARENA_MUSIC[7];
  return ARENA_MUSIC[Math.max(1, Math.min(7, arena))] || ARENA_MUSIC[1];
}

function playNote(ctx: AudioContext, freq: number, start: number, dur: number, type: OscillatorType, vol: number) {
  if (!masterGain) return;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, start);
  g.gain.exponentialRampToValueAtTime(0.001, start + dur * 0.95);
  g.connect(masterGain);
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  osc.connect(g);
  osc.start(start);
  osc.stop(start + dur);
}

function playDrum(ctx: AudioContext, start: number, vol: number) {
  if (!masterGain) return;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, start);
  g.gain.exponentialRampToValueAtTime(0.001, start + 0.15);
  g.connect(masterGain);
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.connect(g);
  src.start(start);
}

function startLoop(fn: (ctx: AudioContext, time: number) => number): { stop: () => void } {
  const ctx = getCtx();
  let running = true;
  let nextTime = ctx.currentTime + 0.1;

  const schedule = () => {
    if (!running) return;
    while (nextTime < ctx.currentTime + 2) {
      nextTime += fn(ctx, nextTime);
    }
    setTimeout(schedule, 500);
  };
  schedule();

  return { stop: () => { running = false; } };
}

// ═══ Arena Battle Music ═══
export function playBattleMusic(arena: number) {
  stopMusic();
  if (!_musicEnabled) return;
  const m = getArenaMusic(arena);
  const beatDur = 60 / m.bpm;
  let beatIndex = 0;

  currentLoop = startLoop((ctx, time) => {
    const i = beatIndex % m.key.length;
    // Chord pad
    playNote(ctx, NOTES[m.key[i]] || 261, time, beatDur * 2, m.waveType, 0.06);
    // Bass
    playNote(ctx, NOTES[m.bass[i]] || 130, time, beatDur, m.bassType, 0.1);
    // Lead melody every other beat
    if (beatIndex % 2 === 0) {
      playNote(ctx, NOTES[m.lead[i]] || 523, time, beatDur * 0.6, 'sine', 0.04);
    }
    // Drums
    if (beatIndex % 4 === 0) playDrum(ctx, time, 0.12);
    else if (beatIndex % 2 === 0) playDrum(ctx, time, 0.06);
    beatIndex++;
    return beatDur;
  });
}

// ═══ Overtime Music — intense/pressuring ═══
export function playOvertimeMusic() {
  stopMusic();
  if (!_musicEnabled) return;
  const bpm = 150;
  const beatDur = 60 / bpm;
  let beatIndex = 0;
  const bassNotes = ['C3', 'C3', 'E3', 'G3', 'C3', 'C3', 'A3', 'G3'];
  const leadNotes = ['C5', 'E5', 'G5', 'C5', 'D5', 'E5', 'G5', 'C5'];

  currentLoop = startLoop((ctx, time) => {
    const i = beatIndex % 8;
    // Heavy bass
    playNote(ctx, NOTES[bassNotes[i]] || 130, time, beatDur * 0.8, 'sawtooth', 0.15);
    // Fast drums every beat
    playDrum(ctx, time, 0.15);
    // Staccato lead
    if (beatIndex % 2 === 0) {
      playNote(ctx, NOTES[leadNotes[i]] || 523, time, beatDur * 0.3, 'square', 0.06);
    }
    // Extra snare on off-beats
    if (beatIndex % 2 === 1) {
      playDrum(ctx, time + beatDur * 0.5, 0.08);
    }
    beatIndex++;
    return beatDur;
  });
}

// ═══ Lobby Music — calm & ambient ═══
export function playLobbyMusic() {
  stopMusic();
  if (!_musicEnabled) return;
  const bpm = 70;
  const beatDur = 60 / bpm;
  let beatIndex = 0;
  const chords = [['C4', 'E4', 'G4'], ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4'], ['G3', 'B3', 'D4']];

  currentLoop = startLoop((ctx, time) => {
    const chord = chords[Math.floor(beatIndex / 4) % chords.length];
    // Gentle pad with all chord notes
    chord.forEach((note, ni) => {
      playNote(ctx, NOTES[note] || 261, time + ni * 0.05, beatDur * 3, 'sine', 0.03);
    });
    // Soft bass
    playNote(ctx, NOTES[chord[0]] ? NOTES[chord[0]] / 2 : 65, time, beatDur * 2, 'sine', 0.05);
    beatIndex++;
    return beatDur * 2;
  });
}

export function stopMusic() {
  if (currentLoop) {
    currentLoop.stop();
    currentLoop = null;
  }
}

export function isPlaying() {
  return currentLoop !== null;
}
