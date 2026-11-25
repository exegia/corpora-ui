# Gallery annotation verification — 2026-11-24

Scope: the six Composed annotations in session
`dec8c0e9-e5f3-4723-9171-bae80c245b79`.

| Annotation | Change | Verification |
| --- | --- | --- |
| 1 — code background | Opaque muted surface in light mode; background surface in dark mode | Visually checked in the running native gallery in both themes |
| 2 — PDF pill | Explicit 4px horizontal and 2px vertical content padding | Visually checked in the running native gallery in both themes |
| 3 — verse number | Sans serif, primary color, 75% body size, lowered 3px at default zoom | Both themes visually checked; native reference, word and footnote popovers verified on follow-up; two verse unit tests pass |
| 4 — half-size control | Composer Send/Stop reduced from 48px to 24px, including icon | Both themes rendered; native Send click verified on follow-up; composer integration test passes |
| 5 — square buttons | Chapter/verse cells use 32px squares with small corner radius and zero content padding | Both themes rendered; native draft selection and commit verified on follow-up; navigation integration test passes |
| 6 — remove primary styling | Shared UserPill uses the neutral secondary variant | Native dark view and rebuilt light snapshot checked |

The initial square-cell render exposed label padding that exceeded the cell
width. Removing that padding corrected the overlap, including two-digit labels.
Verse body wrapping now uses a hanging indent; reference and body click targets
retain their original segment mapping.

## Checks

Run from `gpui/`:

```sh
rtk cargo check -p corpora-ui --example gallery
rtk cargo test -p corpora-ui --test composed
rtk cargo test -p corpora-ui --test composed navigation
```

All 17 Composed integration tests passed. The navigation test passed again after
the final padding correction. Rustfmt checks on the changed files and
`rtk proxy git diff --check` passed. The gallery watcher reported a successful
hot patch of the final navigation change.

## Native click follow-up — 2026-11-24

All three requested interaction areas passed in the running gallery, in dark
mode. These observations supersede the earlier inconclusive live checks.

| Check | Observed result | Evidence |
| --- | --- | --- |
| Verse reference | Pointer click on `1:1` opens “John, chapter 1, verse 1”; Escape closes it | [Reference popup](qa-evidence/2026-11-24-live-clicks/verse-reference.jpg) |
| Inline word | Clicking `the Word` opens the `λόγος` card with “noun · 330×”, View details and Add to chat | [Word popup](qa-evidence/2026-11-24-live-clicks/verse-word.jpg) |
| Footnote | Clicking `a` opens “Or: face to face with God” | [Footnote popup](qa-evidence/2026-11-24-live-clicks/verse-footnote.jpg) |
| Navigation | Selecting chapter 7 changes the verse grid from 36 to 53 choices. Selecting verse 17 creates draft John 7:17 while the current breadcrumb remains John 3:16. Clicking Go to location commits John 7:17, updates the breadcrumb/current-location dots and disables Go to location | [Draft](qa-evidence/2026-11-24-live-clicks/navigation-draft.jpg), [Committed](qa-evidence/2026-11-24-live-clicks/navigation-and-send.jpg) |
| Send | Entered `Native QA send check` and clicked the 24px Send button. Host caption became “Sent ‘Native QA send check’ with 1 attached”; text and attachment cleared, and empty Send became disabled | [Send result](qa-evidence/2026-11-24-live-clicks/navigation-and-send.jpg) |

No application code changes were needed for this follow-up. The existing tests
above were not rerun for this documentation-only update; `rtk proxy git diff
--check` and local evidence-link validation passed.

## Native-access observations and coverage limits

The bridge still returned slow accessibility reads, and the navigation commit's
combined click/read call timed out at 60 seconds. Reconnecting confirmed that
the commit had succeeded. A timeout alone did not establish an application failure.

The verse text's accessibility click did not open its popover; a direct pointer
click did. Visible popup content also did not appear in the returned accessibility
tree. Screenshots verified the content and Escape dismissal. This remains an
accessibility/automation observation, not a claim of complete assistive-technology
coverage.

Live click coverage here is dark mode. Earlier appearance checks covered both
themes using native captures and the built-in GPUI snapshot renderer. Animation
timing, resizing, navigation arrows and the popup's View details/Add to chat
actions were not part of this follow-up.

Session screenshot artifacts are in `/tmp/corpora-composed-verified/` (final
light/dark GPUI renders) and `/tmp/corpora-native-data-dark.jpg` (native capture).
The durable follow-up captures are linked above. The annotation threads contain
the earlier individual style-verification results.


## Blocks annotations 4–8 — 2026-11-24

The user clarified that note 4 targets the Bible chapter/verse buttons and note
5 targets Composer Send. These changes supersede the earlier 32px grid and
24px Send sizing recorded above.

