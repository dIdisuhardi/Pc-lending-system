import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ErrorDialog from "../components/common/ErrorDialog";
import LoadingSpinner from "../components/common/LoadingSpinner";
import TopBar from "../components/common/TopBar";
import type { PC } from "../types/index";
import { usePcData } from "../hooks/usePcData";

const LIST_COLUMNS: { label: string; key: keyof PC }[] = [
  { label: "PC名", key: "PCName" },
  { label: "番号", key: "PCNo" },
  { label: "状況", key: "status" },
  { label: "分類", key: "classification" },
  { label: "場所", key: "place" },
  { label: "現在使用者", key: "user" },
  { label: "区分", key: "type" },
];

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  "1使用中": { background: "#D4F8D3", color: "#27AE60" },
  "2未使用": { background: "#474747", color: "#FFFFFF" },
  "3破棄": { background: "#FFF0BB", color: "#000" },
  "4使用不可": { background: "#E96D6D", color: "#000" },
  "5不明": { background: "#FFB74D", color: "#000" },
};

export default function PcListPage() {
  const navigate = useNavigate();
  const { fetchPcList, loading, error } = usePcData();

  const [pcList, setPcList] = useState<PC[]>([]);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [dialogError, setDialogError] = useState("");

  useEffect(() => {
    fetchPcList().then((data) => {
      if (data) setPcList(data);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <LoadingSpinner message="読み込み中..." />;

  return (
    <div style={styles.page}>
      <TopBar
        title="PC一覧"
        showBack
        onBack={() => navigate("/")}
        registerBtn
      />

      <div style={styles.toolbar}></div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              {LIST_COLUMNS.map((col) => (
                <th key={col.key} style={styles.th}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pcList.length === 0 ? (
              <tr>
                <td colSpan={LIST_COLUMNS.length} style={styles.emptyCell}>
                  データがありません
                </td>
              </tr>
            ) : (
              pcList.map((pc) => (
                <tr
                  key={pc.PCNo}
                  style={{
                    ...styles.tr,
                    background: hoveredRow === pc.PCNo ? "#FFF3E8" : "#fff",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate(`/pc-register/${pc.PCNo}`)}
                  onMouseEnter={() => setHoveredRow(pc.PCNo)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {LIST_COLUMNS.map((col) => (
                    <td key={col.key} style={styles.td}>
                      {col.key === "status" ? (
                        <span
                          style={{
                            ...styles.badge,
                            ...(STATUS_STYLE[String(pc[col.key] ?? "")] ?? {
                              background: "#F5F5F5",
                              color: "#555",
                            }),
                          }}
                        >
                          {String(pc[col.key] ?? "")}
                        </span>
                      ) : (
                        String(pc[col.key] ?? "")
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {(error || dialogError) && (
        <ErrorDialog
          message={error || dialogError}
          onClose={() => setDialogError("")}
        />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f5f5f5",
    display: "flex",
    flexDirection: "column",
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 4%",
  },
  count: {
    fontSize: 13,
    color: "#666",
  },
  registerBtn: {
    padding: "8px 18px",
    background: "#FF6F20",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
  },
  tableWrap: {
    margin: "0 4% 32px",
    borderRadius: 10,
    overflow: "auto",
    boxShadow: "0 1px 4px rgba(0,0,0,0.10)",
    background: "#fff",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
    minWidth: 800,
  },
  th: {
    padding: "10px 12px",
    background: "#FF6F20",
    color: "#fff",
    fontWeight: 600,
    textAlign: "left",
    whiteSpace: "nowrap",
    position: "sticky",
    top: 0,
  },
  tr: {
    borderBottom: "1px solid #f0f0f0",
    transition: "background 0.12s",
  },
  td: {
    padding: "9px 12px",
    color: "#333",
    whiteSpace: "nowrap",
    maxWidth: 200,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  emptyCell: {
    padding: "40px 12px",
    textAlign: "center",
    color: "#999",
    fontSize: 14,
  },
  badge: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 500,
  },
};
