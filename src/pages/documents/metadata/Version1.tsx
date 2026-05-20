import { useMemo, useState } from 'react'
import {
  Banner,
  bannerStyles,
  bannerVariants,
  Chip,
  chipStyles,
  chipVariants,
  constants,
  FileUploader,
  Icon,
  iconType,
  Pagination,
  Panel,
  PropertyItemArray,
  type PropertyItemArrayItem,
  SearchBar,
  Table,
  Typography,
} from '@goat-ui/goat-ui-core'

const { colorPalette } = constants

type DocumentFormat = 'PDF' | 'XLSX' | 'TXT' | 'DOCX'
type Domain = 'Steuer' | 'HR' | 'Recht' | 'Finanzen' | 'Compliance'
type DocStatus = 'Entwurf' | 'Eingereicht' | 'Ausstehend' | 'Genehmigt' | 'Geprüft' | 'Abgelehnt'
type AlertKind = 'deadline' | 'signature' | 'review'

interface DocAlert {
  kind: AlertKind
  message: string
}

interface DocumentRecord {
  _id: string
  name: string
  format: DocumentFormat
  size: string
  uploadedAt: string
  domain: Domain
  documentType: string
  status: DocStatus
  relevantYear: number
  lawType: string
  jurisdiction: string
  citations: string[]
  partyName: string
  partyRole: string
  partyIdNumber: string
  monetaryValue: string
  monetaryType: string
  alerts: DocAlert[]
}

const domainChipStyle: Record<Domain, string> = {
  Steuer: chipStyles.ACCENT_BLUE,
  HR: chipStyles.ACCENT_PURPLE,
  Recht: chipStyles.ACCENT_CYAN,
  Finanzen: chipStyles.ACCENT_ORANGE,
  Compliance: chipStyles.ACCENT_PINK,
}

const statusChip: Record<DocStatus, { style: string; variant: string }> = {
  Entwurf:     { style: chipStyles.ACCENT_NEUTRAL,  variant: chipVariants.SUBTLE },
  Eingereicht: { style: chipStyles.SEMANTIC_INFO,    variant: chipVariants.SUBTLE },
  Ausstehend:  { style: chipStyles.SEMANTIC_WARNING, variant: chipVariants.SUBTLE },
  Genehmigt:   { style: chipStyles.SEMANTIC_SUCCESS, variant: chipVariants.SUBTLE },
  Geprüft:     { style: chipStyles.SEMANTIC_SUCCESS, variant: chipVariants.DASHED },
  Abgelehnt:   { style: chipStyles.SEMANTIC_DANGER,  variant: chipVariants.SUBTLE },
}

const alertBannerVariant: Record<AlertKind, string> = {
  deadline:  bannerVariants.DANGER,
  signature: bannerVariants.WARNING,
  review:    bannerVariants.INFO,
}

