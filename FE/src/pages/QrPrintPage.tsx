import { useMemo, useRef } from "react";
import { encodeQR } from "qr";

type QrDialogProps = {
  pcNo: string;
  pcName?: string;
  onClose: () => void;
};

export default function QrDialog({ pcNo, pcName, onClose }: QrDialogProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const svgString = useMemo(() => {
    try {
      const raw = encodeQR(pcNo, "svg", { ecc: "medium" });
      return raw.replace(
        "<svg ",
        '<svg width="200" height="200" style="display:block;" ',
      );
    } catch {
      return null;
    }
  }, [pcNo]);

  const handlePrint = () => {
    const iframe = iframeRef.current;
    if (!iframe || !svgString) return;

    const html = 
    `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              font-family: sans-serif;
              background: #fff;
            }
            .qr {
              display: block;
            }
            .pc-name {
              margin-top: 8px;
              font-size: 13px;
              color: #444;
            }
            .pc-no {
              margin-top: 4px;
              font-size: 16px;
              font-weight: 700;
              font-family: monospace;
              letter-spacing: 1px;
              color: #111;
            }
            @page {
              margin: 0;
            }
            @media print {
              body {
                justify-content: flex-start;
                padding-top: 20mm;
              }
            }
          </style>
        </head>
        <body>
          ${svgString}
          ${pcName ? `<p class="pc-name">${pcName}</p>` : ""}
          <p class="pc-no">${pcNo}</p>
        </body>
      </html>`;

    iframe.onload = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      iframe.onload = null;
    };

    iframe.srcdoc = html;
  };

  return (
    <>
      <iframe
        ref={iframeRef}
        title="qr-print-frame"
        style={{
          position: "fixed",
          width: 0,
          height: 0,
          border: "none",
          top: -9999,
          left: -9999,
        }}
        aria-hidden="true"
      />

      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
          <div style={styles.header}>
            <span style={styles.title}>
              QRコード印刷 ー {pcNo}
              {pcName ? ` - ${pcName}` : ""}
            </span>
            <button style={styles.closeBtn} onClick={onClose}>
              ✕
            </button>
          </div>

          <div style={styles.body}>
            <div style={styles.printTarget}>
              {svgString ? (
                <div
                  style={styles.qrWrap}
                  dangerouslySetInnerHTML={{ __html: svgString }}
                />
              ) : (
                <p style={{ color: "#c00" }}>QR生成に失敗しました</p>
              )}
              <div style={styles.label}>
                {pcName && <span style={styles.pcName}>{pcName}</span>}
                <span style={styles.pcNo}>番号：{pcNo}</span>
              </div>
            </div>

            <p style={styles.hint}>
              このQRコードをシールに印刷してPCに貼付してください。QRには番号（
              {pcNo}）が埋め込まれています。
            </p>
          </div>

          <div style={styles.footer}>
            <button style={styles.printBtn} onClick={handlePrint}>
              <svg
                viewBox="0 0 512 512"
                height="14"
                width="14"
                fill="currentColor"
              >
                <path d="M128 0C92.7 0 64 28.7 64 64l0 96 64 0 0-96 226.7 0L384 93.3l0 66.7 64 0 0-66.7c0-17-6.7-33.3-18.7-45.3L400 18.7C388 6.7 371.7 0 354.7 0L128 0zM384 352l0 32 0 64-256 0 0-64 0-16 0-16 256 0zm64 32l32 0c17.7 0 32-14.3 32-32l0-96c0-35.3-28.7-64-64-64L64 192c-35.3 0-64 28.7-64 64l0 96c0 17.7 14.3 32 32 32l32 0 0 64c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-64zM432 248a24 24 0 1 1 0 48 24 24 0 1 1 0-48z" />
              </svg>
              <span style={{ marginLeft: 6 }}>PDF出力/印刷 </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

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
    width: "min(480px)",
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
    padding: "24px 20px 16px",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  printTarget: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    padding: 16,
    border: "1px dashed #ccc",
    borderRadius: 8,
    width: "100%",
  },
  qrWrap: {
    width: 200,
    height: 200,
    lineHeight: 0,
  },
  label: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
  },
  pcName: {
    fontSize: 13,
    color: "#444",
  },
  pcNo: {
    fontSize: 15,
    fontWeight: 700,
    fontFamily: "monospace",
    color: "#111",
    letterSpacing: 1,
  },
  hint: {
    fontSize: 12,
    color: "#888",
    margin: 0,
    textAlign: "center",
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
  printBtn: {
    display: "flex",
    alignItems: "center",
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
