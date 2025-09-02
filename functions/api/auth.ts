import { allowOrigin } from "../../src/utils/cors";

export interface Env {
  GITHUB_CLIENT_ID: string;
  OAUTH_REDIRECT_URI: string;
  GITHUB_OAUTH_SCOPE?: string;
  ALLOWED_ORIGINS?: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const state = crypto.randomUUID();
  const u = new URL("https://github.com/login/oauth/authorize");
  u.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  u.searchParams.set("redirect_uri", env.OAUTH_REDIRECT_URI);
  u.searchParams.set("scope", env.GITHUB_OAUTH_SCOPE || "repo");
  u.searchParams.set("state", state);

  const origin = request.headers.get("Origin") || "";
  const headers: Record<string, string> = {
    "Content-Type": "text/html; charset=utf-8",
    // CSRF対策のstateをCookieに
    "Set-Cookie": `oauth_state=${state}; Max-Age=600; Path=/; HttpOnly; SameSite=Lax; Secure`,
  };

  // CORSヘッダーを条件付きで追加
  if (allowOrigin(origin, env.ALLOWED_ORIGINS)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Credentials"] = "true";
  }

  const html = `<!doctype html><meta charset="utf-8">
<script>
  try {
    if (window.opener) {
      window.opener.postMessage("authorizing:github", "*");
    }
  } catch (_) {}
  location.replace(${JSON.stringify(u.toString())});
</script>`;

  return new Response(html, { headers });
};
