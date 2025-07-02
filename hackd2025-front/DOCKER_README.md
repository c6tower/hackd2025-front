# hackd2025-front Docker Setup

このプロジェクトはDocker Composeを使用してNext.jsアプリケーションを実行できます。

## 使用方法

### 本番環境での実行
```bash
# アプリケーションをビルドして実行
docker-compose up web

# バックグラウンドで実行
docker-compose up -d web
```

### 開発環境での実行
```bash
# 開発モードで実行（ホットリロード有効）
docker-compose --profile dev up dev

# バックグラウンドで実行
docker-compose --profile dev up -d dev
```

### その他のコマンド

```bash
# コンテナを停止
docker-compose down

# イメージを再ビルド
docker-compose build

# ログを確認
docker-compose logs web
# または
docker-compose logs dev

# コンテナ内でコマンドを実行
docker-compose exec web sh
```

## アクセス方法

- **本番環境**: http://localhost:3000
- **開発環境**: http://localhost:3001

## ファイル構成

- `Dockerfile`: 本番用のマルチステージビルドDockerfile
- `Dockerfile.dev`: 開発用のシンプルなDockerfile
- `docker-compose.yml`: Docker Composeの設定ファイル
- `.dockerignore`: Dockerビルドから除外するファイルのリスト

## 注意事項

- 本番環境では`output: 'standalone'`を使用して最適化されたビルドを作成
- 開発環境ではホットリロードが有効
- セキュリティのため、本番環境では非rootユーザーで実行
