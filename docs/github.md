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
- `read:org`: 組織情報の読み取り

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

## 次のステップ

GitHub OAuth アプリケーションの設定が完了したら、[Cloudflare 設定ガイド](./cloudflare.md)に進んでください。