const initialDocuments: DocumentRecord[] = [
  {
    _id: '1', name: 'Unbedenklichkeitsbescheinigung_2024', format: 'PDF', size: '124 KB', uploadedAt: 'Heute',
    domain: 'Steuer', documentType: 'Unbedenklichkeitsbescheinigung', status: 'Genehmigt', relevantYear: 2024,
    lawType: 'Abgabenordnung', jurisdiction: 'Frankfurt am Main', citations: ['§149 AO', '§251 AO'],
    partyName: 'ABC GmbH', partyRole: 'Steuerpflichtiger', partyIdNumber: 'DE 123 456 789',
    monetaryValue: '0,00 EUR', monetaryType: 'Keine offenen Verbindlichkeiten',
    alerts: [],
  },
  {
    _id: '2', name: 'Bescheid_KSt_2024_Bundesfinanzamt', format: 'XLSX', size: '88 KB', uploadedAt: 'Jan 21, 2026',
    domain: 'Steuer', documentType: 'Körperschaftsteuerbescheid', status: 'Eingereicht', relevantYear: 2024,
    lawType: 'Körperschaftsteuergesetz', jurisdiction: 'Bundesfinanzamt Berlin', citations: ['§8 KStG', '§37 KStG'],
    partyName: 'ABC GmbH', partyRole: 'Steuerpflichtiger', partyIdNumber: 'DE 123 456 789',
    monetaryValue: '48.320,00 EUR', monetaryType: 'Nachzahlung',
    alerts: [{ kind: 'deadline', message: 'Zahlung fällig bis 30.09.2025' }],
  },
  {
    _id: '3', name: 'Berechnung_Körperschaftsteuer_Vorauszahlungen_2025', format: 'PDF', size: '210 KB', uploadedAt: 'Jan 6, 2026',
    domain: 'Steuer', documentType: 'Vorauszahlungsberechnung', status: 'Ausstehend', relevantYear: 2025,
    lawType: 'Körperschaftsteuergesetz', jurisdiction: 'Finanzamt Frankfurt I', citations: ['§37 KStG'],
    partyName: 'ABC GmbH', partyRole: 'Steuerpflichtiger', partyIdNumber: 'DE 123 456 789',
    monetaryValue: '48.320,00 EUR', monetaryType: 'Vorauszahlung (vierteljährlich)',
    alerts: [{ kind: 'deadline', message: 'Vorauszahlung Q1 fällig am 10.03.2025' }],
  },
  {
    _id: '4', name: 'Umsatzsteuer-Jahreserklärung_2024', format: 'PDF', size: '345 KB', uploadedAt: 'Sep 23, 2025',
    domain: 'Steuer', documentType: 'Umsatzsteuerjahreserklärung', status: 'Eingereicht', relevantYear: 2024,
    lawType: 'Umsatzsteuergesetz', jurisdiction: 'Finanzamt Frankfurt I', citations: ['§18 UStG', '§15 UStG'],
    partyName: 'ABC GmbH', partyRole: 'Unternehmer', partyIdNumber: 'DE 987 654 321',
    monetaryValue: '256.780,00 EUR', monetaryType: 'Umsatzsteuerzahllast',
    alerts: [],
  },
  {
    _id: '5', name: 'USt-Prüfung_Protokoll_2023', format: 'TXT', size: '56 KB', uploadedAt: 'Aug 11, 2025',
    domain: 'Steuer', documentType: 'Prüfungsprotokoll', status: 'Geprüft', relevantYear: 2023,
    lawType: 'Umsatzsteuergesetz', jurisdiction: 'Finanzamt Frankfurt I', citations: ['§27b UStG'],
    partyName: 'ABC GmbH', partyRole: 'Geprüfter', partyIdNumber: 'DE 987 654 321',
    monetaryValue: '4.200,00 EUR', monetaryType: 'Erstattung',
    alerts: [],
  },
  {
    _id: '6', name: 'Lohnsteuerbescheinigungen_2024', format: 'DOCX', size: '1,2 MB', uploadedAt: 'Jun 8, 2025',
    domain: 'HR', documentType: 'Lohnsteuerbescheinigung', status: 'Eingereicht', relevantYear: 2024,
    lawType: 'Einkommensteuergesetz', jurisdiction: 'Finanzamt Frankfurt III', citations: ['§41b EStG'],
    partyName: 'ABC GmbH', partyRole: 'Arbeitgeber', partyIdNumber: 'BSNR 26 123456 7',
    monetaryValue: '1.240.000,00 EUR', monetaryType: 'Bruttolohnsumme',
    alerts: [],
  },
  {
    _id: '7', name: 'Bescheid_Gewerbesteuer_2024', format: 'XLSX', size: '92 KB', uploadedAt: 'Jun 7, 2025',
    domain: 'Steuer', documentType: 'Gewerbesteuermessbescheid', status: 'Ausstehend', relevantYear: 2024,
    lawType: 'Gewerbesteuergesetz', jurisdiction: 'Stadt Frankfurt am Main', citations: ['§7 GewStG', '§11 GewStG'],
    partyName: 'ABC GmbH', partyRole: 'Steuerpflichtiger', partyIdNumber: 'DE 123 456 789',
    monetaryValue: '55.860,00 EUR', monetaryType: 'Gewerbesteuer',
    alerts: [{ kind: 'deadline', message: 'Einspruchsfrist endet am 15.07.2025' }, { kind: 'signature', message: 'Unterschrift des Geschäftsführers erforderlich' }],
  },
  {
    _id: '8', name: 'Jahresabschluss_2024_ABC_GmbH', format: 'PDF', size: '2,4 MB', uploadedAt: 'Mai 28, 2025',
    domain: 'Finanzen', documentType: 'Jahresabschluss', status: 'Geprüft', relevantYear: 2024,
    lawType: 'Handelsgesetzbuch', jurisdiction: 'Amtsgericht Frankfurt am Main', citations: ['§242 HGB', '§264 HGB'],
    partyName: 'ABC GmbH', partyRole: 'Bilanzierungspflichtiger', partyIdNumber: 'HRB 12345',
    monetaryValue: '4.200.000,00 EUR', monetaryType: 'Bilanzsumme',
    alerts: [{ kind: 'signature', message: 'Testierung durch Wirtschaftsprüfer noch ausstehend' }],
  },
  {
    _id: '9', name: 'Betriebsprüfungsbericht_2023', format: 'PDF', size: '890 KB', uploadedAt: 'Mär 8, 2025',
    domain: 'Steuer', documentType: 'Betriebsprüfungsbericht', status: 'Ausstehend', relevantYear: 2023,
    lawType: 'Abgabenordnung', jurisdiction: 'Finanzamt Frankfurt II', citations: ['§193 AO', '§201 AO'],
    partyName: 'ABC GmbH', partyRole: 'Geprüfter', partyIdNumber: 'DE 123 456 789',
    monetaryValue: '32.160,00 EUR', monetaryType: 'Gesamtnachforderung',
    alerts: [{ kind: 'deadline', message: 'Einspruch bis 05.04.2025 einzureichen' }, { kind: 'review', message: 'Steuerberater muss Bericht prüfen' }],
  },
  {
    _id: '10', name: 'Unbedenklichkeitsbescheinigung_2023', format: 'TXT', size: '48 KB', uploadedAt: 'Dez 8, 2024',
    domain: 'Compliance', documentType: 'Unbedenklichkeitsbescheinigung', status: 'Genehmigt', relevantYear: 2023,
    lawType: 'Abgabenordnung', jurisdiction: 'Frankfurt am Main', citations: ['§149 AO'],
    partyName: 'ABC GmbH', partyRole: 'Antragsteller', partyIdNumber: 'DE 123 456 789',
    monetaryValue: '–', monetaryType: '–',
    alerts: [],
  },
  {
    _id: '11', name: 'Gewerbeanmeldung_2023', format: 'PDF', size: '320 KB', uploadedAt: 'Nov 15, 2024',
    domain: 'Recht', documentType: 'Gewerbeanmeldung', status: 'Genehmigt', relevantYear: 2023,
    lawType: 'Gewerbeordnung', jurisdiction: 'Stadt Frankfurt am Main', citations: ['§14 GewO'],
    partyName: 'ABC GmbH', partyRole: 'Gewerbetreibender', partyIdNumber: 'GewReg 2023-4421',
    monetaryValue: '–', monetaryType: '–',
    alerts: [],
  },
  {
    _id: '12', name: 'Handelsregisterauszug_2023', format: 'PDF', size: '178 KB', uploadedAt: 'Okt 3, 2024',
    domain: 'Recht', documentType: 'Handelsregisterauszug', status: 'Geprüft', relevantYear: 2023,
    lawType: 'Handelsgesetzbuch', jurisdiction: 'Amtsgericht Frankfurt am Main', citations: ['§8 HGB'],
    partyName: 'ABC GmbH', partyRole: 'Eingetragene Gesellschaft', partyIdNumber: 'HRB 12345',
    monetaryValue: '25.000,00 EUR', monetaryType: 'Stammkapital',
    alerts: [],
  },
  {
    _id: '13', name: 'Körperschaftsteuer_2022', format: 'XLSX', size: '134 KB', uploadedAt: 'Sep 12, 2024',
    domain: 'Steuer', documentType: 'Körperschaftsteuererklärung', status: 'Geprüft', relevantYear: 2022,
    lawType: 'Körperschaftsteuergesetz', jurisdiction: 'Finanzamt Frankfurt I', citations: ['§8 KStG', '§23 KStG'],
    partyName: 'ABC GmbH', partyRole: 'Steuerpflichtiger', partyIdNumber: 'DE 123 456 789',
    monetaryValue: '43.500,00 EUR', monetaryType: 'Körperschaftsteuer',
    alerts: [],
  },
  {
    _id: '14', name: 'Umsatzsteuer_Voranmeldung_Q3_2024', format: 'PDF', size: '76 KB', uploadedAt: 'Aug 31, 2024',
    domain: 'Steuer', documentType: 'Umsatzsteuer-Voranmeldung', status: 'Eingereicht', relevantYear: 2024,
    lawType: 'Umsatzsteuergesetz', jurisdiction: 'Finanzamt Frankfurt I', citations: ['§18 UStG'],
    partyName: 'ABC GmbH', partyRole: 'Unternehmer', partyIdNumber: 'DE 987 654 321',
    monetaryValue: '24.260,00 EUR', monetaryType: 'Zahllast',
    alerts: [],
  },
  {
    _id: '15', name: 'Lohnjournal_2024_Q1', format: 'DOCX', size: '654 KB', uploadedAt: 'Jul 10, 2024',
    domain: 'HR', documentType: 'Lohnjournal', status: 'Geprüft', relevantYear: 2024,
    lawType: 'Einkommensteuergesetz', jurisdiction: 'Finanzamt Frankfurt III', citations: ['§38 EStG'],
    partyName: 'ABC GmbH', partyRole: 'Arbeitgeber', partyIdNumber: 'BSNR 26 123456 7',
    monetaryValue: '312.500,00 EUR', monetaryType: 'Bruttolohn Q1',
    alerts: [],
  },
  {
    _id: '16', name: 'Buchungsprotokoll_April_2024', format: 'TXT', size: '112 KB', uploadedAt: 'Jun 1, 2024',
    domain: 'Finanzen', documentType: 'Buchungsprotokoll', status: 'Geprüft', relevantYear: 2024,
    lawType: 'Handelsgesetzbuch', jurisdiction: 'Intern', citations: ['§238 HGB'],
    partyName: 'ABC GmbH', partyRole: 'Buchführungspflichtiger', partyIdNumber: 'HRB 12345',
    monetaryValue: '198.340,00 EUR', monetaryType: 'Monatliche Einnahmen',
    alerts: [],
  },
  {
    _id: '17', name: 'Inventarliste_2023', format: 'XLSX', size: '445 KB', uploadedAt: 'Mai 20, 2024',
    domain: 'Finanzen', documentType: 'Inventarliste', status: 'Geprüft', relevantYear: 2023,
    lawType: 'Handelsgesetzbuch', jurisdiction: 'Intern', citations: ['§240 HGB'],
    partyName: 'ABC GmbH', partyRole: 'Inventurpflichtiger', partyIdNumber: 'HRB 12345',
    monetaryValue: '890.000,00 EUR', monetaryType: 'Anlagevermögen',
    alerts: [{ kind: 'review', message: 'Jahresinventur 2024 muss bis 31.01.2025 abgeschlossen sein' }],
  },
  {
    _id: '18', name: 'Reisekostenabrechnung_2024', format: 'DOCX', size: '287 KB', uploadedAt: 'Apr 9, 2024',
    domain: 'HR', documentType: 'Reisekostenabrechnung', status: 'Ausstehend', relevantYear: 2024,
    lawType: 'Einkommensteuergesetz', jurisdiction: 'Intern', citations: ['§4 EStG', '§9 EStG'],
    partyName: 'Mitarbeiter ABC GmbH', partyRole: 'Arbeitnehmer', partyIdNumber: 'MA-2024-GRP',
    monetaryValue: '34.560,00 EUR', monetaryType: 'Reisekosten gesamt',
    alerts: [{ kind: 'signature', message: 'Genehmigung durch Abteilungsleiter erforderlich' }],
  },
  {
    _id: '19', name: 'Bilanzbericht_2023', format: 'PDF', size: '1,8 MB', uploadedAt: 'Mär 22, 2024',
    domain: 'Finanzen', documentType: 'Bilanzbericht', status: 'Geprüft', relevantYear: 2023,
    lawType: 'Handelsgesetzbuch', jurisdiction: 'Amtsgericht Frankfurt am Main', citations: ['§242 HGB', '§247 HGB'],
    partyName: 'ABC GmbH', partyRole: 'Bilanzierungspflichtiger', partyIdNumber: 'HRB 12345',
    monetaryValue: '3.870.000,00 EUR', monetaryType: 'Bilanzsumme',
    alerts: [],
  },
  {
    _id: '20', name: 'Steuerprüfung_Protokoll_2022', format: 'PDF', size: '530 KB', uploadedAt: 'Feb 14, 2024',
    domain: 'Steuer', documentType: 'Prüfungsprotokoll', status: 'Geprüft', relevantYear: 2022,
    lawType: 'Abgabenordnung', jurisdiction: 'Finanzamt Frankfurt II', citations: ['§193 AO'],
    partyName: 'ABC GmbH', partyRole: 'Geprüfter', partyIdNumber: 'DE 123 456 789',
    monetaryValue: '–', monetaryType: '–',
    alerts: [],
  },
  {
    _id: '21', name: 'USt_Jahreserklärung_2022', format: 'PDF', size: '298 KB', uploadedAt: 'Jan 28, 2024',
    domain: 'Steuer', documentType: 'Umsatzsteuerjahreserklärung', status: 'Geprüft', relevantYear: 2022,
    lawType: 'Umsatzsteuergesetz', jurisdiction: 'Finanzamt Frankfurt I', citations: ['§18 UStG', '§15 UStG'],
    partyName: 'ABC GmbH', partyRole: 'Unternehmer', partyIdNumber: 'DE 987 654 321',
    monetaryValue: '12.300,00 EUR', monetaryType: 'Erstattungsanspruch',
    alerts: [],
  },
  {
    _id: '22', name: 'Gewerbesteuer_Bescheid_2022', format: 'PDF', size: '105 KB', uploadedAt: 'Dez 5, 2023',
    domain: 'Steuer', documentType: 'Gewerbesteuerbescheid', status: 'Geprüft', relevantYear: 2022,
    lawType: 'Gewerbesteuergesetz', jurisdiction: 'Stadt Frankfurt am Main', citations: ['§7 GewStG', '§14 GewStG'],
    partyName: 'ABC GmbH', partyRole: 'Steuerpflichtiger', partyIdNumber: 'DE 123 456 789',
    monetaryValue: '45.570,00 EUR', monetaryType: 'Gewerbesteuer',
    alerts: [],
  },
  {
    _id: '23', name: 'Lohnsteuerbescheinigungen_2023', format: 'DOCX', size: '1,1 MB', uploadedAt: 'Nov 17, 2023',
    domain: 'HR', documentType: 'Lohnsteuerbescheinigung', status: 'Eingereicht', relevantYear: 2023,
    lawType: 'Einkommensteuergesetz', jurisdiction: 'Finanzamt Frankfurt III', citations: ['§41b EStG'],
    partyName: 'ABC GmbH', partyRole: 'Arbeitgeber', partyIdNumber: 'BSNR 26 123456 7',
    monetaryValue: '1.140.000,00 EUR', monetaryType: 'Bruttolohnsumme',
    alerts: [],
  },
  {
    _id: '24', name: 'Kassenbuch_Oktober_2023', format: 'XLSX', size: '67 KB', uploadedAt: 'Okt 31, 2023',
    domain: 'Finanzen', documentType: 'Kassenbuch', status: 'Geprüft', relevantYear: 2023,
    lawType: 'Handelsgesetzbuch', jurisdiction: 'Intern', citations: ['§146 AO'],
    partyName: 'ABC GmbH', partyRole: 'Kassenpflichtiger', partyIdNumber: 'HRB 12345',
    monetaryValue: '3.210,00 EUR', monetaryType: 'Kassenendbestand',
    alerts: [],
  },
  {
    _id: '25', name: 'Jahresabschluss_2022_ABC_GmbH', format: 'PDF', size: '2,1 MB', uploadedAt: 'Sep 2, 2023',
    domain: 'Finanzen', documentType: 'Jahresabschluss', status: 'Geprüft', relevantYear: 2022,
    lawType: 'Handelsgesetzbuch', jurisdiction: 'Amtsgericht Frankfurt am Main', citations: ['§242 HGB', '§264 HGB'],
    partyName: 'ABC GmbH', partyRole: 'Bilanzierungspflichtiger', partyIdNumber: 'HRB 12345',
    monetaryValue: '3.870.000,00 EUR', monetaryType: 'Bilanzsumme',
    alerts: [],
  },
  {
    _id: '26', name: 'Handelsregister_Änderung_2023', format: 'PDF', size: '143 KB', uploadedAt: 'Aug 19, 2023',
    domain: 'Recht', documentType: 'Handelsregisteränderung', status: 'Genehmigt', relevantYear: 2023,
    lawType: 'Handelsgesetzbuch', jurisdiction: 'Amtsgericht Frankfurt am Main', citations: ['§39 GmbHG'],
    partyName: 'Erika Musterfrau', partyRole: 'Neue Geschäftsführerin', partyIdNumber: 'HRB 12345',
    monetaryValue: '–', monetaryType: '–',
    alerts: [],
  },
  {
    _id: '27', name: 'Betriebsprüfung_Bericht_2021', format: 'PDF', size: '710 KB', uploadedAt: 'Jul 6, 2023',
    domain: 'Steuer', documentType: 'Betriebsprüfungsbericht', status: 'Abgelehnt', relevantYear: 2021,
    lawType: 'Abgabenordnung', jurisdiction: 'Finanzamt Frankfurt II', citations: ['§193 AO', '§201 AO'],
    partyName: 'ABC GmbH', partyRole: 'Geprüfter', partyIdNumber: 'DE 123 456 789',
    monetaryValue: '6.837,00 EUR', monetaryType: 'Nachforderung inkl. Zinsen',
    alerts: [{ kind: 'deadline', message: 'Einspruchsfrist bereits abgelaufen – Klage prüfen' }],
  },
  {
    _id: '28', name: 'Umsatzsteuer_Voranmeldung_Q1_2023', format: 'PDF', size: '72 KB', uploadedAt: 'Jun 15, 2023',
    domain: 'Steuer', documentType: 'Umsatzsteuer-Voranmeldung', status: 'Geprüft', relevantYear: 2023,
    lawType: 'Umsatzsteuergesetz', jurisdiction: 'Finanzamt Frankfurt I', citations: ['§18 UStG'],
    partyName: 'ABC GmbH', partyRole: 'Unternehmer', partyIdNumber: 'DE 987 654 321',
    monetaryValue: '18.600,00 EUR', monetaryType: 'Zahllast',
    alerts: [],
  },
  {
    _id: '29', name: 'Personalakte_Musterfrau_2023', format: 'DOCX', size: '389 KB', uploadedAt: 'Mai 3, 2023',
    domain: 'HR', documentType: 'Personalakte', status: 'Entwurf', relevantYear: 2023,
    lawType: 'Bundesdatenschutzgesetz', jurisdiction: 'Intern', citations: ['§26 BDSG'],
    partyName: 'Erika Musterfrau', partyRole: 'Arbeitnehmerin', partyIdNumber: '65 230987 E 003',
    monetaryValue: '72.000,00 EUR', monetaryType: 'Jahresbruttogehalt',
    alerts: [{ kind: 'review', message: 'Akte muss durch HR-Leitung freigegeben werden' }],
  },
  {
    _id: '30', name: 'Kontoauszug_Analyse_2022', format: 'TXT', size: '234 KB', uploadedAt: 'Apr 11, 2023',
    domain: 'Finanzen', documentType: 'Kontoauszugsanalyse', status: 'Geprüft', relevantYear: 2022,
    lawType: 'Abgabenordnung', jurisdiction: 'Intern', citations: ['§147 AO'],
    partyName: 'ABC GmbH', partyRole: 'Kontoinhaber', partyIdNumber: 'DE89 3704 0044 0532 0130 00',
    monetaryValue: '2.140.000,00 EUR', monetaryType: 'Gesamteingänge',
    alerts: [],
  },
]

