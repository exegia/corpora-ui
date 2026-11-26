//! Texture: `react/src/components/atoms/background`.

use gpui_kit::component::ActiveTheme as _;
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    AnyElement, App, Bounds, Corners, ImageAssetLoader, IntoElement, ParentElement, RenderOnce,
    Resource, Styled as _, Window, canvas, div, linear_color_stop, linear_gradient, point, px,
    size,
};

use crate::assets::{FABRIC_TEXTURE, PAPER_TEXTURE};

/// The material a [`Texture`] tiles behind its content.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Hash)]
pub enum TextureVariant {
    #[default]
    Fabric,
    Paper,
}

impl TextureVariant {
    fn path(self) -> &'static str {
        match self {
            Self::Fabric => FABRIC_TEXTURE,
            Self::Paper => PAPER_TEXTURE,
        }
    }
}

/// A page background: a material tiled edge to edge, fading into the
/// background color toward the bottom so content there stays readable.
///
/// ```ignore
/// Texture::new().child(reader)
/// Texture::new().with_variant(TextureVariant::Paper).opacity(0.6).child(reader)
/// ```
///
/// It fills its parent. The material needs [`crate::Assets`].
#[derive(IntoElement)]
pub struct Texture {
    variant: Option<TextureVariant>,
    opacity: f32,
    children: Vec<AnyElement>,
}

impl Texture {
    pub fn new() -> Self {
        Self {
            variant: Some(TextureVariant::default()),
            opacity: 1.,
            children: Vec::new(),
        }
    }

    pub fn with_variant(mut self, variant: TextureVariant) -> Self {
        self.variant = Some(variant);
        self
    }

    /// Drops the material and keeps only the fade.
    pub fn plain(mut self) -> Self {
        self.variant = None;
        self
    }

    /// How strongly the material shows, from 0 to 1.
    pub fn opacity(mut self, opacity: f32) -> Self {
        self.opacity = opacity.clamp(0., 1.);
        self
    }
}

impl Default for Texture {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for Texture {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

/// Paints an image at its own size, repeated to cover the bounds.
fn tiled(path: &'static str, opacity: f32) -> impl IntoElement {
    canvas(
        |_, _, _| (),
        move |bounds, _, window, cx| {
            let source = Resource::Embedded(path.into());
            let Some(Ok(image)) = window.use_asset::<ImageAssetLoader>(&source, cx) else {
                return;
            };
            let pixels = image.size(0);
            let tile = size(
                px(pixels.width.0 as f32).max(px(1.)),
                px(pixels.height.0 as f32).max(px(1.)),
            );
            let mut y = bounds.top();
            while y < bounds.bottom() {
                let mut x = bounds.left();
                while x < bounds.right() {
                    let tile_bounds = Bounds::new(point(x, y), tile);
                    window
                        .paint_image(
                            bounds,
                            tile_bounds,
                            Corners::default(),
                            image.clone(),
                            0,
                            false,
                        )
                        .ok();
                    x += tile.width;
                }
                y += tile.height;
            }
        },
    )
    .absolute()
    .inset_0()
    .opacity(opacity)
}

impl RenderOnce for Texture {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let background = theme.background;
        // Solid at the foot of the page, clear toward the top. In the dark
        // appearance the fade stops at a veil, which keeps the material low.
        let (clear, reach) = if theme.is_dark() {
            (background.opacity(0.3), 0.5)
        } else {
            (background.opacity(0.), 0.4)
        };
        let fade = linear_gradient(
            0.,
            linear_color_stop(background, 0.1),
            linear_color_stop(clear, reach),
        );

        div()
            .relative()
            .size_full()
            .flex()
            .flex_col()
            .flex_1()
            .when_some(self.variant, |this, variant| {
                this.child(tiled(variant.path(), self.opacity))
            })
            .when(!self.children.is_empty(), |this| {
                this.child(
                    div()
                        .relative()
                        .size_full()
                        .flex()
                        .flex_col()
                        .flex_1()
                        .bg(fade)
                        .children(self.children),
                )
            })
    }
}
