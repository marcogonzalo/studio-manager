import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CatalogProductSelectCard } from "./catalog-product-select-card";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}));

const product = {
  id: "p1",
  name: "Armchair",
  image_url: "https://example.com/chair.jpg",
  supplier: { name: "Acme" },
};

describe("CatalogProductSelectCard", () => {
  it("does not nest buttons", () => {
    const { container } = render(
      <CatalogProductSelectCard
        product={product}
        selected={false}
        onSelect={vi.fn()}
        onPreview={vi.fn()}
        viewDetailsLabel="View details"
        noImageLabel="No image"
        noSupplierLabel="No supplier"
      />
    );

    const nested = container.querySelector("button button");
    expect(nested).toBeNull();
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  it("selects from the card without opening preview", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onPreview = vi.fn();

    render(
      <CatalogProductSelectCard
        product={product}
        selected={false}
        onSelect={onSelect}
        onPreview={onPreview}
        viewDetailsLabel="View details"
        noImageLabel="No image"
        noSupplierLabel="No supplier"
      />
    );

    await user.click(screen.getByRole("button", { name: /armchair/i }));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onPreview).not.toHaveBeenCalled();
  });

  it("opens preview without selecting the product", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onPreview = vi.fn();

    render(
      <CatalogProductSelectCard
        product={product}
        selected={false}
        onSelect={onSelect}
        onPreview={onPreview}
        viewDetailsLabel="View details"
        noImageLabel="No image"
        noSupplierLabel="No supplier"
      />
    );

    await user.click(screen.getByRole("button", { name: "View details" }));
    expect(onPreview).toHaveBeenCalledOnce();
    expect(onSelect).not.toHaveBeenCalled();
  });
});
