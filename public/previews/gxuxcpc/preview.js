import { SEGMENTS as FRAGMENTS } from './segments.js'
import {
  GXU_XCPC_MOTION as motion,
  sample,
  sampleCharacters,
  ASSEMBLY,
  createTimeline,
  stageName,
  svgSource,
} from './motion.js'

const $ = (selector) => document.querySelector(selector)
const media = window.matchMedia('(prefers-reduced-motion: reduce)')
const mobile = window.matchMedia('(max-width: 640px)')
const tablet = window.matchMedia('(min-width: 641px) and (max-width: 1000px)')
const disposers = []
const controllers = []
const timers = new Set()
let active = true

function later(callback, delay) {
  const id = setTimeout(() => {
    timers.delete(id)
    if (active) callback()
  }, delay)
  timers.add(id)
  return id
}
function cancelTimer(id) {
  clearTimeout(id)
  timers.delete(id)
}
function listen(element, event, callback, options) {
  element.addEventListener(event, callback, options)
  disposers.push(() => element.removeEventListener(event, callback, options))
}

function mark(
  element,
  { initial = 0, align = 'center', onUpdate = () => {}, onState = () => {} } = {},
) {
  element.innerHTML = svgSource(initial)
  const svg = element.querySelector('svg')
  if (element.tagName === 'BUTTON') {
    svg.removeAttribute('role')
    svg.setAttribute('aria-hidden', 'true')
  }
  const group = element.querySelector('g')
  const paths = [...group.querySelectorAll('path')]
  paths.forEach((path, index) => {
    path.id = `${element.id}-${FRAGMENTS[index].id}`
    path.dataset.part = FRAGMENTS[index].id
    path.dataset.kind = 'segment'
    path.dataset.letter = FRAGMENTS[index].family
  })
  let previous = [],
    offset = NaN
  const draw = (progress, micro = 0) => {
    const frame = sample(progress, align, micro)
    paths.forEach((path, i) => {
      if (previous[i] !== frame.paths[i]) path.setAttribute('d', frame.paths[i])
    })
    if (offset !== frame.offset) group.setAttribute('transform', `translate(${frame.offset} 0)`)
    previous = frame.paths
    offset = frame.offset
    element.dataset.progress = progress.toFixed(4)
    if (element.tagName === 'BUTTON') element.setAttribute('aria-expanded', String(progress < 1))
    onUpdate(progress)
  }
  const timeline = createTimeline(draw, {
    initial,
    reduced: () => media.matches,
    onState: (state) => {
      element.dataset.state = state
      onState(state)
    },
  })
  draw(initial)
  const controller = { element, timeline, draw }
  controllers.push(controller)
  return controller
}

let main
let revealTimer
function takeControl(action) {
  cancelTimer(revealTimer)
  action()
}
const frames = [0, 0.2, 0.4, 0.6, 0.8, 1]
const labels = ['READABLE', 'TWO BRANCHES', 'FOLD TOGETHER', 'G + X', 'ASSEMBLY', 'CORE']
$('#filmstrip').innerHTML = frames
  .map(
    (p, i) =>
      `<button class="frame" type="button" data-progress="${p}" aria-label="检查 ${p * 100}% 形变" aria-pressed="${p === 0}"><span class="frame-picture">${svgSource(p).replaceAll(' id="', ` id="frame-${i}-`)}</span><span class="frame-label"><span>${(p * 100).toString().padStart(3, '0')}%</span><span>${labels[i]}</span></span></button>`,
  )
  .join('')

main = mark($('#primary'), {
  onUpdate(p) {
    $('#progress').value = p
    $('#progress-value').value = `${Math.round(p * 100)
      .toString()
      .padStart(3, '0')}%`
    $('#stage').textContent = stageName(p)
    for (const button of $('#filmstrip').children)
      button.setAttribute(
        'aria-pressed',
        String(Math.abs(Number(button.dataset.progress) - p) < 0.005),
      )
  },
  onState(state) {
    const playing = state === 'compressing' || state === 'expanding'
    $('#play').textContent = playing ? 'Ⅱ 暂停' : '▷ 播放'
    $('#transport-status').textContent =
      state === 'compressing'
        ? '正在收起'
        : state === 'expanding'
          ? '正在展开'
          : state === 'paused'
            ? '已暂停'
            : '动画完成'
  },
})
listen($('#expand'), 'click', () => takeControl(() => main.timeline.to(0)))
listen($('#collapse'), 'click', () => takeControl(() => main.timeline.to(1)))
listen($('#play'), 'click', () => {
  cancelTimer(revealTimer)
  if (main.timeline.running) main.timeline.pause()
  else
    main.timeline.to(
      main.timeline.progress === main.timeline.target
        ? main.timeline.progress < 0.5
          ? 1
          : 0
        : main.timeline.target,
    )
})
listen($('#progress'), 'input', (event) =>
  takeControl(() => main.timeline.seek(Number(event.target.value))),
)
listen($('#speed'), 'change', (event) => {
  main.timeline.speed = Number(event.target.value)
})
for (const button of $('#filmstrip').children)
  listen(button, 'click', () =>
    takeControl(() => main.timeline.seek(Number(button.dataset.progress))),
  )

