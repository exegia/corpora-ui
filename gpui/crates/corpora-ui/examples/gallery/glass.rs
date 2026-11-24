//! The glass probe: a pane of glass to drag over a backdrop while tuning its
//! material. Ported from `gpui-corpora`'s glass showcase.

use std::cell::Cell;
use std::rc::Rc;

use corpora_ui::atoms::{Button, GlassEdge, GlassSpec, GlassSurfaceExt as _, Text};
use corpora_ui::composed::CodeBlock;
use corpora_ui::foundations::{ActiveCorporaTheme as _, AtomSize, Radius};
use gpui_kit::component::slider::{Slider, SliderEvent, SliderState};
use gpui_kit::component::switch::Switch;
use gpui_kit::component::{ActiveTheme as _, h_flex, v_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::*;

/// What lies behind the probe.
#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Backdrop {
    Text,
    Bars,
    Gradient,
    Flat,
}

impl Backdrop {
    const ALL: [Self; 4] = [Self::Text, Self::Bars, Self::Gradient, Self::Flat];

    fn label(self) -> &'static str {
        match self {
            Self::Text => "Text",
            Self::Bars => "Bars",
            Self::Gradient => "Gradient",
            Self::Flat => "Flat",
        }
    }
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum Preset {
    Blur,
    Glass,
    Deep,
    Frosted,
    Custom,
}

impl Preset {
    const ALL: [Self; 4] = [Self::Blur, Self::Glass, Self::Deep, Self::Frosted];

    fn label(self) -> &'static str {
        match self {
            Self::Blur => "Blur",
            Self::Glass => "Glass",
            Self::Deep => "Deep",
            Self::Frosted => "Frosted",
            Self::Custom => "Custom",
        }
    }
}

/// The sides of the probe the two edge sliders set.
#[derive(Clone, Copy, PartialEq, Eq)]
enum EdgeTarget {
    All,
    X,
    Y,
    Top,
    Right,
    Bottom,
    Left,
}

impl EdgeTarget {
    const ALL: [Self; 7] = [
        Self::All,
        Self::X,
        Self::Y,
        Self::Top,
        Self::Right,
        Self::Bottom,
        Self::Left,
    ];

    fn label(self) -> &'static str {
        match self {
            Self::All => "All sides",
            Self::X => "Left and right",
            Self::Y => "Top and bottom",
            Self::Top => "Top",
            Self::Right => "Right",
            Self::Bottom => "Bottom",
            Self::Left => "Left",
        }
    }

    /// Whether the target covers each side: top, right, bottom, left.
    fn sides(self) -> [bool; 4] {
        match self {
            Self::All => [true; 4],
            Self::X => [false, true, false, true],
            Self::Y => [true, false, true, false],
            Self::Top => [true, false, false, false],
            Self::Right => [false, true, false, false],
            Self::Bottom => [false, false, true, false],
            Self::Left => [false, false, false, true],
        }
    }
}

/// One tunable value of the probe.
#[derive(Clone, Copy, PartialEq, Eq)]
#[repr(usize)]
enum Control {
    Width,
    Height,
    Radius,
    Blur,
    Lens,
    Magnify,
    Gain,
    Saturation,
    Dispersion,
    Lift,
    Edge,
    EdgeWidth,
    TintFill,
}

impl Control {
    const ALL: [Self; 13] = [
        Self::Width,
        Self::Height,
        Self::Radius,
        Self::Blur,
        Self::Lens,
        Self::Magnify,
        Self::Gain,
        Self::Saturation,
        Self::Dispersion,
        Self::Lift,
        Self::Edge,
        Self::EdgeWidth,
        Self::TintFill,
    ];
    const SIZE: [Self; 3] = [Self::Width, Self::Height, Self::Radius];
    const OPTICS: [Self; 7] = [
        Self::Blur,
        Self::Lens,
        Self::Magnify,
        Self::Gain,
        Self::Saturation,
        Self::Dispersion,
        Self::Lift,
    ];
    const EDGE: [Self; 2] = [Self::Edge, Self::EdgeWidth];

