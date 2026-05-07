import { describe, it, expect } from "vitest";
import { evaluateEmailRisk } from "./evaluate-email-risk";

describe("evaluateEmailRisk", () => {
  it("returns low score for a typical address", () => {
    const { score } = evaluateEmailRisk("maria.garcia@gmail.com");
    expect(score).toBeLessThan(45);
  });

  it("returns elevated score for dotted obfuscation pattern", () => {
    const { score } = evaluateEmailRisk("b.a.rl.e.t.hh08.2@example.com");
    expect(score).toBeGreaterThanOrEqual(45);
  });

  it("returns elevated score for many short dot-separated segments", () => {
    const { score } = evaluateEmailRisk("u.s.e.r.a.n.izi.f472@mail.com");
    expect(score).toBeGreaterThanOrEqual(45);
  });
});
