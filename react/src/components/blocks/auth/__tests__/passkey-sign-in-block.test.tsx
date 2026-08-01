import { describe, expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PasskeySignInBlock } from "../passkey-sign-in-block";

describe("PasskeySignInBlock", () => {
  test("renders nothing when passkeys are unavailable", () => {
    const { container } = render(<PasskeySignInBlock available={false} />);
    expect(container.innerHTML).toBe("");
  });

  test("signs in through onSignIn", async () => {
    const user = userEvent.setup();
    const onSignIn = mock(async () => {});
    render(<PasskeySignInBlock onSignIn={onSignIn} />);

    await user.click(screen.getByRole("button", { name: /passkey/i }));

    expect(onSignIn).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  test("treats a cancelled prompt as a silent return to idle", async () => {
    const user = userEvent.setup();
    render(<PasskeySignInBlock onSignIn={async () => ({ cancelled: true })} />);

    await user.click(screen.getByRole("button", { name: /passkey/i }));

    expect(screen.queryByRole("alert")).toBeNull();
  });

  test("shows the error and the fallback hint on failure", async () => {
    const user = userEvent.setup();
    render(
      <PasskeySignInBlock
        onSignIn={async () => {
          throw new Error("No passkey found for this account.");
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: /passkey/i }));

    expect((await screen.findByRole("alert")).textContent).toBe(
      "No passkey found for this account.",
    );
    expect(
      await screen.findByText(
        "You can still sign in with your other methods below.",
      ),
    ).toBeDefined();
  });

  test("uses a custom label", () => {
    render(<PasskeySignInBlock label="Use Face ID" />);
    expect(screen.getByRole("button", { name: "Use Face ID" })).toBeDefined();
  });
});