| Note | Change | Verification |
| --- | --- | --- |
| 4 — larger Bible buttons | Chapter and verse cells are 56px squares with zero content padding. The grid wraps to the available rail width, capped at five columns. | Light/dark GPUI renders; navigation draft/commit integration test passes. The first render exposed clipping in the narrow sidebar; wrapping fixes it. |
| 5 — larger Send | Send/Stop now uses the default 32px circular button size, matching the Atoms circle examples. | Light/dark GPUI renders show the enabled and disabled controls; composer integration test passes. |
| 6 — smaller action corners | Recommendation Alternatives, Accept and Undo use the shared small radius (8.4px at default scale). | Light/dark GPUI renders of the recommendation actions. |
| 7 — primary focus border | Stock input focus uses the primary theme role; the custom Composer surface also uses primary when focused. InputField applies focused primary after its invalid border, retaining the error text and blurred error border. | Native pointer focus verified on email, password and OTP in light mode. The theme integration test asserts primary focus color in both appearances. Dark live focus and custom Composer live focus were subsequently verified in the follow-up below. |
| 8 — clip panel corners | AI gallery frames use the GPUI rounded frame cover so the header and textured body stay inside their rounded outline. | Light/dark GPUI renders, including Published edition's corners. |

The shared focus role also colors stock keyboard focus outlines. Borderless
embedded inputs retain their existing frameless presentation.

Evidence:

- [Light panel](qa-evidence/2026-11-24-blocks-feedback/panel-light.png) and [dark panel](qa-evidence/2026-11-24-blocks-feedback/panel-dark.png): Send size, action corners and frame clipping.
- [Light navigator](qa-evidence/2026-11-24-blocks-feedback/navigation-light.png) and [dark navigator](qa-evidence/2026-11-24-blocks-feedback/navigation-dark.png): larger cells and narrow-rail wrapping.
- Native light focus: [email](qa-evidence/2026-11-24-blocks-feedback/native-email-light.jpg), [password](qa-evidence/2026-11-24-blocks-feedback/native-password-light.jpg), [OTP](qa-evidence/2026-11-24-blocks-feedback/native-otp-light.jpg).

Checks run from `gpui/`:

```sh
rtk cargo test -p corpora-ui --test composed
rtk cargo test -p corpora-ui --test composed navigation
rtk cargo test -p corpora-ui --test atoms init_installs_the_corpora_theme_in_both_appearances
rtk cargo run -p corpora-ui --example gallery -- --snapshot /tmp/corpora-blocks-final
```

All 17 Composed tests passed; the targeted navigation test passed again after
the wrapping correction. The theme test passed in both appearances. The gallery
built and rendered both themes; changed-file rustfmt and diff checks passed.
The watcher reported a successful hot patch of the final navigation change.
Existing unused-variable/dead-code warnings remain.

Native access succeeded for the three light focus checks, then repeated app
selection/click calls timed out at 60 seconds. Dark mode was confirmed on by the
accessibility tree before access failed. The appearance checks above therefore
use the rebuilt GPUI offscreen renderer, not live native dark captures. No new
live Send or navigation click result, animation timing, or resizing result is
claimed for this pass.


## Dark native focus and resized controls — 2026-11-24

The requested live checks passed after restarting the gallery development
process. These results supersede the dark-focus and resized-control click
coverage limits in the preceding Blocks pass. No application source changes
were made during this follow-up.

| Check | Observed native result | Evidence |
| --- | --- | --- |
| Dark input focus | Email, password and the first OTP cell show primary-purple focus borders. Moving focus restores the previous field's neutral border. | [Email](qa-evidence/2026-11-24-dark-live/email.jpg), [password](qa-evidence/2026-11-24-dark-live/password.jpg), [OTP](qa-evidence/2026-11-24-dark-live/otp.jpg) |
| Dark Composer focus | Clicking the editable Composer and entering `Dark native send check` gives its enclosing surface a primary-purple border. | [Composer focus](qa-evidence/2026-11-24-dark-live/composer-focus.jpg) |
| Resized Send | Pointer click on the 32px Send circle clears the test message and PDF attachment. The empty Send control becomes dimmed and no longer appears as an actionable Send button in the accessibility tree. | [Send result](qa-evidence/2026-11-24-dark-live/send-result.jpg) |
| Resized chapter/verse cells | Pointer clicks on the 56px chapter 7 and verse 4 cells select draft John 7:4; chapter selection changes the verse count from 36 to 53. The main breadcrumb and reading heading remain John 3:16 before commit. | [Draft](qa-evidence/2026-11-24-dark-live/navigation-draft.jpg) |
| Navigation commit | Clicking Go to location updates the main breadcrumb, reading heading and current-location dots to John 7:4, and exposes Return to John 3:16. | [Committed](qa-evidence/2026-11-24-dark-live/navigation-committed.jpg) |

