import { describe, expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AnimatedSidebarPanelContext } from "@/components/blocks/shell/utils";
import { ProfileCardBlock } from "../profile-card-block";

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
  test("collapsed folds to the avatar but keeps the accessible name", () => {
    const { rerender } = render(<ProfileCardBlock collapsed user={USER} />);

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
    // 40px tile, like the tree rail: no inset, avatar centred.
    expect(trigger.className).toContain("justify-center");
    expect(trigger.className).toContain("size-10");
    expect(trigger.className).toContain("p-0");

    rerender(<ProfileCardBlock user={USER} />);
    expect(trigger.hasAttribute("data-collapsed")).toBe(false);
    expect(trigger.getAttribute("title")).toBeNull();
    expect(identity?.getAttribute("aria-hidden")).toBeNull();
  });

  test("collapsed still opens the menu", async () => {
    const user = userEvent.setup();
    render(<ProfileCardBlock collapsed user={USER} />);
    await user.click(screen.getByRole("button"));
    expect(await screen.findByRole("menuitem", { name: "Log out" })).toBeDefined();
  });

  test("follows the enclosing AnimatedPanel unless collapsed is set", () => {
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
        <ProfileCardBlock collapsed={false} user={USER} />
      </AnimatedSidebarPanelContext.Provider>,
    );
    expect(trigger.hasAttribute("data-collapsed")).toBe(false);

    // Outside any panel it is simply expanded.
    rerender(<ProfileCardBlock user={USER} />);
    expect(trigger.hasAttribute("data-collapsed")).toBe(false);
  });
});
