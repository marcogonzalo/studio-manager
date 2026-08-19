import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ItemPriceOrTbd, PriceTbdPill } from "./price-tbd-pill";

describe("PriceTbdPill", () => {
  it("renders the TBD label", () => {
    render(<PriceTbdPill label="To be defined" />);
    expect(screen.getByText("To be defined")).toBeInTheDocument();
  });
});

describe("ItemPriceOrTbd", () => {
  it("shows pill when item price is TBD", () => {
    render(
      <ItemPriceOrTbd item={{ is_price_tbd: true }} tbdLabel="To be defined">
        €12.00
      </ItemPriceOrTbd>
    );
    expect(screen.getByText("To be defined")).toBeInTheDocument();
    expect(screen.queryByText("€12.00")).not.toBeInTheDocument();
  });

  it("shows children when price is known", () => {
    render(
      <ItemPriceOrTbd item={{ is_price_tbd: false }} tbdLabel="To be defined">
        €12.00
      </ItemPriceOrTbd>
    );
    expect(screen.getByText("€12.00")).toBeInTheDocument();
    expect(screen.queryByText("To be defined")).not.toBeInTheDocument();
  });
});