// A pointer/focus intent is layered over each example's resting state.
// Reversals always change the target of its existing timeline.
function interactions(controller, resting = () => 1) {
  let hover = false,
    focus = false,
    temporary = null,
    intent,
    release
  const sync = () => controller.timeline.to(temporary ?? (hover || focus ? 0 : resting()))
  listen(controller.element, 'pointerenter', (event) => {
    if (event.pointerType === 'touch') return
    cancelTimer(intent)
    intent = later(() => {
      hover = true
      sync()
    }, motion.hoverIntent)
  })
  listen(controller.element, 'pointerleave', (event) => {
    if (event.pointerType === 'touch') return
    cancelTimer(intent)
    intent = later(() => {
      hover = false
      sync()
    }, motion.hoverIntent)
  })
  listen(controller.element, 'focus', () => {
    if (controller.element.matches(':focus-visible')) {
      focus = true
      sync()
    }
  })
  listen(controller.element, 'blur', () => {
    focus = false
    temporary = null
    cancelTimer(release)
    sync()
  })
  listen(controller.element, 'click', () => {
    cancelTimer(intent)
    cancelTimer(release)
    temporary = controller.timeline.target === 0 ? 1 : 0
    hover = focus = false
    sync()
    release = later(() => {
      temporary = null
      sync()
    }, 2400)
  })
  const reset = () => {
    cancelTimer(intent)
    cancelTimer(release)
    hover = focus = false
    temporary = null
    sync()
  }
  listen(controller.element, 'keydown', (event) => {
    if (event.key === 'Escape') reset()
  })
  listen(controller.element, 'pointercancel', reset)
  return sync
}
interactions(mark($('#hover'), { initial: 1 }))
const revealMark = mark($('#reveal'))
function reveal(controller) {
  cancelTimer(revealTimer)
  if (media.matches) {
    controller.timeline.to(0, true)
    return
  }
  controller.timeline.to(1, true)
  revealTimer = later(() => controller.timeline.to(0), motion.revealDelay)
}
listen($('#replay'), 'click', () => reveal(revealMark))
let seen = false
try {
  seen = sessionStorage.getItem('gxuxcpc:motion-study:seen') === '1'
  sessionStorage.setItem('gxuxcpc:motion-study:seen', '1')
} catch {
  /* Storage may be unavailable in a private preview. */
}
if (!seen) reveal(main)
else main.timeline.to(0, true)

const alive = mark($('#alive'), { initial: 1 })
let microFrame = 0
function respond() {
  if (microFrame || media.matches) return
  let start
  const tick = (now) => {
    start ??= now
    const p = Math.min(1, (now - start) / (motion.microDuration * 1000))
    const amount = Math.sin(p * Math.PI) ** 2
    alive.draw(1, amount)
    if (p < 1) microFrame = requestAnimationFrame(tick)
    else {
      microFrame = 0
      alive.draw(1)
    }
  }
  microFrame = requestAnimationFrame(tick)
}
listen(alive.element, 'pointerenter', respond)
listen(alive.element, 'focus', respond)
listen(alive.element, 'click', respond)

const scrollWindow = $('#scroll-window')
const scrollHeader = $('.scroll-header')
scrollHeader.style.setProperty('--header-expanded', `${motion.headerExpandedHeight}px`)
scrollHeader.style.setProperty(
  '--header-ratio',
  motion.headerCoreHeight / motion.headerExpandedHeight,
)
scrollHeader.style.setProperty(
  '--header-offset',
  `${(motion.headerCoreHeight - motion.headerExpandedHeight) / 2}px`,
)
scrollHeader.style.setProperty('--header-duration', `${motion.headerDuration}ms`)
scrollHeader.style.setProperty('--header-delay', `${motion.headerDelay}ms`)
let scrolled = false,
  menuOpen = false
