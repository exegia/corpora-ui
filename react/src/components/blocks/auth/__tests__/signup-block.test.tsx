import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SignupBlock } from "../signup-block";

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
