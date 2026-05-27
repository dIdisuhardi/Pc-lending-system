function getHistory(
    _e: GoogleAppsScript.Events.DoGet | GoogleAppsScript.Events.DoPost,
    client: SheetClient
): GoogleAppsScript.Content.TextOutput {
    const rows = client.getAllRows("履歴", 2)
    rows.sort((a, b) =>
        String(b["タイムスタンプ"]).localeCompare(String(a["タイムスタンプ"]))
    )

    return successResponse(rows)
}