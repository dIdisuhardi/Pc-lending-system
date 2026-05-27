import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import ErrorDialog from "../components/common/ErrorDialog";
import LoadingSpinner from "../components/common/LoadingSpinner";
import LoanDialog from "./LoanFormPage";
import PcInfoReadOnly from "../components/pc/PcInfoReadOnly";
import PcStatusForm from "../components/pc/PcStatusForm";
import TopBar from "../components/common/TopBar";
import type { PC } from "../types/index";
import { useAuth } from "../hooks/useAuth";
import { useDropdowns } from "../hooks/useDropdowns";
import { useEmployees } from "../hooks/useEmployees";
import { usePcData } from "../hooks/usePcData";

export default function PcInfoPage() {
  const { no } = useParams<{ no: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { userEmail } = useAuth();

  const { loading, saving, error: pcError, fetchPc, savePc } = usePcData();
  const { dropdowns, loading: dropdownsLoading } = useDropdowns();
  const { employees, loading: employeesLoading } = useEmployees();

  const statePC = (location.state as { pc?: PC } | null)?.pc ?? null;

  const [pc, setPc] = useState<PC | null>(statePC);
  const [form, setForm] = useState<Partial<PC>>(statePC ?? {});
  const [error, setError] = useState<string>("");
  const displayError = error || pcError;
  const [isLending, setIsLending] = useState(false);
  const [showLoanDialog, setShowLoanDialog] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof PC, string>>
  >({});

  useEffect(() => {
    if (statePC || !no) return;
    const load = async () => {
      const data = await fetchPc(no);
      if (!data) {
        setError(`番号「${no}」のPCが見つかりません。`);
        return;
      }
      setPc(data);
      setForm(data);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [no]);

  const validateField = (key: keyof PC, value: string) => {
    switch (key) {
      case "status":
        return value.trim() ? "" : "状況は必須です";
      case "classification":
        return value.trim() ? "" : "分類は必須です";
      default:
        return "";
    }
  };

  const validate = () => {
    const errors: Partial<Record<keyof PC, string>> = {};
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
    if (!form.PCNo) return;
    if (!validate()) return;
    const ok = await savePc(form, {
      editor: userEmail,
      editType: "PC貸出",
    });
    if (!ok) return;
    setIsLending((form.place == "2現場" || form.place == "3自宅") ?? false);
  };

  const handleLending = () => setShowLoanDialog(true);

  if (loading || dropdownsLoading || employeesLoading)
    return <LoadingSpinner message="読み込み中..." />;

  return (
    <div style={styles.page}>
      <TopBar
        title={`PC情報-${form.PCName}`}
        showBack
        onBack={() => navigate("/")}
        showPcList
      />

      <div style={styles.body}>
        <div style={styles.container}>{pc && <PcInfoReadOnly pc={pc} />}</div>
        <div style={styles.container}>
          <PcStatusForm
            form={form}
            dropdowns={dropdowns}
            employees={employees}
            isLending={isLending}
            fieldErrors={fieldErrors}
            onChange={handleFormChange}
            onSave={handleSave}
            onLending={handleLending}
            saving={saving}
          />
        </div>
      </div>

      {showLoanDialog && (
        <LoanDialog form={form} onClose={() => setShowLoanDialog(false)} />
      )}

      {displayError && (
        <ErrorDialog
          message={displayError}
          onClose={() => {
            setError("");
            navigate("/");
          }}
        />
      )}
    </div>
  );
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
  },
  container: {
    maxWidth: 720,
    width: "100%",
    margin: "0 auto",
  },
};