const PAGE_SIZE = 10

function DomainChip({ domain }: { domain: Domain }) {
  return (
    <Chip
      label={domain}
      chipStyle={domainChipStyle[domain] as Parameters<typeof Chip>[0]['chipStyle']}
      variant={chipVariants.SUBTLE}
    />
  )
}

function StatusChip({ status }: { status: DocStatus }) {
  const s = statusChip[status]
  return (
    <Chip
      label={status}
      chipStyle={s.style as Parameters<typeof Chip>[0]['chipStyle']}
      variant={s.variant as Parameters<typeof Chip>[0]['variant']}
    />
  )
}

function AlertsCell({ alerts }: { alerts: DocAlert[] }) {
  if (alerts.length === 0) return null
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {alerts.map((a, i) => (
        <Chip
          key={i}
          label={a.kind === 'deadline' ? 'Frist' : a.kind === 'signature' ? 'Unterschrift' : 'Prüfung'}
          chipStyle={a.kind === 'deadline' ? chipStyles.SEMANTIC_DANGER : a.kind === 'signature' ? chipStyles.SEMANTIC_WARNING : chipStyles.SEMANTIC_INFO}
          variant={chipVariants.SUBTLE}
        />
      ))}
    </div>
  )
}

function SectionHeader({ children }: { children: string }) {
  return (
    <div style={{ paddingBottom: 8, marginBottom: 4, borderBottom: '1px solid #f0f0f0' }}>
      <Typography size="base-sm" weight="bold" color="neutral-darken3">
        {children}
      </Typography>
    </div>
  )
}

