// Regenerates public/media/hero-loop.mp4 from a source clip.
//
//   node scripts/encode-hero.mjs "/path/to/source.mov"
//
// Produces a small, web-safe, autoplay-friendly loop:
//   H.264 High / yuv420p (limited range)  — the source was HEVC yuvj420p (full
//   range), which some browsers' demuxers stall on; this normalises it.
//   no audio track                        — the hero <video> is always muted
//   +faststart                            — moov atom up front so it starts
//                                           streaming immediately
import { execFileSync } from 'node:child_process'
import ffmpeg from 'ffmpeg-static'

const src = process.argv[2]
if (!src) {
  console.error('usage: node scripts/encode-hero.mjs <source-video>')
  process.exit(1)
}

const out = new URL('../public/media/hero-loop.mp4', import.meta.url).pathname

execFileSync(
  ffmpeg,
  [
    '-y',
    '-i', src,
    '-an',
    '-t', '40',
    '-vf', 'scale=1280:-2,fps=30',
    '-c:v', 'libx264',
    '-profile:v', 'high',
    '-pix_fmt', 'yuv420p',
    '-crf', '28',
    '-preset', 'slow',
    '-movflags', '+faststart',
    out,
  ],
  { stdio: 'inherit' },
)

console.log('\nwrote', out)
