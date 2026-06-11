# PC貸出・返却管理システム

QRコードを活用したPC貸出・返却管理のウェブアプリケーションです。各PCに貼付したQRシールをブラウザでスキャンするだけで、貸出ステータスの確認・更新・借用書出力が行えます。

## プロジェクト概要

| 項目 | 内容 |
|------|------|
| フロントエンド | React (TypeScript) + Vite |
| バックエンド | Google Apps Script (TypeScript + clasp) |
| データ管理 | Google Sheets |
| 認証 | Google OAuth |
| デプロイ | Docker + nginx（社内共用サーバー） |

## リポジトリ構成

```
Pc-lending-system/
├── FE/          # Reactフロントエンド
└── GAS/         # Google Apps Script バックエンド
```

## 主な機能

- **QRスキャン** — ブラウザのカメラでQRコードを読み取り、対象PCの情報を即座に表示
- **借用書出力** — 貸出分類選択時にPDFの借用書を自動生成・ダウンロード（スキップ不可）
- **PC一覧・登録・編集** — 管理者向けのPC一覧表示・新規登録・QRコード印刷
- **Google認証** — 未認証ユーザーはいかなるPC情報にもアクセス不可

## 必要な事前準備

1. **Google Workspace** — OAuthクライアントの設定（管理者権限が必要な場合あり）
2. **Google Sheets** — PC一覧・区分・社員名簿シートを含むスプレッドシート
3. **共用サーバー** — Docker・nginx が使用可能な社内サーバー

## セットアップの流れ

```
1. GASバックエンドをデプロイしてデプロイURLを取得
        ↓
2. FEの .env に GAS URL を設定
        ↓
3. Dockerイメージをビルドして共用サーバーにデプロイ
```

詳細な手順は各ディレクトリの README を参照してください。

- [FE/README.md](./FE/README.md) — フロントエンドのセットアップ・デプロイ手順
- [GAS/README.md](./GAS/README.md) — バックエンドのセットアップ・デプロイ手順

## ライセンス

使用ライブラリはすべて MIT ライセンスに準拠しています。

---

# PC Lending & Return Management System

A QR code-based web application for managing PC lending and returns. Scan the QR sticker on any PC with a browser to instantly view, update, and record its status.

## Project Overview

| Item | Details |
|------|---------|
| Frontend | React (TypeScript) + Vite |
| Backend | Google Apps Script (TypeScript + clasp) |
| Data | Google Sheets |
| Auth | Google OAuth |
| Deployment | Docker + nginx (internal shared server) |

## Repository Structure

```
Pc-lending-system/
├── FE/          # React frontend
└── GAS/         # Google Apps Script backend
```

## Key Features

- **QR Scanning** — Scan a QR code with the browser camera to instantly pull up PC info
- **Loan Form PDF** — Automatically generates and downloads a borrowing slip when lending classification is selected (cannot be skipped)
- **PC List / Register / Edit** — Admin screens for managing PCs and printing QR codes
- **Google Auth** — Unauthenticated users cannot access any PC information

## Prerequisites

1. **Google Workspace** — OAuth client configuration (may require admin privileges)
2. **Google Sheets** — Spreadsheet containing PC list, classification, and employee roster sheets
3. **Internal Server** — A shared server with Docker and nginx available

## Setup Flow

```
1. Deploy GAS backend → obtain deploy URL
        ↓
2. Set GAS URL in FE .env file
        ↓
3. Build Docker image → deploy to internal server
```

For detailed instructions, see the README in each directory:

- [FE/README.md](./FE/README.md) — Frontend setup and deployment
- [GAS/README.md](./GAS/README.md) — Backend setup and deployment

## License

All dependencies use MIT-compatible open source licenses.