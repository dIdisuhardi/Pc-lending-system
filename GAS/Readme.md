# GAS — バックエンド

Google Apps Script (TypeScript) で構築されたAPIバックエンドです。Google Sheets をデータストアとして使用し、PC情報の取得・更新・登録・ドロップダウン選択肢の提供を行います。

## 機能概要

| エンドポイント | 説明 |
|--------------|------|
| `getDropdowns` | 区分シートからドロップダウン選択肢を取得 |
| `getPcList` | PC一覧シートの全レコードを取得 |
| `getPcByNo` | 番号でPC情報を1件取得 |
| `getEmployees` | 社員名簿シートの全レコードを取得 |
| `updatePc` | PC情報を部分更新（排他制御あり） |
| `registerPc` | 新規PCをPC一覧に追加（排他制御あり） |
| `getHistory` | 履歴シートの全レコードをタイムスタンプ降順で取得 |

## 技術スタック

- Google Apps Script (TypeScript)
- clasp（ローカル開発・デプロイツール）
- LockService（排他制御）
- Google Sheets API（SpreadsheetApp）

## 必要なファイル

### `.clasp.json`

clasp がプロジェクトを識別するために必要です。`.clasp.json.example` をコピーして作成してください。

```bash
cp .clasp.json.example .clasp.json
```

`.clasp.json.example`:

```json
{
  "scriptId": "YOUR_GAS_SCRIPT_ID",
  "rootDir": "./dist"
}
```

`scriptId` は GAS プロジェクトの ID です。GAS コンソールの「プロジェクトの設定」から確認できます。

### スクリプトプロパティの設定（SHEET_ID）

`SHEET_ID` はコード内にハードコードせず、GAS コンソールの「スクリプトプロパティ」で管理します。

GAS コンソールで対象プロジェクトを開き、**プロジェクトの設定 → スクリプトプロパティ** から以下を追加してください。

| プロパティ名 | 値 |
|------------|---|
| `SHEET_ID` | `<Google SheetsのスプレッドシートID>` |

スプレッドシートIDはURLの `https://docs.google.com/spreadsheets/d/<ここがID>/edit` の部分です。

コード内では以下のように参照しています。

```typescript
const SHEET_ID = PropertiesService.getScriptProperties().getProperty("SHEET_ID")
```

## Google Sheets の構成要件

バックエンドは以下のシートが存在することを前提としています（シート名・列定義の変更不可）。

| シート名 | 用途 |
|---------|------|
| PC一覧 | PCマスタ情報 |
| 区分 | ドロップダウン選択肢 |
| 社員名簿 | 社員情報・在退職区分 |
| 履歴 | 操作ログ |

## ローカル開発環境の準備

**1. Node.js・clasp のインストール**

```bash
npm install -g @google/clasp
```

**2. Google アカウントでログイン**

```bash
clasp login
```

**3. 依存パッケージのインストール**

```bash
cd GAS
npm install
```

## デプロイ手順

### 初回デプロイ

**1. GAS プロジェクトの作成**

既存のプロジェクトを使う場合はスキップし、`.clasp.json` に `scriptId` を設定してください。  
新規作成する場合:

```bash
clasp create
```

実行後に生成される `.clasp.json` の `scriptId` を控えておきます。

**2. TypeScript のコンパイル**

```bash
npx tsc
```

`dist/` ディレクトリにコンパイル済みのJSファイルが生成されます。

**3. GAS へのプッシュ**

```bash
clasp push
```

**4. Webアプリとしてデプロイ**

GAS コンソール（`https://script.google.com`）を開き、対象プロジェクトで以下の設定でデプロイします。

| 設定項目 | 値 |
|---------|---|
| 実行ユーザー | 自分（スクリプトオーナー） |
| アクセス権限 | Googleアカウントを持つ全員 |

デプロイ後に表示される **ウェブアプリのURL** を控えてください。  
フロントエンドの `VITE_GAS_URL` に設定します。

### 更新デプロイ（コード変更時）

```bash
npx tsc
clasp push
```

GAS コンソールで「新しいデプロイ」または「デプロイを管理」から既存デプロイのバージョンを更新します。

> **注意:** `clasp push` だけではデプロイURLのエンドポイントは更新されません。必ずGASコンソールでデプロイの更新を行ってください。

## プロジェクト構成

```
GAS/
├── gas/
│   ├── Code.ts              # エントリーポイント（doGet / doPost）
│   ├── Router.ts            # actionによるハンドラーの振り分け
│   ├── handlers/
│   │   ├── getDropdowns.ts
│   │   ├── getPcList.ts
│   │   ├── getPcByNo.ts
│   │   ├── getEmployees.ts
│   │   ├── getHistory.ts
│   │   ├── updatePc.ts
│   │   └── registerPc.ts
│   ├── sheets/
│   │   └── SheetClient.ts   # SpreadsheetApp操作の抽象化
│   └── utils/
│       ├── response.ts      # 共通レスポンス生成
│       └── lock.ts          # LockServiceラッパー
├── tsconfig.json
├── package.json
├── .clasp.json.example      # clasp設定テンプレート
└── .claspignore
```

## トラブルシューティング

