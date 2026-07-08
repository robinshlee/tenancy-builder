import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import type { AgreementFull } from "./types";

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 11, fontFamily: "Helvetica", lineHeight: 1.5, color: "#111111" },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
  reference: { fontSize: 10, color: "#555555", marginBottom: 20 },
  sectionHeading: { fontSize: 12, fontWeight: 700, marginTop: 16, marginBottom: 6 },
  paragraph: { marginBottom: 4 },
  indented: { marginLeft: 12, marginBottom: 4 },
  signatureBlock: { marginTop: 18 },
  signatureLine: { borderBottom: "1pt solid #333333", width: 260, marginBottom: 4, marginTop: 14 },
  footer: { position: "absolute", bottom: 24, left: 48, right: 48, fontSize: 9, color: "#888888", textAlign: "center" },
});

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function formatMoney(amount: number): string {
  return `GHS ${Number(amount).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function AgreementPdfDocument({ agreement }: { agreement: AgreementFull }) {
  const propertyLine = [agreement.property.address, agreement.property.suburb, agreement.property.city]
    .filter(Boolean)
    .join(", ");

  const acceptedClauses = agreement.clauses.filter((c) => c.clause_text_review_status === "accepted");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>TENANCY AGREEMENT</Text>
        <Text style={styles.reference}>Reference: {agreement.reference_number}</Text>

        <Text style={styles.paragraph}>This Tenancy Agreement is made between:</Text>

        <Text style={styles.sectionHeading}>THE LANDLORD(S)</Text>
        {agreement.landlords.map((l) => (
          <Text key={l.id} style={styles.indented}>
            {l.full_name} (ID: {l.id_number}){l.address ? `, of ${l.address}` : ""}
          </Text>
        ))}

        <Text style={styles.sectionHeading}>AND THE TENANT(S)</Text>
        {agreement.tenants.map((t) => (
          <Text key={t.id} style={styles.indented}>
            {t.full_name} (ID: {t.id_number}){t.current_address ? `, of ${t.current_address}` : ""}
          </Text>
        ))}

        <Text style={styles.sectionHeading}>PROPERTY</Text>
        <Text style={styles.indented}>{propertyLine}</Text>
        {(agreement.property.property_type || agreement.property.bedrooms) && (
          <Text style={styles.indented}>
            {[agreement.property.property_type, agreement.property.bedrooms ? `${agreement.property.bedrooms} bedroom(s)` : null]
              .filter(Boolean)
              .join(", ")}
          </Text>
        )}
        {agreement.property.description && <Text style={styles.indented}>{agreement.property.description}</Text>}

        <Text style={styles.sectionHeading}>TERMS</Text>
        <Text style={styles.indented}>
          1. Rent: {formatMoney(agreement.rental_amount)} per month, due on the {ordinal(agreement.payment_due_day)} day of
          each month.
        </Text>
        <Text style={styles.indented}>
          2. Security Deposit: {agreement.deposit_amount != null ? formatMoney(agreement.deposit_amount) : "N/A"},
          refundable at the end of the tenancy subject to the condition of the property.
        </Text>
        <Text style={styles.indented}>
          3. Lease Term: from {formatDate(agreement.lease_start_date)} to {formatDate(agreement.lease_end_date)}.
        </Text>
        <Text style={styles.indented}>
          4. The Tenant shall use the property solely for residential purposes and shall not sublet without the
          Landlord&apos;s written consent.
        </Text>
        <Text style={styles.indented}>
          5. The Tenant shall maintain the property in good condition, fair wear and tear excepted.
        </Text>
        <Text style={styles.indented}>
          6. Either party may terminate this Agreement in accordance with applicable law upon expiry of the lease term.
        </Text>

        {agreement.special_conditions?.trim() && (
          <>
            <Text style={styles.sectionHeading}>SPECIAL CONDITIONS</Text>
            {agreement.special_conditions
              .trim()
              .split("\n")
              .map((line, i) => (
                <Text key={i} style={styles.indented}>
                  {line}
                </Text>
              ))}
          </>
        )}

        {acceptedClauses.length > 0 && (
          <>
            <Text style={styles.sectionHeading}>ADDITIONAL CLAUSES</Text>
            {acceptedClauses.map((c) => (
              <Text key={c.id} style={styles.indented}>
                {c.clause_text}
              </Text>
            ))}
          </>
        )}

        <Text style={styles.sectionHeading}>SIGNATURES</Text>
        {agreement.landlords.map((l) => (
          <View key={l.id} style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text>Landlord: {l.full_name}</Text>
            <Text>Date: ____________________</Text>
          </View>
        ))}
        {agreement.tenants.map((t) => (
          <View key={t.id} style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text>Tenant: {t.full_name}</Text>
            <Text>Date: ____________________</Text>
          </View>
        ))}

        <Text style={styles.footer} fixed>
          {agreement.reference_number} — Generated by Tenancy Builder
        </Text>
      </Page>
    </Document>
  );
}

export async function renderAgreementPdf(agreement: AgreementFull): Promise<Buffer> {
  return renderToBuffer(<AgreementPdfDocument agreement={agreement} />);
}
