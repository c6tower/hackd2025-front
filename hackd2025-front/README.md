# 🎨 アイロンビーズ図案提案アプリ

このWebアプリケーションは、ユーザーが指定したビーズの色数に応じて、作成可能なアイロンビーズ図案を複数提案し、選択した図案をモーダルで詳細表示するサービスです。

## ✨ 特徴

- **10色対応**: 赤、オレンジ、黄、緑、青、紫、黒、白、ピンク、茶
- **16×16グリッド**: 最大256マスの図案に対応
- **トリプル入力システム**: ステッパー、スライダー、数値入力で快適な操作
- **レスポンシブデザイン**: PC・タブレット・スマートフォン対応
- **リアルタイム図案提案**: 手持ちビーズで作れる図案を即座に表示

## 🚀 技術スタック

- **Frontend**: Next.js 15.3.4 (App Router)
- **Styling**: Tailwind CSS 4.0
- **Language**: TypeScript
- **Testing**: Jest + React Testing Library
- **Container**: Docker & Docker Compose

## 🛠 Getting Started

### 開発環境の起動

**Docker Compose を使用（推奨）:**

```bash
# 開発環境（ホットリロード対応）
docker-compose up dev --build

# 本番環境
docker-compose --profile prod up web --build
```

**ローカル環境で直接実行:**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

### アクセス方法

- **ローカル**: [http://localhost:3000](http://localhost:3000)
- **外部デバイス**: `http://[YOUR_IP_ADDRESS]:3000` (同一WiFiネットワーク内)

### 開発

`app/page.tsx` を編集することでページを変更できます。ファイルを保存すると自動的に更新されます。

## 📁 プロジェクト構造

```
src/
├── app/                # Next.js App Router
├── assets/             # 静的アセット（画像・アイコン）
├── components/         # UIコンポーネント
│   ├── module/         # 複合コンポーネント
│   ├── part/           # 基本コンポーネント
│   └── template/       # ページテンプレート
├── hooks/              # カスタムHooks
├── types/              # TypeScript型定義
└── lib/                # 共通ライブラリ
```

## 📚 詳細ドキュメント

- [`doc/design.md`](./doc/design.md) - 要件定義・API設計・データベース設計
- [`doc/ui.md`](./doc/ui.md) - UI設計・画面仕様

## 🧪 テスト

```bash
# テスト実行
npm run test

# ウォッチモード
npm run test:watch

# カバレッジ
npm run test:coverage
```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
