import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ErrorDialog from "../components/common/ErrorDialog";
import LoadingSpinner from "../components/common/LoadingSpinner";
import TopBar from "../components/common/TopBar";
import type { PC, Dropdowns } from "../types/index";
import { useDropdowns } from "../hooks/useDropdowns";
import { useEmployees } from "../hooks/useEmployees";
import { usePcData } from "../hooks/usePcData";

type FieldType =
  | "text"
  | "number"
  | "date"
  | "select"
  | "textarea"
  | "employee";

type FieldDef = {
  label: string;
  key: keyof PC;
  type: FieldType;
  dropdownKey?: keyof Dropdowns;
  readOnlyInEdit?: boolean;
  alwaysReadOnly?: boolean;
  placeholder?: string;
};

const LEFT_SECTIONS: { title: string; fields: FieldDef[] }[] = [
  {
    title: "基本情報",
    fields: [
      {
        label: "番号",
        key: "PCNo",
        type: "text",
        readOnlyInEdit: true,
        placeholder: "例: PC-001",
      },
      {
        label: "PC名",
        key: "PCName",
        type: "text",
        placeholder: "例: TOMATO101",
      },
      { label: "製造社", key: "manufacture", type: "text" },
      { label: "モデル名", key: "modelName", type: "text" },
      { label: "CPU", key: "CPU", type: "text" },
      { label: "RAM", key: "RAM", type: "number" },
      {
        label: "以前使用者",
        key: "prevUser",
        type: "text",
        alwaysReadOnly: true,
      },
    ],
  },
  {
    title: "OS情報",
    fields: [
      { label: "OS名", key: "OSName", type: "text" },
      { label: "OS Licence", key: "OSLicence", type: "text" },
      {
        label: "バックアップイメージ作成日",
        key: "backupImageCreationDate",
        type: "date",
      },
      { label: "購入日", key: "purchaseDate", type: "date" },
    ],
  },
  {
    title: "Office・Network",
    fields: [
      { label: "Office Licence", key: "OfficeLicence", type: "text" },
      {
        label: "IP",
        key: "IP",
        type: "text",
        placeholder: "例: 192.168.1.100",
      },
    ],
  },
];

const RIGHT_FIELDS: FieldDef[] = [
  { label: "状況", key: "status", type: "select", dropdownKey: "status" },
  {
    label: "分類",
    key: "classification",
    type: "select",
    dropdownKey: "classification",
  },
  { label: "用途", key: "purpose", type: "select", dropdownKey: "purpose" },
  { label: "区分", key: "type", type: "select", dropdownKey: "type" },
  { label: "現在使用者", key: "user", type: "employee" },
  {
    label: "在/退職",
    key: "employmentStatus",
    type: "text",
    alwaysReadOnly: true,
  },
  { label: "場所", key: "place", type: "select", dropdownKey: "place" },
  { label: "貸出日", key: "lendingDate", type: "date" },
  { label: "状態", key: "state", type: "text" },
  { label: "備考", key: "note", type: "textarea" },
];

type FieldRendererProps = {
  def: FieldDef;
  form: Partial<PC>;
  isEditMode: boolean;
  dropdowns: Dropdowns | undefined;
  employeeSearch: string;
  showEmployeeList: boolean;
  filteredEmployees: { employeeNo: number; name: string; type: string }[];
  onChangeField: (key: keyof PC, value: string | number) => void;
  onEmployeeSearchChange: (val: string) => void;
  onEmployeeSelect: (emp: { name: string; type: string }) => void;
  onEmployeeListShow: (show: boolean) => void;
};

