import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { PC } from "../types/index";

Font.register({
  family: "NotoSansCJK",
  src: "/font/NotoSansCJKkr-Regular.otf",
});

const styles = StyleSheet.create({
  page: {
    padding: "60 72",
    fontSize: 12,
    fontFamily: "NotoSansCJK",
    color: "#111",
  },
  title: {
    fontSize: 22,
    textAlign: "center",
    letterSpacing: 8,
    marginBottom: 48,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 12,
    width: 220,
    flexShrink: 0,
  },
  fieldValue: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#111",
    paddingBottom: 2,
    fontSize: 12,
    minHeight: 18,
  },
  bodyText: {
    fontSize: 12,
    lineHeight: 1.8,
    marginTop: 32,
    marginBottom: 48,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
  },
  dateText: {
    fontSize: 12,
  },
  dateBlank: {
    width: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#111",
    marginBottom: 2,
  },
});

type LoanDocumentProps = {
  form: Partial<PC>;
  userEmail: string;
};

const Field = ({ label, value }: { label: string; value?: string }) => (
  <View style={styles.fieldRow}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.fieldValue}>{value ?? ""}</Text>
  </View>
);

export default function LoanDocument({ form }: LoanDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>貸 出 証</Text>

        <Field label="名前 :" value={form.user} />

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>日付 :</Text>
          <Text style={styles.fieldValue}>
            {form.lendingDate
              ? `${new Date(form.lendingDate).getFullYear()}年${
                  new Date(form.lendingDate).getMonth() + 1
                }月${new Date(form.lendingDate).getDate()}日`
              : ""}
          </Text>
        </View>

        <Field label="品名（例： TOMATO101）:" value={form.PCName} />
        <Field
          label="以前使用した品名（例： TOMATO100）: "
          value={form.prevUser ?? ""}
        />
        <Field label="使用場所（例: 自宅/本社/現場）:" value={form.place} />

        <Text style={styles.bodyText}>
          上記の品目をプロジェクト開発用として貸出します。{"\n"}
          プロジェクトが終了したら会社に返納します。
        </Text>

        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.bodyText}>
            {new Date().getFullYear()}年{new Date().getMonth() + 1}月
            {new Date().getDate()}日
          </Text>
        </View>
      </Page>
    </Document>
  );
}
