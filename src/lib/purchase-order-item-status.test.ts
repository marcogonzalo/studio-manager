import { describe, expect, it } from "vitest";
import { getItemStatusForPO } from "./purchase-order-item-status";

describe("getItemStatusForPO", () => {
  it("maps confirmed to ordered and received to received", () => {
    expect(getItemStatusForPO("confirmed")).toBe("ordered");
    expect(getItemStatusForPO("CONFIRMED")).toBe("ordered");
    expect(getItemStatusForPO("received")).toBe("received");
  });

  it("maps draft/sent/unknown to pending", () => {
    expect(getItemStatusForPO("draft")).toBe("pending");
    expect(getItemStatusForPO("sent")).toBe("pending");
    expect(getItemStatusForPO("cancelled")).toBe("pending");
    expect(getItemStatusForPO("")).toBe("pending");
  });
});
