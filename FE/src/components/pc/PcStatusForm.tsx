import { useState, useMemo } from "react";

import type { PC, Dropdowns, Employee } from "../../types/index";

type PcStatusFormProps = {
  form: Partial<PC>;
  dropdowns: Dropdowns | undefined;
  employees: Employee[] | undefined;
  isLending: boolean;
  onChange: (form: Partial<PC>) => void;
  onSave: () => void;
  onLending: () => void;
  saving?: boolean;
};

export default function PcStatusForm({
  form,
  dropdowns,
  employees,
  isLending,
  onChange,
  onSave,
  onLending,
  saving = false,
}: PcStatusFormProps) {
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [showEmployeeList, setShowEmployeeList] = useState(false);
  const handleClassChange = (value: string) => {
    onChange({
      ...form,
      classification: value,
      purpose: "",
      type: "",
      place: "",
    });
  };

  const handleEmployeeSelect = (emp: Employee) => {
    onChange({
      ...form,
      user: String(emp.name),
      employmentStatus: String(emp.type),
    });
    setEmployeeSearch(String(emp.name));
    setShowEmployeeList(false);
  };

  const filteredEmployees = useMemo(() => {
    const q = employeeSearch.trim().toLowerCase();
    if (!q) return employees;
    return (employees ?? []).filter(
      (e) =>
        String(e.name).toLowerCase().includes(q) ||
        String(e.employeeNo).includes(q),
    );
  }, [employees, employeeSearch]);

  return (
    <div style={styles.wrap}>
      <h3 style={styles.sectionTitle}>ステータス更新</h3>

      <div style={styles.field}>
        <label style={styles.label}>状況</label>
        <select
          style={styles.select}
          value={form.status ?? ""}
          onChange={(e) => onChange({ ...form, status: e.target.value })}
        >
          <option value="">選択してください</option>
          {(dropdowns?.status ?? []).map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>分類</label>
        <select
          style={styles.select}
          value={form.classification ?? ""}
          onChange={(e) => handleClassChange(e.target.value)}
        >
          <option value="">選択してください</option>
          {(dropdowns?.classification ?? []).map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>用途</label>
        <select
          style={styles.select}
          value={form.purpose ?? ""}
          onChange={(e) => onChange({ ...form, purpose: e.target.value })}
        >
          <option value="">選択してください</option>
          {(dropdowns?.purpose ?? []).map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>区分</label>
        <select
          style={styles.select}
          value={form.type ?? ""}
          onChange={(e) => onChange({ ...form, type: e.target.value })}
        >
          <option value="">選択してください</option>
          {(dropdowns?.type ?? []).map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>現在使用者</label>
        <div style={styles.employeeWrap}>
          <input
            style={styles.searchInput}
            type="text"
            placeholder="名前または番号で検索..."
            value={employeeSearch || form.user || ""}
            onChange={(e) => {
              setEmployeeSearch(e.target.value);
              setShowEmployeeList(true);
              if (e.target.value === "") {
                onChange({ ...form, user: "", employmentStatus: "" });
              }
            }}
            onFocus={() => setShowEmployeeList(true)}
            onBlur={() => setTimeout(() => setShowEmployeeList(false), 150)}
          />
          {showEmployeeList &&
            filteredEmployees &&
            filteredEmployees.length > 0 && (
              <ul style={styles.employeeList}>
                {filteredEmployees.slice(0, 20).map((emp) => (
                  <li
                    key={emp.employeeNo}
                    style={styles.employeeItem}
                    onMouseDown={() => handleEmployeeSelect(emp)}
                  >
                    <span style={styles.empName}>{emp.name}</span>
                    <span style={styles.empMeta}>
                      #{String(emp.employeeNo)}・{emp.type}
                    </span>
                  </li>
                ))}
              </ul>
            )}
        </div>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>在/退職</label>
        <div style={styles.employeeWrap}>
          <input
            style={{
              ...styles.searchInput,
              background: "#1C1C1C80",
              cursor: "not-allowed",
            }}
            type="text"
            value={form.employmentStatus || ""}
            readOnly
          />
        </div>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>場所</label>
        <select
          style={styles.select}
          value={form.place ?? ""}
          onChange={(e) => onChange({ ...form, place: e.target.value })}
        >
          <option value="">選択してください</option>
          {(dropdowns?.place ?? []).map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>貸出日</label>
        <input
          type="date"
          style={{
            ...styles.select,
            background:
              form.place != "2現場" && form.place != "3自宅"
                ? "#1C1C1C80"
                : styles.select.background,
            cursor:
              form.place != "2現場" && form.place != "3自宅"
                ? "not-allowed"
                : styles.select.cursor,
          }}
          value={form.lendingDate ?? ""}
          onChange={(e) => onChange({ ...form, lendingDate: e.target.value })}
          disabled={(form.place != "2現場" && form.place != "3自宅") ?? false}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>備考</label>
        <textarea
          style={styles.textarea}
          value={form.note ?? ""}
          onChange={(e) => onChange({ ...form, note: e.target.value })}
          rows={3}
        />
      </div>

      <div style={styles.buttonRow}>
        <button
          style={{ ...styles.saveButton, opacity: saving ? 0.4 : 1 }}
          onClick={onSave}
          disabled={saving}
        >
          ✓<span style={{ marginLeft: 6 }}></span>
          {saving ? "保存中..." : "保存"}
        </button>

        <button
          style={{
            ...styles.lendingButton,
            opacity: isLending ? 1 : 0.4,
            cursor: isLending ? "pointer" : "not-allowed",
          }}
          onClick={onLending}
          disabled={!isLending || saving}
        >
          <svg viewBox="0 0 384 512" height="16" width="12" fill="currentColor">
            <path d="M64 48l112 0 0 88c0 39.8 32.2 72 72 72l88 0 0 240c0 8.8-7.2 16-16 16L64 464c-8.8 0-16-7.2-16-16L48 64c0-8.8 7.2-16 16-16zM224 67.9l92.1 92.1-68.1 0c-13.3 0-24-10.7-24-24l0-68.1zM64 0C28.7 0 0 28.7 0 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-261.5c0-17-6.7-33.3-18.7-45.3L242.7 18.7C230.7 6.7 214.5 0 197.5 0L64 0zm56 256c-13.3 0-24 10.7-24 24s10.7 24 24 24l144 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-144 0zm0 96c-13.3 0-24 10.7-24 24s10.7 24 24 24l144 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-144 0z" />
          </svg>
          <span style={{ marginLeft: 6 }}></span>
          貸出処理
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 500,
    margin: 0,
    paddingBottom: 8,
    borderBottom: "1px solid #e0e0e0",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  label: {
    fontSize: 12,
    color: "#666",
    fontWeight: 500,
  },
  select: {
    padding: "8px 10px",
    borderRadius: 6,
    border: "1px solid #d0d0d0",
    fontSize: 14,
    background: "#fff",
  },
  employeeWrap: {
    position: "relative",
  },
  searchInput: {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 6,
    border: "1px solid #d0d0d0",
    fontSize: 14,
    boxSizing: "border-box",
  },
  employeeList: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    background: "#fff",
    border: "1px solid #d0d0d0",
    borderRadius: 6,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    maxHeight: 200,
    overflowY: "auto",
    zIndex: 100,
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  employeeItem: {
    padding: "8px 12px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #f0f0f0",
    fontSize: 13,
  },
  empName: {
    fontWeight: 500,
  },
  empMeta: {
    fontSize: 11,
    color: "#888",
  },
  statusBadge: {
    display: "inline-block",
    fontSize: 11,
    padding: "2px 8px",
    borderRadius: 20,
    marginTop: 4,
    fontWeight: 500,
  },
  textarea: {
    padding: "8px 10px",
    borderRadius: 6,
    border: "1px solid #d0d0d0",
    fontSize: 14,
    resize: "vertical",
    fontFamily: "inherit",
  },
  buttonRow: {
    display: "flex",
    gap: 10,
    marginTop: 8,
    justifyContent: "flex-end",
  },
  saveButton: {
    width: "25%",
    padding: "10px 0",
    background: "#FF6F20",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    fontSize: 16,
    cursor: "pointer",
    fontWeight: 500,
  },
  lendingButton: {
    width: "25%",
    padding: "10px 0",
    background: "#FFB74D",
    color: "#000",
    border: "none",
    borderRadius: 4,
    fontSize: 16,
    fontWeight: 500,
  },
};
