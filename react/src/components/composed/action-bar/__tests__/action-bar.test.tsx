import { describe, expect, test } from "bun:test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BoldIcon } from "lucide-react";
import ActionBar from "../toolbar";
import { Action, Separator } from "../action";
import type { TActionKey, TActionMap } from "../types";

const act = (id: string) => () => (
  <Action Icon={BoldIcon} action={() => {}} id={id} tooltip={id} />
);

const bar = (actions: TActionMap<TActionKey>) => {
  const { container } = render(
    <ActionBar id="bar" variant="default" actions={actions} />
  );
  return {
    groups: container.querySelectorAll('[data-slot="toolbar-group"]').length,
    separators: container.querySelectorAll('[data-slot="toolbar-separator"]')
      .length,
    // TooltipTrigger's data-slot wins over ToolbarButton's in the render
    // merge, so actions are matched by tag rather than by slot.
    buttons: container.querySelectorAll("button[data-tooltip]").length,
    // A group that rendered with no actions inside is the failure this guards.
    emptyGroups: [
      ...container.querySelectorAll('[data-slot="toolbar-group"]'),
    ].filter((g) => g.querySelectorAll("button[data-tooltip]").length === 0)
      .length,
  };
};

describe("ActionBar grouping", () => {
  test("multiple toolbars keep their tooltips and labels independent", async () => {
    const user = userEvent.setup();
    render(
      <>
        <ActionBar
          id="first-bar"
          variant="default"
          actions={{ "action-first": act("first") }}
        />
        <ActionBar
          id="second-bar"
          variant="default"
          actions={{ "action-second": act("second") }}
        />
      </>
    );
    await user.tab();
    await waitFor(() => expect(screen.getByText("first")).toBeDefined());
    await user.tab();
    await waitFor(() => expect(screen.getByText("second")).toBeDefined());
  });
  test("no separator renders flat — no ToolbarGroup is added", () => {
    const r = bar({
      "action-a": act("a"),
      "action-b": act("b"),
    } as TActionMap<TActionKey>);
    expect(r.groups).toBe(0);
    expect(r.separators).toBe(0);
    expect(r.buttons).toBe(2);
  });

  test("a separator splits the actions either side of it into two groups", () => {
    const r = bar({
      "action-a": act("a"),
      "separator-1": Separator,
      "action-b": act("b"),
    } as TActionMap<TActionKey>);
    expect(r.groups).toBe(2);
    expect(r.separators).toBe(1);
    expect(r.emptyGroups).toBe(0);
  });

  test("a leading separator does not render an empty group before it", () => {
    const r = bar({
      "separator-1": Separator,
      "action-a": act("a"),
      "action-b": act("b"),
    } as TActionMap<TActionKey>);
    expect(r.groups).toBe(1);
    expect(r.emptyGroups).toBe(0);
  });

  test("a trailing separator does not render an empty group after it", () => {
    const r = bar({
      "action-a": act("a"),
      "separator-1": Separator,
    } as TActionMap<TActionKey>);
    expect(r.groups).toBe(1);
    expect(r.emptyGroups).toBe(0);
  });

  test("back-to-back separators do not render an empty group between them", () => {
    const r = bar({
      "action-a": act("a"),
      "separator-1": Separator,
      "separator-2": Separator,
      "action-b": act("b"),
    } as TActionMap<TActionKey>);
    expect(r.groups).toBe(2);
    expect(r.separators).toBe(2);
    expect(r.emptyGroups).toBe(0);
  });

  test("groups preserve the map's insertion order", () => {
    const { container } = render(
      <ActionBar
        id="bar"
        variant="default"
        actions={
          {
            "action-first": act("first"),
            "separator-1": Separator,
            "action-second": act("second"),
          } as TActionMap<TActionKey>
        }
      />
    );
    const order = [...container.querySelectorAll("[data-tooltip]")].map((b) =>
      b.getAttribute("data-tooltip")
    );
    expect(order).toEqual(["first", "second"]);
  });
});