| 症状 | 対処 |
|------|------|
| `シート「PC一覧」が見つかりません` エラー | `SHEET_ID` が正しいか、シート名が一致しているか確認 |
| `他のユーザーが更新中です` エラー | 数秒待って再試行（LockService のタイムアウトは10秒） |
| `clasp push` 後も古い動作のまま | GASコンソールで新しいバージョンとしてデプロイを更新する |
| 認証エラー（401） | GASのアクセス権限設定が「Googleアカウントを持つ全員」になっているか確認 |

---

# GAS — Backend

Google Apps Script (TypeScript) backend that uses Google Sheets as a datastore. Provides API endpoints for reading and writing PC information, dropdowns, and employee data.

## Feature Summary

| Endpoint | Description |
|----------|-------------|
| `getDropdowns` | Fetch dropdown options from the classification sheet |
| `getPcList` | Fetch all records from the PC list sheet |
| `getPcByNo` | Fetch a single PC record by number |
| `getEmployees` | Fetch all records from the employee roster sheet |
| `updatePc` | Partially update a PC record (with exclusive lock) |
| `registerPc` | Add a new PC to the list (with exclusive lock) |
| `getHistory` | Fetch all records from the history sheet, sorted by timestamp descending |

## Tech Stack

- Google Apps Script (TypeScript)
- clasp (local development and deployment tool)
- LockService (concurrent write protection)
- Google Sheets API (SpreadsheetApp)

## Required Files

### `.clasp.json`

Required for clasp to identify the GAS project. Copy from the example:

```bash
cp .clasp.json.example .clasp.json
```

`.clasp.json.example`:

```json
{
  "scriptId": "YOUR_GAS_SCRIPT_ID",
  "rootDir": "./dist"
}
```

Find `scriptId` in the GAS console under Project Settings.

### Script Properties (SHEET_ID)

`SHEET_ID` is not hardcoded — it is managed via **Script Properties** in the GAS console.

Open the project in the GAS console, go to **Project Settings → Script Properties**, and add the following:

| Property | Value |
|----------|-------|
| `SHEET_ID` | `<your Google Sheets spreadsheet ID>` |

The spreadsheet ID is the segment in the URL: `https://docs.google.com/spreadsheets/d/<ID>/edit`.

In the code it is read as:

```typescript
const SHEET_ID = PropertiesService.getScriptProperties().getProperty("SHEET_ID")
```

## Google Sheets Requirements

The backend expects the following sheets to exist with exact names and column definitions (do not rename or restructure):

| Sheet Name | Purpose |
|-----------|---------|
| PC一覧 | PC master data |
| 区分 | Dropdown options |
| 社員名簿 | Employee data and status |
| 履歴 | Operation log |

## Local Development Setup

**1. Install Node.js and clasp**

```bash
npm install -g @google/clasp
```

**2. Log in with your Google account**

```bash
clasp login
```

**3. Install dependencies**

```bash
cd GAS
npm install
```

## Deployment

### Initial Deployment

**1. Create (or link) a GAS project**

To use an existing project, just set its `scriptId` in `.clasp.json`.  
To create a new one:

```bash
clasp create
```

Note the `scriptId` from the generated `.clasp.json`.

**2. Compile TypeScript**

```bash
npx tsc
```

Compiled JS files are output to `dist/`.

**3. Push to GAS**

```bash
clasp push
```

**4. Deploy as a Web App**

Open the GAS console at `https://script.google.com`, open the project, and deploy with these settings:

| Setting | Value |
|---------|-------|
| Execute as | Me (script owner) |
| Who has access | Anyone with a Google account |

Copy the **Web app URL** shown after deployment — set it as `VITE_GAS_URL` in the frontend `.env`.

### Updating the Deployment

```bash
npx tsc
clasp push
```

Then in the GAS console, go to **Deploy → Manage Deployments** and create a new version or update the existing deployment.

> **Note:** `clasp push` alone does not update the deployed endpoint URL. Always update the deployment version in the GAS console after pushing.

## Project Structure

```
GAS/
├── gas/
│   ├── Code.ts              # Entry point (doGet / doPost)
│   ├── Router.ts            # Routes by action to handler
│   ├── handlers/
│   │   ├── getDropdowns.ts
│   │   ├── getPcList.ts
│   │   ├── getPcByNo.ts
│   │   ├── getEmployees.ts
│   │   ├── getHistory.ts
│   │   ├── updatePc.ts
│   │   └── registerPc.ts
│   ├── sheets/
│   │   └── SheetClient.ts   # SpreadsheetApp abstraction
│   └── utils/
│       ├── response.ts      # Common response helpers
│       └── lock.ts          # LockService wrapper
├── tsconfig.json
├── package.json
├── .clasp.json.example      # clasp config template
└── .claspignore
```

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `シート「PC一覧」が見つかりません` error | Verify `SHEET_ID` is correct and sheet names match exactly |
| `他のユーザーが更新中です` error | Wait a few seconds and retry (LockService timeout is 10 seconds) |
| Old behavior after `clasp push` | Update the deployment version in the GAS console |
| Auth error (401) | Confirm GAS access is set to "Anyone with a Google account" |