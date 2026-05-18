export type PC = {
  no: number
  番号: string
  PC名: string
  状況: string
  分類: string
  用途: string
  区分: string
  現在使用者: string
  在退職: string
  以前使用者: string
  場所: string
  状態: string
  備考: string
  貸出日: string
  貸出証: string
  製造社: string
  モデル名: string
  CPU: string
  RAM: string
  購入日: string
  OS名: string
  OS_Licence: string
  バックアップイメージ作成日: string
  Office_Licence: string
  IP: string
}

export type Employee = {
  番号: number
  名前: string
  区分: string
}

export type Dropdowns = {
  状況: string[]
  分類: string[]
  用途: string[]
  区分: string[]
  場所: string[]
}

export type ApiResponse<T> = {
  status: "success" | "error"
  data?: T
  message?: string
}

export const LENDING_CLASSIFICATIONS = [
  "2現場貸出",
  "5貸出(社内開発)",
  "6貸出(現場)"
]
