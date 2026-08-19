/** "Jenny Hamilton" → "JH", "luna" → "L". */
export function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ""
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : ""
  return (first + last).toUpperCase()
}

/** Sampling grid for `measureRimTone`. 16² px is enough to average a rim. */
const TONE_SAMPLE_SIZE = 16
/** Pixels this far (in radii) from the centre count as rim — the band the
 * bezel sits on. Matches the ring's mask, which fades in from ~78%. */
const TONE_RIM_RADIUS = 0.6

const toneCache = new Map<string, Promise<number | null>>()

/**
 * Average perceived lightness, 0 (black) → 1 (white), of an image's outer
 * band — the pixels the bezel ring overlays — or `null` when it cannot be
 * measured: no DOM/canvas (SSR, test DOM), a decode failure, or a host
 * without CORS headers (the sample needs a CORS-clean image; the avatar's
 * own `<img>` is left untouched, so a non-CORS host still displays).
 * Results are memoised per `src`, so a room of the same face samples once.
 */
export function measureRimTone(src: string): Promise<number | null> {
  const cached = toneCache.get(src)
  if (cached) return cached
  const promise = new Promise<number | null>((resolve) => {
    if (typeof document === "undefined" || typeof Image === "undefined") {
      resolve(null)
      return
    }
    const image = new Image()
    image.crossOrigin = "anonymous"
    image.decoding = "async"
    image.onerror = () => resolve(null)
    image.onload = () => {
      try {
        const size = TONE_SAMPLE_SIZE
        const canvas = document.createElement("canvas")
        canvas.width = size
        canvas.height = size
        const context = canvas.getContext("2d", { willReadFrequently: true })
        if (!context) {
          resolve(null)
          return
        }
        context.drawImage(image, 0, 0, size, size)
        const { data } = context.getImageData(0, 0, size, size)
        const centre = (size - 1) / 2
        const rim = TONE_RIM_RADIUS * centre
        let sum = 0
        let count = 0
        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            const dx = x - centre
            const dy = y - centre
            if (dx * dx + dy * dy < rim * rim) continue
            const offset = (y * size + x) * 4
            const r = data[offset] ?? 0
            const g = data[offset + 1] ?? 0
            const b = data[offset + 2] ?? 0
            // Rec. 709 luma on the gamma-encoded channels: close enough to
            // perceived lightness for a "light or dark?" verdict.
            sum += (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
            count++
          }
        }
        resolve(count === 0 ? null : sum / count)
      } catch {
        // A tainted canvas throws on getImageData.
        resolve(null)
      }
    }
    image.src = src
  })
  toneCache.set(src, promise)
  // Only a real reading is worth keeping — a failed sample (flaky network,
  // a host that gained CORS headers later) gets another go next mount.
  void promise.then((tone) => {
    if (tone === null) toneCache.delete(src)
  })
  return promise
}

/**
 * Bezel highlight/shadow alphas for an image whose rim lightness is `tone`
 * (0 → 1). Against a dark rim the white highlight is eased off (it glares)
 * and the black shadow pushed up (it has to darken mid-tones to register);
 * against a pale rim the reverse — the highlight can be full (it barely
 * shows) and the shadow is what carries the emboss, so it sits lighter.
 * Linear between; the end points are tuned by eye on a dark and a light
 * photo in both themes.
 */
export function bezelAlphasForTone(tone: number): { hi: number; lo: number } {
  const t = Math.min(1, Math.max(0, tone))
  return {
    hi: 0.7 + 0.3 * t,
    lo: 0.6 - 0.4 * t,
  }
}
