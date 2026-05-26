import type { PC } from "../../types/index";

type FieldDef = {
  label: string;
  key: keyof PC;
  type?: "text" | "number" | "date";
  alwaysReadOnly?: boolean;
  placeholder?: string;
  isIp?: boolean;
  required?: boolean;
  readOnlyInEdit?: boolean;
};

type Section = {
  title: string;
  fields: FieldDef[];
  registerOnly?: boolean;
};

const SECTIONS: Section[] = [
  {
    title: "基本情報",
    fields: [
      { label: "番号", key: "PCNo", placeholder: "例: PC-001", required: true, readOnlyInEdit: true },
      { label: "PC名", key: "PCName", placeholder: "例: TOMATO101" },
      { label: "製造社", key: "manufacture" },
      { label: "モデル名", key: "modelName" },
      { label: "CPU", key: "CPU" },
      { label: "RAM", key: "RAM", type: "number" },
      { label: "以前使用者", key: "prevUser", alwaysReadOnly: true },
    ],
  },
  {
    title: "OS情報",
    registerOnly: true,
    fields: [
      { label: "OS名", key: "OSName" },
      { label: "OS Licence", key: "OSLicence" },
    ],
  },
  {
    title: "Office・Network",
    registerOnly: true,
    fields: [
      { label: "Office Licence", key: "OfficeLicence" },
      { label: "IP", key: "IP", placeholder: "例: 192.168.1.100", isIp: true },
    ],
  },
];

type ViewProps = {
  pc: PC;
  form?: never;
  onChange?: never;
  fieldErrors?: Partial<Record<keyof PC, string>>;
  isEditMode?: boolean;
};

type EditProps = {
  pc?: never;
  form: Partial<PC>;
  onChange: (updated: Partial<PC>) => void;
  fieldErrors?: Partial<Record<keyof PC, string>>;
  isEditMode?: boolean;
};

type PcInfoReadOnlyProps = ViewProps | EditProps;

export default function PcInfoReadOnly({
  pc,
  form,
  onChange,
  fieldErrors,
  isEditMode,
}: PcInfoReadOnlyProps) {
  const isEditable = onChange !== undefined;
  const data: Partial<PC> = pc ?? form ?? {};

  const visibleSections = isEditable
    ? SECTIONS
    : SECTIONS.filter((s) => !s.registerOnly);

  return (
    <div style={styles.wrap}>
      {visibleSections.map((section) => (
        <div key={section.title} style={styles.section}>
          <h3 style={styles.sectionTitle}>{section.title}</h3>

          {section.fields.map(
            ({
              label,
              key,
              type = "text",
              alwaysReadOnly,
              placeholder,
              isIp,
              required,
              readOnlyInEdit,
            }) => {
              const rawValue = data[key];
              const strValue =
                rawValue === undefined || rawValue === null
                  ? ""
                  : String(rawValue);
              const isReadOnly = !isEditable || alwaysReadOnly || (readOnlyInEdit && isEditMode);;

              return (
                <div key={key} style={styles.field}>
                  <span style={styles.label}>
                    {label}
                    {isEditable && required && (
                      <span style={styles.required}> *</span>
                    )}
                  </span>
                  {isIp ? (
                    <input
                      style={{
                        ...styles.value,
                        ...(isReadOnly
                          ? styles.valueReadOnly
                          : styles.valueEditable),
                      }}
                      type="text"
                      value={strValue}
                      readOnly={isReadOnly}
                      onChange={
                        isReadOnly || !onChange
                          ? () => {}
                          : (ip) => onChange({ ...form, [key]: ip })
                      }
                    />
                  ) : (
                    <input
                      style={{
                        ...styles.value,
                        ...(isReadOnly
                          ? styles.valueReadOnly
                          : styles.valueEditable),
                        ...(fieldErrors?.[key]
                          ? { borderColor: "#e53935" }
                          : {}),
                      }}
                      type={type}
                      value={strValue}
                      placeholder={
                        isEditable && !isReadOnly
                          ? (placeholder ?? "")
                          : undefined
                      }
                      readOnly={isReadOnly}
                      onChange={
                        isReadOnly || !onChange
                          ? undefined
                          : (e) =>
                              onChange({
                                ...form,
                                [key]:
                                  type === "number"
                                    ? Number(e.target.value)
                                    : e.target.value,
                              })
                      }
                    />
                  )}
                  {fieldErrors?.[key] && (
                    <span style={styles.fieldError}>{fieldErrors[key]}</span>
                  )}
                </div>
              );
            },
          )}
        </div>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    border: "1px solid #E2E4E5",
    borderRadius: 8,
    height: "100%",
    paddingBottom: 0,
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 500,
    margin: "0 0 6px",
    paddingBottom: 8,
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
    border: "none",
    fontSize: 14,
    width: "100%",
    boxSizing: "border-box" as const,
  },
  valueReadOnly: {
    background: "#1C1C1C80",
    border: "1px solid transparent",
    cursor: "default",
  },
  valueEditable: {
    background: "#fff",
    borderBottom: "1px solid #E2E4E5",
  },
  required: {
    color: "#e53935",
    fontSize: 12,
  },
  fieldError: {
    fontSize: 11,
    color: "#e53935",
    marginTop: 2,
  },
};
