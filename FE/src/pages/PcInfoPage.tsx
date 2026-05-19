import { useNavigate } from "react-router-dom";

import TopBar from "../components/common/TopBar";

export default function PcInfoPage() {
    const navigate = useNavigate();
    const pcName = "PC-12345"; 
  return <div>
        <TopBar
          title={`PC情報 — ${pcName}`}
          showBack={true}
          onBack={() => navigate("/")}
        />
        <div>PcInfoPage</div>
      </div>
}