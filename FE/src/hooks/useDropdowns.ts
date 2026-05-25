import { useEffect, useState } from "react"

import type { Dropdowns } from "../types/index"
import { gasApi } from "../api/gas"
import { useAuth } from "./useAuth"

const EMPTY_DROPDOWNS: Dropdowns = {
    status: [],
    classification: [],
    purpose: [],
    type: [],
    place: [],
}

let cache: Dropdowns | null = null
let fetchPromise: Promise<Dropdowns> | null = null
const listeners: Set<() => void> = new Set()

const notify = () => listeners.forEach((fn) => fn())

export function useDropdowns() {
    const { isAuthenticated } = useAuth()
    const [dropdowns, setDropdowns] = useState<Dropdowns>(() => cache ?? EMPTY_DROPDOWNS)
    const [loading, setLoading] = useState(() => !cache)
    const [error, setError] = useState<string>("")
    useEffect(() => {
        const sync = () => {
            if (cache) setDropdowns(cache)
        }
        listeners.add(sync)
        return () => { listeners.delete(sync) }
    }, [])

    useEffect(() => {
        if (!isAuthenticated || cache) return

        if (!fetchPromise) {
            fetchPromise = gasApi.getDropdowns()
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

    return { dropdowns, loading, error }
}