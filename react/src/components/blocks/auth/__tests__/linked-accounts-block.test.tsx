import { describe, expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  LinkedAccountsBlock,
  type LinkedIdentity,
} from "../linked-accounts-block";

const IDENTITIES: LinkedIdentity[] = [
  { id: "id-1", provider: "google", email: "reader@example.com" },
  { id: "id-2", provider: "github" },
];

describe("LinkedAccountsBlock", () => {
  test("shows the loading row", () => {
    render(<LinkedAccountsBlock loading />);
    expect(screen.getByText("Loading connected accounts…")).toBeDefined();
  });

  test("shows the empty state when nothing is connected", () => {
    render(<LinkedAccountsBlock identities={[]} />);
    expect(screen.getByText("No sign-in methods connected yet.")).toBeDefined();
  });

  test("lists connected identities with their addresses", () => {
    render(<LinkedAccountsBlock identities={IDENTITIES} />);

    const list = screen.getByRole("list", { name: "Connected accounts" });
    expect(list.querySelectorAll("li")).toHaveLength(2);
    expect(screen.getByText("reader@example.com")).toBeDefined();
  });

  test("offers only the providers that are not connected yet", () => {
    render(
      <LinkedAccountsBlock
        identities={IDENTITIES}
        providers={["google", "apple", "github"]}
      />,
    );

    expect(screen.getByRole("button", { name: "Connect Apple" })).toBeDefined();
    expect(screen.queryByRole("button", { name: "Connect Google" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Connect GitHub" })).toBeNull();
  });

  test("connects a provider through onLink", async () => {
    const user = userEvent.setup();
    const onLink = mock(async () => {});
    render(
      <LinkedAccountsBlock
        identities={IDENTITIES}
        providers={["apple"]}
        onLink={onLink}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Connect Apple" }));

    expect(onLink).toHaveBeenCalledWith("apple");
  });

  test("disconnects an identity through onUnlink", async () => {
    const user = userEvent.setup();
    const onUnlink = mock(async () => {});
    render(<LinkedAccountsBlock identities={IDENTITIES} onUnlink={onUnlink} />);

    await user.click(screen.getByRole("button", { name: "Disconnect Google" }));

    expect(onUnlink).toHaveBeenCalledWith("id-1");
  });

  test("guards the last remaining sign-in method", async () => {
    const user = userEvent.setup();
    const onUnlink = mock(async () => {});
    render(
      <LinkedAccountsBlock identities={[IDENTITIES[0]!]} onUnlink={onUnlink} />,
    );

    const button = screen.getByRole("button", { name: "Disconnect Google" });
    expect(button.hasAttribute("disabled")).toBe(true);

    const note = screen.getByText(
      "This is your only way to sign in, so it can't be disconnected.",
    );
    expect(button.getAttribute("aria-describedby")).toBe(note.id);

    await user.click(button);
    expect(onUnlink).not.toHaveBeenCalled();
  });

  test("surfaces a failing link as an error", async () => {
    const user = userEvent.setup();
    render(
      <LinkedAccountsBlock
        identities={IDENTITIES}
        providers={["apple"]}
        onLink={async () => {
          throw new Error("That account is already linked elsewhere.");
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Connect Apple" }));

    expect((await screen.findByRole("alert")).textContent).toBe(
      "That account is already linked elsewhere.",
    );
  });
});