function FieldRenderer({
  def,
  form,
  isEditMode,
  dropdowns,
  employeeSearch,
  showEmployeeList,
  filteredEmployees,
  onChangeField,
  onEmployeeSearchChange,
  onEmployeeSelect,
  onEmployeeListShow,
}: FieldRendererProps) {
  const {
    label,
    key,
    type,
    dropdownKey,
    readOnlyInEdit,
    alwaysReadOnly,
    placeholder,
  } = def;
  const isReadOnly = alwaysReadOnly || (isEditMode && readOnlyInEdit);
  const rawValue = form[key];
  const strValue =
    rawValue === undefined || rawValue === null ? "" : String(rawValue);

  if (type === "employee") {
    return (
      <div style={styles.field}>
        <label style={styles.label}>{label}</label>
        <div style={styles.employeeWrap}>
          <input
            style={styles.input}
            type="text"
            placeholder="名前または番号で検索..."
            value={employeeSearch}
            onChange={(e) => onEmployeeSearchChange(e.target.value)}
            onFocus={() => onEmployeeListShow(true)}
            onBlur={() => setTimeout(() => onEmployeeListShow(false), 150)}
          />
          {showEmployeeList && filteredEmployees.length > 0 && (
            <ul style={styles.employeeList}>
              {filteredEmployees.slice(0, 20).map((emp) => (
                <li
                  key={emp.employeeNo}
                  style={styles.employeeItem}
                  onMouseDown={() => onEmployeeSelect(emp)}
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
    );
  }

  if (type === "select" && dropdownKey) {
    const options = dropdowns?.[dropdownKey] ?? [];
    return (
      <div style={styles.field}>
        <label style={styles.label}>{label}</label>
        <select
          style={styles.select}
          value={strValue}
          onChange={(e) => onChangeField(key, e.target.value)}
        >
          <option value="">選択してください</option>
          {options.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div style={styles.field}>
        <label style={styles.label}>{label}</label>
        <textarea
          style={styles.textarea}
          value={strValue}
          onChange={(e) => onChangeField(key, e.target.value)}
          rows={3}
        />
      </div>
    );
  }

  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      <input
        style={{ ...styles.input, ...(isReadOnly ? styles.inputReadOnly : {}) }}
        type={type}
        placeholder={placeholder ?? ""}
        value={strValue}
        readOnly={isReadOnly}
        onChange={(e) =>
          !isReadOnly &&
          onChangeField(
            key,
            type === "number" ? Number(e.target.value) : e.target.value,
          )
        }
      />
    </div>
  );
}

export default function PcRegisterPage() {
  const { no } = useParams<{ no: string }>();
  const navigate = useNavigate();
  const isEditMode = no !== undefined;

  const {
    fetchPc,
    savePc,
    registerPc,
    loading,
    saving,
    error: hookError,
  } = usePcData();
  const { dropdowns } = useDropdowns();
  const { employees } = useEmployees();

  const [form, setForm] = useState<Partial<PC>>({});
  const [dialogError, setDialogError] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [showEmployeeList, setShowEmployeeList] = useState(false);

  useEffect(() => {
    if (!isEditMode) return;
    fetchPc(no!).then((data) => {
      if (data) {
        setForm(data);
        setEmployeeSearch(data.user ?? "");
      } else {
        setDialogError(`番号「${no}」のPCが見つかりません。`);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [no]);

  const handleChangeField = (key: keyof PC, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleEmployeeSearchChange = (val: string) => {
    setEmployeeSearch(val);
    setShowEmployeeList(true);
    if (val === "") {
      handleChangeField("user", "");
      handleChangeField("employmentStatus", "");
    }
  };

  const handleEmployeeSelect = (emp: { name: string; type: string }) => {
    setForm((prev) => ({
      ...prev,
      user: emp.name,
      employmentStatus: emp.type,
    }));
    setEmployeeSearch(emp.name);
    setShowEmployeeList(false);
  };

  const handleSave = async () => {
    if (!form.PCNo) {
      setDialogError("番号は必須です。");
      return;
    }
    if (!form.PCName) {
      setDialogError("PC名は必須です。");
      return;
    }

    if (isEditMode) {
      const ok = await savePc(form);
      if (ok) navigate("/pc-list");
    } else {
      const ok = await registerPc(form);
      if (ok) navigate(`/qr-print/${form.PCNo}`);
    }
  };

  const filteredEmployees = (employees ?? []).filter((e) => {
    const q = employeeSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      String(e.name).toLowerCase().includes(q) ||
      String(e.employeeNo).includes(q)
    );
  });

  const sharedFieldProps = {
    form,
    isEditMode,
    dropdowns,
    employeeSearch,
    showEmployeeList,
    filteredEmployees,
    onChangeField: handleChangeField,
    onEmployeeSearchChange: handleEmployeeSearchChange,
    onEmployeeSelect: handleEmployeeSelect,
    onEmployeeListShow: setShowEmployeeList,
  };

  if (loading) return <LoadingSpinner message="読み込み中..." />;

  const displayError = hookError || dialogError;

  return (
    <div style={styles.page}>
      <TopBar
        title={isEditMode ? "PCデータ更新" : "PC登録"}
        showBack
        onBack={() => navigate("/pc-list")}
      />

      <div style={styles.body}>
        <div style={styles.leftCol}>
          {LEFT_SECTIONS.map((section) => (
            <div key={section.title} style={styles.panel}>
              <h3 style={styles.sectionTitle}>{section.title}</h3>
              {section.fields.map((def) => (
                <FieldRenderer key={def.key} def={def} {...sharedFieldProps} />
              ))}
            </div>
          ))}
        </div>

        <div style={styles.rightCol}>
          <div style={styles.rightPanel}>
            <h3 style={styles.sectionTitle}>ステータス更新</h3>
            {RIGHT_FIELDS.map((def) => (
              <FieldRenderer key={def.key} def={def} {...sharedFieldProps} />
            ))}

            <div className="register-spacer" style={styles.spacer} />

            <div style={styles.buttonRow}>
              <button
                style={{ ...styles.saveBtn, opacity: saving ? 0.5 : 1 }}
                onClick={handleSave}
                disabled={saving}
              >
                ✓ {saving ? "保存中..." : "保存"}
              </button>
              <button
                style={{
                  ...styles.saveBtn,
                  background: "#FFB74D",
                  opacity: saving ? 0.5 : 1,
                }}
                onClick={handleSave}
                disabled={saving}
              >
                <svg
                  viewBox="0 0 384 512"
                  height="14"
                  width="11"
                  fill="currentColor"
                >
                  <path d="M64 48l112 0 0 88c0 39.8 32.2 72 72 72l88 0 0 240c0 8.8-7.2 16-16 16L64 464c-8.8 0-16-7.2-16-16L48 64c0-8.8 7.2-16 16-16zM224 67.9l92.1 92.1-68.1 0c-13.3 0-24-10.7-24-24l0-68.1zM64 0C28.7 0 0 28.7 0 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-261.5c0-17-6.7-33.3-18.7-45.3L242.7 18.7C230.7 6.7 214.5 0 197.5 0L64 0z" />
                </svg>
                <span style={{ marginLeft: 5 }}>{"QR生成"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {displayError && (
        <ErrorDialog
          message={displayError}
          onClose={() => {
            setDialogError("");
            if (hookError) navigate("/pc-list");
          }}
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
  body: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    gap: 12,
    padding: 16,
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "stretch",
  },
  leftCol: {
    maxWidth: 440,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  rightCol: {
    maxWidth: 440,
    width: "100%",
    display: "flex",
    flexDirection: "column",
  },
  panel: {
    background: "#fff",
    borderRadius: 10,
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
  },
  rightPanel: {
    background: "#fff",
    borderRadius: 10,
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
    flex: 1,
  },
  spacer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 500,
    margin: "0 0 8px",
    paddingBottom: 8,
    borderBottom: "1px solid #e0e0e0",
    color: "#222",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    color: "#666",
    fontWeight: 500,
  },
  input: {
    padding: "8px 10px",
    borderRadius: 6,
    border: "1px solid #d0d0d0",
    fontSize: 14,
    background: "#fff",
    boxSizing: "border-box" as const,
    width: "100%",
  },
  inputReadOnly: {
    background: "#1C1C1C80",
    cursor: "not-allowed",
    border: "1px solid transparent",
  },
  select: {
    padding: "8px 10px",
    borderRadius: 6,
    border: "1px solid #d0d0d0",
    fontSize: 14,
    background: "#fff",
    width: "100%",
  },
  textarea: {
    padding: "8px 10px",
    borderRadius: 6,
    border: "1px solid #d0d0d0",
    fontSize: 14,
    resize: "vertical" as const,
    fontFamily: "inherit",
    width: "100%",
    boxSizing: "border-box" as const,
  },
  employeeWrap: {
    position: "relative" as const,
  },
  employeeList: {
    position: "absolute" as const,
    top: "100%",
    left: 0,
    right: 0,
    background: "#fff",
    border: "1px solid #d0d0d0",
    borderRadius: 6,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    maxHeight: 200,
    overflowY: "auto" as const,
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
  buttonRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 16,
    paddingTop: 12,
    borderTop: "1px solid #e0e0e0",
  },
  saveBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "9px 16px",
    background: "#FF6F20",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
  },
};

const SPACER_STYLE_ID = "pc-register-spacer-style";
if (
  typeof document !== "undefined" &&
  !document.getElementById(SPACER_STYLE_ID)
) {
  const style = document.createElement("style");
  style.id = SPACER_STYLE_ID;
  style.textContent =
    "@media (max-width: 920px) { .register-spacer { display: none !important; } }";
  document.head.appendChild(style);
}
