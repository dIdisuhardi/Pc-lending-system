import type { PC, Employee, Dropdowns, ApiResponse, HistoryEntry } from "../types/index"

const GAS_URL = import.meta.env.VITE_GAS_URL as string

async function get<T>(action: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(GAS_URL)
    url.searchParams.set("action", action)
    if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
    const res = await fetch(url.toString(), { redirect: "follow" })
    const data: ApiResponse<T> = await res.json()
    if (data.status === "error") throw new Error(data.message)
    return data.data!
}

async function post<T>(action: string, body: object): Promise<T> {
    const res = await fetch(GAS_URL, {
        method: "POST",
        redirect: "follow",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action, ...body }),
    })
    const data: ApiResponse<T> = await res.json()
    if (data.status === "error") throw new Error(data.message)
    return data.data!
}

function toDateString(raw: unknown): string {
    if (!raw) return ""
    const s = String(raw)
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
    const match = s.match(/^(\d{4}-\d{2}-\d{2})/)
    if (match) return match[1]
    return ""
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPC(r: any): PC {
    return {
        no: r["No."],
        PCNo: r["番号"],
        PCName: r["PC名"],
        status: r["状況"],
        classification: r["分類"],
        purpose: r["用途"],
        type: r["区分"],
        user: r["現在使用者"],
        employmentStatus: r["在/退職"],
        prevUser: r["以前使用者"],
        place: r["場所"],
        state: r["状態"],
        note: r["備考"],
        lendingDate: toDateString(r["貸出日"]),
        manufacture: r["製造社"],
        modelName: r["モデル名"],
        CPU: r["CPU"],
        RAM: r["RAM"],
        purchaseDate:  toDateString(r["購入日"]),
        OSName: r["OS名"],
        OSLicence: r["OS Licence"],
        backupImageCreationDate:  toDateString(r["バックアップイメージ作成日"]),
        OfficeLicence: r["Office Licence"],
        IP: r["IP"],
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEmployee(r: any): Employee {
    return {
        employeeNo: r["番号"],
        name: r["名前"],
        type: r["区分"],
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDropdowns(r: any): Dropdowns {
    return {
        status: r["状況"],
        classification: r["分類"],
        purpose: r["用途"],
        type: r["区分"],
        place: r["場所"],
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapHistoryEntry(r: any): HistoryEntry {
    const raw = String(r["タイムスタンプ"] ?? "")
    const [datePart = "", timePart = ""] = raw.includes("T")
        ? raw.split("T").map((s, i) => i === 1 ? s.slice(0, 8) : s)
        : raw.split(" ")

    return {
        date: datePart,
        time: timePart.slice(0, 8),
        pcNo: String(r["番号"] ?? ""),
        editType: String(r["編集種別"] ?? ""),
        editor: String(r["編集者"] ?? ""),
    }
}

function unmapPC(form: Partial<PC>): Record<string, unknown> {
    const r: Record<string, unknown> = {}
    if (form.PCNo !== undefined) r["番号"] = form.PCNo
    if (form.PCName !== undefined) r["PC名"] = form.PCName
    if (form.status !== undefined) r["状況"] = form.status
    if (form.classification !== undefined) r["分類"] = form.classification
    if (form.purpose !== undefined) r["用途"] = form.purpose
    if (form.type !== undefined) r["区分"] = form.type
    if (form.user !== undefined) r["現在使用者"] = form.user
    if (form.employmentStatus !== undefined) r["在/退職"] = form.employmentStatus
    if (form.prevUser !== undefined) r["以前使用者"] = form.prevUser
    if (form.place !== undefined) r["場所"] = form.place
    if (form.state !== undefined) r["状態"] = form.state
    if (form.note !== undefined) r["備考"] = form.note
    if (form.lendingDate !== undefined) r["貸出日"] = form.lendingDate
    if (form.manufacture !== undefined) r["製造社"] = form.manufacture
    if (form.modelName !== undefined) r["モデル名"] = form.modelName
    if (form.CPU !== undefined) r["CPU"] = form.CPU
    if (form.RAM !== undefined) r["RAM"] = form.RAM
    if (form.purchaseDate !== undefined) r["購入日"] = form.purchaseDate
    if (form.OSName !== undefined) r["OS名"] = form.OSName
    if (form.OSLicence !== undefined) r["OS Licence"] = form.OSLicence
    if (form.backupImageCreationDate !== undefined) r["バックアップイメージ作成日"] = form.backupImageCreationDate
    if (form.OfficeLicence !== undefined) r["Office Licence"] = form.OfficeLicence
    if (form.IP !== undefined) r["IP"] = form.IP
    return r
}

export const gasApi = {
    getDropdowns: async () => {
        const raw = await get<Record<string, string[]>>("getDropdowns")
        return mapDropdowns(raw)
    },
    getPcList: async () => {
        const raw = await get<Record<string, unknown>[]>("getPcList")
        return raw.map(mapPC)
    },
    getPcByNo: async (no: string) => {
        const raw = await get<Record<string, unknown> | null>("getPcByNo", { no })
        return raw ? mapPC(raw) : null
    },
    getEmployees: async () => {
        const raw = await get<Record<string, unknown>[]>("getEmployees")
        return raw.map(mapEmployee)
    },
    updatePc: (form: Partial<PC>, meta: { editor: string; editType: string }) =>
        post<null>("updatePc", { ...unmapPC(form), ...meta }),
    registerPc: (form: Partial<PC>, meta: { editor: string }) =>
        post<null>("registerPc", { ...unmapPC(form), editType: "PC登録", ...meta }),
    getHistory: async () => {
        const raw = await get<Record<string, unknown>[]>("getHistory")
        return raw.map(mapHistoryEntry)
    },
}