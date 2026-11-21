# GPUI glass backport

`gpui-pre` and `gpui-pre-apple` here are the published 0.3.12 sources (Zed
revision `d2a4fb6`) with a backdrop pass added, so `corpora_ui::atoms::glass`
can bend and frost what is painted behind it. `../Cargo.toml` patches both in,
which keeps GPUI Kit and this workspace on one GPUI type graph. Their
Apache-2.0 licenses are kept in each package.

The pass is the one `gpui-corpora` carries for GPUI 0.3.8, itself adapted from
[`crabtalk/zed` revision `44df48a`](https://github.com/crabtalk/zed/tree/44df48a262b7bba0f2ca6bceddbf1a5abcfbee8e),
moved to 0.3.12. Only these files differ from the published packages:

- `gpui-pre/src/scene.rs`, `gpui-pre/src/scene/paint_scale.rs`: ordered
  backdrop primitives and retained-scene replay.
- `gpui-pre/src/window.rs`: `GlassEffect` and `paint_backdrop_blur`.
- `gpui-pre-apple/src/metal_renderer.rs`: framebuffer snapshots, a cached MPS
  Gaussian kernel and the glass draw. Rewritten against `objc2-metal`, which
  0.3.12 uses in place of the `metal` crate.
- `gpui-pre-apple/src/shaders.metal`: Bezel's rounded lens, dispersion and rim.
  The rim's brightness and width are per side here (`GlassEffect::edge` and
  `edge_width` are `Edges`); upstream has one value for the whole outline.
- `gpui-pre-apple/build.rs`: shader bindings are generated from the sibling
  `gpui-pre`, not from the copy the published crate embeds (omitted here).

The glass material values come from
[`crabtalk/bezel`](https://github.com/crabtalk/bezel), under its
[MIT license](LICENSE-BEZEL). Only Metal implements the pass; other renderers
ignore the call and the atom falls back to a translucent fill.

To move to a newer GPUI, diff these files against the published 0.3.12
packages and apply the result to the new version.
