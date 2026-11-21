//! SocialProviders: `react/src/components/composed/social-providers.tsx`.

use std::rc::Rc;
use std::sync::Arc;

use gpui_kit::assets::IconName as LucideIcon;
use gpui_kit::component::{Icon, Sizable as _, h_flex, v_flex};
use gpui_kit::{
    App, ElementId, IntoElement, ParentElement as _, RenderOnce, SharedString, Styled as _,
    StyledImage as _, Window, img,
};

use crate::assets::{GOOGLE_MARK, X_MARK};
use crate::atoms::Button;

/// An identity provider a person can sign in with.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum SocialProvider {
    Google,
    Apple,
    Github,
    X,
}

impl SocialProvider {
    /// The provider's name as it is written.
    pub const fn label(self) -> &'static str {
        match self {
            Self::Google => "Google",
            Self::Apple => "Apple",
            Self::Github => "GitHub",
            Self::X => "X",
        }
    }

    /// Stable identity for element ids.
    const fn slug(self) -> &'static str {
        match self {
            Self::Google => "google",
            Self::Apple => "apple",
            Self::Github => "github",
            Self::X => "x",
        }
    }
}

/// The verb on a labelled provider button.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Hash)]
pub enum SocialAction {
    Login,
    Signup,
    #[default]
    Continue,
}

impl SocialAction {
    const fn phrase(self) -> &'static str {
        match self {
            Self::Login => "Login with",
            Self::Signup => "Sign up with",
            Self::Continue => "Continue with",
        }
    }
}

/// How the provider buttons are arranged.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Hash)]
pub enum SocialLayout {
    /// Full-width labelled buttons, one per line.
    #[default]
    Stack,
    /// Icon-only buttons side by side.
    Row,
}

type SelectHandler = Rc<dyn Fn(SocialProvider, &mut Window, &mut App)>;

/// Sign-in buttons for identity providers. Presentation only: start the
/// provider's flow from [`Self::on_select`].
///
/// ```ignore
/// SocialProviders::new("sign-in-providers")
///     .action(SocialAction::Login)
///     .loading(self.pending_provider)
///     .on_select(cx.listener(|this, provider, _, cx| this.sign_in_with(*provider, cx)))
/// ```
#[derive(IntoElement)]
pub struct SocialProviders {
    id: ElementId,
    providers: Vec<SocialProvider>,
    action: SocialAction,
    layout: SocialLayout,
    loading: Option<SocialProvider>,
    disabled: bool,
    on_select: Option<SelectHandler>,
}

impl SocialProviders {
    /// `id` must be stable and unique among siblings. Offers Google, Apple
    /// and GitHub until [`Self::providers`] says otherwise.
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            providers: vec![
                SocialProvider::Google,
                SocialProvider::Apple,
                SocialProvider::Github,
            ],
            action: SocialAction::default(),
            layout: SocialLayout::default(),
            loading: None,
            disabled: false,
            on_select: None,
        }
    }

    pub fn providers(mut self, providers: impl IntoIterator<Item = SocialProvider>) -> Self {
        self.providers = providers.into_iter().collect();
        self
    }

    pub fn action(mut self, action: SocialAction) -> Self {
        self.action = action;
        self
    }

    pub fn layout(mut self, layout: SocialLayout) -> Self {
        self.layout = layout;
        self
    }

    /// Shows that provider's button as loading and disables the others.
    pub fn loading(mut self, provider: Option<SocialProvider>) -> Self {
        self.loading = provider;
        self
    }

    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }

    pub fn on_select(
        mut self,
        handler: impl Fn(&SocialProvider, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_select = Some(Rc::new(move |provider, window, cx| {
            handler(&provider, window, cx)
        }));
        self
    }
}

impl RenderOnce for SocialProviders {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let row = self.layout == SocialLayout::Row;
        let buttons = self.providers.into_iter().map(|provider| {
            let name: SharedString =
                format!("{} {}", self.action.phrase(), provider.label()).into();
            let on_select = self.on_select.clone();
            let button = Button::new(ElementId::NamedChild(
                Arc::new(self.id.clone()),
                provider.slug().into(),
            ))
            .outline()
            .loading(self.loading == Some(provider))
            .disabled(self.disabled || self.loading.is_some_and(|loading| loading != provider))
            .on_click(move |_, window, cx| {
                if let Some(on_select) = &on_select {
                    on_select(provider, window, cx);
                }
            });
            // Google's mark is the only one in color, so it is an image; the
            // others take the button's ink.
            let button = match provider {
                SocialProvider::Google => button.start(
                    img(GOOGLE_MARK)
                        .size_4()
                        .flex_none()
                        .object_fit(gpui_kit::ObjectFit::Contain),
                ),
                SocialProvider::Apple => button.start(Icon::new(LucideIcon::Apple).small()),
                SocialProvider::Github => button.start(Icon::new(LucideIcon::Github).small()),
                SocialProvider::X => button.start(Icon::default().path(X_MARK).small()),
            };
            if row {
                button.tooltip(name)
            } else {
                button.full_width(true).label(name)
            }
        });

        if row {
            h_flex()
                .w_full()
                .justify_center()
                .gap_2()
                .children(buttons)
                .into_any_element()
        } else {
            v_flex()
                .w_full()
                .gap_2()
                .children(buttons)
                .into_any_element()
        }
    }
}
