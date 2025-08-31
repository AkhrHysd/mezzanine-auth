import { describe, it, expect } from "vitest";
import { allowOrigin } from "../src/utils/cors";

describe("allowOrigin", () => {
  const list = "https://site-a.com,https://*.mezzanine.app";

  it("許可ドメインはtrue", () => {
    expect(allowOrigin("https://site-a.com", list)).toBe(true);
    expect(allowOrigin("https://foo.mezzanine.app", list)).toBe(true);
  });

  it("不許可ドメインはfalse", () => {
    expect(allowOrigin("https://evil.com", list)).toBe(false);
  });

  it("不正なOrigin文字列はfalse", () => {
    // 文字列がおかしくても落ちずに false
    expect(allowOrigin("not-a-url", list)).toBe(false);
  });
});
