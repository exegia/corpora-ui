# Corpora UI for GPUI

Foundations, atoms, composed components and blocks for native GPUI applications.
Requires Rust 1.99.1 or newer and GPUI Kit 0.10.

```toml
[dependencies]
corpora-ui = "0.1"
gpui-kit = "0.10"
```

Register `corpora_ui::Assets` with the application and call
`corpora_ui::init(cx)` once at startup. This initializes GPUI Kit and the Corpora
theme, fonts and assets. See the [gallery and component guide](https://github.com/exegia/corpora-ui/blob/dev/gpui/README.md).

## Optional full glass on macOS

**The default crate uses translucent surfaces. Real backdrop blur and refraction
require the `glass` feature plus our patched GPUI renderer.** Adding another
dependency alone does not replace the renderer used by GPUI Kit. The patch also
supplies painted scale pulses for press and hover feedback; the default build
keeps those controls at their normal scale. Other renderers continue to use the
translucent glass fallback.

The full glass setup uses the same renderer sources as the native gallery.
Clone the following pinned revision into a `corpora-ui-renderer` directory next
to your application's root `Cargo.toml`:

```sh
git clone https://github.com/exegia/corpora-ui.git corpora-ui-renderer
git -C corpora-ui-renderer checkout 0247f1c5d50c8d6dd5efd5da9d67b7410a81e1e4
```

Then configure your **application workspace root**, not a dependency manifest:

```toml
[dependencies]
corpora-ui = { version = "0.1", features = ["glass"] }
gpui-kit = "0.10"

[patch.crates-io]
gpui-pre = { path = "corpora-ui-renderer/gpui/vendor/gpui-pre" }
gpui-pre-apple = { path = "corpora-ui-renderer/gpui/vendor/gpui-pre-apple" }
```

Run `cargo update -p gpui-pre -p gpui-pre-apple`, then build the application.
Keep both renderer overrides together at the same pinned revision. Cargo does
not propagate dependency workspaces' `[patch]` sections to your application.
These overrides currently support the GPUI Kit 0.10 / GPUI 0.3.12 combination;
do not substitute Kit 0.11 without porting and testing the renderer changes.

The gallery also uses a separate GPUI Base patch for its wider text caret. That
patch is optional for glass itself:

```toml
# Optional additional entry under [patch.crates-io]:
gpui-base = { git = "https://github.com/emmanuel-defreitas/gpui-kit", rev = "0b1e12150d768416451ffd134833321d2c927539" }
```

The renderer includes its upstream Apache-2.0 notices and the glass material's
MIT attribution. See [renderer provenance](https://github.com/exegia/corpora-ui/blob/0247f1c5d50c8d6dd5efd5da9d67b7410a81e1e4/gpui/vendor/README.md).

## Development tools

The gallery, native media examples and Agentation integration are development
tools in the source repository. They are excluded from the published library
archive. Run `make gpui-gallery` or `make gpui-gallery-dev` from the repository
to use them with full glass.

The library is MIT licensed. Included font and icon assets retain their own
license notices under `assets/`.
