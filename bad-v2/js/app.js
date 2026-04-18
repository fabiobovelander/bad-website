/**
 * BAD v2 — Canvas Scroll Animation
 * Skill: SKILL_scroll_website.md
 *
 * Stack: Lenis + GSAP ScrollTrigger + HTML5 Canvas
 * Frames: 241 WebP @ 24fps (hero.mp4, 10s)
 */

// ── Config ─────────────────────────────────────────────────────
const FRAME_COUNT = 241
const FRAME_SPEED = 1.0      // 1.0 = animatie loopt over volledige scroll
const IMAGE_SCALE = 0.9      // hoe groot het beeld in de canvas past
const IS_MOBILE   = window.innerWidth < 768

// ── State ──────────────────────────────────────────────────────
const frames    = new Array(FRAME_COUNT)
let   loaded    = 0
let   lastIndex = -1
let   animReady = false

// ── DOM refs ───────────────────────────────────────────────────
const loader      = document.getElementById('loader')
const loaderBar   = document.querySelector('.loader-bar')
const loaderPct   = document.querySelector('.loader-pct')
const canvas      = document.getElementById('canvas')
const canvasWrap  = document.getElementById('canvas-wrap')
const overlay     = document.getElementById('overlay')
const hero        = document.getElementById('hero')
const heroContent  = document.querySelector('.hero-content')
const sectionTitle = document.getElementById('section-title')

... (398 more lines, 16370 bytes total)
