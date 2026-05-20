const SHEET_ID = PropertiesService.getScriptProperties().getProperty("SHEET_ID") ?? ""

function doGet(e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.Content.TextOutput {
  return Router.handle(e, SHEET_ID)
}

function doPost(e: GoogleAppsScript.Events.DoPost): GoogleAppsScript.Content.TextOutput {
  return Router.handle(e, SHEET_ID)
}