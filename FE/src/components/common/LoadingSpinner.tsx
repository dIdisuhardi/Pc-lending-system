type LoadingSpinnerProps = {
  message?: string;
};

export default function LoadingSpinner({ message }: LoadingSpinnerProps) {
  return (
    <div style={styles.overlay}>
      <div style={styles.inner}>
        <div style={styles.spinner} />
        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(255,255,255,0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  inner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },
  spinner: {
    width: 36,
    height: 36,
    border: "3px solid #e0e0e0",
    borderTop: "3px solid #FF6F20",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  message: {
    fontSize: 13,
    color: "#666",
    margin: 0,
  },
};

const styleId = "loading-spinner-keyframes";
if (typeof document !== "undefined" && !document.getElementById(styleId)) {
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = "@keyframes spin { to { transform: rotate(360deg); } }";
  document.head.appendChild(style);
}
