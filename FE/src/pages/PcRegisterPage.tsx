import { useNavigate } from "react-router-dom";

import TopBar from "../components/common/TopBar";

export default function PcRegisterPage() {
  const navigate = useNavigate();
  return (
    <div>
      <TopBar
        title="PCデータ更新"
        showBack={true}
        onBack={() => navigate("/pc-list")}
      />
      <div>PcRegisterPage</div>
    </div>
  );
}
