import { describe, expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  OnboardingBlock,
  type OnboardingBlockProps,
  type OnboardingStepConfig,
} from "../onboarding-block";

const STEPS: OnboardingStepConfig[] = [
  {
    id: "profile",
    title: "Your profile",
    fields: [
      { kind: "text", name: "display_name", label: "Display name", required: true },
    ],
  },
  {
    id: "links",
    title: "Your links",
    fields: [
      { kind: "url", name: "website", label: "Website" },
      { kind: "checkbox", name: "newsletter", label: "Send me the newsletter" },
    ],
  },
];

describe("OnboardingBlock", () => {
  test("renders the declared steps as progress", () => {
    render(<OnboardingBlock steps={STEPS} />);

    const items = screen
      .getByRole("navigation", { name: "Onboarding progress" })
      .querySelectorAll("li");
    expect(items).toHaveLength(2);
    expect(items[0]?.getAttribute("aria-current")).toBe("step");
  });

  test("blocks advance on a missing required field", async () => {
    const user = userEvent.setup();
    const onStepSubmit = mock(async () => {});
    render(<OnboardingBlock steps={STEPS} onStepSubmit={onStepSubmit} />);

    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByText("Display name is required")).toBeDefined();
    expect(onStepSubmit).not.toHaveBeenCalled();
  });

  test("rejects a malformed URL", async () => {
    const user = userEvent.setup();
    render(<OnboardingBlock steps={STEPS} />);

    await user.type(screen.getByLabelText("Display name"), "Ada");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    await user.type(await screen.findByLabelText("Website"), "not-a-url");
    await user.click(screen.getByRole("button", { name: "Finish" }));

    expect(await screen.findByText("Enter a valid URL")).toBeDefined();
  });

  test("walks the steps and reports the merged profile once", async () => {
    const user = userEvent.setup();
    const onStepSubmit =
      mock<NonNullable<OnboardingBlockProps["onStepSubmit"]>>(async () => {});
    const onComplete =
      mock<NonNullable<OnboardingBlockProps["onComplete"]>>(async () => {});
    render(
      <OnboardingBlock
        steps={STEPS}
        onStepSubmit={onStepSubmit}
        onComplete={onComplete}
      />,
    );

    await user.type(screen.getByLabelText("Display name"), "Ada");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    await user.type(
      await screen.findByLabelText("Website"),
      "https://example.com",
    );
    await user.click(
      screen.getByRole("checkbox", { name: "Send me the newsletter" }),
    );
    await user.click(screen.getByRole("button", { name: "Finish" }));

    expect(onStepSubmit).toHaveBeenCalledTimes(2);
    expect(onStepSubmit.mock.calls[0]).toEqual([
      "profile",
      { display_name: "Ada" },
    ]);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete.mock.calls[0]?.[0]).toEqual({
      display_name: "Ada",
      website: "https://example.com",
      newsletter: true,
    });
    expect(await screen.findByText("You're all set")).toBeDefined();
  });

  test("restores drafts when navigating back", async () => {
    const user = userEvent.setup();
    render(<OnboardingBlock steps={STEPS} />);

    await user.type(screen.getByLabelText("Display name"), "Ada");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    const website = await screen.findByLabelText("Website");
    await user.type(website, "https://example.com");
    await user.click(screen.getByRole("button", { name: "Back" }));

    expect(
      ((await screen.findByLabelText("Display name")) as HTMLInputElement).value,
    ).toBe("Ada");

    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(
      ((await screen.findByLabelText("Website")) as HTMLInputElement).value,
    ).toBe("https://example.com");
  });

  test("keeps the user on the step when onStepSubmit rejects", async () => {
    const user = userEvent.setup();
    render(
      <OnboardingBlock
        steps={STEPS}
        onStepSubmit={async () => {
          throw new Error("Saving your profile was rejected.");
        }}
      />,
    );

    await user.type(screen.getByLabelText("Display name"), "Ada");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect((await screen.findByRole("alert")).textContent).toBe(
      "Saving your profile was rejected.",
    );
    expect(screen.getByLabelText("Display name")).toBeDefined();
  });

  test("renders nothing after completion when the success screen is off", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <OnboardingBlock steps={[STEPS[0]!]} showCompleteScreen={false} />,
    );

    await user.type(screen.getByLabelText("Display name"), "Ada");
    await user.click(screen.getByRole("button", { name: "Finish" }));

    expect(container.innerHTML).toBe("");
  });
});