### Open finding: folded preview reads the other navigator's location

After the main navigator commits John 7:4, the folded example below still has
its independent John 3:16 breadcrumb, but its reading heading changes to John
7:4. The committed capture above shows both values. Source inspection confirms
`render_corpus_navigator` derives `reading` from `self.navigation` and passes
that same string into the example backed by `self.folded_navigation`
(`crates/corpora-ui/examples/gallery.rs`, around lines 2169–2200). The folded
preview should derive its heading from its own navigation state. This is a
gallery example wiring issue, separate from the enlarged cell click behavior.
No fix was made in this verification-only pass.

### Access and validation

The bridge initially returned inconsistent observations and repeated 60-second
timeouts. An attempted email capture showed Foundations and was discarded as
focus evidence. Restarting `make gpui-gallery-dev` restored enough access to
finish; later accessibility reads and captures still took roughly 20–35 seconds.
A timed-out navigation/theme call had completed when the window was reacquired.
The seven linked captures are from the recovered live native session, not the
offscreen renderer. No backend message delivery is claimed for the gallery
Send demonstration.

`rtk proxy git diff --check` and validation of every local QA evidence link
passed. Existing build/test results were not rerun for this documentation-only
follow-up. Animation timing, resizing and invalid-field focus are outside this
follow-up's coverage.


## Embedded media annotations 8–10 — 2026-11-24

Implemented the requested in-gallery players on macOS. Composed now embeds an
eight-second H.264 fractal video and an eight-second synthesized WAV chime.
Both samples ship in the executable and play through AVFoundation without a
network request or external player. The gallery owns playback, while the shared
Attachment component exposes controlled Play/Pause state. The video action uses
the shared glass button treatment. Each example has elapsed/duration text, a
progress indicator and Replay; changing gallery tabs pauses both players.

| Annotation/check | Result | Evidence |
| --- | --- | --- |
| 8: video example | A real poster is shown before playback. A native pointer click on Play produced a different decoded frame and reached `0:08 / 0:08` with a full progress bar. | [Light playback result](qa-evidence/2026-11-24-media/light-playback.jpg) |
| 9: audio example | The bundled chime has a waveform measured from its PCM samples. A native pointer click on Play advanced it from `0:00 / 0:08` to `0:08 / 0:08`. | [Playback result](qa-evidence/2026-11-24-media/light-playback.jpg) |
| 10: glass Play | The video action is visibly translucent with the shared glass rim and theme-appropriate icon. Scrolling moved the fixed annotation markers away from the control for unobstructed inspection. | [Light glass](qa-evidence/2026-11-24-media/light-glass.jpg), [dark glass](qa-evidence/2026-11-24-media/dark-glass.jpg) |
| Native decoding and controls | The real AVFoundation verification passed for both fixtures: clock advancement, pause stability, replay rewind and natural end. Video also produced at least five distinct decoded frames. | `--verify-media` command below |

Validation from `gpui/`:

```sh
rtk cargo check -p corpora-ui --example gallery -p corpora-ui-gallery
rtk cargo test -p corpora-ui --example gallery media::tests
rtk cargo test -p corpora-ui --test composed
rtk cargo run -p corpora-ui --example gallery -- --verify-media
```

The waveform fixture test and all 17 Composed tests passed. Changed Rust files
passed rustfmt checks; `rtk proxy git diff --check` passed. The hot-reload watcher
was restarted to pick up the new native dependencies and reported a successful
full build. Existing unused-variable/dead-code warnings remain.

Coverage limits: the native bridge took 20–50 seconds per observation, longer
than these clips, so intermediate Pause/Replay behavior is verified by the
native backend check rather than timed UI captures. Speaker audibility/output
configuration was not independently captured. Tab-away pause is implemented but
was not exercised during active playback in this visual pass. Playback currently
supports macOS; other platforms show an explicit message when Play is pressed.

Two visual details remain for a later polish pass: the video thumbnail still
has square image corners despite its rounded container, and a tooltip opened
while playing can retain “Pause video” after natural end until the pointer
leaves (the accessibility label and visible icon return to Play). The latter is
visible in the light playback capture; the unobstructed captures show the
settled Play state. These do not prevent embedded playback.


## Composed annotations 11–19 — 2026-11-24

Implemented the nine requested changes in reusable components and the embedded gallery media controller. Native verification used the running gallery through computer access, with screenshots in `qa-evidence/2026-11-24-composed-polish/`.