    fn label(self) -> &'static str {
        match self {
            Self::Width => "Width",
            Self::Height => "Height",
            Self::Radius => "Radius",
            Self::Blur => "Blur",
            Self::Lens => "Rim / lens",
            Self::Magnify => "Magnification",
            Self::Gain => "Gain",
            Self::Saturation => "Saturation",
            Self::Dispersion => "Dispersion",
            Self::Lift => "Lift",
            Self::Edge => "Edge",
            Self::EdgeWidth => "Edge width",
            Self::TintFill => "Tint fill",
        }
    }

    fn description(self) -> &'static str {
        match self {
            Self::Width => "Makes the glass wider or narrower.",
            Self::Height => "Makes the glass taller or shorter.",
            Self::Radius => "Rounds the corners more or less.",
            Self::Blur => "Softens what is behind the glass.",
            Self::Lens => "How far in from the rim the glass bends the picture.",
            Self::Magnify => "Makes the picture behind look bigger or smaller.",
            Self::Gain => "Brightens or darkens the light coming through.",
            Self::Saturation => "Strengthens or dulls the colors behind.",
            Self::Dispersion => "Splits colors near the rim like a prism.",
            Self::Lift => "Lays a soft white veil over the glass.",
            Self::Edge => "How brightly the rim shines.",
            Self::EdgeWidth => "Makes the shining rim thicker or thinner.",
            Self::TintFill => "How much of the tint color is mixed in.",
        }
    }

    /// Minimum, maximum and step.
    fn range(self) -> (f32, f32, f32) {
        match self {
            Self::Width => (120., 600., 1.),
            Self::Height => (30., 250., 1.),
            Self::Radius => (0., 125., 1.),
            Self::Blur => (0., 24., 0.1),
            Self::Lens => (0., 120., 0.5),
            Self::Magnify => (-16., 16., 0.01),
            Self::Gain => (0., 2., 0.001),
            Self::Saturation => (0., 2., 0.01),
            Self::Lift | Self::TintFill | Self::Edge => (0., 1., 0.01),
            Self::EdgeWidth => (0., 12., 0.1),
            Self::Dispersion => (0., 0.2, 0.001),
        }
    }
}

const DEFAULT_LIFT: f32 = 18.8 / 255.;
const STAGE_HEIGHT: f32 = 400.;

/// A float as Rust source: at most three decimals, no trailing zeros, and a
/// bare point on a whole number.
fn literal(value: f32) -> String {
    let text = format!("{value:.3}");
    let text = text.trim_end_matches('0');
    if text == "-0." {
        "0.".into()
    } else {
        text.into()
    }
}

fn pixels_source(value: Pixels) -> String {
    format!("px({})", literal(value.into()))
}

fn edge_source(edge: GlassEdge) -> String {
    format!(
        "GlassEdge::new({}, {})",
        pixels_source(edge.width),
        literal(edge.brightness)
    )
}

/// The pointer position a drag of the probe started from, and where the
/// probe was then.
struct DragProbe {
    start: Cell<Point<Pixels>>,
    origin: Point<Pixels>,
}

/// The probe moves itself, so the drag shows no preview.
struct DragPreview;

impl Render for DragPreview {
    fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
        Empty
    }
}

pub struct GlassShowcase {
    pub backdrop: Backdrop,
    preset: Preset,
    position: Point<Pixels>,
    width: f32,
    height: f32,
    radius: f32,
    lift: f32,
    tint_enabled: bool,
    tint_fill: f32,
    edge_target: EdgeTarget,
    spec: GlassSpec,
    sliders: [Entity<SliderState>; 13],
    _subscriptions: Vec<Subscription>,
}