function MetadataPanel({ doc, onClose }: { doc: DocumentRecord; onClose: () => void }) {
  const overviewItems: PropertyItemArrayItem[] = [
    { label: 'Dokumenttyp', value: doc.documentType },
    { label: 'Domäne', value: <DomainChip domain={doc.domain} /> },
    { label: 'Status', value: <StatusChip status={doc.status} /> },
    { label: 'Relevantes Jahr', value: doc.relevantYear },
    { label: 'Hochgeladen am', value: doc.uploadedAt },
    { label: 'Dateigröße', value: doc.size },
    { label: 'Format', value: doc.format },
  ]

  const legalItems: PropertyItemArrayItem[] = [
    { label: 'Gesetzestyp', value: doc.lawType },
    { label: 'Rechtsordnung', value: doc.jurisdiction },
    { label: 'Zitate', value: doc.citations.length > 0 ? doc.citations.join(', ') : '–' },
  ]

  const partyItems: PropertyItemArrayItem[] = [
    { label: 'Name', value: doc.partyName },
    { label: 'Rolle', value: doc.partyRole },
    { label: 'ID-Nummer', value: doc.partyIdNumber },
  ]

  const financialItems: PropertyItemArrayItem[] = [
    { label: 'Betrag', value: doc.monetaryValue },
    { label: 'Art', value: doc.monetaryType },
  ]

  const hasFinancial = doc.monetaryValue !== '–'

  return (
    <Panel
      visible
      title={
        <Typography weight="bold" size="base-lg">
          {doc.name.replace(/_/g, ' ')}
        </Typography>
      }
      width={500}
      onClose={onClose}
    >
      <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {doc.alerts.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {doc.alerts.map((alert, i) => (
              <Banner
                key={i}
                variant={alertBannerVariant[alert.kind] as Parameters<typeof Banner>[0]['variant']}
                bannerStyle={bannerStyles.SUBTLE}
                header={alert.message}
                dismissible={false}
              />
            ))}
          </div>
        )}

        <div>
          <SectionHeader>Dokument</SectionHeader>
          <PropertyItemArray
            items={overviewItems}
            labelProps={{ color: 'neutral-darken2', size: 'base-sm' } as Parameters<typeof PropertyItemArray>[0]['labelProps']}
          />
        </div>

        <div>
          <SectionHeader>Rechtliches</SectionHeader>
          <PropertyItemArray
            items={legalItems}
            labelProps={{ color: 'neutral-darken2', size: 'base-sm' } as Parameters<typeof PropertyItemArray>[0]['labelProps']}
          />
        </div>

        <div>
          <SectionHeader>Partei</SectionHeader>
          <PropertyItemArray
            items={partyItems}
            labelProps={{ color: 'neutral-darken2', size: 'base-sm' } as Parameters<typeof PropertyItemArray>[0]['labelProps']}
          />
        </div>

        {hasFinancial && (
          <div>
            <SectionHeader>Finanzielles</SectionHeader>
            <PropertyItemArray
              items={financialItems}
              labelProps={{ color: 'neutral-darken2', size: 'base-sm' } as Parameters<typeof PropertyItemArray>[0]['labelProps']}
            />
          </div>
        )}

      </div>
    </Panel>
  )
}

