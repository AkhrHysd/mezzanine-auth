import { describe, it, expect, vi, afterEach } from "vitest";
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
  it("code→token交換に成功すると {token} を返す", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ access_token: "tkn" }), {
        headers: { "Content-Type": "application/json" },
      }),
    );

    const res = await callback({ request: reqWith("abc", "xyz"), env } as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ token: "tkn" });
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("https://client-a.com");
  });

  it("state不一致なら400", async () => {
    const bad = new Request("https://auth.example.com/api/auth/callback?code=abc&state=BAD", {
      headers: { Cookie: "oauth_state=xyz", Origin: "https://client-a.com" },
    });
    const res = await callback({ request: bad, env } as any);
    expect(res.status).toBe(400);
  });

  it("GitHub交換が失敗したら400 token_error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "bad_verification_code" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      }),
    );

    const res = await callback({ request: reqWith("abc", "xyz"), env } as any);
    expect(res.status).toBe(400);
    const j = await res.json();
    expect(j.error).toBe("token_error");
  });
});
