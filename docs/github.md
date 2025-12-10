# GitHub OAuth アプリケーション設定ガイド

このガイドでは、mezzanine-auth を使用するために必要な GitHub OAuth アプリケーションの設定手順を説明します。

## 前提条件

- GitHub アカウントを持っていること
- 管理者権限のある GitHub アカウントであること

## 手順

### 1. GitHub OAuth アプリケーションの作成

1. **GitHub にログイン**して、右上のプロフィールアイコンをクリックします
2. **Settings**を選択します
3. 左サイドバーの**Developer settings**をクリックします
4. **OAuth Apps**を選択します
5. **New OAuth App**ボタンをクリックします

### 2. アプリケーション情報の入力

以下の情報を入力してください：

| 項目                           | 説明                               | 例                                             |
| ------------------------------ | ---------------------------------- | ---------------------------------------------- |
| **Application name**           | アプリケーションの名前             | `mezzanine-auth`                               |
| **Homepage URL**               | アプリケーションのホームページ URL | `https://your-app.pages.dev`                   |
| **Application description**    | アプリケーションの説明（任意）     | `OAuth認証システム`                            |
| **Authorization callback URL** | コールバック URL                   | `https://your-app.pages.dev/api/auth/callback` |

### 3. アプリケーションの登録

**Register application**ボタンをクリックして、OAuth アプリケーションを登録します。

### 4. クライアント ID とシークレットの取得

登録が完了すると、以下の情報が表示されます：

- **Client ID**: 公開可能な識別子
- **Client Secret**: 機密情報（絶対に公開しないでください）

### 5. 環境変数の設定

取得した情報を Cloudflare Pages の環境変数に設定します：

```bash
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
```

## 重要な設定項目

### Authorization callback URL

コールバック URL は、GitHub が認証完了後にユーザーをリダイレクトする URL です。
以下の形式で設定してください：

```
https://your-domain.pages.dev/api/auth/callback
```

**注意**:

- プロトコル（https://）を含めてください
- ドメイン名は実際の Cloudflare Pages のドメインに合わせてください
- パスは`/api/auth/callback`で固定です

### OAuth Scopes

デフォルトでは`repo`スコープが設定されています。必要に応じて以下のスコープを追加できます：

- `repo`: プライベートリポジトリへのアクセス
- `user`: ユーザー情報の読み取り
- `read:org`: 組織情報の読み取り（組織のリポジトリにアクセスする場合に推奨）

**組織のリポジトリを使用する場合**:
- `GITHUB_OAUTH_SCOPE=repo read:org` のように複数のスコープをスペース区切りで指定できます

## セキュリティのベストプラクティス

1. **Client Secret の保護**

   - Client Secret を絶対に公開リポジトリにコミットしないでください
   - 環境変数として安全に管理してください

2. **HTTPS の使用**

   - 本番環境では必ず HTTPS を使用してください
   - Cloudflare Pages は自動的に HTTPS を提供します

3. **許可されたオリジンの制限**
   - `ALLOWED_ORIGINS`環境変数で許可されたドメインのみを指定してください

## トラブルシューティング

### よくある問題

**問題**: "redirect_uri_mismatch"エラーが発生する
**解決策**: Authorization callback URL が正確に一致しているか確認してください

**問題**: "invalid_client"エラーが発生する
**解決策**: Client ID と Client Secret が正しく設定されているか確認してください

**問題**: CORS エラーが発生する
**解決策**: `ALLOWED_ORIGINS`環境変数にフロントエンドのドメインが含まれているか確認してください

**問題**: "repo not found" または "epo ... not found" エラーが発生する（組織のリポジトリの場合）
**解決策**: 

1. **承認リクエストを生成する**:
   - Decap CMSから「Login with GitHub」をクリックしてログインを試みる
   - GitHubの認証画面で組織へのアクセス許可を求める画面が表示されたら、「Authorize [組織名]」をクリック
   - これにより組織の設定ページに承認リクエストが表示されます

2. **組織のOAuthアプリ承認**:
   - 組織の管理者が組織の設定ページ（`https://github.com/organizations/[組織名]/settings/oauth_application_policy`）にアクセス
   - 「Pending requests」セクションに承認待ちのリクエストが表示されるので、**Grant**（承認）をクリック
   - 組織の管理者権限が必要です

3. **OAuthスコープの確認**:
   - Cloudflare Pagesの環境変数で `GITHUB_OAUTH_SCOPE=repo read:org` を設定
   - `read:org`スコープが組織のリポジトリへのアクセスに必要です
   - 環境変数を更新した後、Cloudflare Pagesを再デプロイしてください

4. **リポジトリ名の確認**:
   - Decap CMSの設定ファイル（`public/admin/config.yml`）で `repo: OWNER/REPO` の形式が正しいか確認
   - 例: `repo: sankei-o-seisaku-kikaku/snk-wb`

5. **再認証**:
   - OAuthアプリを承認した後、Decap CMSから一度ログアウトして再度ログインしてください
   - ブラウザのキャッシュをクリアしてから再試行することも有効です

## 組織のリポジトリを使用する場合の追加手順

組織のリポジトリでDecap CMSを使用する場合は、以下の手順が必要です：

### 1. OAuthアプリの承認リクエストを生成する

組織の設定ページにOAuthアプリが表示されない場合は、まず承認リクエストを生成する必要があります：

1. **Decap CMSからログインを試みる**:
   - Decap CMSの「Login with GitHub」ボタンをクリック
   - GitHubの認証画面で、組織へのアクセス許可を求める画面が表示される場合があります
   - 「Authorize [組織名]」をクリックして承認リクエストを送信

2. **承認リクエストの確認**:
   - 組織の設定ページ（`https://github.com/organizations/[組織名]/settings/oauth_application_policy`）にアクセス
   - 「Pending requests」セクションに承認待ちのリクエストが表示されるはずです
   - 組織の管理者がこのリクエストを承認する必要があります

### 2. OAuthアプリを事前承認する（管理者向け）

組織の管理者は、以下の手順でOAuthアプリを事前承認できます：

1. **個人アカウントでOAuthアプリを確認**:
   - GitHubにログインして、**Settings** → **Developer settings** → **OAuth Apps** にアクセス
   - 使用しているOAuthアプリケーションの**Client ID**を確認

2. **組織の設定でアプリを検索**:
   - 組織の設定ページ（`https://github.com/organizations/[組織名]/settings/oauth_application_policy`）にアクセス
   - ページ下部の「Authorized applications」セクションを確認
   - または、検索ボックスでOAuthアプリの名前やClient IDで検索

3. **アプリが見つからない場合**:
   - 組織のメンバーがDecap CMSからログインを試みると、承認リクエストが生成されます
   - 「Pending requests」セクションでリクエストを確認し、**Grant**（承認）をクリック

**注意**: 
- 組織の管理者権限が必要です
- 「Access restricted」ポリシーの場合、すべてのOAuthアプリは明示的な承認が必要です
- `mezzanine-dev`が所有するアプリは自動的にアクセス可能と表示されていますが、個人アカウントで作成したOAuthアプリは承認が必要です

### 2. 環境変数の設定

Cloudflare Pagesの環境変数に以下を設定します：

```bash
GITHUB_OAUTH_SCOPE=repo read:org
```

これにより、組織のリポジトリへのアクセスが可能になります。

## 次のステップ

GitHub OAuth アプリケーションの設定が完了したら、[Cloudflare 設定ガイド](./cloudflare.md)に進んでください。
