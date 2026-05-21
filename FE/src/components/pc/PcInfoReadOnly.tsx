import type { PC } from "../../types/index";

type PcInfoReadOnlyProps = {
  pc: PC;
};

type FieldDef = {
  label: string;
  key: keyof PC;
};

const FIELDS: FieldDef[] = [
  { label: "番号", key: "PCNo" },
  { label: "PC名", key: "PCName" },
  { label: "製造社", key: "manufacture" },
  { label: "モデル名", key: "modelName" },
  { label: "CPU", key: "CPU" },
  { label: "RAM", key: "RAM" },
//   { label: "OS名", key: "OSName" },
//   { label: "OS Licence", key: "OSLicence" },
//   { label: "Office Licence", key: "OfficeLicence" },
//   { label: "購入日", key: "purchaseDate" },
//   { label: "バックアップ作成日", key: "backupImageCreationDate" },
//   { label: "IP", key: "IP" },
//   { label: "貸出日", key: "lendingDate" },
   { label: "以前使用者", key: "prevUser" },
];

export default function PcInfoReadOnly({ pc }: PcInfoReadOnlyProps) {
  return (
    <div style={styles.wrap}>
      <h3 style={styles.sectionTitle}>基本情報</h3>
        {FIELDS.map(({ label, key }) => {
          const value = pc[key];
          return (
            <div key={key} style={styles.field}>
              <span style={styles.label}>{label}</span>
              <input style={styles.value} value={String(value)} readOnly />
            </div>
          );
        })}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
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
  value: {
    padding: "8px 10px",
    borderRadius: 6,
    borderBottom: "1px solid #d0d0d0",
    background: "#1C1C1C80",
    fontSize: 14,
  },
};
