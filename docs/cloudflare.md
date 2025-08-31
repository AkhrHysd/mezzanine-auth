# Cloudflare Pages 設定ガイド

このガイドでは、mezzanine-auth を Cloudflare Pages にデプロイするための設定手順を説明します。

## 前提条件

- Cloudflare アカウントを持っていること
- GitHub リポジトリが準備されていること
- [GitHub OAuth 設定](./github.md)が完了していること

## 手順

### 1. Cloudflare Pages プロジェクトの作成

1. **Cloudflare ダッシュボード**にログインします
2. 左サイドバーの**Pages**をクリックします
3. **Create a project**ボタンをクリックします
4. **Connect to Git**を選択します

### 2. GitHub リポジトリの接続

1. **GitHub**を選択します
2. 認証を許可します
3. `mezzanine-auth`リポジトリを選択します
4. **Begin setup**をクリックします

### 3. ビルド設定

以下の設定を行います：

| 項目                       | 値               | 説明                         |
| -------------------------- | ---------------- | ---------------------------- |
| **Project name**           | `mezzanine-auth` | プロジェクト名（任意）       |
| **Production branch**      | `main`           | 本番ブランチ                 |
| **Framework preset**       | `None`           | フレームワークプリセットなし |
| **Build command**          | 空欄             | ビルドコマンドは不要         |
| **Build output directory** | 空欄             | ビルド出力ディレクトリは不要 |
| **Root directory**         | 空欄             | ルートディレクトリ           |

### 4. 環境変数の設定

**Environment variables**セクションで以下の環境変数を設定します：

#### 必須環境変数

```bash
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
OAUTH_REDIRECT_URI=https://your-project.pages.dev/api/auth/callback
ALLOWED_ORIGINS=https://your-project.pages.dev
```

#### オプション環境変数

```bash
GITHUB_OAUTH_SCOPE=repo
```

**注意**:

- `GITHUB_CLIENT_ID`と`GITHUB_CLIENT_SECRET`は[GitHub 設定](./github.md)で取得した値を使用
- `OAUTH_REDIRECT_URI`は実際の Cloudflare Pages ドメインに合わせて設定
- `ALLOWED_ORIGINS`にはフロントエンドのドメインを設定

### 5. プロジェクトの作成

**Save and Deploy**をクリックしてプロジェクトを作成し、初回デプロイを開始します。

## デプロイ後の確認

### 1. デプロイ状況の確認

- **Deployments**タブでデプロイ状況を確認
- 緑のチェックマークが表示されれば成功

### 2. 動作確認

以下のエンドポイントが正常に動作するか確認してください：

- **認証開始**: `https://your-project.pages.dev/api/auth`
- **コールバック**: `https://your-project.pages.dev/api/auth/callback`

### 3. ログの確認

問題が発生した場合は、**Functions**タブでログを確認できます。

## カスタムドメインの設定（オプション）

### 1. カスタムドメインの追加

1. **Custom domains**タブをクリックします
2. **Set up a custom domain**をクリックします
3. ドメイン名を入力します

### 2. DNS 設定の確認

Cloudflare が自動的に DNS レコードを作成します。必要に応じて手動で調整してください。

## 環境変数の管理

### 本番環境とプレビュー環境

- **Production**: 本番環境用の環境変数
- **Preview**: プレビュー環境用の環境変数（プルリクエスト時）

### 環境変数の更新

1. **Settings**タブをクリックします
2. **Environment variables**セクションで編集
3. 変更後、再デプロイが必要です

## セキュリティ設定

### 1. 環境変数の保護

- 機密情報（Client Secret 等）は絶対に公開しないでください
- 環境変数として安全に管理してください

### 2. CORS 設定

`ALLOWED_ORIGINS`で許可されたドメインのみからのリクエストを許可します：

```bash
# 単一ドメイン
ALLOWED_ORIGINS=https://example.com

# 複数ドメイン（カンマ区切り）
ALLOWED_ORIGINS=https://example.com,https://app.example.com

# サブドメイン（ワイルドカード）
ALLOWED_ORIGINS=https://*.example.com
```

## トラブルシューティング

### よくある問題

**問題**: デプロイが失敗する
**解決策**:

- 環境変数が正しく設定されているか確認
- GitHub リポジトリの接続状況を確認

**問題**: OAuth 認証が動作しない
**解決策**:

- `OAUTH_REDIRECT_URI`が GitHub 設定と一致しているか確認
- 環境変数が正しく設定されているか確認

**問題**: CORS エラーが発生する
**解決策**:

- `ALLOWED_ORIGINS`にフロントエンドのドメインが含まれているか確認
- プロトコル（https://）が正しく設定されているか確認

## パフォーマンス最適化

### 1. エッジ関数の活用

Cloudflare Pages Functions はエッジで実行されるため、高速なレスポンスを提供します。

### 2. キャッシュ設定

必要に応じて、Cloudflare のキャッシュ設定を調整してください。

## 監視とログ

### 1. アクセスログ

- **Analytics**タブでアクセス統計を確認
- **Functions**タブで関数の実行ログを確認

### 2. エラー監視

エラーが発生した場合は、Cloudflare ダッシュボードで詳細を確認できます。

## 次のステップ

Cloudflare Pages の設定が完了したら、フロントエンドアプリケーションから OAuth 認証を使用できます。

### 使用例

```javascript
// 認証開始
window.location.href = "https://your-project.pages.dev/api/auth";

// コールバック処理（フロントエンドで実装）
// URLパラメータからトークンを取得して使用
```

## サポート

問題が発生した場合は、以下を確認してください：

1. Cloudflare Pages のドキュメント
2. GitHub OAuth 設定の確認
3. 環境変数の設定状況
4. ブラウザの開発者ツールでのエラーログ
