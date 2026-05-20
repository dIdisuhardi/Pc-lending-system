type ErrorDialogProps = {
  message: string
  onClose: () => void
}

export default function ErrorDialog({ message, onClose }: ErrorDialogProps) {
  return (
    <div style={styles.overlay}>
      <div style={styles.dialog}>
        <p style={styles.header}>エラーが発生しました</p>
          <svg viewBox="0 0 512 512" height={120} width={128}><path fill="#d32f2f" d="M256 0c14.7 0 28.2 8.1 35.2 21l216 400c6.7 12.4 6.4 27.4-.8 39.5S486.1 480 472 480L40 480c-14.1 0-27.2-7.4-34.4-19.5s-7.5-27.1-.8-39.5l216-400c7-12.9 20.5-21 35.2-21zm0 352a32 32 0 1 0 0 64 32 32 0 1 0 0-64zm0-192c-18.2 0-32.7 15.5-31.4 33.7l7.4 104c.9 12.5 11.4 22.3 23.9 22.3 12.6 0 23-9.7 23.9-22.3l7.4-104c1.3-18.2-13.1-33.7-31.4-33.7z"/></svg>
        <p style={styles.message}>{message}</p>
        <div style={styles.buttonArea}>
             <button style={styles.backButton} onClick={onClose}>
          閉じる
        </button>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  dialog: {
    background: "#fff",
    borderRadius: 12,
    padding: "32px 24px 24px",
    width: "min(120vw, 480px)",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    border: "2px solid #000",
  },
    header: {
    fontSize: 20,
    fontFamily:"poppins",
    fontWeight: "bold",
    },
  message: {
    borderTopStyle: "solid",
    borderTopWidth: 2,
    borderTopColor: "#000",
    paddingTop: 16,
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    lineHeight: 1.6,
    margin: 0,
  },
    buttonArea: {
    display: "flex",
    justifyContent: "flex-end",
    width: "100%",
    },
  backButton: {
    width: "30%",
    height: 32,
    background: "#d32f2f",
    color: "#fff",
    border: "none",
    borderRadius: 16,
    fontSize: 14,
    cursor: "pointer",
  },
}