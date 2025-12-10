意th# mezzanine-auth (Cloudflare Pages Functions)

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
- (optional) GITHUB_OAUTH_SCOPE = repo | public_repo | "repo read:org" (組織のリポジトリの場合)

## デプロイ

- Pages Functions:
  ```bash
  wrangler pages deploy
  ```

## Decap CMS の設定

`public/admin/config.yml`

```yaml
backend:
  name: github
  repo: OWNER/REPO
  branch: main
  auth_endpoint: https://<your-pages-domain>/api/auth
publish_mode: editorial_workflow
media_folder: "public/images/uploads"
public_folder: "images/uploads"
```

## セキュリティ

- state を Cookie に保存し、callback で照合（CSRF 対策）

- CORS は ALLOWED_ORIGINS に設定したドメインのみ許可

- アクセストークンは保存しない / ログ出力しない

- GitHub リポジトリ側では main ブランチ保護を推奨
