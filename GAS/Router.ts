type HandlerFn = (
  e: GoogleAppsScript.Events.DoGet | GoogleAppsScript.Events.DoPost,
  client: SheetClient
) => GoogleAppsScript.Content.TextOutput

const HANDLERS: Record<string, HandlerFn> = {
  getDropdowns,
  getPcList,
  getPcByNo,
  getEmployees,
  updatePc,
  registerPc,
  getHistory,
}

const Router = {
  handle(
    e: GoogleAppsScript.Events.DoGet | GoogleAppsScript.Events.DoPost,
    sheetId: string
  ): GoogleAppsScript.Content.TextOutput {
    let action: string | undefined
    if (!e) return errorResponse("不正なactionです")

    const doGetEvent = e as GoogleAppsScript.Events.DoGet
    const doPostEvent = e as GoogleAppsScript.Events.DoPost
    if (doGetEvent.parameter && doGetEvent.parameter.action) {
      action = doGetEvent.parameter.action
    }

    if (!action && doPostEvent.postData && doPostEvent.postData.contents) {
      try {
        const body = JSON.parse(doPostEvent.postData.contents)
        action = body.action
      } catch {
        return errorResponse("リクエストボディの解析に失敗しました")
      }
    }

    if (!action) return errorResponse("actionが指定されていません")

    const handler = HANDLERS[action]
    if (!handler) return errorResponse("不正なactionです")

    try {
      return handler(e, new SheetClient(sheetId))
    } catch (err) {
      const message = err instanceof Error ? err.message : "不明なエラーが発生しました"
      return errorResponse(message)
    }
  },
}