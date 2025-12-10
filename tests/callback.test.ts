import { afterEach, describe, expect, it, vi } from "vitest";
import { onRequestGet as callback } from "../functions/api/auth/callback";

const env = {
  GITHUB_CLIENT_ID: "id",
  GITHUB_CLIENT_SECRET: "secret",
  OAUTH_REDIRECT_URI: "https://auth.example.com/api/auth/callback",
  ALLOWED_ORIGINS: "https://client-a.com",
};

afterEach(() => vi.restoreAllMocks());

function reqWith(code: string, state: string) {
  return new Request(`https://auth.example.com/api/auth/callback?code=${code}&state=${state}`, {
    headers: {
      Cookie: `oauth_state=${state}`,
      Origin: "https://client-a.com",
    },
  });
}

describe("/api/auth/callback", () => {
  it("code→token交換に成功するとHTMLでpostMessageを返す", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ access_token: "tkn" }), {
        headers: { "Content-Type": "application/json" },
      }),
    );

    const res = await callback({ request: reqWith("abc", "xyz"), env } as any);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/html; charset=utf-8");

    const html = await res.text();
    expect(html).toContain("<!doctype html>");
    expect(html).toContain("window.opener.postMessage");
    expect(html).toContain("authorization:github:success:");
    expect(html).toContain('\\"token\\":\\"tkn\\"');
    expect(html).toContain("window.close()");

    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("https://client-a.com");
  });

  it("state不一致ならHTMLでエラーメッセージを返す", async () => {
    const bad = new Request("https://auth.example.com/api/auth/callback?code=abc&state=BAD", {
      headers: { Cookie: "oauth_state=xyz", Origin: "https://client-a.com" },
    });
    const res = await callback({ request: bad, env } as any);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/html; charset=utf-8");

    const html = await res.text();
    expect(html).toContain("authorization:github:error:");
    expect(html).toContain("invalid_state");
  });

  it("GitHub交換が失敗したらHTMLでエラーメッセージを返す", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "bad_verification_code" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      }),
    );

    const res = await callback({ request: reqWith("abc", "xyz"), env } as any);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/html; charset=utf-8");

    const html = await res.text();
    expect(html).toContain("authorization:github:error:");
    expect(html).toContain("token_error");
  });
});