impl GlassShowcase {
    pub fn new(cx: &mut Context<Self>) -> Self {
        let mut this = Self {
            backdrop: Backdrop::Text,
            preset: Preset::Glass,
            position: point(px(120.), px(80.)),
            width: 220.,
            height: 168.,
            radius: 34.,
            lift: DEFAULT_LIFT,
            tint_enabled: false,
            tint_fill: 0.34,
            edge_target: EdgeTarget::All,
            spec: GlassSpec::default(),
            sliders: Control::ALL.map(|_| cx.new(|_| SliderState::new())),
            _subscriptions: Vec::new(),
        };
        this.sliders = Control::ALL.map(|control| {
            let (min, max, step) = control.range();
            let value = this.value(control);
            cx.new(|_| {
                SliderState::new()
                    .min(min)
                    .max(max)
                    .step(step)
                    .default_value(value)
            })
        });
        this._subscriptions = Control::ALL
            .into_iter()
            .map(|control| {
                cx.subscribe(
                    &this.sliders[control as usize],
                    move |this, _, event: &SliderEvent, cx| {
                        if let SliderEvent::Change(value) = event {
                            this.set(control, value.start());
                            cx.notify();
                        }
                    },
                )
            })
            .collect();
        this
    }

    /// The first side the edge sliders are set to: the one they show.
    fn edge(&self) -> GlassEdge {
        let edges = self.spec.edges;
        let sides = [edges.top, edges.right, edges.bottom, edges.left];
        let covered = self.edge_target.sides();
        let shown = covered.iter().position(|covered| *covered).unwrap_or(0);
        sides[shown]
    }

    fn set_edge(&mut self, change: impl Fn(&mut GlassEdge)) {
        let edges = &mut self.spec.edges;
        let sides = [
            &mut edges.top,
            &mut edges.right,
            &mut edges.bottom,
            &mut edges.left,
        ];
        for (side, covered) in sides.into_iter().zip(self.edge_target.sides()) {
            if covered {
                change(side);
            }
        }
    }

    fn select_edge_target(
        &mut self,
        target: EdgeTarget,
        window: &mut Window,
        cx: &mut Context<Self>,
    ) {
        self.edge_target = target;
        let preset = self.preset;
        self.sync_sliders(window, cx);
        // Showing another side's values is not a change to the material.
        self.preset = preset;
        cx.notify();
    }

    fn value(&self, control: Control) -> f32 {
        match control {
            Control::Width => self.width,
            Control::Height => self.height,
            Control::Radius => self.radius,
            Control::Blur => self.spec.blur_radius.into(),
            Control::Lens => self.spec.lens.into(),
            Control::Magnify => self.spec.magnify,
            Control::Gain => self.spec.gain_light,
            Control::Saturation => self.spec.saturation,
            Control::Dispersion => self.spec.dispersion,
            Control::Lift => self.lift,
            Control::Edge => self.edge().brightness,
            Control::EdgeWidth => self.edge().width.into(),
            Control::TintFill => self.tint_fill,
        }
    }

    fn set(&mut self, control: Control, value: f32) {
        self.preset = Preset::Custom;
        match control {
            Control::Width => self.width = value,
            Control::Height => self.height = value,
            Control::Radius => self.radius = value,
            Control::Blur => self.spec.blur_radius = px(value),
            Control::Lens => self.spec.lens = px(value),
            Control::Magnify => self.spec.magnify = value,
            Control::Gain => {
                self.spec.gain_light = value;
                self.spec.gain_dark = value;
            }
            Control::Saturation => self.spec.saturation = value,
            Control::Dispersion => self.spec.dispersion = value,
            Control::Lift => self.lift = value,
            Control::Edge => self.set_edge(|edge| edge.brightness = value),
            Control::EdgeWidth => self.set_edge(|edge| edge.width = px(value)),
            Control::TintFill => self.tint_fill = value,
        }
        self.radius = self.radius.min(self.width.min(self.height) / 2.);
    }

