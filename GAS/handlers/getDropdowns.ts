function getDropdowns(
    _e: GoogleAppsScript.Events.DoGet | GoogleAppsScript.Events.DoPost,
    client: SheetClient
): GoogleAppsScript.Content.TextOutput {
    const rows = client.getAllRows("区分", 2)

    const pluck = (key: string): string[] =>
        rows
            .map((r) => String(r[key] ?? ""))
            .filter((v) => v !== "" && v !== "null" && v !== "undefined")

    const data = {
        状況: pluck("状況"),
        分類: pluck("分類"),
        用途: pluck("用途"),
        区分: pluck("区分"),
        場所: pluck("場所"),
    }

    return successResponse(data)
}