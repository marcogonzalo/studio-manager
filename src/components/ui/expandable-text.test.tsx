import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExpandableText } from "./expandable-text";

const longText =
  "Sofá modular de lino lavado con chaise longue, patas de madera de roble y fundas extraíbles. Disponible en tres profundidades.";

describe("ExpandableText", () => {
  it("renders collapsed text as a button", () => {
    render(
      <ExpandableText
        text={longText}
        expandLabel="Show full description"
        collapseLabel="Hide full description"
      />
    );

    const button = screen.getByRole("button", { name: longText });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button.className).toContain("line-clamp-2");
  });

  it("expands on click and collapses on second click", async () => {
    const user = userEvent.setup();
    render(
      <ExpandableText
        text={longText}
        expandLabel="Show full description"
        collapseLabel="Hide full description"
      />
    );

    const button = screen.getByRole("button", { name: longText });
    await user.click(button);

    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(button.className).not.toContain("line-clamp-2");
    expect(button.className).toContain("whitespace-pre-wrap");

    await user.click(button);

    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button.className).toContain("line-clamp-2");
  });

  it("uses a custom collapsed class", () => {
    render(
      <ExpandableText
        text={longText}
        collapsedClassName="truncate"
        expandLabel="Show full description"
        collapseLabel="Hide full description"
      />
    );

    expect(screen.getByRole("button", { name: longText }).className).toContain(
      "truncate"
    );
  });
});
