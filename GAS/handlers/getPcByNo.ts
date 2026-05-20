function getPcByNo(
    e: GoogleAppsScript.Events.DoGet | GoogleAppsScript.Events.DoPost,
    client: SheetClient
): GoogleAppsScript.Content.TextOutput {
    const no = (e as GoogleAppsScript.Events.DoGet).parameter?.no
    if (!no) return errorResponse("不正なパラメーター")

    const rows = client.getAllRows("PC一覧", 3)
    const pc = rows.find((r) => String(r["番号"]) === String(no)) ?? null

    return successResponse(pc)
}