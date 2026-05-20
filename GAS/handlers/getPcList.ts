function getPcList(
  _e: GoogleAppsScript.Events.DoGet | GoogleAppsScript.Events.DoPost,
  client: SheetClient
): GoogleAppsScript.Content.TextOutput {
  const rows = client.getAllRows("PC一覧", 3)
  return successResponse(rows)
}