    fn formatted(&self, control: Control) -> String {
        let value = self.value(control);
        match control {
            Control::Width | Control::Height | Control::Radius => format!("{value:.0} pt"),
            Control::Blur | Control::Lens | Control::EdgeWidth => format!("{value:.1} pt"),
            Control::Magnify => format!("{value:+.2}"),
            Control::Gain | Control::Dispersion => format!("{value:.3}"),
            Control::Lift => format!("{:.0}/255", value * 255.),
            Control::Saturation | Control::Edge | Control::TintFill => format!("{value:.2}"),
        }
    }

    fn sync_sliders(&self, window: &mut Window, cx: &mut Context<Self>) {
        for control in Control::ALL {
            let value = self.value(control);
            self.sliders[control as usize]
                .update(cx, |slider, cx| slider.set_value(value, window, cx));
        }
    }

    fn select_preset(&mut self, preset: Preset, window: &mut Window, cx: &mut Context<Self>) {
        let frosted = GlassSpec::frosted(cx);
        self.spec = match preset {
            Preset::Blur => GlassSpec::blur(),
            Preset::Deep => GlassSpec::deep(),
            Preset::Frosted => frosted,
            Preset::Glass | Preset::Custom => GlassSpec::default(),
        };
        self.lift = DEFAULT_LIFT;
        self.tint_enabled = false;
        self.sync_sliders(window, cx);
        // Syncing the sliders reports changes, which mark the probe custom.
        self.preset = preset;
        cx.notify();
    }

    /// The probe's material as the Rust that builds it.
    fn spec_source(&self) -> String {
        let spec = self.spec;
        let tint = if self.tint_enabled {
            format!("cx.theme().primary.opacity({})", literal(self.tint_fill))
        } else {
            format!("cx.palette().highlight.opacity({})", literal(self.lift))
        };
        let edges = spec.edges;
        let even = [edges.right, edges.bottom, edges.left]
            .iter()
            .all(|side| *side == edges.top);
        let edges = if even {
            format!("GlassEdges::all({})", edge_source(edges.top))
        } else {
            format!(
                "GlassEdges {{\n        top: {},\n        right: {},\n        bottom: {},\n        \
                 left: {},\n    }}",
                edge_source(edges.top),
                edge_source(edges.right),
                edge_source(edges.bottom),
                edge_source(edges.left),
            )
        };
        [
            "GlassSpec {".to_string(),
            format!("    blur_radius: {},", pixels_source(spec.blur_radius)),
            format!("    lens: {},", pixels_source(spec.lens)),
            format!("    reach: {},", pixels_source(spec.reach)),
            format!("    magnify: {},", literal(spec.magnify)),
            format!("    dispersion: {},", literal(spec.dispersion)),
            format!("    gain_light: {},", literal(spec.gain_light)),
            format!("    gain_dark: {},", literal(spec.gain_dark)),
            format!("    saturation: {},", literal(spec.saturation)),
            format!("    tint: Some({tint}),"),
            format!("    edges: {edges},"),
            format!("    edge_aa: {},", pixels_source(spec.edge_aa)),
            "}".to_string(),
        ]
        .join("\n")
    }

    /// The probe as the Rust that builds it: its frame, then its material.
    fn usage_source(&self) -> String {
        let radius = self.radius.min(self.width.min(self.height) / 2.);
        format!(
            "div()\n    .w({})\n    .h({})\n    .rounded({})\n    .glass_with({})",
            pixels_source(px(self.width)),
            pixels_source(px(self.height)),
            pixels_source(px(radius)),
            // The spec sits one level in, under the builder chain.
            self.spec_source().replace('\n', "\n    "),
        )
    }

