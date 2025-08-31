# mezzanine-auth ドキュメント

このディレクトリには、mezzanine-auth の設定と使用方法に関するドキュメントが含まれています。

## 📚 利用可能なドキュメント

### 🚀 セットアップガイド

- **[GitHub 設定ガイド](./github.md)** - GitHub OAuth アプリケーションの設定手順
- **[Cloudflare 設定ガイド](./cloudflare.md)** - Cloudflare Pages へのデプロイ手順

## 🎯 概要

mezzanine-auth は、Cloudflare Pages Functions を使用した GitHub OAuth 認証システムです。

### 主な機能

- 🔐 GitHub OAuth 認証
- 🛡️ CSRF 保護
- 🌐 CORS 制御
- ⚡ エッジ関数による高速レスポンス
- 🔒 セキュアなトークン管理

### アーキテクチャ

```
フロントエンド → /api/auth → GitHub認証 → /api/auth/callback → アクセストークン
```

## 📋 セットアップの流れ

1. **GitHub OAuth 設定** - [github.md](./github.md)を参照
2. **Cloudflare Pages 設定** - [cloudflare.md](./cloudflare.md)を参照
3. **環境変数の設定**
4. **デプロイとテスト**

## 🔧 必要な環境変数

| 変数名                 | 説明                                  | 必須 |
| ---------------------- | ------------------------------------- | ---- |
| `GITHUB_CLIENT_ID`     | GitHub OAuth クライアント ID          | ✅   |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth クライアントシークレット | ✅   |
| `OAUTH_REDIRECT_URI`   | OAuth コールバック URL                | ✅   |
| `ALLOWED_ORIGINS`      | 許可されたオリジン                    | ✅   |
| `GITHUB_OAUTH_SCOPE`   | OAuth スコープ                        | ❌   |

## 🚨 セキュリティ注意事項

- Client Secret は絶対に公開しないでください
- 許可されたオリジンのみを設定してください
- HTTPS を使用してください
- 環境変数は安全に管理してください

## 📖 詳細ドキュメント

各設定ガイドの詳細については、対応する Markdown ファイルを参照してください。

## 🆘 サポート

問題が発生した場合は、以下を確認してください：

1. 環境変数の設定状況
2. GitHub OAuth 設定との整合性
3. Cloudflare Pages のログ
4. ブラウザの開発者ツール

## 🔗 関連リンク

- [GitHub OAuth Apps](https://github.com/settings/developers)
- [Cloudflare Pages](https://pages.cloudflare.com/)
- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/platform/functions/)
