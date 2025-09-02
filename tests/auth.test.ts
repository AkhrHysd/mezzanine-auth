import { describe, expect, it } from "vitest";
import { onRequestGet as auth } from "../functions/api/auth";

describe("/api/auth", () => {
  const env = {
    GITHUB_CLIENT_ID: "id",
    OAUTH_REDIRECT_URI: "https://auth.example.com/api/auth/callback",
    GITHUB_OAUTH_SCOPE: "public_repo",
    ALLOWED_ORIGINS: "https://client-a.com",
  };

  it("HTMLレスポンスを返し、postMessageとGitHub認証URLを含む", async () => {
    const req = new Request("https://auth.example.com/api/auth", {
      headers: { Origin: "https://client-a.com" },
    });
    const res = await auth({ request: req, env } as any);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/html; charset=utf-8");

    const html = await res.text();
    expect(html).toContain("<!doctype html>");
    expect(html).toContain("window.opener.postMessage");
    expect(html).toContain("authorizing:github");
    expect(html).toContain("location.replace");
    expect(html).toContain("github.com/login/oauth/authorize");
    expect(html).toContain("client_id=id");
    expect(html).toContain("scope=public_repo");

    expect(res.headers.get("Set-Cookie")).toMatch(
      /oauth_state=.*SameSite=Lax; Secure/
    );
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://client-a.com"
    );
    expect(res.headers.get("Access-Control-Allow-Credentials")).toBe("true");
  });

  it("デフォルトスコープがrepoになる", async () => {
    const envWithoutScope = {
      GITHUB_CLIENT_ID: "id",
      OAUTH_REDIRECT_URI: "https://auth.example.com/api/auth/callback",
    };

    const req = new Request("https://auth.example.com/api/auth");
    const res = await auth({ request: req, env: envWithoutScope } as any);
    const html = await res.text();
    expect(html).toContain("scope=repo");
  });
});
