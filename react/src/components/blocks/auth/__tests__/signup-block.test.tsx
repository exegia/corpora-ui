import { describe, expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SignupBlock } from "../signup-block";

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
