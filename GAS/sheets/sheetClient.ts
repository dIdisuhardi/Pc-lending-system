class SheetClient {
  private ss: GoogleAppsScript.Spreadsheet.Spreadsheet

  constructor(sheetId: string) {
    this.ss = SpreadsheetApp.openById(sheetId)
  }

  // シート名でシートを取得。存在しない場合はエラーをスロー
  getSheet(name: string): GoogleAppsScript.Spreadsheet.Sheet {
    const sheet = this.ss.getSheetByName(name)
    if (!sheet) throw new Error(`シート「${name}」が見つかりません`)
    return sheet
  }

  // ヘッダー行をキーとしたオブジェクト配列を返す
  getAllRows(sheetName: string): Record<string, unknown>[] {
    const sheet = this.getSheet(sheetName)
    const [headers, ...rows] = sheet.getDataRange().getValues()

    return rows
      .map((row) =>
        (headers as string[]).reduce<Record<string, unknown>>((obj, header, i) => {
          obj[header] = row[i]
          return obj
        }, {})
      )
      .filter((row) =>
        // 全列が空の行は除外
        Object.values(row).some((v) => v !== "" && v !== null && v !== undefined)
      )
  }

  // 番号列でPC行の行インデックスを検索（1始まり、ヘッダー行含む）
  // 見つからない場合は -1 を返す
  findRowByno(no: string): number {
    const sheet = this.getSheet("PC一覧")
    const [headers, ...rows] = sheet.getDataRange().getValues()
    const noColIndex = (headers as string[]).indexOf("番号")

    if (noColIndex === -1) throw new Error("PC一覧シートに「番号」列が見つかりません")

    const rowIndex = rows.findIndex((row) => String(row[noColIndex]) === String(no))

    // getDataRange は 1始まりで、1行目がヘッダーなので +2
    return rowIndex === -1 ? -1 : rowIndex + 2
  }

  // 指定行の指定列のみ部分更新する（送られたキーのみ更新）
  updateRow(
    sheetName: string,
    rowIndex: number,
    updates: Record<string, unknown>
  ): void {
    const sheet = this.getSheet(sheetName)
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] as string[]

    Object.entries(updates).forEach(([key, value]) => {
      const colIndex = headers.indexOf(key)
      if (colIndex === -1) return // 存在しない列キーは無視
      sheet.getRange(rowIndex, colIndex + 1).setValue(value)
    })
  }

  // ヘッダー順に並べた新規行を末尾に追加する
  appendRow(sheetName: string, rowData: Record<string, unknown>): void {
    const sheet = this.getSheet(sheetName)
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] as string[]

    const newRow = headers.map((header) => rowData[header] ?? "")
    sheet.appendRow(newRow)
  }
}