const restingHeader = () =>
  menuOpen ? 0 : mobile.matches || scrolled ? 1 : tablet.matches ? motion.stages.fold : 0
const headerMark = mark($('#header-logo'), { initial: restingHeader(), align: 'start' })
const syncHeader = interactions(headerMark, restingHeader)
function updateHeader() {
  const next = scrolled
    ? scrollWindow.scrollTop >= motion.scrollExpand
    : scrollWindow.scrollTop > motion.scrollCollapse
  if (next !== scrolled) {
    scrolled = next
    syncHeader()
  }
  scrollHeader.classList.toggle('is-core', scrolled && !menuOpen)
  $('#scroll-state').textContent =
    restingHeader() === 1 ? 'CORE ICON' : restingHeader() === 0 ? 'EXPANDED' : 'G + X'
}
listen(scrollWindow, 'scroll', updateHeader, { passive: true })
listen($('#menu'), 'click', () => {
  menuOpen = !menuOpen
  $('#menu').setAttribute('aria-expanded', String(menuOpen))
  $('#sample-menu').hidden = !menuOpen
  syncHeader()
  updateHeader()
})
const resizeHeader = () => {
  if (!mobile.matches) {
    menuOpen = false
    $('#sample-menu').hidden = true
    $('#menu').setAttribute('aria-expanded', 'false')
  }
  syncHeader()
  updateHeader()
}
listen(mobile, 'change', resizeHeader)
listen(tablet, 'change', resizeHeader)
updateHeader()

listen($('#theme'), 'click', () => {
  const dark = $('.preview').dataset.theme !== 'dark'
  $('.preview').dataset.theme = dark ? 'dark' : 'light'
  $('#theme').setAttribute('aria-pressed', String(dark))
  $('#theme').setAttribute('aria-label', `切换为${dark ? '浅' : '深'}色主题`)
  $('#theme-label').textContent = dark ? '浅色' : '深色'
  document.querySelector('meta[name="theme-color"]').content = dark ? '#101113' : '#f4f2ec'
})

function reducedMotion() {
  $('#motion-notice').hidden = !media.matches
  if (media.matches) {
    cancelAnimationFrame(microFrame)
    microFrame = 0
    alive.draw(1)
    for (const controller of controllers) controller.timeline.to(controller.timeline.target, true)
  }
}
listen(media, 'change', reducedMotion)
reducedMotion()

const exportedStages = {
  full: 0,
  branches: 0.4,
  folded: motion.stages.fold,
  merged: motion.stages.merge,
  core: 1,
}
listen($('#download'), 'click', () => {
  const state = $('#export-state').value
  const blob = new Blob([svgSource(exportedStages[state], { tight: state === 'core' })], {
    type: 'image/svg+xml',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `gxuxcpc-${state}.svg`
  anchor.click()
  later(() => URL.revokeObjectURL(url), 1000)
})
$('#config').textContent =
  `GXU_XCPC_MOTION\n\n duration       ${motion.duration}s\n easing         cubic-bezier(${motion.easing.join(', ')})\n hover intent   ${motion.hoverIntent}ms\n letter stagger ${motion.characterStagger * 1000}ms\n stroke stagger ${motion.strokeStagger * 1000}ms\n blade stagger  ${motion.bladeStagger * 1000}ms\n core lock      ${motion.lockDuration * 1000}ms\n\n G → Gxu / X → XCPC · parallel stroke assembly\n ${FRAGMENTS.length} SVG segments · one reversible playhead`

listen(document, 'visibilitychange', () => {
  if (document.hidden) {
    for (const controller of controllers) controller.timeline.pause()
    cancelAnimationFrame(microFrame)
    microFrame = 0
    alive.draw(1)
  }
})
listen(window, 'pagehide', () => {
  active = false
  for (const controller of controllers) controller.timeline.pause()
  for (const timer of timers) clearTimeout(timer)
  timers.clear()
  cancelAnimationFrame(microFrame)
})
listen(window, 'pageshow', (event) => {
  if (event.persisted) {
    active = true
    syncHeader()
    reducedMotion()
  }
})

// Inspection access is scoped to this standalone preview, never installed on the main site.
window.gxuxcpcPreview = {
  main: main.timeline,
  header: headerMark.timeline,
  sample,
  sampleCharacters,
  motion,
  fragments: FRAGMENTS,
  assembly: ASSEMBLY,
}
