// functions/api/auth/callback.ts
import { allowOrigin } from "../../../src/utils/cors";

interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  OAUTH_REDIRECT_URI: string;
  ALLOWED_ORIGINS?: string;
}

export const onRequestOptions: PagesFunction<Env> = async ({ request, env }) => {
  const origin = request.headers.get("Origin") || "";
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };

  if (allowOrigin(origin, env.ALLOWED_ORIGINS)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Credentials"] = "true";
  }

  return new Response(null, {
    status: 204,
    headers,
  });
};

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const origin = request.headers.get("Origin") || "";

  // CORSヘッダ（全レスポンス共通で付ける）
  const baseHeaders: Record<string, string> = {
    "Content-Type": "text/html; charset=utf-8",
  };

  if (allowOrigin(origin, env.ALLOWED_ORIGINS)) {
    baseHeaders["Access-Control-Allow-Origin"] = origin;
    baseHeaders["Access-Control-Allow-Credentials"] = "true";
  }

  // HTMLを返して postMessage → window.close() するユーティリティ
  const page = (msg: string) => {
    return new Response(
      `<!doctype html><meta charset="utf-8">
      <script>
        try {
          if (window.opener) {
            window.opener.postMessage(${JSON.stringify(msg)}, "*");
          }
        } catch (e) {}
        // ほんの少し遅延して閉じるとデバッグしやすい（任意）
        setTimeout(() => window.close(), 50);
      </script>`,
      { headers: baseHeaders },
    );
  };

  // state 検証（CSRF対策）
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const cookieHeader = request.headers.get("Cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((v) => {
      const [k, ...rest] = v.trim().split("=");
      return [k, rest.join("=")];
    }),
  );

  if (!code || !state || cookies["oauth_state"] !== state) {
    return page(
      `authorization:github:error:${JSON.stringify({
        message: "invalid_state",
      })}`,
    );
  }

  // トークン交換
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json" },
    body: new URLSearchParams({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: env.OAUTH_REDIRECT_URI,
    }),
  });

  const tokenJson = (await tokenRes.json()) as {
    access_token?: string;
    error?: string;
  };
  if (!tokenJson.access_token) {
    return page(
      `authorization:github:error:${JSON.stringify({
        message: "token_error",
        detail: tokenJson,
      })}`,
    );
  }

  // 成功：親ウィンドウに渡して閉じる
  const payload = { token: tokenJson.access_token };
  return page(`authorization:github:success:${JSON.stringify(payload)}`);
};
