import { describe, expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { act } from "@testing-library/react";

import { AnimatedSidebarPanelContext } from "@/components/blocks/shell/utils";
import { ProfileCardBlock } from "../profile-card-block";
import { useProfileCardActions, useProfileCardState } from "../use-profile-card-state";
import type { ProfileCardActions, ProfileCardState } from "../type";

const USER = { name: "Jenny Hamilton", username: "@jennycodes" };

describe("ProfileCardBlock", () => {
  test("names the trigger after the identity it shows", () => {
    render(<ProfileCardBlock user={USER} />);

    const trigger = screen.getByRole("button", {
      name: "Jenny Hamilton @jennycodes, account menu",
    });
    expect(trigger.textContent).toContain("Jenny Hamilton");
    expect(trigger.textContent).toContain("@jennycodes");
  });

  test("falls back to initials derived from the name", () => {
    render(<ProfileCardBlock user={{ name: "Jenny Hamilton" }} />);
    expect(screen.getByText("JH")).toBeDefined();
  });

  test("opens the default menu with a destructive sign-out", async () => {
    const user = userEvent.setup();
    render(<ProfileCardBlock user={USER} />);

    await user.click(screen.getByRole("button"));

    expect(await screen.findByRole("menuitem", { name: "Profile" })).toBeDefined();
    expect(screen.getByRole("menuitem", { name: "Settings" })).toBeDefined();
    expect(screen.getByRole("menuitem", { name: "Teams" })).toBeDefined();
    expect(screen.getByRole("menuitem", { name: "Invite" })).toBeDefined();
    expect(
      screen
        .getByRole("menuitem", { name: "Log out" })
        .getAttribute("data-variant"),
    ).toBe("destructive");
  });

  test("opens from the keyboard", async () => {
    const user = userEvent.setup();
    render(<ProfileCardBlock user={USER} />);

    await user.tab();
    await user.keyboard("{Enter}");

    expect(await screen.findByRole("menuitem", { name: "Profile" })).toBeDefined();
  });

  test("fires the handler behind the selected item", async () => {
    const user = userEvent.setup();
    const onSelect = mock(() => {});
    render(
      <ProfileCardBlock
        items={[{ id: "settings", label: "Settings", onSelect }]}
        user={USER}
      />,
    );

    await user.click(screen.getByRole("button"));
    await user.click(await screen.findByRole("menuitem", { name: "Settings" }));

    expect(onSelect).toHaveBeenCalled();
  });

  test("items replace the default menu", async () => {
    const user = userEvent.setup();
    render(
      <ProfileCardBlock
        items={[{ id: "switch", label: "Switch team" }]}
        user={USER}
      />,
    );

    await user.click(screen.getByRole("button"));

    expect(
      await screen.findByRole("menuitem", { name: "Switch team" }),
    ).toBeDefined();
    expect(screen.queryByRole("menuitem", { name: "Log out" })).toBeNull();
  });

  test("labels name the group they head, up to the next separator", async () => {
    const user = userEvent.setup();
    render(
      <ProfileCardBlock
        items={[
          { type: "label", label: "Workspace" },
          { id: "switch", label: "Switch team" },
          { type: "separator" },
          { id: "sign-out", label: "Log out", variant: "destructive" },
        ]}
        user={USER}
      />,
    );

    await user.click(screen.getByRole("button"));

    const named = await screen.findByRole("group", { name: "Workspace" });
    expect(named.querySelectorAll('[data-slot="menu-item"]')).toHaveLength(1);
    expect(screen.getAllByRole("group")).toHaveLength(2);
    expect(
      screen.getByRole("menuitem", { name: "Log out" }).getAttribute("data-variant"),
    ).toBe("destructive");
  });

  test("reports a rejected action through onError", async () => {
    const user = userEvent.setup();
    const onError = mock(() => {});
    render(
      <ProfileCardBlock
        items={[
          {
            id: "sign-out",
            label: "Log out",
            onSelect: async () => {
              throw new Error("Session already ended.");
            },
          },
        ]}
        onError={onError}
        user={USER}
      />,
    );

    await user.click(screen.getByRole("button"));
    await user.click(await screen.findByRole("menuitem", { name: "Log out" }));

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onError).toHaveBeenCalled();
  });
  test("variant=collapsed folds to the avatar but keeps the accessible name", () => {
    const { rerender } = render(<ProfileCardBlock user={USER} variant="collapsed" />);

    const trigger = screen.getByRole("button", {
      name: "Jenny Hamilton @jennycodes, account menu",
    });
    expect(trigger.hasAttribute("data-collapsed")).toBe(true);
    // Hover names the tile the way the rail's menu buttons do.
    expect(trigger.getAttribute("title")).toBe("Jenny Hamilton @jennycodes");
    // The avatar stays; the identity lines fold (hidden, not removed — that
    // is what lets the fold animate back open).
    expect(screen.getByText("JH")).toBeDefined();
    const identity = trigger.querySelector('[data-slot="profile-card-identity"]');
    expect(identity?.getAttribute("aria-hidden")).toBe("true");
    expect(identity?.textContent).toContain("Jenny Hamilton");
    // Full-width h-10 row, like the tree rail's tiles: avatar centred on
    // the rail's own centre line, no inset.
    expect(trigger.className).toContain("justify-center");
    expect(trigger.className).toContain("h-10");
    expect(trigger.className).toContain("w-full");
    expect(trigger.className).toContain("p-0");

    rerender(<ProfileCardBlock user={USER} variant="expanded" />);
    expect(trigger.hasAttribute("data-collapsed")).toBe(false);
    expect(trigger.getAttribute("title")).toBeNull();
    expect(identity?.getAttribute("aria-hidden")).toBeNull();
  });

  test("variant=collapsed still opens the menu", async () => {
    const user = userEvent.setup();
    render(<ProfileCardBlock user={USER} variant="collapsed" />);
    await user.click(screen.getByRole("button"));
    expect(await screen.findByRole("menuitem", { name: "Log out" })).toBeDefined();
  });

  test("follows the enclosing AnimatedPanel unless variant is set", () => {
    const panel = { collapsed: true, collapsible: "icon", side: "left" } as const;
    const { rerender } = render(
      <AnimatedSidebarPanelContext.Provider value={panel}>
        <ProfileCardBlock user={USER} />
      </AnimatedSidebarPanelContext.Provider>,
    );
    const trigger = screen.getByRole("button");
    expect(trigger.hasAttribute("data-collapsed")).toBe(true);

    // An explicit prop wins over the panel.
    rerender(
      <AnimatedSidebarPanelContext.Provider value={panel}>
        <ProfileCardBlock user={USER} variant="expanded" />
      </AnimatedSidebarPanelContext.Provider>,
    );
    expect(trigger.hasAttribute("data-collapsed")).toBe(false);

  });

  test("outside any panel an unnamed card starts expanded", () => {
    render(<ProfileCardBlock user={USER} />);
    expect(screen.getByRole("button").hasAttribute("data-collapsed")).toBe(false);
    expect(screen.getByRole("button").getAttribute("data-variant")).toBe("expanded");
  });

  test("defaultVariant seeds an uncontrolled card", () => {
    render(<ProfileCardBlock defaultVariant="collapsed" user={USER} />);
    expect(screen.getByRole("button").getAttribute("data-variant")).toBe("collapsed");
  });
  test("data-variant mirrors the fold and onVariantChange reports store-driven changes", () => {
    const onVariantChange = mock(() => {});
    let actions!: ProfileCardActions;
    let state!: ProfileCardState;
    function Probe() {
      actions = useProfileCardActions("account");
      state = useProfileCardState("account");
      return null;
    }
    render(
      <>
        <ProfileCardBlock
          onVariantChange={onVariantChange}
          profileCardId="account"
          user={USER}
        />
        <Probe />
      </>,
    );
    const trigger = screen.getByRole("button");
    expect(trigger.getAttribute("data-variant")).toBe("expanded");
    expect(state.variant).toBe("expanded");

    // Driven from outside by id — no controller, no ref.
    act(() => actions.collapse());
    expect(trigger.getAttribute("data-variant")).toBe("collapsed");
    expect(state.variant).toBe("collapsed");
    expect(onVariantChange).toHaveBeenCalledWith("collapsed");

    act(() => actions.toggleVariant());
    expect(trigger.getAttribute("data-variant")).toBe("expanded");
    expect(onVariantChange).toHaveBeenLastCalledWith("expanded");
  });

  test("a controlled variant is never overwritten by the store", () => {
    let actions!: ProfileCardActions;
    function Probe() {
      actions = useProfileCardActions("locked");
      return null;
    }
    const onVariantChange = mock(() => {});
    render(
      <>
        <ProfileCardBlock
          onVariantChange={onVariantChange}
          profileCardId="locked"
          user={USER}
          variant="expanded"
        />
        <Probe />
      </>,
    );
    act(() => actions.collapse());
    // Reported, not applied — the prop is truth.
    expect(onVariantChange).toHaveBeenCalledWith("collapsed");
    expect(screen.getByRole("button").getAttribute("data-variant")).toBe("expanded");
  });

  test("openMenu / closeMenu from outside drive the menu through the store", async () => {
    let actions!: ProfileCardActions;
    function Probe() {
      actions = useProfileCardActions("menu");
      return null;
    }
    render(
      <>
        <ProfileCardBlock profileCardId="menu" user={USER} />
        <Probe />
      </>,
    );
    act(() => actions.openMenu());
    expect(await screen.findByRole("menuitem", { name: "Profile" })).toBeDefined();
    act(() => actions.closeMenu());
    await new Promise((r) => setTimeout(r, 300));
    expect(screen.queryByRole("menuitem", { name: "Profile" })).toBeNull();
  });

  test("busy tracks a pending action in the store", async () => {
    const user = userEvent.setup();
    let resolve!: () => void;
    let state!: ProfileCardState;
    function Probe() {
      state = useProfileCardState("busy");
      return null;
    }
    render(
      <>
        <ProfileCardBlock
          items={[
            {
              id: "slow",
              label: "Slow",
              onSelect: () => new Promise<void>((r) => (resolve = r)),
            },
          ]}
          profileCardId="busy"
          user={USER}
        />
        <Probe />
      </>,
    );
    await user.click(screen.getByRole("button"));
    await user.click(await screen.findByRole("menuitem", { name: "Slow" }));
    expect(state.busy).toBe(true);
    expect(state.pendingActionId).toBe("slow");
    await act(async () => {
      resolve();
      await Promise.resolve();
    });
    expect(state.busy).toBe(false);
  });

  test("user.presence and the presence prop reach the avatar badge", () => {
    const { rerender } = render(
      <ProfileCardBlock user={{ ...USER, presence: "online" }} />,
    );
    const badge = () =>
      document.querySelector('[data-slot="user-avatar-presence"]');
    expect(badge()?.getAttribute("data-presence")).toBe("online");
    rerender(
      <ProfileCardBlock presence="offline" user={{ ...USER, presence: "online" }} />,
    );
    expect(badge()?.getAttribute("data-presence")).toBe("offline");
    rerender(<ProfileCardBlock user={USER} />);
    expect(badge()).toBeNull();
  });
});
