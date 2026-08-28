// kit/arena_ui/core/theme.js
//
// COLOSSEUM — shared visual language for the pixel arena UI.
// Byte-identical between Day26-Colosseum-Agent-Arena-Kit and Day26-Colosseum-Agent-Arena
// (CONTRACTS.md §10 / FINAL-PLAN.md §8). Consumed by core/widgets.js and by
// spar.html / projector.html directly.
//
// Pure data. No DOM, no canvas calls, no imports, no side effects — this file
// never throws and never depends on anything else in the tree, so it is safe
// to load first, before any other core/ module exists.
//
// Native ES module (`export const ...`). Load it with
// `<script type="module" src="core/theme.js"></script>` or
// `import { COLORS, SIZES, TIMINGS, FONT } from "./core/theme.js"` — no
// bundler, no npm, no CDN; this is exactly what "vanilla JS, no build step"
// means for a multi-file browser app.
//
// Every SIZES value is a whole CSS pixel. Every TIMINGS value is whole
// milliseconds, measured on the same clock as the `t` argument every
// core/widgets.js draw function receives (a presentation-only rAF/
// performance.now() timeline — CONTRACTS §11's "no wall-clock" rule binds
// *scored* code, not this cosmetic L4 clock). Colours are flat hex strings;
// widgets.js applies alpha at draw time for fades, it is never baked in here.

// ---------------------------------------------------------------------------
// COLOURS
// ---------------------------------------------------------------------------
export const COLORS = Object.freeze({
  // stage
  bg:             '#0a0e16', // canvas background, both views
  panelBg:        '#111a2c', // combat log / cut-in / scrubber / round-banner fill
  panelBorder:    '#3a4a72', // 2px chunky border on every panel
  panelBorderLit: '#6f86c9', // border on an active / just-updated panel

  // sides — fixed identity regardless of which physical team is "you"; the
  // composing view (spar.html / projector.html) decides which side lands on
  // which half of the screen.
  sideA:      '#3ddc97', // teal
  sideAHp:    '#3ddc97',
  sideAHpBg:  '#123b2c', // a spent/empty HP chunk on side A's bar
  sideB:      '#ff9d3d', // amber
  sideBHp:    '#ff9d3d',
  sideBHpBg:  '#402210',

  // universal semantics — same meaning regardless of side
  damageRed:    '#ff3b3b', // HP just lost; VERIFIED claim damage (§10.2, CONTRACTS §6.2)
  denyBlue:     '#4d7cff', // gateway.denied shield glyph + DENIED combat-log lines
  falseRecoil:  '#e84fd6', // FALSE verdict — the prosecutor takes the recoil
  unprovenGrey: '#8892a6', // UNPROVEN verdict; the ⚑ latent-violation counter
  creditBar:    '#f4d35e', // credit bar fill
  creditBarBg:  '#3a3418', // credit bar spent track
  creditFloat:  '#f4d35e', // the floating "-N cr" glyph

  integrityRed: '#ff2d55', // the integrity banner that "does not clear" (§10.2)

  // text
  text:        '#e7ecf7', // primary pixel-font colour
  textDim:     '#8892a6', // secondary — timestamps, seq numbers, hints
  textInverse: '#0a0e16', // text drawn on a fully-lit fill

  // particles / shake
  mutationSpark: '#ffd23f',
});

// ---------------------------------------------------------------------------
// SIZES — integer px. "Everything integer-aligned so nothing renders on a
// half pixel." Every widget rounds its own rect before drawing regardless,
// but these constants are pre-rounded so a naive caller stays honest too.
// ---------------------------------------------------------------------------
export const SIZES = Object.freeze({
  borderWidth: 2,

  hpBarHeight: 18,
  hpChunks:    20, // 100 max HP / 20 chunks = 5 HP per chunk
  hpChunkGap:  1,

  creditBarHeight: 6,
  creditBarGapY:   2, // gap between the HP bar above it and the credit bar

  flagGlyphSize: 7, // one 5x7 font cell at scale 1

  combatLogLineH:    10,
  combatLogPadding:  4,
  combatLogMaxLines: 200, // matches the bounded client history in CONTRACTS §10.1

  cutinPadding: 8,

  roundBannerHeight: 28,

  scrubberHeight:  20,
  scrubberBtnSize: 14,
  scrubberGap:     4,

  particleSize:  2,
  particleCount: 14,

  fontScaleSmall: 1,
  fontScaleBody:  2,
  fontScaleLarge: 3,
});

