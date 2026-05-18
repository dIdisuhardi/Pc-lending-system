// GAS Webアプリのエントリーポイント
// doGet・doPostの両メソッドをRouterに委譲する
//
// デプロイ設定:
//   実行ユーザー: 自分（スクリプトオーナー）
//   アクセス権限: Googleアカウントを持つ全員
//   レスポンス形式: JSON（ContentService.MimeType.JSON）

const SHEET_ID = PropertiesService.getScriptProperties().getProperty("SHEET_ID") ?? ""

function doGet(e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.Content.TextOutput {
  return Router.handle(e, SHEET_ID)
}

function doPost(e: GoogleAppsScript.Events.DoPost): GoogleAppsScript.Content.TextOutput {
  return Router.handle(e, SHEET_ID)
}