# mezzanine-auth (Cloudflare Pages Functions)

Decap CMS の `auth_endpoint` として使う GitHub OAuth 中継（token 発行）です。

## 開発環境

- Bun (>= 1.1)
- Cloudflare Wrangler CLI

### 初期化

```bash
bun install
```

## 必要な環境変数（Cloudflare Secrets）

- GITHUB_CLIENT_ID
- GITHUB_CLIENT_SECRET
- OAUTH_REDIRECT_URI (例: https://<your-pages-domain>/api/auth/callback)
- ALLOWED_ORIGINS (例: https://client-a.com,https://*.mezzanine.app)
- (optional) GITHUB_OAUTH_SCOPE = repo | public_repo

## デプロイ

- Pages Functions:
  ```bash
  wrangler pages deploy
  ```
