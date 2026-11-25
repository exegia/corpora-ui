# Gallery media samples

These original, generated fixtures are distributed under the repository MIT
license. They contain no external footage, voices, or network URLs.

- `fractal-zoom.mp4`: eight seconds of FFmpeg's Mandelbrot generator,
  480 × 270, 24 fps, H.264, no audio.
- `fractal-poster.png`: the first decoded frame of that video.
- `chime.wav`: eight seconds of mono 22,050 Hz, 16-bit PCM; six synthesized
  notes (C4, E4, G4, C5, G4, E4), with attack and exponential decay.

The files are embedded in the gallery executable. AVFoundation reads a temporary
copy owned by each player; dropping the player pauses it and removes that copy.
There is no runtime FFmpeg dependency. Native playback is macOS-only; other
platforms show an explicit unsupported message when Play is pressed.

Verify actual decoding and playback on macOS from `gpui/`:

```sh
rtk cargo run -p corpora-ui --example gallery -- --verify-media
```

This checks video frame changes and playback/pause/replay/end for both samples.
The audio check verifies the native playback clock, not the listener's output
volume or speaker configuration.
