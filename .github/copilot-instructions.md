# GitHub Copilot Instructions

## 📋 プロジェクト詳細

このプロジェクトの詳細な仕様については、以下のドキュメントを参照してください：

- **要件定義**: `hackd2025-front/doc/design.md` - プロジェクトの概要、仕様、API設計、データベース設計
- **UI設計**: `hackd2025-front/doc/ui.md` - 画面設計、レイアウト、ユーザーインターフェース仕様

## 🎯 開発ガイドライン

### 実装ルール
- コードを修正するときはセットでテストとドキュメントも修正すること

### コーディング規約
- **TypeScript**: 型安全性を重視し、`any`型の使用を避ける
- **関数型プログラミング**: React Hooksを活用したモダンな書き方
- **コンポーネント設計**: 再利用可能で単一責任のコンポーネントを作成
- **命名規則**: ケバブケース（ファイル名）、PascalCase（コンポーネント名）、camelCase（変数・関数名）

### UI/UX原則
- **レスポンシブデザイン**: デスクトップ、タブレット、モバイル対応
- **アクセシビリティ**: ARIA属性、キーボードナビゲーション対応
- **直感的な操作**: ユーザーが迷わないシンプルなUI
- **視覚的フィードバック**: ボタンのホバー効果、選択状態の明示

## 🎨 デザインシステム（実装用）

### ビーズ色定義（10色）
```typescript
const BEAD_COLORS = {
  red: '#FF0000',
  orange: '#FFA500', 
  yellow: '#FFFF00',
  green: '#008000',
  blue: '#0000FF',
  purple: '#800080',
  black: '#000000',
  white: '#FFFFFF',
  pink: '#FFC0CB',
  brown: '#A52A2A'
} as const;

type BeadColor = keyof typeof BEAD_COLORS;
```

## 🔧 TypeScript型定義

### 基本型
```typescript
// ビーズ色定義（10色）
export const BEAD_COLORS = {
  red: '#FF0000',
  orange: '#FFA500', 
  yellow: '#FFFF00',
  green: '#008000',
  blue: '#0000FF',
  purple: '#800080',
  black: '#000000',
  white: '#FFFFFF',
  pink: '#FFC0CB',
  brown: '#A52A2A'
} as const;

export type BeadColor = keyof typeof BEAD_COLORS;

// ビーズ使用数の型
export type BeadCounts = {
  [K in BeadColor]: number;
}

// コンポーネントProps型
export interface BeadInputProps {
  color: BeadColor;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export interface PatternGridProps {
  pattern: string; // 256文字
  size?: 'small' | 'large'; // 選択画面 or モーダル
  interactive?: boolean;
}

// データ型
export interface PatternData {
  id: string;
  pattern: string; // 256文字の図案データ
  beadCounts: BeadCounts;
}

export interface PatternApiResponse {
  patterns: PatternData[];
  success: boolean;
  error?: string;
}

// 色名マッピング（表示用・API用・コード用）
export const BEAD_COLOR_NAMES: Record<BeadColor, string>; // 日本語表示名
export const BEAD_COLOR_EMOJIS: Record<BeadColor, string>; // 絵文字
export const BEAD_COLOR_API_NAMES: Record<BeadColor, string>; // API用色名
export const BEAD_COLOR_CODES: Record<BeadColor, string>; // 図案データ用1文字コード
```

## 📁 ディレクトリ構造

```
src/
├── app/                # Next.js App Router
│   ├── layout.tsx      # ルートレイアウト
│   ├── page.tsx        # ホーム画面（メイン画面）
│   ├── globals.css     # グローバルスタイル
│   └── api/            # API Routes
├── assets/             # 静的アセット（画像・アイコン）
│   ├── background.png  # 背景画像
│   ├── background2.png # 背景画像（代替）
│   ├── camera.png      # カメラアイコン
│   ├── home.png        # ホームアイコン 
│   ├── next.png        # 次へアイコン
│   ├── previous.png    # 戻るアイコン
│   ├── reset.png       # リセットアイコン
│   ├── step1.png       # ステップ1画像
│   └── step2.png       # ステップ2画像
├── components/         # 再利用可能コンポーネント
│   ├── module/         # 複合コンポーネント
│   │   ├── PatternDetailModal/  # 図案詳細モーダル
│   │   ├── PatternGrid/         # 図案グリッド表示
│   │   └── PatternPreview/      # 図案プレビュー
│   ├── part/           # 基本コンポーネント
│   │   ├── BeadInput/  # ビーズ入力コンポーネント
│   │   ├── Button/     # ボタンコンポーネント
│   │   └── Loading/    # ローディングコンポーネント
│   └── template/       # ページテンプレート
│       ├── bead-input/ # ビーズ入力画面
│       └── pattern-view/ #図案選択画面
├── hooks/              # カスタムHooks
├── types/              # TypeScript型定義
├── utils/              # ユーティリティ関数
└── lib/                # 設定・初期化関数
```

## 🧪 テスト方針

- **単体テスト**: Jest + React Testing Library
- **E2Eテスト**: Playwright (必要に応じて)
- **視覚回帰テスト**: Storybook + Chromatic (推奨)

## 🚀 パフォーマンス考慮事項

- **メモ化**: React.memo, useMemo, useCallbackの適切な使用
- **遅延読み込み**: Next.js dynamic importの活用
- **画像最適化**: Next.js Image コンポーネントの使用
- **バンドルサイズ**: 不要なライブラリの削除、Tree shaking

## 💡 開発時の注意点

1. **ビーズ色の一貫性**: デザインシステムで定義された色を必ず使用
2. **入力値の検証**: 0-256の範囲チェック、整数値のみ受付
3. **エラーハンドリング**: APIエラー、ネットワークエラーの適切な処理
4. **ローディング状態**: ユーザーにフィードバックを提供
5. **モバイル対応**: タッチ操作の最適化、画面サイズ対応

## 🔧 推奨ライブラリ

- **状態管理**: React Context API または Zustand
- **フォーム**: React Hook Form
- **アニメーション**: Framer Motion
- **アイコン**: Lucide React
- **日付**: date-fns
- **HTTP**: axios または fetch API

このプロジェクトの目標は、直感的で使いやすいアイロンビーズ図案提案アプリを作成することです。ユーザーエクスペリエンスを最優先に、シンプルで美しいUIを心がけてください。
