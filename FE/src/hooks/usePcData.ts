import { useState } from "react"

import type { PC, HistoryMeta } from "../types/index"
import { gasApi } from "../api/gas"

export function usePcData() {
    const [pc, setPc] = useState<PC | null>(null)
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string>("")

    const fetchPc = async (no: string) => {
        setLoading(true)
        setError("")
        try {
            const data = await gasApi.getPcByNo(no)
            setPc(data)
            return data
        } catch (e) {
            setError(e instanceof Error ? e.message : "Unknown error")
            return null
        } finally {
            setLoading(false)
        }
    }

    const fetchPcList = async () => {
        setLoading(true)
        setError("")
        try {
            return await gasApi.getPcList()
        } catch (e) {
            setError(e instanceof Error ? e.message : "Unknown error")
            return []
        } finally {
            setLoading(false)
        }
    }

    const savePc = async (form: Partial<PC>, meta: HistoryMeta) => {
        setSaving(true)
        setError("")
        try {
            await gasApi.updatePc(form, meta)
            return true
        } catch (e) {
            setError(e instanceof Error ? e.message : "Unknown error")
            return false
        } finally {
            setSaving(false)
        }
    }

    const registerPc = async (form: Partial<PC>, meta: { editor: string }) => {
        setSaving(true)
        setError("")
        try {
            await gasApi.registerPc(form, meta)
            return true
        } catch (e) {
            setError(e instanceof Error ? e.message : "Unknown error")
            return false
        } finally {
            setSaving(false)
        }
    }

    return { pc, loading, saving, error, fetchPc, fetchPcList, savePc, registerPc }
}