// ---------------------------------------------------------------------------
// TIMINGS — whole milliseconds.
// ---------------------------------------------------------------------------
export const TIMINGS = Object.freeze({
  hpAnimMs:   600, // CONTRACTS §10.2: "hp (L3) -> HP bar animates over 600 ms"
  hpFlashMs:  250, // red flash on the chunk(s) currently draining

  creditTweenMs: 200,
  creditFloatMs: 900, // "-6 cr" rise-and-fade duration

  revealMs:      5000, // exchange_start card-flip reveal (FINAL-PLAN §8.2)
  cutinSlideMs:   350, // claimCutIn slide-in phase
  cutinHoldMs:   3000, // claimCutIn TOTAL on-screen time, slide-in included
  roundBannerMs: 1500, // transient "ROUND n/10" banner between rounds

  shakeMs:          400, // screenShake decay window
  shakeMagnitudePx:   6,
  particleMs:       500,

  denyFlashMs:      500, // combat-log DENIED line flash-in
  integrityPulseMs: 1000, // integrity banner pulse period (it never fully clears)
});

// ---------------------------------------------------------------------------
// FONT — sizing only. Glyph bitmaps live in core/font.js (5x7, no webfont).
// ---------------------------------------------------------------------------
export const FONT = Object.freeze({
  glyphW: 5,
  glyphH: 7,
  glyphGap: 1, // px between glyphs at scale 1
  lineGap: 2,
});

// ---------------------------------------------------------------------------
// Glow effects — for dramatic highlights (K.O., critical hits, victory)
// ---------------------------------------------------------------------------
export const GLOWS = Object.freeze({
  damageGlow: { color: '#ff3b3b', blur: 8, alpha: 0.6 },
  criticalGlow: { color: '#ffd23f', blur: 12, alpha: 0.8 },
  victoryGlow: { color: '#f4d35e', blur: 16, alpha: 0.9 },
  denialGlow: { color: '#4d7cff', blur: 6, alpha: 0.5 },
  integrityGlow: { color: '#ff2d55', blur: 10, alpha: 0.7 },
});

// ---------------------------------------------------------------------------
// Particle effect types — defines behavior for different events
// ---------------------------------------------------------------------------
export const PARTICLE_TYPES = Object.freeze({
  damage: { spread: 360, speed: 1.2, particleCount: 14, color: 'damageRed' },
  critical: { spread: 720, speed: 2.0, particleCount: 20, color: 'creditFloat' },
  heal: { spread: 180, speed: 0.8, particleCount: 8, color: 'sideAHp' },
  miss: { spread: 90, speed: 0.3, particleCount: 6, color: 'unprovenGrey' },
  denial: { spread: 270, speed: 0.6, particleCount: 10, color: 'denyBlue' },
  victory: { spread: 360, speed: 1.5, particleCount: 24, color: 'creditFloat' },
});

// ---------------------------------------------------------------------------
// Sound effect mappings (placeholder — sounds.js will implement actual audio)
// ---------------------------------------------------------------------------
export const SOUNDS = Object.freeze({
  hit: 'slash',
  miss: 'buzz',
  damage: 'thud',
  critical: 'alarm',
  victory: 'fanfare',
  defeat: 'crash',
  roundStart: 'bell',
  ko: 'explosion',
  button: 'click',
  deny: 'shield',
  claim: 'chime',
});

// ---------------------------------------------------------------------------
// Small lookups shared by every widget that is side- or outcome-aware.
// ---------------------------------------------------------------------------
export function sideColor(side) {
  return side === 'B' ? COLORS.sideB : COLORS.sideA;
}

export function sideHpColors(side) {
  return side === 'B'
    ? { fill: COLORS.sideBHp, empty: COLORS.sideBHpBg }
    : { fill: COLORS.sideAHp, empty: COLORS.sideAHpBg };
}

// CONTRACTS §6.2: VERIFIED (damage in red) / UNPROVEN (grey) / FALSE (recoil).
export function outcomeColor(outcome) {
  switch (outcome) {
    case 'verified': return COLORS.damageRed;
    case 'unproven': return COLORS.unprovenGrey;
    case 'false':    return COLORS.falseRecoil;
    default:         return COLORS.textDim;
  }
}