| Note | Change and result | Verification |
| --- | --- | --- |
| 11 — Copy feedback | Shared opt-in Copy feedback replaces the icon with a checkmark for two seconds. Repeated clicks restart the timer. Applied to code, Markdown, research-answer and action-bar Copy controls. The conversation Copy example now writes its answer to the clipboard. | Timer regression test passes, including repeated clicks. Native Copy click delivered; capture latency exceeds the two-second state, so a timed native screenshot is not claimed. |
| 12 — Inline notes | Footnote marks use the serif font, primary color, smaller size and raised baseline. Explicit inline height prevents fallback to plain, noninteractive text. Literal scripture line breaks and indentation are preserved. | Native marker visible in both themes; clicking the light marker opens its note. [Light note popover](qa-evidence/2026-11-24-composed-polish/note-popover-light.jpg), [dark reading](qa-evidence/2026-11-24-composed-polish/reading-dark-scroll.jpg). |
| 13 — Status border | ApplyToast uses the brighter semantic success foreground and 70% border opacity in dark mode. | Native dark border visibly distinct. Computed token contrast is approximately 5.08:1 against its interior and 5.61:1 against the page; these are color calculations, not screenshot measurements. |
| 14 — Popover typography | Shared floating content explicitly starts with the sans-serif UI family; scripture children can select their serif font. | Live note click showed sans-serif “Or: face to face with God”; Escape dismissed it. Evidence above. |
| 15 — Code scrolling | The scroll child is sized to the measured longest unwrapped line plus its gutter and padding. Horizontal scrolling has no scrollbar widget, with vertical overflow clipped. Gallery includes a long line that demonstrates overflow. | New headless wheel-event regression moves the actual ScrollHandle more than 100px horizontally while its vertical offset stays zero. Native horizontal scroll attempts produced no visible movement through the computer bridge; native trackpad verification remains open. [Native result](qa-evidence/2026-11-24-composed-polish/code-native-scroll.jpg). |
| 16 — Table badges | Shared Tag uses brighter semantic dark-mode colors and stronger borders. Light colors are retained. | Native dark and light table inspected. Computed dark text/background contrast: amber 7.63:1, purple 5.13:1, blue 5.38:1, green 7.04:1. [Dark table/media](qa-evidence/2026-11-24-composed-polish/media-dark-before.jpg), [light](qa-evidence/2026-11-24-composed-polish/media-light.jpg). |
| 17 — Waveform | Actual audio peaks remain stable while primary-colored playback progress advances across the bars using the AVFoundation clock. | Live Play reached 0:08 / 0:08 with all bars highlighted. [Before](qa-evidence/2026-11-24-composed-polish/media-dark-before.jpg), [after](qa-evidence/2026-11-24-composed-polish/media-dark-after.jpg). Capture latency prevents an intermediate-frame timing claim. |
| 18 — Video | Video is 16:9 with larger clipped corners, an untinted glass control, filled Play/Pause SVGs, an overlaid scrubber, and elapsed/total time in the corner. Seeking uses zero tolerances after verification caught keyframe snapping with default AVFoundation seeking. | Native Play changed the decoded frame and advanced corner time from 0:00 to 0:08; both themes inspected. Backend verification passes clock, pause, exact seek, replay and end for both samples, with 28 distinct decoded video frames. Scrub-position clamping test passes. Native scrub dragging and the brief filled Pause appearance were not captured. Existing stale hover tooltip after playback ends remains a separate known issue. |
| 19 — Chart tooltip | Stock hover data and animation state now render through a transparent blur surface with a 25% theme tint instead of opaque tooltip chrome. | Live line-chart hover displayed VI / Greek / 15 in both themes. [Light tooltip](qa-evidence/2026-11-24-composed-polish/chart-tooltip-light.jpg), [dark tooltip](qa-evidence/2026-11-24-composed-polish/chart-tooltip-dark.jpg). |

Validation:

- `rtk cargo test -p corpora-ui --lib --test composed --test atoms` — 113 passed.
- `rtk cargo check -p corpora-ui --example gallery -p corpora-ui-gallery` — passed; existing shade/scaffold and dependency future-compatibility warnings remain.
- `rtk cargo run -p corpora-ui --example gallery -- --verify-media` — video and audio playback, pause, exact seek, replay and natural end passed.
- Rustfmt check on touched Rust files and `rtk proxy git diff --check` — passed.

Native access repeatedly took 20–60 seconds per observation and sometimes timed out. Reconnecting recovered the gallery and the dark tooltip; those timeouts did not establish an app crash. Remaining manual QA is limited to native horizontal trackpad scrolling, scrub dragging and sub-two-second feedback timing. Implementation and automated verification are complete; these capture limitations are not recorded as native passes.
