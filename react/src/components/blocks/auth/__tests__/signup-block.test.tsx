import { describe, expect, mock, test } from "bun:test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";

import { SignupBlock } from "../signup-block";

const STRONG = "Str0ngPassword";

/** Fills every field, so only the terms checkbox stands between us and submit. */
async function fillForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Name"), "Ada Researcher");
  await user.type(screen.getByLabelText("Email"), "ada@corpora.local");
  // The password field carries no accessible name on this branch, so it is
  // reached by placeholder.
  await user.type(
    await screen.findByPlaceholderText("Create a password"),
    STRONG,
  );
}

// Base UI renders a hidden native input beside the Checkbox root, so the box is
// queried by role and read from aria-checked (see CLAUDE.md).
const checkbox = () => screen.getByRole("checkbox");

describe("SignupBlock terms checkbox", () => {
  test("owns the box when uncontrolled", async () => {
    const user = userEvent.setup();
    render(<SignupBlock />);

    expect(checkbox().getAttribute("aria-checked")).toBe("false");

    await user.click(checkbox());
    await waitFor(() =>
      expect(checkbox().getAttribute("aria-checked")).toBe("true"),
    );
  });

  test("starts from defaultTermsChecked", () => {
    render(<SignupBlock defaultTermsChecked />);
    expect(checkbox().getAttribute("aria-checked")).toBe("true");
  });

  test("reports changes through onTermsCheckedChange while uncontrolled", async () => {
    const user = userEvent.setup();
    const onChange = mock((checked: boolean) => checked);
    render(<SignupBlock onTermsCheckedChange={onChange} />);

    await user.click(checkbox());
    expect(onChange).toHaveBeenCalledWith(true);
  });

  test("defers to the owner when controlled", async () => {
    const user = userEvent.setup();
    const onChange = mock((checked: boolean) => checked);
    render(<SignupBlock termsChecked={false} onTermsCheckedChange={onChange} />);

    await user.click(checkbox());

    // The click is reported, but the box only moves if the owner says so.
    expect(onChange).toHaveBeenCalledWith(true);
    expect(checkbox().getAttribute("aria-checked")).toBe("false");
  });

  test("lets an outside action tick the box and unblock submit", async () => {
    const user = userEvent.setup();
    const onSubmit = mock(async () => {});

    // Stands in for a consumer's terms dialog: an "I agree" action that ticks
    // the block's checkbox from outside it.
    function Host() {
      const [accepted, setAccepted] = React.useState(false);
      return (
        <>
          <button type="button" onClick={() => setAccepted(true)}>
            I agree
          </button>
          <SignupBlock
            termsChecked={accepted}
            onTermsCheckedChange={setAccepted}
            onSubmit={onSubmit}
          />
        </>
      );
    }
    render(<Host />);

    await fillForm(user);
    await user.click(await screen.findByRole("button", { name: "I agree" }));
    await waitFor(() =>
      expect(checkbox().getAttribute("aria-checked")).toBe("true"),
    );

    await user.click(screen.getByRole("button", { name: "Create account" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  });

  test("still blocks submission while the controlled box is unticked", async () => {
    const user = userEvent.setup();
    const onSubmit = mock(async () => {});
    render(<SignupBlock termsChecked={false} onSubmit={onSubmit} />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      "Please accept the terms to continue.",
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

// The terms link sits inside the consent <label>, and under happy-dom that
// nesting computes an empty accessible name — so it is queried by text rather
// than by role + name. It resolves normally in a browser.
const termsLink = () => screen.getByText("terms");

describe("SignupBlock termsComponent", () => {
  test("renders the built-in terms link by default", async () => {
    const user = userEvent.setup();
    const onTerms = mock(() => {});
    render(<SignupBlock onTerms={onTerms} />);

    expect(termsLink().tagName).toBe("BUTTON");
    await user.click(termsLink());
    expect(onTerms).toHaveBeenCalled();
  });

  test("swaps the link for the consumer's own node", () => {
    render(
      <SignupBlock
        termsComponent={<button type="button">read the terms</button>}
      />,
    );

    expect(screen.getByText("read the terms")).toBeDefined();
    expect(screen.queryByText("terms")).toBeNull();
  });

  test("keeps the consent label around the replacement", () => {
    render(<SignupBlock termsComponent={<span>our terms of use</span>} />);

    expect(screen.getByText(/I agree to the/)).toBeDefined();
    expect(screen.getByRole("checkbox")).toBeDefined();
  });
});
