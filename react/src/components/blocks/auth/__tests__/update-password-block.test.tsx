import { describe, expect, mock, test } from "bun:test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { UpdatePasswordBlock } from "../update-password-block";

const STRONG = "Str0ngPassword";

describe("UpdatePasswordBlock", () => {
  test("gates the confirm field behind a strong new password", async () => {
    const user = userEvent.setup();
    render(<UpdatePasswordBlock />);

    expect(screen.queryByLabelText("Confirm new password")).toBeNull();

    await user.type(screen.getByLabelText("New password"), STRONG);

    expect(
      await screen.findByLabelText("Confirm new password"),
    ).toBeDefined();
  });

  test("gates the submit button behind matching passwords", async () => {
    const user = userEvent.setup();
    render(<UpdatePasswordBlock />);

    await user.type(screen.getByLabelText("New password"), STRONG);
    await user.type(
      await screen.findByLabelText("Confirm new password"),
      "different",
    );

    expect(screen.queryByRole("button", { name: "Update password" })).toBeNull();
  });

  test("submits the new password and shows the success panel", async () => {
    const user = userEvent.setup();
    const onSubmit = mock(async () => {});
    render(<UpdatePasswordBlock onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("New password"), STRONG);
    await user.type(
      await screen.findByLabelText("Confirm new password"),
      STRONG,
    );
    await user.click(
      await screen.findByRole("button", { name: "Update password" }),
    );

    expect(onSubmit).toHaveBeenCalledWith({ password: STRONG });
    expect(await screen.findByText("Password updated")).toBeDefined();
  });

  test("surfaces a rejection from onSubmit and stays on the form", async () => {
    const user = userEvent.setup();
    render(
      <UpdatePasswordBlock
        onSubmit={async () => {
          throw new Error("Password was used recently.");
        }}
      />,
    );

    await user.type(screen.getByLabelText("New password"), STRONG);
    await user.type(
      await screen.findByLabelText("Confirm new password"),
      STRONG,
    );
    await user.click(
      await screen.findByRole("button", { name: "Update password" }),
    );

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe("Password was used recently.");
    expect(screen.queryByText("Password updated")).toBeNull();
  });

  test("flags a diverged confirmation, but not a prefix mid-typing", async () => {
    const user = userEvent.setup();
    render(<UpdatePasswordBlock />);

    await user.type(screen.getByLabelText("New password"), STRONG);
    const confirm = await screen.findByLabelText("Confirm new password");

    await user.type(confirm, STRONG.slice(0, 4));
    expect(screen.queryByRole("alert")).toBeNull();

    await user.type(confirm, "X");
    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toBe(
        "Passwords do not match.",
      );
    });
  });
});
