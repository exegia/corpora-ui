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
  await user.type(await screen.findByLabelText("Password"), STRONG);
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

describe("SignupBlock field labelling", () => {
  test("names every field, including the revealed password", async () => {
    const user = userEvent.setup();
    render(<SignupBlock />);

    expect(screen.getByLabelText("Name")).toBeDefined();
    expect(screen.getByLabelText("Email")).toBeDefined();

    // The password field only appears once the email validates.
    await user.type(screen.getByLabelText("Email"), "ada@corpora.local");
    expect(await screen.findByLabelText("Password")).toBeDefined();
  });

  test("gives each instance its own password id", async () => {
    const user = userEvent.setup();
    render(
      <>
        <SignupBlock showNameField={false} />
        <SignupBlock showNameField={false} />
      </>,
    );

    const emails = screen.getAllByLabelText("Email");
    await user.type(emails[0], "ada@corpora.local");
    await user.type(emails[1], "ben@corpora.local");

    // Two blocks on one page must not collide on a hard-coded id, or the
    // second label would point at the first block's input.
    const passwords = await screen.findAllByLabelText("Password");
    expect(passwords).toHaveLength(2);
    expect(passwords[0].id).not.toBe(passwords[1].id);
  });
});
