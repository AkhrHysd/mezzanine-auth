import { allowOrigin } from "../../src/utils/cors";

export interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  OAUTH_REDIRECT_URI: string;
  ALLOWED_ORIGINS: string;
  GITHUB_OAUTH_SCOPE: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const state = crypto.randomUUID();

  const u = new URL("https://github.com/login/oauth/authorize");
  u.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  u.searchParams.set("redirect_uri", env.OAUTH_REDIRECT_URI);
  u.searchParams.set("scope", env.GITHUB_OAUTH_SCOPE || "repo");
  u.searchParams.set("state", state);

  const origin = request.headers.get("Origin") || "";
  return new Response(null, {
    status: 302,
    headers: {
      Location: u.toString(),
      "Set-Cookie": `oauth_state=${state}; Max-Age=600; Path=/; HttpOnly; SameSite=Lax; Secure`,
      Vary: "Origin",
      ...(allowOrigin(origin, env.ALLOWED_ORIGINS)
        ? {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
          }
        : {}),
    },
  });
};
