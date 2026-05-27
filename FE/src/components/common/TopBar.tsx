import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { useAuth } from "../../hooks/useAuth";

type TopBarProps = {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  showPcList?: boolean;
};

export default function TopBar({
  title,
  showBack,
  onBack,
  showPcList,
}: TopBarProps) {
  const { isAuthenticated, userEmail, login, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const TOPBAR_STYLE_ID = "topbar-mobile-style";
  if (
    typeof document !== "undefined" &&
    !document.getElementById(TOPBAR_STYLE_ID)
  ) {
    const s = document.createElement("style");
    s.id = TOPBAR_STYLE_ID;
    s.textContent = `
    @media (max-width: 600px) {
      .topbar-dropdown  { display: flex !important; }
      .topbar-email   { display: none !important; }
      .topbar-hamburger { display: flex !important; }
      .topbar-login   { display: none !important; }
      .topbar-logout  { display: none !important; }
      .topbar-pclist  { display: none !important; }
    }
  `;
    document.head.appendChild(s);
  }

  return (
    <div>
      <header style={styles.header}>
        <div style={styles.left}>
          {showBack && (
            <button
              style={styles.iconButton}
              onClick={onBack ?? (() => navigate(-1))}
            >
              ← 戻る
            </button>
          )}
          <span style={styles.title}>{title}</span>
        </div>

        <div style={styles.right}>
          {showPcList && (
            <button
              style={{
                ...styles.iconButton,
                background: isAuthenticated ? "" : "#fff80",
                cursor: isAuthenticated ? "pointer" : "not-allowed",
              }}
              onClick={() => isAuthenticated && navigate("/pc-list")}
              disabled={!isAuthenticated}
              className="topbar-pclist"
            >
              PC一覧
            </button>
          )}

          {isAuthenticated ? (
            <div style={styles.userArea}>
              <span style={styles.emailChip} className="topbar-email">
                {userEmail}
              </span>
              <button
                style={{
                  ...styles.iconButton,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
                onClick={logout}
                className="topbar-logout"
              >
                <svg height="16" width="16" viewBox="0 0 512 512">
                  <path d="M160 96c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 32C43 32 0 75 0 128L0 384c0 53 43 96 96 96l64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l64 0zM502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 192 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l210.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128z" />
                </svg>
                ログアウト
              </button>
            </div>
          ) : (
            <div className="topbar-login">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  login(credentialResponse);
                }}
                onError={() => console.error("Google login failed")}
                size="medium"
                shape="rectangular"
                text="signin"
              />
            </div>
          )}
          <button
            className="topbar-hamburger"
            style={{ ...styles.iconButton, display: "none" }}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <svg height="16" width="14" viewBox="0 0 448 512">
              <path d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z" />
            </svg>
          </button>
        </div>
      </header>
      {menuOpen && (
        <div className="topbar-dropdown" style={styles.dropdown}>
          {showPcList && (
            <button
              onClick={() => {
                navigate("/pc-list");
                setMenuOpen(false);
              }}
              style={styles.iconButton}
            >
              PC一覧
            </button>
          )}
          {isAuthenticated ? (
            <>
              <span
                style={{
                  ...styles.emailChip,
                  textAlign: "center",
                  maxWidth: "100%",
                }}
              >
                {userEmail}
              </span>
              <button onClick={logout} style={styles.iconButton}>
                <svg height="16" width="16" viewBox="0 0 512 512">
                  <path d="M160 96c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 32C43 32 0 75 0 128L0 384c0 53 43 96 96 96l64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l64 0zM502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 192 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l210.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128z" />
                </svg>
                ログアウト
              </button>
            </>
          ) : (
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                login(credentialResponse);
              }}
              onError={() => console.error("Google login failed")}
              size="medium"
              shape="rectangular"
              text="signin"
            />
          )}
        </div>
      )}
    </div>
  );
}
const styles: Record<string, React.CSSProperties> = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    margin: "1% 4%",
    marginBottom: 0,
    padding: "8px",
    borderRadius: "8px",
    background: "#FF6F20",
    color: "#fff",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
  },
  left: {
    gap: 16,
    display: "flex",
    alignItems: "center",
    padding: "4px 8px",
  },
  title: {
    fontFamily: "inter",
    fontSize: 20,
    fontWeight: 500,
    flex: 1,
    textAlign: "center",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    minWidth: 40,
    justifyContent: "flex-end",
  },
  iconButton: {
    border: "none",
    color: "#000",
    fontSize: 16,
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: "8px",
  },
  userArea: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  emailChip: {
    fontSize: 13,
    background: "rgba(255,255,255,0.2)",
    padding: "2px 10px",
    borderRadius: 12,
    maxWidth: 200,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  dropdown: {
    display: "none",
    flexDirection: "column",
    gap: 8,
    padding: "10px 16px",
    borderRadius: "0 0 8px 8px",
    margin: "0 4%",
    background: "#FFB74D80",
  },
};
