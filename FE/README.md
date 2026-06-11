# FE — フロントエンド

React (TypeScript) + Vite で構築されたフロントエンドです。Docker コンテナとして社内共用サーバーに nginx 経由でデプロイします。

## 機能概要

| 画面 | 説明 |
|------|------|
| QRスキャン画面 | カメラでQRを読み取り対象PCへ遷移 |
| PC一覧画面 | 全PC一覧表示・PC登録画面への導線 |
| PC登録・編集画面 | 新規PC登録 / 既存PC編集 |
| 借用書出力ダイアログ | 貸出時の借用書PDF生成・ダウンロード |
| QR生成ダイアログ | QRコード生成・ダウンロード |
| 変更履歴一覧画面 | PCデータの登録・更新履歴表示 |

## 技術スタック

- React 18 + TypeScript
- Vite
- React Router
- @react-pdf/renderer（借用書PDF出力）
- paulmillr-qr（QRスキャン）
- Google OAuth（認証）

## 動作環境
 
HTTPS 環境が必要です（カメラAPIの制約）。

## 必要なファイル

`.env` ファイルをプロジェクトルート（`FE/`）に作成してください。

```bash
cp .env.example .env
```

`.env.example`:

```env
VITE_GAS_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

`VITE_GAS_URL` には GAS バックエンドのデプロイURLを設定します（GAS/README.md 参照）。

## ローカル開発

```bash
cd FE
npm install
npm run dev
```

`http://localhost:5173` でアプリが起動します。

> **注意:** ローカル環境ではカメラAPIはHTTPSが必要なため、QRスキャンはそのまま動作しません。Chrome で `chrome://flags/#unsafely-treat-insecure-origin-as-secure` からlocalhost を許可するか、ngrok などでHTTPS化してください。

## ビルド

```bash
npm run build
```

`dist/` に静的ファイルが生成されます。

## 社内ネットワークへのデプロイ（Docker + nginx）

### 前提条件

- 共用サーバーに Docker がインストール済み
- サーバーへの SSH アクセスが可能
- ポート 443（HTTPS）・80（HTTP）が開放済み

### 手順

**1. .env.production ファイルの準備**

```bash
cp .env.example .env.production
# VITE_GAS_URL に GAS デプロイURLを設定
```

**2. 自己署名SSL証明書の生成**

サーバー上で実行するか、Dockerfile ビルド前に生成してください。

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx.key \
  -out nginx.crt \
  -subj "/CN=<サーバーのIPまたはホスト名>"
```

**3. Docker イメージのビルド**

```bash
docker build -t pc-lending-fe .
```

**4. コンテナの起動**

```bash
docker run -d \
  --name pc-lending-fe \
  -p 80:80 \
  -p 443:443 \
  -v $(pwd)/nginx.key:/etc/ssl/private/nginx.key:ro \
  -v $(pwd)/nginx.crt:/etc/ssl/certs/nginx.crt:ro \
  pc-lending-fe
```

**5. 動作確認**

ブラウザで `https://<サーバーIP>` にアクセスし、QRスキャン画面が表示されることを確認します。  
自己署名証明書のため、初回アクセス時にブラウザの警告が表示されますが、社内利用のため続行してください。

### コンテナの更新（再デプロイ）

```bash
docker stop pc-lending-fe
docker rm pc-lending-fe
docker build -t pc-lending-fe .
docker run -d --name pc-lending-fe -p 80:80 -p 443:443 \
  -v $(pwd)/nginx.key:/etc/ssl/private/nginx.key:ro \
  -v $(pwd)/nginx.crt:/etc/ssl/certs/nginx.crt:ro \
  pc-lending-fe
```

### Dockerfile 概要

```dockerfile
# ビルドステージ: Node.js でビルド
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 配信ステージ: nginx で静的ファイルを配信
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80 443
```

nginx はHTTPをHTTPSへリダイレクトし、React Router の SPA ルーティングに対応した設定（`try_files $uri /index.html`）が含まれています。

---

# FE — Frontend

React (TypeScript) + Vite frontend, deployed as a Docker container via nginx on the internal shared server.

## Feature Summary

| Screen | Description |
|--------|-------------|
| QR Scan | Scan a QR code with camera to navigate to the PC |
| PC List | View all PCs and navigate to the register screen |
| PC Register / Edit | Register new PCs or edit existing ones|
| Loan Form Dialog| Generate and download a borrowing slip PDF when lending |
| QR Generator Dialog | Generate and download PC QR code|
| History　List | View PC data registration and update history |

## Tech Stack

- React 18 + TypeScript
- Vite
- React Router
- @react-pdf/renderer (loan slip PDF)
- paulmillr-qr(QR scanning)
- Google OAuth (authentication)

## Browser Requirements

HTTPS connection is required (camera API restriction).

## Required Configuration

Create a `.env` file in the project root (`FE/`):

```bash
cp .env.example .env
```

`.env.example`:

```env
VITE_GAS_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

Set `VITE_GAS_URL` to your GAS backend deployment URL (see GAS/README.md).

## Local Development

```bash
cd FE
npm install
npm run dev
```

App runs at `http://localhost:5173`.

> **Note:** Camera API requires HTTPS. For local QR scanning, either enable the `chrome://flags/#unsafely-treat-insecure-origin-as-secure` flag for localhost, or use a tool like ngrok to serve over HTTPS.

## Build

```bash
npm run build
```

Static files are output to `dist/`.

## Deploying to Internal Network (Docker + nginx)

### Prerequisites

- Docker installed on the shared server
- SSH access to the server
- Ports 443 (HTTPS) and 80 (HTTP) open

### Steps

**1. Prepare the .env.production file**

```bash
cp .env.example .env.production
# Set VITE_GAS_URL to your GAS deployment URL
```

**2. Generate a self-signed SSL certificate**

Run on the server or before building the Docker image:

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx.key \
  -out nginx.crt \
  -subj "/CN=<server-IP-or-hostname>"
```

**3. Build the Docker image**

```bash
docker build -t pc-lending-fe .
```

**4. Start the container**

```bash
docker run -d \
  --name pc-lending-fe \
  -p 80:80 \
  -p 443:443 \
  -v $(pwd)/nginx.key:/etc/ssl/private/nginx.key:ro \
  -v $(pwd)/nginx.crt:/etc/ssl/certs/nginx.crt:ro \
  pc-lending-fe
```

**5. Verify**

Open `https://<server-IP>` in a browser. You should see the QR scan screen.  
A browser warning about the self-signed certificate is expected — proceed for internal use.

### Redeployment (update)

```bash
docker stop pc-lending-fe
docker rm pc-lending-fe
docker build -t pc-lending-fe .
docker run -d --name pc-lending-fe -p 80:80 -p 443:443 \
  -v $(pwd)/nginx.key:/etc/ssl/private/nginx.key:ro \
  -v $(pwd)/nginx.crt:/etc/ssl/certs/nginx.crt:ro \
  pc-lending-fe
```

### Dockerfile Overview

```dockerfile
# Build stage: compile with Node.js
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve stage: nginx serves static files
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80 443
```

nginx redirects HTTP to HTTPS and is configured for SPA routing (`try_files $uri /index.html`).