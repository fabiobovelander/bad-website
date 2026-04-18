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
const nav         = document.getElementById('nav')
const scrollFill  = document.getElementById('scroll-fill')
const scrollCont  = document.getElementById('scroll-container')
// Project cards gegroepeerd per set
const projGroups = [
  { cards: document.querySelectorAll('[data-group="0"]'), in: 0.13, fullIn: 0.20, fullOut: 0.30, out: 0.37 },
  { cards: document.querySelectorAll('[data-group="1"]'), in: 0.37, fullIn: 0.44, fullOut: 0.54, out: 0.61 },
  { cards: document.querySelectorAll('[data-group="2"]'), in: 0.61, fullIn: 0.68, fullOut: 0.78, out: 0.85 },
]

// ── Canvas setup (DPR-aware) ────────────────────────────────────
const ctx = canvas.getContext('2d')
let dpr   = window.devicePixelRatio || 1

function resizeCanvas () {
  dpr = window.devicePixelRatio || 1
  const w = window.innerWidth
  const h = window.innerHeight
  canvas.width  = w * dpr
  canvas.height = h * dpr
  canvas.style.width  = w + 'px'
  canvas.style.height = h + 'px'
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  if (lastIndex >= 0) drawFrame(lastIndex)
}
window.addEventListener('resize', resizeCanvas)
resizeCanvas()

// ── Frame renderer ─────────────────────────────────────────────
function drawFrame (index) {
  const img = frames[index]
  if (!img || !img.complete) return

  const cw = canvas.width  / dpr
  const ch = canvas.height / dpr
  const iw = img.naturalWidth
  const ih = img.naturalHeight

  // Clear to bg colour
  ctx.fillStyle = '#050A18'
  ctx.fillRect(0, 0, cw, ch)

  // Scale: cover viewport × IMAGE_SCALE
  const scale = Math.max(cw / iw, ch / ih) * IMAGE_SCALE
  const dw = iw * scale
  const dh = ih * scale

  // Centre (+ mobile offset wanneer nodig)
  let dx = (cw - dw) / 2
  let dy = (ch - dh) / 2
  if (IS_MOBILE) dx += cw * 0.1

  ctx.drawImage(img, dx, dy, dw, dh)

  // ── Edge feathering — 8% gradient fade op alle 4 kanten ──
  const fw = cw * 0.08
  const fh = ch * 0.08

  // Top
  const gt = ctx.createLinearGradient(0, 0, 0, fh)
  gt.addColorStop(0, 'rgba(5,10,24,1)')
  gt.addColorStop(1, 'rgba(5,10,24,0)')
  ctx.fillStyle = gt
  ctx.fillRect(0, 0, cw, fh)

  // Bottom
  const gb = ctx.createLinearGradient(0, ch - fh, 0, ch)
  gb.addColorStop(0, 'rgba(5,10,24,0)')
  gb.addColorStop(1, 'rgba(5,10,24,1)')
  ctx.fillStyle = gb
  ctx.fillRect(0, ch - fh, cw, fh)

  // Left
  const gl = ctx.createLinearGradient(0, 0, fw, 0)
  gl.addColorStop(0, 'rgba(5,10,24,1)')
  gl.addColorStop(1, 'rgba(5,10,24,0)')
  ctx.fillStyle = gl
  ctx.fillRect(0, 0, fw, ch)

  // Right
  const gr = ctx.createLinearGradient(cw - fw, 0, cw, 0)
  gr.addColorStop(0, 'rgba(5,10,24,0)')
  gr.addColorStop(1, 'rgba(5,10,24,1)')
  ctx.fillStyle = gr
  ctx.fillRect(cw - fw, 0, fw, ch)
}

// ── Frame preloader (two-phase) ────────────────────────────────
function loadFrame (i) {
  const img = new Image()
  const num  = String(i + 1).padStart(4, '0')
  img.src    = `/bad-v2/frames/frame_${num}.webp`
  img.onload = () => {
    frames[i] = img
    loaded++
    const pct = Math.round((loaded / FRAME_COUNT) * 100)
    loaderBar.style.width = pct + '%'
    loaderPct.textContent = pct + '%'

    // Eerste frame direct tekenen
    if (i === 0) drawFrame(0)

    // Alle frames geladen → start animatie
    if (loaded === FRAME_COUNT && !animReady) {
      animReady = true
      startAnimation()
    }
  }
  img.onerror = () => {
    // Tel toch mee zodat de loader niet hangt
    loaded++
    if (loaded === FRAME_COUNT && !animReady) {
      animReady = true
      startAnimation()
    }
  }
}

