// actionパラメータに応じて各ハンドラーに処理を振り分けるRouter
// ハンドラーは Week2 3日目に実装予定（現在はスタブ）

type HandlerFn = (
  e: GoogleAppsScript.Events.DoGet | GoogleAppsScript.Events.DoPost,
  client: SheetClient
) => GoogleAppsScript.Content.TextOutput

// 実装済みになったハンドラーをここに追加していく
const HANDLERS: Record<string, HandlerFn> = {
  // getDropdowns,
  // getPcList,
  // getPcByno,
  // getEmployees,
  // updatePc,
  // registerPc,
}

const Router = {
  handle(
    e: GoogleAppsScript.Events.DoGet | GoogleAppsScript.Events.DoPost,
    sheetId: string
  ): GoogleAppsScript.Content.TextOutput {
    let action: string | undefined

    // GASのeventオブジェクトは 'in' 演算子が使えないため直接プロパティにアクセスする
    // GASコンソールから手動実行した場合、eがundefinedになるためガードする
    if (!e) return errorResponse("不正なactionです")

    const doGetEvent = e as GoogleAppsScript.Events.DoGet
    const doPostEvent = e as GoogleAppsScript.Events.DoPost

    // GETはクエリパラメータから取得
    if (doGetEvent.parameter && doGetEvent.parameter.action) {
      action = doGetEvent.parameter.action
    }

    // POSTはリクエストボディから取得
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