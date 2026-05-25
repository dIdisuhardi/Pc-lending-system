import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import ErrorDialog from "../components/common/ErrorDialog";
import LoadingSpinner from "../components/common/LoadingSpinner";
import LoanDialog from "./LoanFormPage";
import PcInfoReadOnly from "../components/pc/PcInfoReadOnly";
import PcStatusForm from "../components/pc/PcStatusForm";
import TopBar from "../components/common/TopBar";
import type { PC } from "../types/index";
import { useDropdowns } from "../hooks/useDropdowns";
import { useEmployees } from "../hooks/useEmployees";
import { usePcData } from "../hooks/usePcData";

export default function PcInfoPage() {
  const { no } = useParams<{ no: string }>();
  const navigate = useNavigate();
  const location = useLocation();

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
  }, [no, fetchPc, statePC]);

  const handleSave = async () => {
    if (!form.PCNo) return;
    const ok = await savePc(form);
    if (!ok) return;
    setIsLending((form.place == "2現場" || form.place == "3自宅") ?? false);
  };

  const handleLending = () => setShowLoanDialog(true);

  if (loading || dropdownsLoading || employeesLoading)
    return <LoadingSpinner message="読み込み中..." />;

  return (
    <div style={styles.page}>
      <TopBar title="PC情報" showBack onBack={() => navigate("/")} showPcList />

      <div style={styles.body}>
        <div style={styles.container}>{pc && <PcInfoReadOnly pc={pc} />}</div>
        <div style={styles.container}>
          <PcStatusForm
            form={form}
            dropdowns={dropdowns}
            employees={employees}
            isLending={isLending}
            onChange={(updated) => {
              setForm(updated);
            }}
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
  },
  container: {
    maxWidth: 720,
    width: "100%",
    margin: "0 auto",
  },
};
