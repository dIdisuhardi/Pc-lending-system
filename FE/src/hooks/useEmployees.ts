import { useEffect, useState } from "react"

import type { Employee } from "../types/index"
import { gasApi } from "../api/gas"
import { useAuth } from "./useAuth"

let cache: Employee[] | null = null
let fetchPromise: Promise<Employee[]> | null = null
const listeners: Set<() => void> = new Set()

const notify = () => listeners.forEach((fn) => fn())

export function useEmployees() {
    const { isAuthenticated } = useAuth()
    const [employees, setEmployees] = useState<Employee[]>(() => cache ?? [])
    const [loading, setLoading] = useState(() => !cache)
    const [error, setError] = useState<string>("")

    useEffect(() => {
        const sync = () => {
            if (cache) setEmployees(cache)
        }
        listeners.add(sync)
        return () => { listeners.delete(sync) }
    }, [])

    useEffect(() => {
        if (!isAuthenticated || cache) return

        if (!fetchPromise) {
            fetchPromise = gasApi.getEmployees()
        }

        let cancelled = false
        fetchPromise
            .then((data) => {
                if (cancelled) return
                cache = data
                setLoading(false)
                notify()
            })
            .catch((e) => {
                if (cancelled) return
                setError(e instanceof Error ? e.message : "Unknown error")
                setLoading(false)
                fetchPromise = null
            })
        return () => { cancelled = true }
    }, [isAuthenticated])

    return { employees, loading, error }
}