import { pdf } from "@react-pdf/renderer";

import LoanDocument from "../pdf/LoanDocument";
import type { PC } from "../types/index";
import { useAuth } from "../hooks/useAuth";

type LoanDialogProps = {
  form: Partial<PC>;
  onClose: () => void;
};

export default function LoanDialog({ form, onClose }: LoanDialogProps) {
  const { userEmail } = useAuth();

  const handleOpenPdf = async () => {
    const blob = await pdf(
      <LoanDocument form={form} userEmail={userEmail} />,
    ).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <span style={styles.title}>貸出証出力</span>
          <button style={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={styles.body}>
          <div style={styles.summary}>
            <div style={{ ...styles.title, textAlign: "center" }}>PC貸出証</div>
            <Row label="PC名" value={form.PCName} />
            <Row label="番号" value={form.PCNo} />
            <Row label="借用者" value={form.user} />
            <Row label="分類" value={form.classification} />
            <Row label="用途" value={form.purpose} />
            <Row label="場所" value={form.place} />
            <Row label="貸出日" value={form.lendingDate} />
          </div>
        </div>

        <div style={styles.footer}>
          <button style={styles.openBtn} onClick={handleOpenPdf}>
            <svg
              viewBox="0 0 512 512"
              height="14"
              width="14"
              fill="currentColor"
            >
              <path d="M64 64C64 28.7 92.7 0 128 0L341.5 0c17 0 33.3 6.7 45.3 18.7l42.5 42.5c12 12 18.7 28.3 18.7 45.3l0 37.5-384 0 0-80zM0 256c0-35.3 28.7-64 64-64l384 0c35.3 0 64 28.7 64 64l0 96c0 17.7-14.3 32-32 32l-32 0 0 64c0 35.3-28.7 64-64 64l-256 0c-35.3 0-64-28.7-64-64l0-64-32 0c-17.7 0-32-14.3-32-32l0-96zM128 416l0 32 256 0 0-96-256 0 0 64zM456 272a24 24 0 1 0 -48 0 24 24 0 1 0 48 0z" />
            </svg>
            <span style={{ marginLeft: 6 }}>PDF出力/印刷</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const Row = ({ label, value }: { label: string; value?: string }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      gap: 8,
      fontSize: 13,
      padding: "6px 0",
      borderBottom: "1px solid #f0f0f0",
    }}
  >
    <span style={{ color: "#666", minWidth: 64, flexShrink: 0 }}>{label}</span>
    <span style={{ color: "#333", fontWeight: 500 }}>{value ?? "—"}</span>
  </div>
);

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 200,
  },
  dialog: {
    background: "#fff",
    borderRadius: 12,
    width: "min(90vw, 480px)",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderBottom: "1px solid #e0e0e0",
  },
  title: {
    fontSize: 16,
    fontWeight: 600,
    color: "#111",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
    color: "#666",
    lineHeight: 1,
    padding: 4,
  },
  body: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  summary: {
    border: "2px solid #E2E4E5",
    borderRadius: 8,
    padding: "8px 12px",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    padding: "14px 20px",
    borderTop: "1px solid #e0e0e0",
  },
  cancelBtn: {
    padding: "9px 18px",
    background: "transparent",
    border: "1px solid #d0d0d0",
    borderRadius: 6,
    fontSize: 13,
    cursor: "pointer",
    color: "#444",
  },
  openBtn: {
    padding: "9px 18px",
    background: "#FF6F20",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  },
};
