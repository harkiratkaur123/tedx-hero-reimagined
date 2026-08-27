import { useEffect, useRef, useState } from 'react'
import { EVENT } from '../../data/site'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import HeroCTAs from './HeroCTAs'
import MarqueeText from './MarqueeText'

type Props = {
  onGetTickets: () => void
  onApplyToSpeak: () => void
  /** skip straight to the resting hero (e.g. a modal was deep-linked open) */
  startResolved?: boolean
}

/**
 * The reveal, per the tested reference choreography:
 *   0ms     two dark-oxblood curtains cover the screen; the event footage is
 *           already playing full-bleed underneath them
 *   300ms   the curtains pull apart (1.15s, cubic-bezier(.76,0,.24,1))
 *   1700ms  the TEDXIGDTUW marquee sign + the two CTAs fade/slide up over the video
 *
 * The marquee bulbs light red where the cursor gets close. Reduced-motion and a
 * deep-linked modal skip straight to the open/text-visible end state.
 */
export default function HeroSequence({ onGetTickets, onApplyToSpeak, startResolved }: Props) {
  const prefersReduced = usePrefersReducedMotion()
  const settleNow = Boolean(startResolved) || prefersReduced

  const [open, setOpen] = useState(settleNow)
  const [textVisible, setTextVisible] = useState(settleNow)
  const [skipped, setSkipped] = useState(settleNow)
  const heroVideoRef = useRef<HTMLVideoElement>(null)
  const timers = useRef<number[]>([])

  const finish = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setOpen(true)
    setTextVisible(true)
    setSkipped(true)
  }

  useEffect(() => {
    if (settleNow) return
    timers.current = [
      window.setTimeout(() => setOpen(true), 300),
      window.setTimeout(() => setTextVisible(true), 1700),
    ]
    return () => timers.current.forEach(clearTimeout)
  }, [settleNow])

  // Keep the footage playing (browsers pause a backgrounded <video>).
  useEffect(() => {
    const play = () => {
      if (!document.hidden) heroVideoRef.current?.play().catch(() => {})
    }
    play()
    document.addEventListener('visibilitychange', play)
    return () => document.removeEventListener('visibilitychange', play)
  }, [])

  // Skip with any key while the intro runs.
  useEffect(() => {
    if (textVisible) return
    const onKey = () => finish()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [textVisible])

  return (
    <section
      className={`relative h-[100svh] w-full overflow-hidden bg-ink ${open ? 'curtain-open' : ''}`}
    >
      {/* ---- event footage, playing from the start behind the curtains ---- */}
      <video
        ref={heroVideoRef}
        src="/media/hero-loop.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 z-[2] h-full w-full object-cover opacity-[0.72]"
      />
      <div className="absolute inset-0 z-[3] bg-black/25" />
      <div
        className="pointer-events-none absolute inset-0 z-[3]"
        style={{
          background:
            'radial-gradient(120% 85% at 50% 42%, transparent 0%, rgba(0,0,0,0.35) 62%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      {/* ---- curtains ---- */}
      <div className="pointer-events-none absolute inset-0 z-[5] flex">
        <div className="curtain left" />
        <div className="curtain right" />
      </div>

      {/* ---- marquee + CTAs ---- */}
      <div
        className="absolute inset-0 z-[6] flex flex-col items-center justify-center px-4"
        style={{
          opacity: textVisible ? 1 : 0,
          transform: textVisible ? 'translateY(0)' : 'translateY(24px)',
          transition:
            'opacity 0.8s ease, transform 0.8s cubic-bezier(.2,.8,.25,1)',
          pointerEvents: textVisible ? 'auto' : 'none',
        }}
      >
        <MarqueeText
          text={EVENT.wordmark}
          interactive={textVisible}
          animateIn={textVisible && !settleNow}
        />
        <p className="mt-4 text-center text-xs tracking-[0.42em] text-white/70 uppercase sm:text-sm">
          {EVENT.theme}
        </p>
        <HeroCTAs show={textVisible} onGetTickets={onGetTickets} onApplyToSpeak={onApplyToSpeak} />
      </div>

      {/* ---- top bar ---- */}
      <div
        className="absolute top-0 left-0 z-[7] flex w-full items-center px-5 py-4 transition-opacity duration-500 sm:px-8"
        style={{ opacity: textVisible ? 1 : 0 }}
      >
        <span className="text-lg font-bold tracking-tight">
          TEDx<span className="text-ted">IGDTUW</span>
        </span>
      </div>

      {/* ---- skip intro ---- */}
      {!textVisible && !skipped && (
        <button
          type="button"
          onClick={finish}
          className="absolute right-6 bottom-6 z-20 rounded-full border border-white/20 bg-white/10 px-3.5 py-2
                     text-xs tracking-widest text-white/60 uppercase transition hover:text-white
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          Skip intro
        </button>
      )}

      {/* ---- scroll hint ---- */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        aria-label="Scroll down"
        className="absolute bottom-5 left-1/2 z-[7] -translate-x-1/2 text-xl text-white/50 transition-opacity duration-500 hover:text-white/80"
        style={{ opacity: textVisible ? 1 : 0, pointerEvents: textVisible ? 'auto' : 'none' }}
      >
        <span className="block animate-bounce" aria-hidden>
          ↓
        </span>
      </button>
    </section>
  )
}
