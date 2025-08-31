import { allowOrigin } from "../../../src/utils/cors";
import type { Env } from "../auth";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const cookie = Object.fromEntries(
    (request.headers.get("Cookie") || "")
      .split(";")
      .map((v) => v.trim().split("="))
      .filter(([k]) => k),
  );

  if (!code || !state || cookie["oauth_state"] !== state) {
    return json({ error: "invalid_state" }, 400, request, env);
  }

  const r = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json" },
    body: new URLSearchParams({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: env.OAUTH_REDIRECT_URI,
    }),
  });
  const data: any = await r.json();
  if (!data.access_token) {
    return json({ error: "token_error", detail: data }, 400, request, env);
  }

  return json({ token: data.access_token }, 200, request, env);
};

function json(body: unknown, status: number, request: Request, env: any) {
  const origin = request.headers.get("Origin") || "";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
  if (allowOrigin(origin, env.ALLOWED_ORIGINS)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return new Response(JSON.stringify(body), { status, headers });
}
