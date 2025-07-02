- FE -> BE にビーズの個数を送れる IF が必要
- アウトプットは画像 or ラズパイ用データ？
- 個数選択をバーで選べるといいよね
- 図案データは 0~9 の数値
- 検索するときは 0 が 0個、 1 が 2個 みたいにできれば簡単そう
- docker compose で起動できるようにする
- カメラ画面、ビーズ数選択画面、図案選択画面、図案表示画面
- ビーズの個数を送って、図案を返す API
- 修正するときはテストの追加と、docの更新を忘れずに

- 白: w
- 黒: d(dark)
- ピンク: p
- 赤: r
- オレンジ: o
- 黄: y
- 緑: g
- 青: b
- 紫: v
- 茶色: m(maron)
- null: n


app dir 配下はそのままでOKです。
components 配下は修正したいです。

- components
  - template
    - bead-input
      - index.tsx
      - index.test.tsx
    - pattern-view
      - index.tsx
      - index.test.tsx
  - module
    - PatternPreview
      - index.tsx
      - index.test.tsx
    - PatternDetailModal
      - index.tsx
      - index.test.tsx
    - PatternGrid
      - index.tsx
      - index.test.tsx
  - part
    - Button
      - index.tsx
      - index.test.tsx
    - Loading
      - index.tsx
      - index.test.tsx