    fn render_backdrop(&self, cx: &App) -> AnyElement {
        let theme = cx.theme();
        let base = div().absolute().inset_0();
        match self.backdrop {
            Backdrop::Flat => base.bg(theme.background).into_any_element(),
            Backdrop::Gradient => {
                let [first, _, third, ..] = cx.palette().chart;
                base.bg(linear_gradient(
                    120.,
                    linear_color_stop(first, 0.),
                    linear_color_stop(third, 1.),
                ))
                .into_any_element()
            }
            Backdrop::Bars => base
                .flex()
                .children(
                    cx.palette()
                        .chart
                        .into_iter()
                        .cycle()
                        .take(15)
                        .map(|color| div().flex_1().h_full().bg(color)),
                )
                .into_any_element(),
            Backdrop::Text => base
                .bg(theme.background)
                .p_6()
                .flex()
                .flex_col()
                .gap_3()
                .overflow_hidden()
                .children((0..6).map(|_| {
                    Text::paragraph(
                        "In the beginning was the Word, and the Word was with God, and the \
                         Word was God. The same was in the beginning with God. All things \
                         were made by him; and without him was not any thing made that was \
                         made. In him was life; and the life was the light of men.",
                    )
                    .serif()
                    .text_lg()
                }))
                .into_any_element(),
        }
    }

    fn render_control(&self, control: Control, disabled: bool, cx: &App) -> impl IntoElement {
        h_flex()
            .id(("glass-control", control as usize))
            .w_full()
            .gap_4()
            .py_1p5()
            .child(
                v_flex()
                    .w(rems(16.))
                    .flex_none()
                    .child(
                        div()
                            .text_sm()
                            .font_weight(FontWeight::MEDIUM)
                            .child(control.label()),
                    )
                    .child(
                        div()
                            .text_xs()
                            .text_color(cx.theme().muted_foreground)
                            .child(control.description()),
                    ),
            )
            .child(
                div().min_w_0().flex_1().child(
                    Slider::new(&self.sliders[control as usize])
                        .disabled(disabled)
                        .accessibility_label(control.label()),
                ),
            )
            .child(
                div()
                    .w(rems(5.))
                    .flex_none()
                    .flex()
                    .justify_end()
                    .text_sm()
                    .font_weight(FontWeight::SEMIBOLD)
                    .child(self.formatted(control)),
            )
    }

    fn render_group(
        &self,
        title: &'static str,
        controls: &[Control],
        cx: &App,
    ) -> impl IntoElement {
        v_flex()
            .gap_1()
            .child(Text::new(title).muted().small())
            .children(
                controls
                    .iter()
                    .map(|control| self.render_control(*control, false, cx).into_any_element()),
            )
    }
}

impl Render for GlassShowcase {
    fn render(&mut self, _: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let theme = cx.theme().clone();
        let spec = self.spec.tint(if self.tint_enabled {
            theme.primary.opacity(self.tint_fill)
        } else {
            cx.palette().highlight.opacity(self.lift)
        });

        let drag = Rc::new(DragProbe {
            start: Cell::new(Point::default()),
            origin: self.position,
        });
        let probe = div()
            .id("glass-probe")
            .absolute()
            .left(self.position.x)
            .top(self.position.y)
            .w(px(self.width))
            .h(px(self.height))
            .flex()
            .items_center()
            .justify_center()
            .rounded(px(self.radius.min(self.width.min(self.height) / 2.)))
            .text_sm()
            .font_weight(FontWeight::SEMIBOLD)
            .cursor_move()
            .child(if self.tint_enabled {
                "Tinted glass"
            } else {
                "Glass"
            })
            .on_drag(drag, |drag, _, window, cx| {
                drag.start.set(window.mouse_position());
                cx.stop_propagation();
                cx.new(|_| DragPreview)
            })
            .glass_with(spec);

        let stage = div()
            .id("glass-stage")
            .relative()
            .h(px(STAGE_HEIGHT))
            .w_full()
            .overflow_hidden()
            .border_1()
            .border_color(theme.border)
            .rounded(Radius::Lg.resolve(cx))
            .on_drag_move::<Rc<DragProbe>>(cx.listener(
                |this, event: &DragMoveEvent<Rc<DragProbe>>, _, cx| {
                    let drag = event.drag(cx);
                    let delta = event.event.position - drag.start.get();
                    let max_x = (event.bounds.size.width - px(this.width)).max(px(0.));
                    let max_y = (event.bounds.size.height - px(this.height)).max(px(0.));
                    this.position = point(
                        (drag.origin.x + delta.x).clamp(px(0.), max_x),
                        (drag.origin.y + delta.y).clamp(px(0.), max_y),
                    );
                    cx.notify();
                },
            ))
            .child(self.render_backdrop(cx))
            .child(probe);

        let choice = |id: ElementId, label: &'static str, selected: bool| {
            let button = Button::new(id).label(label).with_atom_size(AtomSize::Sm);
            if selected {
                button.secondary()
            } else {
                button.ghost()
            }
        };

