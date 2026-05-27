export type PC = {
  no: number
  PCNo: string //番号
  PCName: string //PC名
  status: string // 状況
  classification: string // 分類
  purpose: string //用途
  type: string //区分
  user: string // 現在使用者
  employmentStatus: string //在/退職
  prevUser: string //以前使用者
  place: string //場所
  state: string //状態
  note: string //備考
  lendingDate: string //貸出日
  manufacture: string //製造社
  modelName: string //モデル名
  CPU: string //CPU
  RAM: number //RAM
  purchaseDate: string //購入日
  OSName: string //OS名
  OSLicence: string //OSライセンス
  backupImageCreationDate: string //バックアップイメージ作成日
  OfficeLicence: string //Officeライセンス
  IP: string //IPアドレス
}

export type Employee = {
  employeeNo: number //番号
  name: string // 名前
  type: string // 区分
}

export type Dropdowns = {
  status: string[] // 状況
  classification: string[] // 分類
  purpose: string[] // 用途
  type: string[] // 区分
  place: string[] // 場所
}

export type ApiResponse<T> = {
  status: "success" | "error"
  data?: T
  message?: string
}

export type HistoryEntry = {
  date: string // タイムスタンプ (日付)
  time: string // タイムスタンプ (時刻)
  editType: string // 編集種別
  editor: string // 編集者
  pcNo: string // 番号
  pcName?: string // PC名
}

export type HistoryMeta = {
  editor: string
  editType: string
}