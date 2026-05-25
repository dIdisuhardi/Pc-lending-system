import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import PcInfoPage from "./pages/PcInfoPage";
import PcListPage from "./pages/PcListPage";
import PcRegisterPage from "./pages/PcRegisterPage";
import QrPrintPage from "./pages/QrPrintPage";
import QrScanPage from "./pages/QrScanPage";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<QrScanPage />} />
      <Route
        path="/pc/:no"
        element={
          <ProtectedRoute>
            <PcInfoPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pc-list"
        element={
          <ProtectedRoute>
            <PcListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pc-register"
        element={
          <ProtectedRoute>
            <PcRegisterPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pc-register/:no"
        element={
          <ProtectedRoute>
            <PcRegisterPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/qr-print/:no"
        element={
          <ProtectedRoute>
            <QrPrintPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
