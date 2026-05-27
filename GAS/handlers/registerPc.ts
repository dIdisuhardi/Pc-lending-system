function registerPc(
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
  const editor = String(params["editor"] ?? "")
  delete params["editor"]
  delete params["editType"]

  return withLock(() => {
    const existing = client.findRowByno(no)
    if (existing !== -1) return errorResponse("この番号はすでに登録済み")
    const allRows = client.getAllRows("PC一覧", 3)
    const maxNo = allRows.reduce((max, row) => {
      const val = parseInt(String(row["No."] ?? "0"), 10)
      return isNaN(val) ? max : Math.max(max, val)
    }, 0)
    params["No."] = maxNo + 1
    if (params["現在使用者"]) {
      const employees = client.getAllRows("社員名簿", 2)
      const emp = employees.find((em) => em["名前"] === params["現在使用者"])
      params["在/退職"] = emp?.["区分"] ?? ""
    }
    const { action: _a, no: _n, ...rowData } = params as Record<string, unknown> & {
      action?: unknown
      no?: unknown
    }

    client.appendRow("PC一覧", rowData)
    client.writeHistory("PC登録", editor, no)
    return successResponse(null)
  })
}