        let backdrops = h_flex()
            .gap_1()
            .child(Text::new("Backdrop").muted().small().w(rems(5.)))
            .children(Backdrop::ALL.map(|backdrop| {
                choice(
                    ("glass-backdrop", backdrop as usize).into(),
                    backdrop.label(),
                    self.backdrop == backdrop,
                )
                .on_click(cx.listener(move |this, _, _, cx| {
                    this.backdrop = backdrop;
                    cx.notify();
                }))
            }));

        let presets = h_flex()
            .gap_1()
            .child(Text::new("Preset").muted().small().w(rems(5.)))
            .children(Preset::ALL.map(|preset| {
                choice(
                    ("glass-preset", preset as usize).into(),
                    preset.label(),
                    self.preset == preset,
                )
                .on_click(cx.listener(move |this, _, window, cx| {
                    this.select_preset(preset, window, cx);
                }))
            }))
            .when(self.preset == Preset::Custom, |this| {
                this.child(Text::new(Preset::Custom.label()).muted().small().ml_2())
            });

        let edge_targets = h_flex()
            .flex_wrap()
            .gap_1()
            .children(EdgeTarget::ALL.map(|target| {
                choice(
                    ("glass-edge-target", target as usize).into(),
                    target.label(),
                    self.edge_target == target,
                )
                .on_click(cx.listener(move |this, _, window, cx| {
                    this.select_edge_target(target, window, cx);
                }))
            }));

        let owner = cx.entity().downgrade();
        let tint = h_flex().gap_4().child(
            Switch::new("glass-tint")
                .label("Tint with the primary color")
                .checked(self.tint_enabled)
                .on_change(move |checked, _, cx| {
                    owner
                        .update(cx, |this, cx| {
                            this.tint_enabled = *checked;
                            cx.notify();
                        })
                        .ok();
                }),
        );

        v_flex()
            .gap_4()
            .child(stage)
            .child(backdrops)
            .child(presets)
            .child(
                h_flex()
                    .items_start()
                    .gap_8()
                    .child(v_flex().flex_1().min_w_0().gap_4().child(self.render_group(
                        "Optics",
                        &Control::OPTICS,
                        cx,
                    )))
                    .child(
                        v_flex()
                            .flex_1()
                            .min_w_0()
                            .gap_4()
                            .child(self.render_group("Size", &Control::SIZE, cx))
                            .child(
                                v_flex()
                                    .gap_1()
                                    .child(Text::new("Edge").muted().small())
                                    .child(edge_targets)
                                    .children(
                                        Control::EDGE
                                            .map(|control| self.render_control(control, false, cx)),
                                    ),
                            )
                            .child(
                                v_flex()
                                    .gap_1()
                                    .child(Text::new("Tint").muted().small())
                                    .child(tint)
                                    .child(self.render_control(
                                        Control::TintFill,
                                        !self.tint_enabled,
                                        cx,
                                    )),
                            ),
                    ),
            )
            .child(
                CodeBlock::new("glass-spec-code", self.usage_source())
                    .filename("Glass surface")
                    .keywords(["Some"]),
            )
    }
}
