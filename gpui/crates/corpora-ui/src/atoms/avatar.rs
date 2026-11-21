//! Avatar: `react/src/components/atoms/avatar`.

use std::time::Duration;

use gpui_kit::assets::IconName as LucideIcon;
use gpui_kit::component::avatar::Avatar as StockAvatar;
use gpui_kit::component::skeleton::Skeleton;
use gpui_kit::component::{ActiveTheme as _, Icon, Sizable as _, Size};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    Animation, AnimationExt as _, App, IntoElement, ParentElement as _, RenderOnce, SharedString,
    Styled as _, Window, div, linear_color_stop, linear_gradient, px, rems,
};

use super::Loader;
use crate::foundations::{ActiveCorporaTheme as _, AtomSize};

/// Presence of the person an [`Avatar`] shows.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum AvatarStatus {
    Online,
    Idle,
    Offline,
}

/// Live-audio state of the person an [`Avatar`] shows, drawn as a ring.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum AvatarAudio {
    /// In the call, microphone off: no ring.
    Muted,
    /// Microphone on, silent: a faint ring.
    Unmuted,
    /// Talking: a ring that breathes.
    Speaking,
}

/// The person an [`Avatar`] shows.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct AvatarUser {
    pub first_name: Option<SharedString>,
    pub last_name: Option<SharedString>,
    /// A URL or a file path.
    pub avatar_url: Option<SharedString>,
    pub verified: bool,
    pub status: Option<AvatarStatus>,
    /// What the person does here, such as "Editor". Shown by
    /// [`crate::composed::UserInfo`], not by the avatar.
    pub role: Option<SharedString>,
}

impl AvatarUser {
    pub fn named(first_name: impl Into<SharedString>, last_name: impl Into<SharedString>) -> Self {
        Self {
            first_name: Some(first_name.into()),
            last_name: Some(last_name.into()),
            ..Self::default()
        }
    }

    pub fn avatar_url(mut self, url: impl Into<SharedString>) -> Self {
        self.avatar_url = Some(url.into());
        self
    }

    pub fn verified(mut self, verified: bool) -> Self {
        self.verified = verified;
        self
    }

    pub fn status(mut self, status: AvatarStatus) -> Self {
        self.status = Some(status);
        self
    }

    pub fn role(mut self, role: impl Into<SharedString>) -> Self {
        self.role = Some(role.into());
        self
    }

    /// The full name, when both halves are known. Initials need both, so a
    /// lone first name falls back to the anonymous placeholder.
    fn full_name(&self) -> Option<SharedString> {
        let first = self.first_name.as_ref().filter(|name| !name.is_empty())?;
        let last = self.last_name.as_ref().filter(|name| !name.is_empty())?;
        Some(format!("{first} {last}").into())
    }
}

/// Diameter of the disc, in rems. The scale starts at small; `Xs` reads as it.
fn diameter(size: AtomSize) -> f32 {
    match size {
        AtomSize::Xs | AtomSize::Sm => 1.5,
        AtomSize::Md => 2.0,
        AtomSize::Lg => 2.5,
        AtomSize::Xl => 3.5,
        AtomSize::Xxl => 4.0,
    }
}

/// The stock tier whose initials fit the disc. The stock avatar sizes its
/// text by tier, and its tiers are wider apart than the atom scale.
fn text_tier(size: AtomSize) -> Size {
    match size {
        AtomSize::Xs | AtomSize::Sm => Size::Small,
        AtomSize::Md | AtomSize::Lg => Size::Medium,
        AtomSize::Xl | AtomSize::Xxl => Size::Large,
    }
}

/// The dot trio is about half the disc wide.
fn loader_size(size: AtomSize) -> AtomSize {
    match size {
        AtomSize::Xs | AtomSize::Sm | AtomSize::Md => AtomSize::Xs,
        AtomSize::Lg | AtomSize::Xl => AtomSize::Sm,
        AtomSize::Xxl => AtomSize::Md,
    }
}

/// A person's picture, or their initials when there is none.
///
/// ```ignore
/// Avatar::new().user(AvatarUser::named("Ada", "Lovelace").status(AvatarStatus::Online))
/// ```
///
/// Presence and the verified mark are left off the small size, where they
/// would cover the face. While `loading`, identity is hidden behind a
/// skeleton and neither is shown.
#[derive(IntoElement)]
pub struct Avatar {
    user: Option<AvatarUser>,
    size: AtomSize,
    loading: bool,
    audio: Option<AvatarAudio>,
}

