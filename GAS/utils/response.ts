type ApiResponse<T> = {
  status: "success" | "error"
  data?: T
  message?: string
}

function successResponse<T>(data: T): GoogleAppsScript.Content.TextOutput {
  const payload: ApiResponse<T> = { status: "success", data }
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  )
}

function errorResponse(message: string): GoogleAppsScript.Content.TextOutput {
  const payload: ApiResponse<never> = { status: "error", message }
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  )
}