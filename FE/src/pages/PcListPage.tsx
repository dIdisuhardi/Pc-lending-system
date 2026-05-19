import { useNavigate } from "react-router-dom";

import TopBar from "../components/common/TopBar";

export default function PcListPage() {
  const navigate = useNavigate();
  return (
    <div>
      <TopBar
        title="PC一覧"
        showBack={true}
        onBack={() => navigate("/")}
      />
      <div>PcListPage</div>
    </div>
  );
}
