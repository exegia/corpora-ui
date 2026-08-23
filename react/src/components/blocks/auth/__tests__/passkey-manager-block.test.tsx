import { describe, expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  PasskeyManagerBlock,
  type PasskeyRecord,
} from "../passkey-manager-block";

const PASSKEYS: PasskeyRecord[] = [
  { id: "pk-1", name: "MacBook", createdAt: "2026-01-05T00:00:00.000Z" },
  { id: "pk-2", name: "iPhone", lastUsedAt: "2026-02-01T00:00:00.000Z" },
];

describe("PasskeyManagerBlock", () => {
  test("explains itself when the device cannot use passkeys", () => {
    render(<PasskeyManagerBlock available={false} passkeys={PASSKEYS} />);

    expect(screen.getByText(/aren't available on this device/i)).toBeDefined();
    expect(screen.queryByRole("list", { name: "Passkeys" })).toBeNull();
  });

  test("shows the loading row", () => {
    render(<PasskeyManagerBlock loading />);
    expect(screen.getByText("Loading passkeys…")).toBeDefined();
  });

  test("shows the empty state when nothing is registered", () => {
    render(<PasskeyManagerBlock />);
    expect(screen.getByText(/No passkeys registered yet/i)).toBeDefined();
  });

  test("lists every passkey", () => {
    render(<PasskeyManagerBlock passkeys={PASSKEYS} />);

    const list = screen.getByRole("list", { name: "Passkeys" });
    expect(list.querySelectorAll("li")).toHaveLength(2);
    expect(screen.getByText("MacBook")).toBeDefined();
    expect(screen.getByText("iPhone")).toBeDefined();
  });

  test("registers a passkey through onRegister", async () => {
    const user = userEvent.setup();
    const onRegister = mock(async () => {});
    render(<PasskeyManagerBlock onRegister={onRegister} />);

    await user.click(screen.getByRole("button", { name: "Add a passkey" }));

    expect(onRegister).toHaveBeenCalledTimes(1);
  });

  test("rejects a rename outside 1-120 characters without calling onRename", async () => {
    const user = userEvent.setup();
    const onRename = mock(async () => {});
    render(<PasskeyManagerBlock passkeys={PASSKEYS} onRename={onRename} />);

    await user.click(screen.getByRole("button", { name: "Rename MacBook" }));
    const input = await screen.findByLabelText("Passkey name");
    await user.clear(input);
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(
      await screen.findByText("Name must be between 1 and 120 characters."),
    ).toBeDefined();
    expect(onRename).not.toHaveBeenCalled();
  });

  test("submits a trimmed rename", async () => {
    const user = userEvent.setup();
    const onRename = mock(async () => {});
    render(<PasskeyManagerBlock passkeys={PASSKEYS} onRename={onRename} />);

    await user.click(screen.getByRole("button", { name: "Rename MacBook" }));
    const input = await screen.findByLabelText("Passkey name");
    await user.clear(input);
    await user.type(input, "  Work laptop  ");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onRename).toHaveBeenCalledWith("pk-1", "Work laptop");
  });

  test("deletes only after confirmation", async () => {
    const user = userEvent.setup();
    const onDelete = mock(async () => {});
    render(<PasskeyManagerBlock passkeys={PASSKEYS} onDelete={onDelete} />);

    await user.click(screen.getByRole("button", { name: "Delete MacBook" }));
    expect(onDelete).not.toHaveBeenCalled();

    await user.click(
      await screen.findByRole("button", { name: "Delete passkey" }),
    );
    expect(onDelete).toHaveBeenCalledWith("pk-1");
  });

  test("warns before deleting the last remaining passkey", async () => {
    const user = userEvent.setup();
    render(<PasskeyManagerBlock passkeys={[PASSKEYS[0]!]} />);

    await user.click(screen.getByRole("button", { name: "Delete MacBook" }));

    expect(await screen.findByText(/This is your last passkey/i)).toBeDefined();
  });

  test("does not warn while other passkeys remain", async () => {
    const user = userEvent.setup();
    render(<PasskeyManagerBlock passkeys={PASSKEYS} />);

    await user.click(screen.getByRole("button", { name: "Delete MacBook" }));
    await screen.findByRole("button", { name: "Delete passkey" });

    expect(screen.queryByText(/This is your last passkey/i)).toBeNull();
  });

  test("surfaces a failing action as an error", async () => {
    const user = userEvent.setup();
    render(
      <PasskeyManagerBlock
        onRegister={async () => {
          throw new Error("Passkey registration is disabled.");
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Add a passkey" }));

    expect((await screen.findByRole("alert")).textContent).toBe(
      "Passkey registration is disabled.",
    );
  });
});