export default function MetadataVersion1() {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null)

  const filteredDocs = useMemo(() => {
    const q = searchQuery.toLowerCase()
    if (!q) return initialDocuments
    return initialDocuments.filter(
      (doc) =>
        doc.name.toLowerCase().includes(q) ||
        doc.domain.toLowerCase().includes(q) ||
        doc.documentType.toLowerCase().includes(q) ||
        doc.status.toLowerCase().includes(q),
    )
  }, [searchQuery])

  const pagedDocs = useMemo(
    () => filteredDocs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredDocs, currentPage],
  )

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Typography>{name.replace(/_/g, ' ')}</Typography>
      ),
    },
    {
      title: 'Domäne',
      dataIndex: 'domain',
      key: 'domain',
      render: (domain: Domain) => <DomainChip domain={domain} />,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: DocStatus) => <StatusChip status={status} />,
    },
    {
      title: 'Jahr',
      dataIndex: 'relevantYear',
      key: 'relevantYear',
    },
    {
      title: 'Hinweise',
      dataIndex: 'alerts',
      key: 'alerts',
      render: (alerts: DocAlert[]) => <AlertsCell alerts={alerts} />,
    },
  ]

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, backgroundColor: colorPalette.white, minHeight: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography size="heading-lg" weight="bold">
          Meine Dokumente
        </Typography>
        <SearchBar
          placeholder="Name, Domäne, Typ oder Status…"
          onChange={(v) => { setSearchQuery(v); setCurrentPage(1) }}
        />
      </div>

      <div className="file-uploader-full-width">
        <FileUploader
          onUpload={(file) => console.log('Uploaded:', file)}
          accept={['.pdf', '.docx', '.xlsx', '.txt']}
        >
          <div
            className="upload-zone"
            style={{
              border: '1.5px dashed #d0d0d0',
              borderRadius: 8,
              padding: '28px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
            }}
          >
            <Icon type={iconType.UploadOutlined} color="neutral-darken4" />
            <Typography color="neutral-darken5">
              Klicken Sie, um ein Dokument auszuwählen, oder ziehen Sie es hierher.
            </Typography>
            <Typography size="base-sm" color="neutral-darken2">
              PDF-, DOCX-, XLSX- und TXT-Formate, max. Größe 10 MB
            </Typography>
          </div>
        </FileUploader>
      </div>

      <Table
        dataSource={pagedDocs}
        columns={columns}
        pagination={false}
        actions={(row: DocumentRecord) => [
          {
            key: 'details',
            label: 'Details öffnen',
            onClick: () => setSelectedDoc(row),
          },
          {
            key: 'download',
            label: 'Herunterladen',
            onClick: () => console.log('Download', row.name),
          },
          {
            key: 'delete',
            label: 'Löschen',
            onClick: () => console.log('Delete', row.name),
          },
        ] as any}
      />

      <Pagination
        current={currentPage}
        total={filteredDocs.length}
        pageSize={PAGE_SIZE}
        onChange={(page) => setCurrentPage(page)}
      />

      {selectedDoc && (
        <MetadataPanel doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
      )}
    </div>
  )
}