// Phase 1: eerste 10 frames (zichtbaar tijdens hero)
for (let i = 0; i < Math.min(10, FRAME_COUNT); i++) loadFrame(i)

// Phase 2: rest na 50ms (non-blocking)
setTimeout(() => {
  for (let i = 10; i < FRAME_COUNT; i++) loadFrame(i)
}, 50)

// ── Lenis + GSAP setup ─────────────────────────────────────────
function startAnimation () {
  // Loader weggooien
  setTimeout(() => {
    loader.classList.add('hidden')
    playHeroEntry()
  }, 300)

  // ── Lenis smooth scroll ──
  const lenis = new Lenis({
    duration:    1.2,
    easing:      t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add(time => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)

  // ── Diensten kubus initialiseren ──
  initDiensten()

  // ── Scroll progress bar ──
  lenis.on('scroll', ({ progress }) => {
    if (scrollFill) scrollFill.style.width = (progress * 100) + '%'
  })

  // ── Nav scrolled state ──
  lenis.on('scroll', ({ scroll }) => {
    nav.classList.toggle('scrolled', scroll > 80)
  })

  // ── Master ScrollTrigger: frames + hero fade + circle-wipe ──
  ScrollTrigger.create({
    trigger:  scrollCont,
    start:    'top top',
    end:      'bottom bottom',
    scrub:    true,
    onUpdate (self) {
      const progress = self.progress

      // 1. Hero fade — weg bij ~4% scroll
      hero.style.opacity = Math.max(0, 1 - progress * 25)
      // Zodra hero onzichtbaar is: blokkeer pointer-events zodat
      // de hero-content geen klikken op de project-cards onderschept
      heroContent.style.pointerEvents = progress < 0.06 ? 'auto' : 'none'

      // 2. Canvas circle-wipe — zachte radial gradient mask
      const wipeP  = Math.min(1, Math.max(0, (progress - 0.005) / 0.04))
      const radius = wipeP * 75
      const soft   = Math.max(3, 10 - wipeP * 8)
      const inner  = Math.max(0, radius - soft)
      const mask   = `radial-gradient(circle, black ${inner}%, transparent ${radius}%)`
      canvasWrap.style.maskImage = mask
      canvasWrap.style.webkitMaskImage = mask

      // 3. Dark overlay — 0→40% bij opkomst, dan 40→100% naar einde (fade-to-black)
      {
        let op
        if (progress < 0.04) {
          op = Math.min(0.40, (progress - 0.005) / 0.02)
        } else if (progress < 0.78) {
          op = 0.40
        } else {
          op = 0.40 + Math.min(1, (progress - 0.78) / 0.22) * 0.60
        }
        overlay.style.opacity = Math.min(1, Math.max(0, op))
      }

      // 3d. Diensten tussenstuk — later op, GEEN fade-out aan canvas-kant
      //     De diensten-sectie (z-index 8) schuift er vanzelf overheen bij verder scrollen
      //     Bij terugscrollen verdwijnt het automatisch via de fade-in logica
      {
        const dtEl = document.getElementById('diensten-title')
        if (dtEl) {
          let op = 0
          if (progress >= 0.90 && progress < 0.95) op = (progress - 0.90) / 0.05  // fade in
          else if (progress >= 0.95)               op = 1                          // blijft op 1 t/m einde canvas
          const ty = progress < 0.95 ? (1 - Math.max(0, (progress - 0.90) / 0.05)) * 20 : 0
          dtEl.style.opacity   = Math.max(0, Math.min(1, op))
          dtEl.style.transform = `translateY(${ty}px)`
        }
      }

      // 3b. "Gerealiseerde Projecten" tussenstuk
      //     in:  0.05 → 0.10 | zichtbaar: 0.10 → 0.20 | uit: 0.20 → 0.26
      {
        let op = 0
        if (progress >= 0.05 && progress <= 0.26) {
          if (progress < 0.10)       op = (progress - 0.05) / 0.05
          else if (progress < 0.20)  op = 1
          else                       op = 1 - (progress - 0.20) / 0.06
        }
        // Subtiele y-beweging: schuift iets omhoog bij uitfaden
        const ty = progress < 0.10 ? (1 - (progress - 0.05) / 0.05) * 28 : 0
        sectionTitle.style.opacity   = op
        sectionTitle.style.transform = `translateY(${ty}px)`
      }

      // 3c. Project cards — 3 sets, elk op eigen scroll-range
      projGroups.forEach(group => {
        let op = 0
        if (progress >= group.in && progress <= group.out) {
          if (progress < group.fullIn) {
            op = (progress - group.in) / (group.fullIn - group.in)
          } else if (progress < group.fullOut) {
            op = 1
          } else {
            op = 1 - (progress - group.fullOut) / (group.out - group.fullOut)
          }
        }
        group.cards.forEach(card => {
          card.style.opacity = op
          // Alleen echte links (a-tags) krijgen pointer-events
          if (card.tagName === 'A') {
            card.style.pointerEvents = op > 0.15 ? 'auto' : 'none'
          }
        })
      })

      // 4. Frame index — stopt bij 75% (sneller naar de diensten)
      if (progress <= 0.75) {
        const frameProgress = Math.min(progress * FRAME_SPEED, 1)
        const index = Math.min(
          Math.floor(frameProgress * FRAME_COUNT),
          FRAME_COUNT - 1
        )
        if (index !== lastIndex) {
          requestAnimationFrame(() => drawFrame(index))
          lastIndex = index
        }
      }
    }
  })
}

// ── Diensten: 3D rolling cube ──────────────────────────────────
function initDiensten () {
  const cube       = document.getElementById('cube')
  const border     = document.getElementById('diensten-border')
  const cubeSticky = document.getElementById('cube-sticky')
  const items       = document.querySelectorAll('.dienst-item')
  const section     = document.getElementById('s-diensten')

  if (!cube || !section) return

  // 6 vlakken — gevarieerde gooi-afstanden per dienst + rotX voor top/bottom
  // rotX: -270° is wiskundig gelijk aan +90° → omzeilt de 180° sprong via lerp
  const keyframes = [
    { x:  18, rotX:    0, rotY:     0 },  // front  — Webdesign    (rechts)
    { x: -18, rotX:    0, rotY:   -90 },  // right  — Onderhoud    (links, snelle kwartslag)
    { x:  18, rotX:    0, rotY:  -540 },  // back   — Hosting      (rechts, 1.5× tol)
    { x: -18, rotX:    0, rotY:  -630 },  // left   — Google       (links, snelle kwartslag)
    { x:  18, rotX:  -90, rotY: -1080 },  // top    — Aanpassingen (rechts, tol + kanteling)
    { x: -18, rotX: -270, rotY: -1440 },  // bottom — Veiligheid   (links, -1440=-4×360→0° effectief)
  ]

  // Startpositie = keyframes[0]
  cube.style.transform = `translateX(${keyframes[0].x * window.innerWidth / 100}px) rotateY(0deg) rotateX(0deg) rotateZ(0deg)`

  // Kubus fadeert in iets vóór de eerste dienst volledig in beeld is
  ScrollTrigger.create({
    trigger:     section,
    start:       'top 30%',
    onEnter:     () => gsap.to(cubeSticky, { opacity: 1, duration: 0.5, ease: 'power2.out' }),
    onLeaveBack: () => gsap.set(cubeSticky, { opacity: 0 }),
  })

  // Blauw kader: verschijnt zodra sectie begint, verdwijnt aan het einde
  if (border) {
    ScrollTrigger.create({
      trigger:     section,
      start:       'top top',
      end:         'bottom bottom',
      onEnter:     () => { border.style.opacity = '1' },
      onLeave:     () => { border.style.opacity = '0' },
      onEnterBack: () => { border.style.opacity = '1' },
      onLeaveBack: () => { border.style.opacity = '0' },
    })
  }

  // Dienst-tekst fade-in
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
  }, { threshold: 0.2 })
  items.forEach(item => observer.observe(item))

  // ── Kubus animatie ────────────────────────────────────────────
  // Sectie: 6 × 100vh = 600vh, scrollable = 500vh
  // raw = progress × 5  →  service N gecenterd bij raw = N
  //
  // In slot N (raw N→N+1):
  //   0.00–0.05  kubus BIJNA STIL bij keyframes[N]
  //   0.05–0.95  rolt continu door naar keyframes[N+1] (cosinus ease)
  //   0.95–1.00  kubus BIJNA STIL bij keyframes[N+1]
  //
  // scrub: true  →  Lenis doet alle smoothing, GSAP volgt exact
  // rollZ: piek tijdens transitie, 0 bij rust  →  kubus staat altijd recht

  ScrollTrigger.create({
    trigger: section,
    start:   'top top',
    end:     'bottom bottom',
    scrub:   true,
    onUpdate (self) {
      const p   = self.progress
      const raw = p * 5

      const idx   = raw >= 5 ? 4 : Math.floor(raw)
      const local = raw >= 5 ? 1 : raw - Math.floor(raw)

      const kfFrom = keyframes[idx]
      const kfTo   = keyframes[Math.min(idx + 1, 5)]

      // Transitie window 0.05 → 0.95 — continu rollen, minimale rust aan de zijkanten
      const tRaw = Math.max(0, Math.min(1, (local - 0.05) / 0.90))
      const t    = (1 - Math.cos(tRaw * Math.PI)) / 2

      const xVw  = lerp(kfFrom.x, kfTo.x, t)
      const rotX = lerp(kfFrom.rotX, kfTo.rotX, t)
      const rotY = lerp(kfFrom.rotY, kfTo.rotY, t)

      // Subtiele lean tijdens beweging, 0 bij rust
      const rollMag = Math.sin(tRaw * Math.PI)
      const rollZ   = -(kfTo.x - kfFrom.x) * rollMag * 0.22

      // Direct style.transform — omzeilt GSAP angle-normalisatie
      // Volgorde: rotY → rotX → rollZ (rotaties in objectruimte)
      const xPx = xVw * window.innerWidth / 100
      cube.style.transform = `translateX(${xPx}px) rotateY(${rotY}deg) rotateX(${rotX}deg) rotateZ(${rollZ}deg)`

    }
  })
}

