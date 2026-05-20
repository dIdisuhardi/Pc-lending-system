function getEmployees(
    _e: GoogleAppsScript.Events.DoGet | GoogleAppsScript.Events.DoPost,
    client: SheetClient
): GoogleAppsScript.Content.TextOutput {
    const rows = client.getAllRows("社員名簿", 2)
    const employees = rows
        .filter((r) => r["名前"] !== null && r["名前"] !== undefined && r["名前"] !== "")
        .map((r) => ({
            番号: r["番号"],
            名前: r["名前"],
            区分: r["区分"],
        }))

    return successResponse(employees)
}