impl Avatar {
    pub fn new() -> Self {
        Self {
            user: None,
            size: AtomSize::Sm,
            loading: false,
            audio: None,
        }
    }

    pub fn user(mut self, user: AvatarUser) -> Self {
        self.user = Some(user);
        self
    }

    pub fn with_atom_size(mut self, size: AtomSize) -> Self {
        self.size = size;
        self
    }

    pub fn loading(mut self, loading: bool) -> Self {
        self.loading = loading;
        self
    }

    pub fn audio(mut self, audio: AvatarAudio) -> Self {
        self.audio = Some(audio);
        self
    }
}

impl Default for Avatar {
    fn default() -> Self {
        Self::new()
    }
}

impl RenderOnce for Avatar {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let palette = *cx.palette();
        let diameter = rems(diameter(self.size));
        let roomy = self.size > AtomSize::Sm;
        let user = self.user.unwrap_or_default();
        let name = user.full_name();

        let disc = StockAvatar::new()
            .with_size(text_tier(self.size))
            .size(diameter)
            // Identity stays hidden until it has loaded.
            .when(!self.loading, |this| {
                this.when_some(user.avatar_url.clone(), |this, url| this.src(url))
                    .when_some(name, |this, name| this.name(name))
            });

        let status = user
            .status
            .filter(|_| roomy && !self.loading)
            .map(|status| {
                let color = match status {
                    AvatarStatus::Online => palette.success,
                    AvatarStatus::Idle => palette.warning,
                    AvatarStatus::Offline => theme.muted_foreground,
                };
                div()
                    .absolute()
                    .bottom_0()
                    .right_0()
                    .size_2p5()
                    .rounded_full()
                    .border_2()
                    .border_color(theme.background)
                    .bg(color)
            });

        let verified = (user.verified && roomy && !self.loading).then(|| {
            div()
                .absolute()
                .top(-px(2.))
                .right(-px(2.))
                .rounded_full()
                .bg(theme.background)
                .text_color(palette.info)
                .child(Icon::new(LucideIcon::BadgeCheck).small())
        });

        let ring = self
            .audio
            .filter(|audio| *audio != AvatarAudio::Muted && !self.loading)
            .map(|audio| {
                let [from, to] = palette.audio_ring;
                let ring = div()
                    .absolute()
                    .inset(-px(3.))
                    .rounded_full()
                    .bg(linear_gradient(
                        45.,
                        linear_color_stop(from, 0.),
                        linear_color_stop(to, 1.),
                    ));
                match audio {
                    AvatarAudio::Speaking if !cx.reduce_motion() => ring
                        .with_animation(
                            "avatar-audio-ring",
                            Animation::new(Duration::from_millis(1400)).repeat(),
                            |ring, phase| {
                                // Breathes between 55% and 100%.
                                let wave = (phase * std::f32::consts::TAU).sin() * 0.5 + 0.5;
                                ring.opacity(0.55 + 0.45 * wave)
                            },
                        )
                        .into_any_element(),
                    AvatarAudio::Speaking => ring.opacity(0.85).into_any_element(),
                    _ => ring.opacity(0.35).into_any_element(),
                }
            });

        div()
            .relative()
            .flex_none()
            .size(diameter)
            .children(ring)
            .child(
                // Keeps the page color between the ring and the picture.
                div()
                    .relative()
                    .size_full()
                    .rounded_full()
                    .bg(theme.background)
                    .child(disc),
            )
            .when(self.loading, |this| {
                this.child(
                    Skeleton::new()
                        .absolute()
                        .inset_0()
                        .size_full()
                        .rounded_full(),
                )
                .child(
                    div()
                        .absolute()
                        .inset_0()
                        .flex()
                        .items_center()
                        .justify_center()
                        .child(Loader::dots().with_atom_size(loader_size(self.size))),
                )
            })
            .children(status)
            .children(verified)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn initials_need_both_names() {
        assert_eq!(
            AvatarUser::named("Ada", "Lovelace").full_name(),
            Some("Ada Lovelace".into())
        );
        let first_only = AvatarUser {
            first_name: Some("Ada".into()),
            ..AvatarUser::default()
        };
        assert_eq!(first_only.full_name(), None);
    }
}