function lerp (a, b, t) { return a + (b - a) * t }

// ── Hero entry animation ───────────────────────────────────────
function splitWords (el) {
  const parts = el.innerHTML.split(/(<br\s*\/?>)/gi)
  el.innerHTML = parts.map(part => {
    if (/^<br/i.test(part)) return part
    return part.trim().split(/\s+/).filter(Boolean)
      .map(w => `<span class="w"><span class="wi">${w}</span></span>`)
      .join(' ')
  }).join(' ')
  return Array.from(el.querySelectorAll('.wi'))
}

function playHeroEntry () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const hl1    = document.querySelector('.hl-1')
  const hl2    = document.querySelector('.hl-2')
  const words1 = hl1 ? splitWords(hl1) : []
  const words2 = hl2 ? splitWords(hl2) : []

  gsap.set([words1, words2], { yPercent: 110 })

  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
  tl.to('.hero-eyebrow', { y: 0, opacity: 1, duration: .9 }, 0)
  if (words1.length) tl.to(words1, { yPercent: 0, duration: 1.15, stagger: .06 }, .2)
  if (words2.length) tl.to(words2, { yPercent: 0, duration: 1.15, stagger: .06 }, .36)
  tl.to('.hero-foot',   { y: 0, opacity: 1, duration: .8 }, .72)
  tl.to('.scroll-cue',  { opacity: 1, duration: .6 }, 1.1)
  tl.add(() => {
    gsap.to('.scroll-line', {
      scaleY: .3, yoyo: true, repeat: -1,
      duration: .82, ease: 'power2.inOut',
      transformOrigin: 'top center',
    })
  }, 1.8)
}
