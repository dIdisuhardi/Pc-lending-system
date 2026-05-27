import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import ErrorDialog from "../components/common/ErrorDialog";
import LoadingSpinner from "../components/common/LoadingSpinner";
import TopBar from "../components/common/TopBar";
import type { HistoryEntry, PC } from "../types/index";
import { gasApi } from "../api/gas";

const EDIT_TYPE_STYLE: Record<string, React.CSSProperties> = {
  PC貸出: { background: "#E3F2FD", color: "#1565C0" },
  PC編集: { background: "#E8F5E9", color: "#2E7D32" },
  PC登録: { background: "#FFF8E1", color: "#F57F17" },
};

const fallbackBadge: React.CSSProperties = {
  background: "#F5F5F5",
  color: "#555",
};

export default function HistoryPage() {
  const navigate = useNavigate();

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = useLocation();

  const pcNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    const pcList = (location.state as { pcList?: PC[] } | null)?.pcList ?? [];
    pcList.forEach((pc) => {
      map[pc.PCNo] = pc.PCName;
    });
    return map;
  }, [location.state]);

  useEffect(() => {
    gasApi
      .getHistory()
      .then(setHistory)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "取得に失敗しました"),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="読み込み中..." />;

  return (
    <div style={styles.page}>
      <TopBar title="編集履歴" showBack onBack={() => navigate("/pc-list")} />

      <div style={styles.toolbar}>
        <span style={styles.count}>{history.length} 件</span>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              {["日付", "時刻", "番号", "PC名", "編集種別", "編集者"].map(
                (h) => (
                  <th key={h} style={styles.th}>
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan={4} style={styles.emptyCell}>
                  履歴がありません
                </td>
              </tr>
            ) : (
              history.map((entry, i) => (
                <tr key={i} style={styles.tr}>
                  <td style={styles.td}>{entry.date}</td>
                  <td style={styles.td}>{entry.time}</td>
                  <td style={styles.td}>
                    <button
                      style={styles.linkBtn}
                      onClick={() => navigate(`/pc-register/${entry.pcNo}`)}
                    >
                      {entry.pcNo}
                    </button>
                  </td>
                  <td style={styles.td}>
                    {pcNameMap[entry.pcNo] ?? entry.pcNo}
                  </td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        ...(EDIT_TYPE_STYLE[entry.editType] ?? fallbackBadge),
                      }}
                    >
                      {entry.editType}
                    </span>
                  </td>
                  <td style={styles.td}>{entry.editor}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {error && <ErrorDialog message={error} onClose={() => setError("")} />}
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
    padding: "12px 4%",
  },
  count: {
    fontSize: 13,
    color: "#666",
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
    minWidth: 560,
  },
  th: {
    padding: "10px 14px",
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
  },
  td: {
    padding: "9px 14px",
    color: "#333",
    whiteSpace: "nowrap",
  },
  emptyCell: {
    padding: "40px 14px",
    textAlign: "center",
    color: "#999",
    fontSize: 14,
  },
  badge: {
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 500,
  },
  linkBtn: {
    background: "none",
    border: "none",
    color: "#1565C0",
    cursor: "pointer",
    fontSize: 13,
    padding: 0,
    textDecoration: "underline",
  },
};
