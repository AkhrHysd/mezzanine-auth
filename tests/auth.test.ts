import { describe, it, expect } from "vitest";
import { onRequestGet as auth } from "../functions/api/auth";

describe("/api/auth", () => {
  const env = {
    GITHUB_CLIENT_ID: "id",
    OAUTH_REDIRECT_URI: "https://auth.example.com/api/auth/callback",
    GITHUB_OAUTH_SCOPE: "public_repo",
    ALLOWED_ORIGINS: "https://client-a.com",
  };

  it("GitHub authorize へ302する & stateをSet-Cookie", async () => {
    const req = new Request("https://auth.example.com/api/auth", {
      headers: { Origin: "https://client-a.com" },
    });
    const res = await auth({ request: req, env } as any);
    expect(res.status).toBe(302);
    const loc = res.headers.get("Location")!;
    expect(loc).toContain("github.com/login/oauth/authorize");
    expect(loc).toContain("client_id=id");
    expect(res.headers.get("Set-Cookie")).toMatch(/oauth_state=.*SameSite=Lax; Secure/);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("https://client-a.com");
  });
});
