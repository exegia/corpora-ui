import { describe, expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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
    const onSettings = mock(() => {});
    render(<ProfileCardBlock user={USER} onSettings={onSettings} />);

    await user.click(screen.getByRole("button"));
    await user.click(await screen.findByRole("menuitem", { name: "Settings" }));

    expect(onSettings).toHaveBeenCalled();
  });

  test("groups replace the default menu", async () => {
    const user = userEvent.setup();
    const onSelect = mock(() => {});
    render(
      <ProfileCardBlock
        user={USER}
        groups={[
          { label: "Workspace", items: [{ id: "switch", label: "Switch team", onSelect }] },
        ]}
        onSignOut={() => {}}
      />,
    );

    await user.click(screen.getByRole("button"));

    expect(
      await screen.findByRole("menuitem", { name: "Switch team" }),
    ).toBeDefined();
    expect(screen.queryByRole("menuitem", { name: "Log out" })).toBeNull();
  });

  test("reports a rejected action through onError", async () => {
    const user = userEvent.setup();
    const onError = mock(() => {});
    render(
      <ProfileCardBlock
        user={USER}
        onError={onError}
        onSignOut={async () => {
          throw new Error("Session already ended.");
        }}
      />,
    );

    await user.click(screen.getByRole("button"));
    await user.click(await screen.findByRole("menuitem", { name: "Log out" }));

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onError).toHaveBeenCalled();
  });
});
