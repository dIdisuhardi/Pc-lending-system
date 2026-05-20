import type { PC, Employee, Dropdowns, ApiResponse } from "../types/index"

const GAS_URL = import.meta.env.VITE_GAS_URL as string

async function get<T>(action: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(GAS_URL)
    url.searchParams.set("action", action)
    if (params) {
        Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
    }

    const res = await fetch(url.toString())
    const data: ApiResponse<T> = await res.json()
    if (data.status === "error") throw new Error(data.message)
    return data.data!
}

async function post<T>(action: string, body: object): Promise<T> {
    const res = await fetch(GAS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...body }),
    })
    const data: ApiResponse<T> = await res.json()
    if (data.status === "error") throw new Error(data.message)
    return data.data!
}

export const gasApi = {
    getDropdowns: () => get<Dropdowns>("getDropdowns"),
    getPcList: () => get<PC[]>("getPcList"),
    getPcByNo: (no: string) => get<PC | null>("getPcByNo", { no }),
    getEmployees: () => get<Employee[]>("getEmployees"),
    updatePc: (form: Partial<PC>) => post<null>("updatePc", form),
    registerPc: (form: Partial<PC>) => post<null>("registerPc", form),
}