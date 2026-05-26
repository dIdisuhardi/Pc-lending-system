import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ErrorDialog from "../components/common/ErrorDialog";
import LoadingSpinner from "../components/common/LoadingSpinner";
import PcInfoReadOnly from "../components/pc/PcInfoReadOnly";
import PcStatusForm from "../components/pc/PcStatusForm";
import QrDialog from "./QrPrintPage";
import TopBar from "../components/common/TopBar";
import type { PC } from "../types/index";
import { useDropdowns } from "../hooks/useDropdowns";
import { useEmployees } from "../hooks/useEmployees";
import { usePcData } from "../hooks/usePcData";

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
  const { dropdowns, loading: dropdownsLoading } = useDropdowns();
  const { employees, loading: employeesLoading } = useEmployees();

  const [form, setForm] = useState<Partial<PC>>({});
  const [dialogError, setDialogError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof PC, string>>
  >({});
  const [saved, setSaved] = useState(isEditMode);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    if (!isEditMode) return;
    fetchPc(no!).then((data) => {
      if (data) setForm(data);
      else setDialogError(`番号「${no}」のPCが見つかりません。`);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [no]);

  const validateField = (key: keyof PC, value: string) => {
    const strValue = String(value ?? "");
    switch (key) {
      case "PCNo":
        return strValue.trim() ? "" : "番号は必須です";
      case "status":
        return strValue.trim() ? "" : "状況は必須です";
      case "classification":
        return strValue.trim() ? "" : "分類は必須です";
      default:
        return "";
    }
  };

  const validate = () => {
    const errors: Partial<Record<keyof PC, string>> = {};

    errors.PCNo = validateField("PCNo", form.PCNo || "");
    errors.status = validateField("status", form.status || "");
    errors.classification = validateField(
      "classification",
      form.classification || "",
    );

    Object.keys(errors).forEach((key) => {
      if (!errors[key as keyof PC]) {
        delete errors[key as keyof PC];
      }
    });

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleFormChange = (updated: Partial<PC>) => {
    const newForm = {
      ...form,
      ...updated,
    };

    setForm(newForm);

    const newErrors = { ...fieldErrors };

    (Object.keys(updated) as (keyof PC)[]).forEach((key) => {
      const value = String(newForm[key] ?? "");
      const error = validateField(key, value);

      if (error) {
        newErrors[key] = error;
      } else {
        delete newErrors[key];
      }
    });

    setFieldErrors(newErrors);
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (isEditMode) {
      await savePc(form);
    } else {
      const ok = await registerPc(form);
      if (ok) setSaved(true);
    }
  };

  const handleQr = () => setShowQr(true);

  if (loading || dropdownsLoading || employeesLoading)
    return <LoadingSpinner message="読み込み中..." />;

  const displayError = hookError || dialogError;

  return (
    <div style={styles.page}>
      <TopBar
        title={isEditMode ? "PCデータ更新" : "PC登録"}
        showBack
        onBack={() => navigate("/pc-list")}
      />

      <div style={styles.body}>
        <div style={styles.container}>
          <PcInfoReadOnly
            form={form}
            onChange={handleFormChange}
            fieldErrors={fieldErrors}
            isEditMode={isEditMode}
          />
        </div>

        <div style={styles.container}>
          <PcStatusForm
            form={form}
            dropdowns={dropdowns}
            employees={employees}
            isLending={false}
            onChange={handleFormChange}
            onSave={handleSave}
            fieldErrors={fieldErrors}
            onLending={() => {}}
            saving={saving}
            renderButtons={() => (
              <div style={styles.buttonRow}>
                <button
                  style={{
                    ...styles.btn,
                    background: "#FF6F20",
                    opacity: saving ? 0.5 : 1,
                  }}
                  onClick={handleSave}
                  disabled={saving}
                >
                  ✓ {saving ? "保存中..." : "保存"}
                </button>
                <button
                  style={{
                    ...styles.btn,
                    background: "#FFB74D80",
                    color: "#000",
                    opacity: saved ? 1 : 0.4,
                    cursor: saved ? "pointer" : "not-allowed",
                  }}
                  onClick={handleQr}
                  disabled={!saved}
                  title={saved ? "" : "先に保存してください"}
                >
                  <svg
                    viewBox="0 0 384 512"
                    height="14"
                    width="11"
                    fill="currentColor"
                  >
                    <path d="M64 160l64 0 0-64-64 0 0 64zM0 80C0 53.5 21.5 32 48 32l96 0c26.5 0 48 21.5 48 48l0 96c0 26.5-21.5 48-48 48l-96 0c-26.5 0-48-21.5-48-48L0 80zM64 416l64 0 0-64-64 0 0 64zM0 336c0-26.5 21.5-48 48-48l96 0c26.5 0 48 21.5 48 48l0 96c0 26.5-21.5 48-48 48l-96 0c-26.5 0-48-21.5-48-48l0-96zM320 96l0 64 64 0 0-64-64 0zM304 32l96 0c26.5 0 48 21.5 48 48l0 96c0 26.5-21.5 48-48 48l-96 0c-26.5 0-48-21.5-48-48l0-96c0-26.5 21.5-48 48-48zM288 352a32 32 0 1 1 0-64 32 32 0 1 1 0 64zm0 64c17.7 0 32 14.3 32 32s-14.3 32-32 32-32-14.3-32-32 14.3-32 32-32zm96 32c0-17.7 14.3-32 32-32s32 14.3 32 32-14.3 32-32 32-32-14.3-32-32zm32-96a32 32 0 1 1 0-64 32 32 0 1 1 0 64zm-32 32a32 32 0 1 1 -64 0 32 32 0 1 1 64 0z" />
                  </svg>
                  <span style={{ marginLeft: 5 }}>QR生成</span>
                </button>
              </div>
            )}
          />
        </div>
      </div>

      {showQr && (
        <QrDialog
          pcNo={String(form.PCNo ?? "")}
          pcName={String(form.PCName ?? "")}
          onClose={() => setShowQr(false)}
        />
      )}

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

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
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
  container: {
    maxWidth: 720,
    width: "100%",
    margin: "0 auto",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    padding: "12px 16px",
    marginTop: "auto",
  },
  btn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "9px 16px",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
  },
};
