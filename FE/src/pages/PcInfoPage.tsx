import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { usePcData } from "../hooks/usePcData";
import { useDropdowns } from "../hooks/useDropdowns";
import { useEmployees } from "../hooks/useEmployees";
import type { PC } from "../types/index";
import TopBar from "../components/common/TopBar";
import PcInfoReadOnly from "../components/pc/PcInfoReadOnly";
import PcStatusForm from "../components/pc/PcStatusForm";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorDialog from "../components/common/ErrorDialog";

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
  const [isLending, setIsLending] = useState(false);

  useEffect(() => {
    if (pcError) setError(pcError);
  }, [pcError]);

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
      setIsLending(false);
    };
    load();
  }, [no, fetchPc, statePC]);

  const handleSave = async () => {
    if (!form.PCNo) return;
    const ok = await savePc(form);
    if (!ok) return;
    // 保存成功後: 貸出系分類が選択されていれば貸出ボタンを活性化（修正済み仕様）
    setIsLending(true);
  };

  const handleLending = () => {
    navigate(`/pc/${no}/loan`, { state: { form } });
  };

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
            onChange={setForm}
            onSave={handleSave}
            onLending={handleLending}
            saving={saving}
          />
        </div>
      </div>

      {error && (
        <ErrorDialog
          message={error}
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
