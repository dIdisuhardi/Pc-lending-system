import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";

import ErrorDialog from "../components/common/ErrorDialog";
import LoadingSpinner from "../components/common/LoadingSpinner";
import PcInfo from "../components/pc/PcInfo";
import PcStatusForm from "../components/pc/PcStatusForm";
import QrDialog from "./QrPrintPage";
import TopBar from "../components/common/TopBar";
import type { PC } from "../types/index";
import { useAuth } from "../hooks/useAuth";
import { useDropdowns } from "../hooks/useDropdowns";
import { useEmployees } from "../hooks/useEmployees";
import { usePcData } from "../hooks/usePcData";
import LoanDialog from "./LoanFormPage";

export default function PcRegisterPage() {
  const { no } = useParams<{ no: string }>();
  const navigate = useNavigate();
  const isEditMode = no !== undefined;
  const { userEmail } = useAuth();

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
  const location = useLocation();
  const statePC = (location.state as { pc?: PC } | null)?.pc ?? null;
  const LENDING_CLASSIFICATIONS = [
    "2現場貸出",
    "5貸出(社内開発)",
    "6貸出(現場)",
  ];

  const [form, setForm] = useState<Partial<PC>>(statePC ?? {});
  const [dialogError, setDialogError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof PC, string>>
  >({});
  const [activateLending, setActivateLending] = useState(false);
  const [activateQr, setActivateQr] = useState(isEditMode);
  const [showLoanDialog, setShowLoanDialog] = useState(false);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    if (!isEditMode) return;
    if (statePC) return;
    fetchPc(no!).then((data) => {
      if (data) setForm(data);
      else setDialogError(`番号「${no}」のPCが見つかりません。`);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [no]);

  const validateField = (key: keyof PC, value: string) => {
    const REQUIRED_FIELDS: Partial<Record<keyof PC, string>> = {
      PCNo: "番号は必須です",
      PCName: "PC名は必須です",
      manufacture: "製造社は必須です",
      modelName: "モデル名は必須です",
      CPU: "CPUは必須です",
      RAM: "RAMは必須です",
      status: "状況は必須です",
      classification: "分類は必須です",
    };
    return REQUIRED_FIELDS[key] && !String(value ?? "").trim()
      ? REQUIRED_FIELDS[key]!
      : "";
  };

  const validate = () => {
    const errors: Partial<Record<keyof PC, string>> = {};
    const REQUIRED_KEYS: (keyof PC)[] = [
      "PCNo",
      "PCName",
      "manufacture",
      "modelName",
      "CPU",
      "RAM",
      "status",
      "classification",
    ];
    REQUIRED_KEYS.forEach((key) => {
      const err = validateField(key, String(form[key] ?? ""));
      if (err) errors[key] = err;
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
      const ok = await savePc(form, { editor: userEmail, editType: "PC編集" });
      if (ok) setActivateQr(true);
    } else {
      const ok = await registerPc(form, { editor: userEmail });
      if (ok) {
        setActivateQr(true);
        setActivateLending(true);
      }
    }
  };

  const handleLending = () => setShowLoanDialog(true);
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
          <PcInfo
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
            isLending={
              LENDING_CLASSIFICATIONS.includes(form.classification ?? "") &&
              activateLending
            }
            isGenerateQr={activateQr}
            onChange={handleFormChange}
            onSave={handleSave}
            fieldErrors={fieldErrors}
            onLending={handleLending}
            onGenerateQr={handleQr}
            saving={saving}
          />
        </div>
      </div>

      {showLoanDialog && (
        <LoanDialog form={form} onClose={() => setShowLoanDialog(false)} />
      )}

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
};
