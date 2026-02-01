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
- (optional) GITHUB_OAUTH_SCOPE = repo | public_repo | "repo read:org" (組織のリポジトリの場合)

## 組織のリポジトリを使う場合

**組織（Organization）のリポジトリ**（パブリック・プライベート問わず）で Decap CMS を使う場合、**組織アカウント側で OAuth アプリの許可**が必要になります。

### 流れ

1. **環境変数**  
   Cloudflare で `GITHUB_OAUTH_SCOPE=repo read:org` を設定し、再デプロイする。

2. **承認リクエストを出す**  
   Decap CMS の「Login with GitHub」で一度ログインを試す。  
   GitHub の認可画面で組織へのアクセス許可を求める画面が出たら「Authorize [組織名]」をクリックする。

3. **組織で OAuth アプリを許可**  
   **組織の管理者**が GitHub で以下を開く:  
   `https://github.com/organizations/<組織名>/settings/oauth_application_policy`  
   - 「Pending requests」に表示された OAuth アプリを **Grant**（許可）する。  
   - 組織の「Third-party application access policy」が Restricted のときは、この承認がないと組織のリポジトリにアクセスできない。

4. **再ログイン**  
   承認後、Decap CMS から再度「Login with GitHub」でログインする。

個人のリポジトリの場合は、組織側の許可は不要です。

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
