class SheetClient {
  private ss: GoogleAppsScript.Spreadsheet.Spreadsheet

  constructor(sheetId: string) {
    this.ss = SpreadsheetApp.openById(sheetId)
  }

  getSheet(name: string): GoogleAppsScript.Spreadsheet.Sheet {
    const sheet = this.ss.getSheetByName(name)
    if (!sheet) throw new Error(`シート「${name}」が見つかりません`)
    return sheet
  }

  getAllRows(sheetName: string, headerRow = 1): Record<string, unknown>[] {
    const sheet = this.getSheet(sheetName)
    const allValues = sheet.getDataRange().getValues()
    const headers = allValues[headerRow - 1] as (string | null)[]
    const dataRows = allValues.slice(headerRow)

    return dataRows
      .map((row) =>
        headers.reduce<Record<string, unknown>>((obj, header, i) => {
          if (header !== null && header !== undefined && String(header).trim() !== "") {
            const cleanHeader = String(header).replace(/\n/g, "")
            obj[cleanHeader] = row[i]
          }
          return obj
        }, {})
      )
      .filter((row) =>
        Object.values(row).some((v) => v !== null && v !== undefined && v !== "")
      )
  }

  findRowByno(no: string): number {
    const sheet = this.getSheet("PC一覧")
    const allValues = sheet.getDataRange().getValues()
    const headers = allValues[2] as (string | null)[]
    const noColIndex = headers.findIndex(
      (h) => h !== null && String(h).trim() === "番号"
    )
    if (noColIndex === -1) throw new Error("PC一覧シートに「番号」列が見つかりません")
    for (let i = 3; i < allValues.length; i++) {
      if (String(allValues[i][noColIndex]) === String(no)) {
        return i + 1
      }
    }
    return -1
  }

  updateRow(
    sheetName: string,
    rowIndex: number,
    updates: Record<string, unknown>
  ): void {
    const sheet = this.getSheet(sheetName)
    const headers = sheet.getRange(3, 1, 1, sheet.getLastColumn()).getValues()[0] as (string | null)[]

    Object.entries(updates).forEach(([key, value]) => {
      const colIndex = headers.findIndex(
        (h) => h !== null && String(h).replace(/\n/g, "") === key
      )
      if (colIndex === -1) return
      sheet.getRange(rowIndex, colIndex + 1).setValue(value ?? "")
    })
  }

  appendRow(sheetName: string, rowData: Record<string, unknown>): void {
    const sheet = this.getSheet(sheetName)
    const headers = sheet.getRange(3, 1, 1, sheet.getLastColumn()).getValues()[0] as (string | null)[]
    const newRow = headers.map((header) => {
      if (!header) return ""
      const cleanHeader = String(header).replace(/\n/g, "")
      return rowData[cleanHeader] ?? ""
    })
    const lastDataRow = sheet.getLastRow()
    sheet.appendRow(newRow)
    const newRowIndex = sheet.getLastRow()
    const sourceRange = sheet.getRange(lastDataRow, 1, 1, sheet.getLastColumn())
    const targetRange = sheet.getRange(newRowIndex, 1, 1, sheet.getLastColumn())

    sourceRange.copyTo(targetRange, SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false)
    sourceRange.copyTo(targetRange, SpreadsheetApp.CopyPasteType.PASTE_DATA_VALIDATION, false)
  }

  writeHistory(editType: string, editor: string, pcNo: string): void {
    const sheet = this.getSheet("履歴")
    const timestamp = Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      "yyyy-MM-dd HH:mm:ss"
    )
    sheet.appendRow([timestamp, pcNo, editType, editor])
  }
}