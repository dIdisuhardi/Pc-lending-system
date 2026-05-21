import { useState, useEffect } from "react"
import { gasApi } from "../api/gas"
import { useAuth } from "./useAuth"
import type { Employee } from "../types/index"

let cache: Employee[] | null = null
let fetchPromise: Promise<Employee[]> | null = null
const listeners: Set<() => void> = new Set()

const notify = () => listeners.forEach((fn) => fn())

export function useEmployees() {
    const { isAuthenticated } = useAuth()
    const [employees, setEmployees] = useState<Employee[]>(cache ?? [])
    const [loading, setLoading] = useState(!cache)
    const [error, setError] = useState<string>("")

    useEffect(() => {
        const sync = () => {
            if (cache) {
                setEmployees(cache)
                setLoading(false)
            }
        }
        listeners.add(sync)
        sync()
        return () => { listeners.delete(sync) }
    }, [])

    useEffect(() => {
        if (!isAuthenticated) return
        if (cache) {
            setEmployees(cache)
            setLoading(false)
            return
        }
        if (!fetchPromise) {
            fetchPromise = gasApi.getEmployees()
        }
        setLoading(true)
        fetchPromise
            .then((data) => {
                cache = data
                notify()
            })
            .catch((e) => {
                setError(e instanceof Error ? e.message : "Unknown error")
                fetchPromise = null
            })
            .finally(() => setLoading(false))
    }, [isAuthenticated])

    return { employees, loading, error }
}