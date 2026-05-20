function updatePc(
  e: GoogleAppsScript.Events.DoGet | GoogleAppsScript.Events.DoPost,
  client: SheetClient
): GoogleAppsScript.Content.TextOutput {
  let params: Record<string, unknown>
  try {
    const body = JSON.parse((e as GoogleAppsScript.Events.DoPost).postData.contents)
    const { action: _action, ...rest } = body
    params = rest
  } catch {
    return errorResponse("不正なパラメーター")
  }

  const no = String(params["番号"] ?? "")
  if (!no) return errorResponse("不正なパラメーター")

  return withLock(() => {
    const rowIndex = client.findRowByno(no)
    if (rowIndex === -1) return errorResponse(`番号「${no}」のPCが見つかりません`)
    const currentRows = client.getAllRows("PC一覧", 3)
    const currentRow = currentRows.find((r) => String(r["番号"]) === no)

    const autoFields: Record<string, unknown> = {}

    if (
      currentRow &&
      params["現在使用者"] !== undefined &&
      currentRow["現在使用者"] !== params["現在使用者"]
    ) {
      autoFields["以前使用者"] = currentRow["現在使用者"]
    }
    if (params["現在使用者"] !== undefined) {
      const employees = client.getAllRows("社員名簿", 2)
      const emp = employees.find((em) => em["名前"] === params["現在使用者"])
      autoFields["在/退職"] = emp?.["区分"] ?? ""
    }
    const { action: _a, no: _n, ...sheetsUpdates } = {
      ...params,
      ...autoFields,
    } as Record<string, unknown> & { action?: unknown; no?: unknown }

    client.updateRow("PC一覧", rowIndex, sheetsUpdates)
    return successResponse(null)
  })
}