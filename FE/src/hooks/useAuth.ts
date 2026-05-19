import type { ReactNode } from "react"
import { createContext, createElement, useContext, useState } from "react"
import { googleLogout } from "@react-oauth/google"

const decodeJwt = (token: string): { email: string } => {
  const payload = token.split(".")[1]
  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
  return JSON.parse(atob(base64))
}

type AuthState = {
    isAuthenticated: boolean
    userEmail: string
    token: string
}

type AuthContextType = AuthState & {
    login: (credentialResponse: { credential?: string }) => void
    logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        userEmail: "",
        token: "",
    })

    const login = (credentialResponse: { credential?: string }) => {
        const token = credentialResponse.credential
        if (!token) return

        const decoded = decodeJwt(token)
        setAuthState({ isAuthenticated: true, userEmail: decoded.email, token })
    }

    const logout = () => {
        googleLogout()
        setAuthState({ isAuthenticated: false, userEmail: "", token: "" })
    }

    return createElement(AuthContext.Provider, { value: { ...authState, login, logout } }, children)
}

export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error("useAuth must be used within AuthProvider")
    return ctx
}