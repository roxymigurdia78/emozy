# emozy / emozy_backend 統合README

`emozy` は、SNS疲れを軽減することを目的にした「感情でつながるSNS」です。  
感情起点の共感を重視し、安心して使える体験を目指します。

参考: https://protopedia.net/prototype/7966

## リポジトリ構成

```text
.
├── emozy/           # フロントエンド (Next.js + TypeScript)
└── emozy_backend/   # バックエンド (Rails API + FastAPI + PostgreSQL)
```

## システム概要

- フロントエンド: `emozy`（Next.js App Router）
- バックエンドAPI: `emozy_backend/rails`（Ruby on Rails, JSON API）
- AI通報判定API: `emozy_backend/python`（FastAPI）
- DB: PostgreSQL（`docker-compose.yml` で `postgres:16`）

フロントは `http://localhost:3000`、Rails APIは `http://localhost:3333`、FastAPIは `http://localhost:8000` で動作します。

## 主な機能

- 認証/初期設定
- サインアップ、サインイン
- プロフィール作成（名前・自己紹介）
- 投稿
- テキスト/画像投稿
- 感情リアクション（複数候補）を付与して投稿
- 投稿前に通報対象判定APIを呼び出し
- タイムライン/交流
- ホームフィード表示
- リアクション送信
- お気に入り登録/解除
- 検索（キーワード + 感情）
- ランキング
- アイコンメーカー
- パーツ選択
- アイコン生成・保存
- 背景/フレームの取得（ポイント連携）

## セットアップ

### 1. バックエンド起動（Docker）

作業ディレクトリを `emozy_backend` に移動して実行します。

```bash
cd emozy_backend
docker compose build
docker compose up -d
```

停止:

```bash
docker compose down
```

### 2. フロントエンド起動

別ターミナルで `emozy` を起動します。

```bash
cd emozy
npm install
npm run dev
```

### 3. サインアップページにアクセス

```
http://localhost:3000/signup
```

## AI通報判定API（FastAPI）

`docker-compose.yml` の環境変数で、LLM接続先（`LLM_BASE_URL` など）を設定します。

LM Studioでサーバーを立てる必要があります。

## 使用技術

- Frontend: Next.js 15, React 19, TypeScript
- Backend: Ruby on Rails 7.2, FastAPI, Python
- Database: PostgreSQL 16
- Infra/Dev: Docker, Docker Compose

## 関連リンク

- ProtoPedia: https://protopedia.net/prototype/7966
- Frontend Repo: https://github.com/roxymigurdia78/emozy
- Backend Repo: https://github.com/k0suke618/emozy_backend
