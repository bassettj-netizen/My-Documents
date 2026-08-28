import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  ButtonDanger,
  ButtonGhost,
  buttonShapes,
  ButtonPrimary,
  ButtonTertiary,
  buttonVariants,
  Checkbox,
  Chip,
  chipStyles,
  chipVariants,
  constants,
  Dropdown,
  dropdownPlacement,
  dropdownTriggers,
  FileUploader,
  Icon,
  iconType,
  Input,
  LAYOUT_SIDEBAR_ID,
  Modal,
  modalVariants,
  Pagination,
  SearchBar,
  Select,
  SIDEBAR_COLLAPSED_WIDTH,
  Skeleton,
  skeletonVariants,
  Spinner,
  Table,
  TextArea,
  toastPlacements,
  Tooltip,
  Typography,
  useNotifications,
} from '@goat-ui/goat-ui-core'

const { colorPalette, spacing, fontWeight } = constants

// ── Types ─────────────────────────────────────────────────────────────────────

type Doc = {
  id: string
  name: string
  type: string
  tags: string[]
  uploaded: string
  size: string
  format: string
}

type Space = {
  id: string
  name: string
  description: string
  initials: string
  color: string
  docCount: number
}

type SpItem = {
  id: string
  name: string
  kind: 'file' | 'folder'
  format?: string
  size?: string
  modified: string
  modifiedBy?: string
}

type Tag = { text: string; style: string }

// ── Constants ─────────────────────────────────────────────────────────────────

const PERSONAL_ID = 'space-personal'
const PAGE_SIZE = 10
const UPLOAD_KEY = 'v6-upload'
const SPACE_COLORS = ['#0066cc', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2']

// ── Mock data ─────────────────────────────────────────────────────────────────

const PERSONAL_DOCS: Doc[] = [
  { id: 'd1', name: 'KSt-Erklärung_2024_Bergmann_GmbH', type: 'Corporate Tax', tags: ['CORPORATE TAX', 'KÖRPERSCHAFTSTEUER', 'KST-ERKLÄRUNG', '2025', 'BERGMANN INDUSTRIE', 'FINANCE', 'COMPLIANCE'], uploaded: 'May 5, 2026', size: '2.5 MB', format: 'PDF' },
  { id: 'd2', name: 'Gewerbesteuererklärung_Bergmann_GmbH_2024', type: 'Tax Return', tags: ['TRADE TAX', 'GEWERBESTEUER', 'TAX RETURN', 'BERGMANN INDUSTRIE', 'GMBH', 'FINANCE', 'COMPLIANCE', 'MUNICIPAL TAX'], uploaded: 'May 5, 2026', size: '2 MB', format: 'PDF' },
  { id: 'd3', name: 'Bescheid_Gewerbesteuer_2025', type: 'Tax Assessment', tags: ['TRADE TAX', 'GEWERBESTEUER', 'TAX ASSESSMENT', 'TAX NOTICE', '2025', 'TAX AUTHORITY', 'COMPLIANCE'], uploaded: 'May 5, 2026', size: '1.4 MB', format: 'DOCX' },
  { id: 'd4', name: 'GoBD_Dokumentation_2025', type: 'Compliance', tags: ['GOBD', 'ACCOUNTING', 'COMPLIANCE', 'DIGITAL RECORDS', '2025', 'TAX COMPLIANCE', 'AUDIT PREPARATION', 'REGULATIONS'], uploaded: 'May 5, 2026', size: '44 KB', format: 'XLSX' },
  { id: 'd5', name: 'Berechnung_Körperschaftsteuer_Vorauszahlung', type: 'Tax Calculation', tags: ['CORPORATE TAX', 'KÖRPERSCHAFTSTEUER', 'TAX CALCULATION', 'TAX PLANNING', 'FINANCE', 'ADVISORY', 'CALCULATION'], uploaded: 'May 5, 2026', size: '209 KB', format: 'PDF' },
  { id: 'd6', name: 'Lohnsteuer-Anmeldung_Juli_2025', type: 'Payroll Tax', tags: ['PAYROLL TAX', 'LOHNSTEUER', 'TAX FILING', '2025', 'EMPLOYEE TAXES', 'FINANCE', 'COMPLIANCE'], uploaded: 'Jan 15, 2026', size: '2.1 MB', format: 'DOCX' },
  { id: 'd7', name: 'Lohnsteuerbescheinigungen_2025', type: 'Payroll', tags: ['PAYROLL', 'LOHNSTEUERBESCHEINIGUNG', 'EMPLOYEE TAX', '2025', 'ANNUAL PAYROLL', 'REPORTING', 'COMPLIANCE'], uploaded: 'Dec 21, 2025', size: '4.2 MB', format: 'PDF' },
]

const SP_SECTIONS: Record<string, SpItem[]> = {
  Home: [
    { id: 'h1', name: 'USt-Prüfung_Protokoll_2026.docx', kind: 'file', format: 'DOCX', size: '0.4 MB', modified: 'Yesterday', modifiedBy: 'Alex Mustermensch' },
    { id: 'h2', name: 'Bescheid_KSt_2025_Bundesfinanzamt.docx', kind: 'file', format: 'DOCX', size: '0.6 MB', modified: '3 days ago', modifiedBy: 'Albert Berg' },
    { id: 'h3', name: 'Nachweis_Innergemeinschaftliche_Lieferung.xlsx', kind: 'file', format: 'XLSX', size: '1.2 MB', modified: 'June 23', modifiedBy: 'Sabine Hoffmann' },
    { id: 'h4', name: 'Lohnsteuerprotokoll_Q2_2026.docx', kind: 'file', format: 'DOCX', size: '0.3 MB', modified: 'June 20', modifiedBy: 'Alex Mustermensch' },
    { id: 'h5', name: 'Jahresabschluss_2025_Bergmann_GmbH.pdf', kind: 'file', format: 'PDF', size: '3.4 MB', modified: 'April 09', modifiedBy: 'Albert Berg' },
    { id: 'h6', name: 'Bilanz_2025_Bergmann_GmbH.xlsx', kind: 'file', format: 'XLSX', size: '1.8 MB', modified: 'April 09', modifiedBy: 'Sabine Hoffmann' },
    { id: 'h7', name: 'Betriebsprüfungsbericht_2024.docx', kind: 'file', format: 'DOCX', size: '2.1 MB', modified: 'Nov 11, 2025', modifiedBy: 'Claudia Richter' },
    { id: 'h8', name: 'Gewerbesteuererklärung_2024.pdf', kind: 'file', format: 'PDF', size: '1.5 MB', modified: 'Nov 11, 2025', modifiedBy: 'Albert Berg' },
  ],
  'My files': [
    { id: 'mf-f1', name: 'Steuerunterlagen 2024', kind: 'folder', modified: 'June 01', modifiedBy: 'Alex Mustermensch' },
    { id: 'mf-f2', name: 'Jahresabschlüsse', kind: 'folder', modified: 'April 15', modifiedBy: 'Albert Berg' },
    { id: 'mf-f3', name: 'Betriebsprüfung', kind: 'folder', modified: 'Nov 15, 2025', modifiedBy: 'Alex Mustermensch' },
    { id: 'mf-f4', name: 'Mandantenkorrespondenz', kind: 'folder', modified: 'March 12', modifiedBy: 'Alex Mustermensch' },
    { id: 'mf1', name: 'Allgemeine_Vollmacht_Bergmann.pdf', kind: 'file', format: 'PDF', size: '0.8 MB', modified: 'May 02', modifiedBy: 'Alex Mustermensch' },
    { id: 'mf2', name: 'Auftragsbestätigung_Kanzlei_2026.docx', kind: 'file', format: 'DOCX', size: '0.2 MB', modified: 'May 01', modifiedBy: 'Alex Mustermensch' },
  ],
  Shared: [
    { id: 'sh1', name: 'Lohnsteuerprotokoll_Q1_2026.xlsx', kind: 'file', format: 'XLSX', size: '1.1 MB', modified: 'Yesterday', modifiedBy: 'Sabine Hoffmann' },
    { id: 'sh2', name: 'Bescheid_USt_2025_Bundesfinanzamt.pdf', kind: 'file', format: 'PDF', size: '0.7 MB', modified: '10 days ago', modifiedBy: 'Albert Berg' },
    { id: 'sh3', name: 'Anlage_EÜR_2024_Bergmann.xlsx', kind: 'file', format: 'XLSX', size: '0.9 MB', modified: 'June 10', modifiedBy: 'Claudia Richter' },
    { id: 'sh-f1', name: 'Geteilte Mandantenunterlagen', kind: 'folder', modified: 'March 15', modifiedBy: 'Thomas Schneider' },
    { id: 'sh4', name: 'Entwurf_Steuerbilanz_2025.docx', kind: 'file', format: 'DOCX', size: '0.6 MB', modified: 'May 15', modifiedBy: 'Thomas Schneider' },
    { id: 'sh5', name: 'Sozialversicherungsmeldungen_2025.pdf', kind: 'file', format: 'PDF', size: '2.3 MB', modified: 'April 30', modifiedBy: 'Sabine Hoffmann' },
    { id: 'sh6', name: 'Umsatzsteuervoranmeldung_Q1_2026.xlsx', kind: 'file', format: 'XLSX', size: '0.5 MB', modified: 'April 10', modifiedBy: 'Albert Berg' },
  ],
  Favorites: [
    { id: 'fav1', name: 'Jahresabschluss_2025_Bergmann_GmbH.pdf', kind: 'file', format: 'PDF', size: '3.4 MB', modified: 'April 09', modifiedBy: 'Albert Berg' },
    { id: 'fav2', name: 'GoBD_Dokumentation_2025.xlsx', kind: 'file', format: 'XLSX', size: '44 KB', modified: 'May 06', modifiedBy: 'Sabine Hoffmann' },
    { id: 'fav3', name: 'Betriebsprüfungsbericht_2024.docx', kind: 'file', format: 'DOCX', size: '2.1 MB', modified: 'Nov 11, 2025', modifiedBy: 'Claudia Richter' },
    { id: 'fav4', name: 'KSt-Erklärung_2024_Bergmann_GmbH.pdf', kind: 'file', format: 'PDF', size: '2.5 MB', modified: 'May 06', modifiedBy: 'Albert Berg' },
    { id: 'fav5', name: 'Gewerbesteuererklärung_2024.pdf', kind: 'file', format: 'PDF', size: '2.0 MB', modified: 'May 06', modifiedBy: 'Albert Berg' },
  ],
  People: [],
  Meetings: [],
  Steuerkanzlei: [
    { id: 'sk-f1', name: 'Bergmann Industrie GmbH', kind: 'folder', modified: 'Yesterday', modifiedBy: 'Petra Meier' },
    { id: 'sk-f2', name: 'Müller & Partner OHG', kind: 'folder', modified: '10 days ago', modifiedBy: 'Petra Meier' },
    { id: 'sk-f3', name: 'Techwerk AG', kind: 'folder', modified: 'June 15', modifiedBy: 'Hans Schmidt' },
    { id: 'sk-f4', name: 'Vorlagen und Muster', kind: 'folder', modified: 'May 20', modifiedBy: 'Petra Meier' },
    { id: 'sk1', name: 'Kanzleihandbuch_2026.pdf', kind: 'file', format: 'PDF', size: '1.4 MB', modified: 'May 01', modifiedBy: 'Petra Meier' },
    { id: 'sk2', name: 'Honorarordnung_2026.docx', kind: 'file', format: 'DOCX', size: '0.3 MB', modified: 'January 10', modifiedBy: 'Petra Meier' },
  ],
  Bergmann: [
    { id: 'bg-f1', name: 'Finanzen', kind: 'folder', modified: 'Yesterday', modifiedBy: 'Klaus Bergmann' },
    { id: 'bg-f2', name: 'Compliance & Recht', kind: 'folder', modified: 'June 10', modifiedBy: 'Maria Bergmann' },
    { id: 'bg-f3', name: 'Personal & HR', kind: 'folder', modified: 'May 15', modifiedBy: 'Maria Bergmann' },
    { id: 'bg1', name: 'Gesellschaftervertrag_2020.pdf', kind: 'file', format: 'PDF', size: '0.8 MB', modified: '2020', modifiedBy: 'Klaus Bergmann' },
    { id: 'bg2', name: 'Handelsregisterauszug_2026.pdf', kind: 'file', format: 'PDF', size: '0.2 MB', modified: 'January 15', modifiedBy: 'Klaus Bergmann' },
  ],
}

const FOLDER_CONTENTS: Record<string, SpItem[]> = {
  'mf-f1': [
    { id: 'st1', name: 'KSt-Erklärung_2024_Bergmann_GmbH.pdf', kind: 'file', format: 'PDF', size: '2.5 MB', modified: 'May 06', modifiedBy: 'Albert Berg' },
    { id: 'st2', name: 'Gewerbesteuererklärung_2024.pdf', kind: 'file', format: 'PDF', size: '2.0 MB', modified: 'May 06', modifiedBy: 'Albert Berg' },
    { id: 'st3', name: 'GoBD_Dokumentation_2025.xlsx', kind: 'file', format: 'XLSX', size: '44 KB', modified: 'May 06', modifiedBy: 'Sabine Hoffmann' },
    { id: 'st4', name: 'Anlage_GvE_Beteiligungen_2024.docx', kind: 'file', format: 'DOCX', size: '1.0 MB', modified: 'May 06', modifiedBy: 'Albert Berg' },
    { id: 'st5', name: 'Umsatzsteuervoranmeldung_Q4_2024.xlsx', kind: 'file', format: 'XLSX', size: '0.6 MB', modified: 'April 09', modifiedBy: 'Claudia Richter' },
  ],
  'mf-f2': [
    { id: 'ja1', name: 'Jahresabschluss_2025_Bergmann_GmbH.pdf', kind: 'file', format: 'PDF', size: '3.4 MB', modified: 'April 09', modifiedBy: 'Albert Berg' },
    { id: 'ja2', name: 'Bilanz_2025_Bergmann_GmbH.xlsx', kind: 'file', format: 'XLSX', size: '1.8 MB', modified: 'April 09', modifiedBy: 'Sabine Hoffmann' },
    { id: 'ja3', name: 'GuV_2025_Bergmann_GmbH.xlsx', kind: 'file', format: 'XLSX', size: '1.2 MB', modified: 'March 22', modifiedBy: 'Sabine Hoffmann' },
    { id: 'ja4', name: 'Anhang_Jahresabschluss_2025.docx', kind: 'file', format: 'DOCX', size: '0.5 MB', modified: 'March 22', modifiedBy: 'Albert Berg' },
    { id: 'ja5', name: 'Jahresabschluss_2024_Bergmann_GmbH.pdf', kind: 'file', format: 'PDF', size: '3.1 MB', modified: 'Nov 15, 2025', modifiedBy: 'Albert Berg' },
  ],
  'mf-f3': [
    { id: 'bp1', name: 'Betriebsprüfungsbericht_2024.docx', kind: 'file', format: 'DOCX', size: '2.1 MB', modified: 'Nov 11, 2025', modifiedBy: 'Claudia Richter' },
    { id: 'bp2', name: 'Antwort_Betriebsprüfung_Anforderung.docx', kind: 'file', format: 'DOCX', size: '0.9 MB', modified: 'Dec 09, 2025', modifiedBy: 'Alex Mustermensch' },
    { id: 'bp3', name: 'Prüfprotokoll_2024.pdf', kind: 'file', format: 'PDF', size: '1.4 MB', modified: 'Oct 15, 2025', modifiedBy: 'Claudia Richter' },
    { id: 'bp4', name: 'Korrespondenz_Finanzamt_2024.docx', kind: 'file', format: 'DOCX', size: '0.3 MB', modified: 'Oct 01, 2025', modifiedBy: 'Alex Mustermensch' },
  ],
  'mf-f4': [
    { id: 'mk1', name: 'Email_Anfrage_Steuererklärung.pdf', kind: 'file', format: 'PDF', size: '0.2 MB', modified: 'March 12', modifiedBy: 'Alex Mustermensch' },
    { id: 'mk2', name: 'Bescheide_Sammlung_2025.pdf', kind: 'file', format: 'PDF', size: '1.6 MB', modified: 'Feb 28', modifiedBy: 'Albert Berg' },
    { id: 'mk3', name: 'Einspruch_Steuerbescheid_2024.docx', kind: 'file', format: 'DOCX', size: '0.4 MB', modified: 'Jan 20', modifiedBy: 'Alex Mustermensch' },
  ],
  'sh-f1': [
    { id: 'gm1', name: 'Steuerliche_Beratungsunterlagen_2026.pdf', kind: 'file', format: 'PDF', size: '1.2 MB', modified: 'March 15', modifiedBy: 'Thomas Schneider' },
    { id: 'gm2', name: 'Vertragsunterlagen_Bergmann_2026.docx', kind: 'file', format: 'DOCX', size: '0.4 MB', modified: 'March 10', modifiedBy: 'Thomas Schneider' },
    { id: 'gm3', name: 'Übersicht_offene_Posten.xlsx', kind: 'file', format: 'XLSX', size: '0.8 MB', modified: 'Feb 20', modifiedBy: 'Thomas Schneider' },
  ],
  'sk-f1': [
    { id: 'sk-bg1', name: 'KSt-Erklärung_2024_Bergmann.pdf', kind: 'file', format: 'PDF', size: '2.5 MB', modified: 'May 06', modifiedBy: 'Albert Berg' },
    { id: 'sk-bg2', name: 'Jahresabschluss_2025.pdf', kind: 'file', format: 'PDF', size: '3.4 MB', modified: 'April 09', modifiedBy: 'Albert Berg' },
    { id: 'sk-bg3', name: 'Lohnsteuer_2025_Bergmann.xlsx', kind: 'file', format: 'XLSX', size: '0.9 MB', modified: 'March 15', modifiedBy: 'Sabine Hoffmann' },
    { id: 'sk-bg4', name: 'Betriebsprüfungsbericht_2024.docx', kind: 'file', format: 'DOCX', size: '2.1 MB', modified: 'Nov 11, 2025', modifiedBy: 'Claudia Richter' },
  ],
  'sk-f2': [
    { id: 'mp1', name: 'KSt-Erklärung_2024_Müller.pdf', kind: 'file', format: 'PDF', size: '1.8 MB', modified: 'May 10', modifiedBy: 'Petra Meier' },
    { id: 'mp2', name: 'Gewerbesteuererklärung_2024_Müller.pdf', kind: 'file', format: 'PDF', size: '1.2 MB', modified: 'May 10', modifiedBy: 'Hans Schmidt' },
    { id: 'mp3', name: 'Jahresabschluss_2025_Müller.pdf', kind: 'file', format: 'PDF', size: '2.8 MB', modified: 'April 20', modifiedBy: 'Petra Meier' },
  ],
  'sk-f3': [
    { id: 'tw1', name: 'Steuerberatungsvertrag_Techwerk.docx', kind: 'file', format: 'DOCX', size: '0.3 MB', modified: 'Jan 15', modifiedBy: 'Hans Schmidt' },
    { id: 'tw2', name: 'Jahresabschluss_2024_Techwerk.pdf', kind: 'file', format: 'PDF', size: '3.2 MB', modified: 'March 30', modifiedBy: 'Petra Meier' },
    { id: 'tw3', name: 'Umsatzsteuererklärung_2024_Techwerk.xlsx', kind: 'file', format: 'XLSX', size: '0.7 MB', modified: 'April 15', modifiedBy: 'Hans Schmidt' },
  ],
  'sk-f4': [
    { id: 'vm1', name: 'Vollmachtsvorlage_Steuer.docx', kind: 'file', format: 'DOCX', size: '0.1 MB', modified: 'Jan 05', modifiedBy: 'Petra Meier' },
    { id: 'vm2', name: 'Mandatsvertrag_Vorlage.docx', kind: 'file', format: 'DOCX', size: '0.2 MB', modified: 'Jan 05', modifiedBy: 'Petra Meier' },
    { id: 'vm3', name: 'Checkliste_Jahresabschluss.xlsx', kind: 'file', format: 'XLSX', size: '0.15 MB', modified: 'Feb 10', modifiedBy: 'Hans Schmidt' },
  ],
  'bg-f1': [
    { id: 'bg-fi1', name: 'Kontenplan_2026.xlsx', kind: 'file', format: 'XLSX', size: '0.6 MB', modified: 'January 10', modifiedBy: 'Klaus Bergmann' },
    { id: 'bg-fi2', name: 'Budget_2026_Bergmann.xlsx', kind: 'file', format: 'XLSX', size: '1.2 MB', modified: 'January 05', modifiedBy: 'Maria Bergmann' },
    { id: 'bg-fi3', name: 'Liquiditätsplanung_Q1_2026.xlsx', kind: 'file', format: 'XLSX', size: '0.8 MB', modified: 'February 15', modifiedBy: 'Klaus Bergmann' },
    { id: 'bg-fi4', name: 'Investitionsplan_2026.pdf', kind: 'file', format: 'PDF', size: '2.1 MB', modified: 'February 01', modifiedBy: 'Klaus Bergmann' },
  ],
  'bg-f2': [
    { id: 'bg-co1', name: 'Datenschutzerklärung_2026.docx', kind: 'file', format: 'DOCX', size: '0.4 MB', modified: 'January 20', modifiedBy: 'Maria Bergmann' },
    { id: 'bg-co2', name: 'Compliance_Handbuch_2026.pdf', kind: 'file', format: 'PDF', size: '3.8 MB', modified: 'March 01', modifiedBy: 'Maria Bergmann' },
    { id: 'bg-co3', name: 'Arbeitsschutzrichtlinien.pdf', kind: 'file', format: 'PDF', size: '1.4 MB', modified: 'April 10', modifiedBy: 'Klaus Bergmann' },
  ],
  'bg-f3': [
    { id: 'bg-hr1', name: 'Organigramm_2026.pdf', kind: 'file', format: 'PDF', size: '0.5 MB', modified: 'February 28', modifiedBy: 'Maria Bergmann' },
    { id: 'bg-hr2', name: 'Stellenbeschreibungen_2026.docx', kind: 'file', format: 'DOCX', size: '0.7 MB', modified: 'March 15', modifiedBy: 'Maria Bergmann' },
    { id: 'bg-hr3', name: 'Gehaltstabelle_2026.xlsx', kind: 'file', format: 'XLSX', size: '0.3 MB', modified: 'January 15', modifiedBy: 'Klaus Bergmann' },
  ],
}

const PEOPLE = [
  { id: 'p1', name: 'Albert Berg', role: 'Senior Steuerberater', initials: 'AB', color: '#2563eb', fileCount: 12, lastActive: 'Yesterday' },
  { id: 'p2', name: 'Sabine Hoffmann', role: 'Steuerberaterin', initials: 'SH', color: '#059669', fileCount: 8, lastActive: '3 days ago' },
  { id: 'p3', name: 'Claudia Richter', role: 'Prüfungsassistentin', initials: 'CR', color: '#dc2626', fileCount: 6, lastActive: 'June 10' },
  { id: 'p4', name: 'Thomas Schneider', role: 'Kanzleileiter', initials: 'TS', color: '#7c3aed', fileCount: 15, lastActive: 'May 15' },
  { id: 'p5', name: 'Petra Meier', role: 'Steuerberaterin', initials: 'PM', color: '#d97706', fileCount: 9, lastActive: 'June 15' },
  { id: 'p6', name: 'Hans Schmidt', role: 'Steuerberater', initials: 'HS', color: '#0891b2', fileCount: 7, lastActive: 'March 30' },
]

const MEETINGS = [
  {
    id: 'm1', title: 'Quartalsreview Q2 2026 – Bergmann Industrie', date: 'July 10, 2026',
    participants: ['Alex Mustermensch', 'Albert Berg', 'Klaus Bergmann'],
    files: [
      { id: 'mr1', name: 'Quartalsreview_Q2_2026.pptx', format: 'PPTX', size: '4.2 MB', modified: 'July 10' },
      { id: 'mr2', name: 'Protokoll_Quartalsreview_Q2.docx', format: 'DOCX', size: '0.2 MB', modified: 'July 10' },
    ],
  },
  {
    id: 'm2', title: 'Jahresabschluss-Besprechung 2025', date: 'April 08, 2026',
    participants: ['Alex Mustermensch', 'Albert Berg', 'Klaus Bergmann', 'Maria Bergmann'],
    files: [
      { id: 'mr3', name: 'Jahresabschluss_Präsentation_2025.pptx', format: 'PPTX', size: '5.6 MB', modified: 'April 08' },
      { id: 'mr4', name: 'Besprechungsnotizen_JA_2025.docx', format: 'DOCX', size: '0.2 MB', modified: 'April 08' },
    ],
  },
  {
    id: 'm3', title: 'Betriebsprüfung Abschlussgespräch', date: 'December 09, 2025',
    participants: ['Alex Mustermensch', 'Claudia Richter'],
    files: [
      { id: 'mr5', name: 'Notizen_Abschlussgespräch.docx', format: 'DOCX', size: '0.3 MB', modified: 'Dec 09, 2025' },
    ],
  },
]

const CONNECTED_APP = { id: 'ca1', name: 'Steuerkanzlei Meier & Schmidt', host: 'steuerkanzlei-meier-schmidt-my.sharepoint.com', initials: 'SM', color: '#0066cc' }

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase()
}

function getColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0
  return SPACE_COLORS[Math.abs(hash) % SPACE_COLORS.length]
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function toTags(tags: string[]): Tag[] {
  return tags.map(t => ({ text: t, style: chipStyles.ACCENT_NEUTRAL }))
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function SpFileTypeIcon({ format, size = 22 }: { format: string; size?: number }) {
  const r = Math.round(size * 0.15)
  type Cfg = { bg: string; label: string; fs: number }
  const map: Record<string, Cfg> = {
    DOCX: { bg: '#185ABD', label: 'W',   fs: size * 0.52 },
    DOC:  { bg: '#185ABD', label: 'W',   fs: size * 0.52 },
    XLSX: { bg: '#1D6F42', label: 'X',   fs: size * 0.52 },
    XLS:  { bg: '#1D6F42', label: 'X',   fs: size * 0.52 },
    PPTX: { bg: '#C43E1C', label: 'P',   fs: size * 0.52 },
    PPT:  { bg: '#C43E1C', label: 'P',   fs: size * 0.52 },
    PDF:  { bg: '#E8192C', label: 'PDF', fs: size * 0.30 },
    ONE:  { bg: '#7719AA', label: 'N',   fs: size * 0.52 },
    ZIP:  { bg: '#6B7280', label: 'ZIP', fs: size * 0.27 },
  }
  const cfg = map[format?.toUpperCase()] ?? { bg: '#6B7280', label: (format ?? '?').slice(0, 3).toUpperCase(), fs: size * 0.27 }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect x="0" y="0" width={size} height={size} rx={r} fill={cfg.bg} />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central" fill="white" fontSize={cfg.fs} fontWeight="700" fontFamily="'Segoe UI',Arial,sans-serif">{cfg.label}</text>
    </svg>
  )
}

function SpFolderIcon({ size = 22 }: { size?: number }) {
  const s = size
  return (
    <svg width={s} height={s * 0.85} viewBox="0 0 22 18" fill="none">
      <path d="M1 3C1 2.45 1.45 2 2 2H8.5L10.5 4.5H20C20.55 4.5 21 4.95 21 5.5V16C21 16.55 20.55 17 20 17H2C1.45 17 1 16.55 1 16V3Z" fill="#FFB900"/>
      <rect x="1" y="7" width="20" height="10" rx="1" fill="#FDD231"/>
    </svg>
  )
}

function MsLogo({ size = 20 }: { size?: number }) {
  const half = size / 2 - 1
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, width: size, height: size }}>
      <div style={{ backgroundColor: '#F25022', borderRadius: 1, width: half, height: half }} />
      <div style={{ backgroundColor: '#7FBA00', borderRadius: 1, width: half, height: half }} />
      <div style={{ backgroundColor: '#00A4EF', borderRadius: 1, width: half, height: half }} />
      <div style={{ backgroundColor: '#FFB900', borderRadius: 1, width: half, height: half }} />
    </div>
  )
}

function CopilotIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.00078 10.687C6.5133 10.687 5.31067 9.48436 5.31067 7.99687C5.31067 6.50939 6.5133 5.30677 8.00078 5.30677C9.48826 5.30677 10.6909 6.50939 10.6909 7.99687C10.6909 9.48436 9.48826 10.687 8.00078 10.687ZM8.00078 6.09797C6.9564 6.09797 6.10188 6.9525 6.10188 7.99687C6.10188 9.04125 6.9564 9.89578 8.00078 9.89578C9.04516 9.89578 9.89969 9.04125 9.89969 7.99687C9.89969 6.9525 9.04516 6.09797 8.00078 6.09797ZM8.01662 15.181C6.38673 15.181 5.24739 13.9151 5.24739 12.1111C5.19991 11.0035 4.47199 10.7661 3.87067 10.7661C2.92122 10.7661 2.08254 10.4496 1.51287 9.86414C1.03814 9.37359 0.800781 8.72479 0.800781 7.99687C0.83243 5.9872 2.41485 5.24348 3.8865 5.22764C4.55111 5.22764 5.24739 4.8637 5.24739 3.88259C5.23155 2.03116 6.35505 0.796875 8.00078 0.796875C9.64651 0.796875 10.6909 1.99951 10.77 3.86677C10.8175 5.03775 11.6403 5.22764 12.1151 5.22764C13.5076 5.22764 15.1533 5.97136 15.2008 7.99687C15.2008 8.72479 14.9634 9.37359 14.4729 9.86414C13.9032 10.4338 13.0487 10.7661 12.1151 10.7661C11.5296 10.7661 10.8175 11.0035 10.7859 12.1111C10.7067 13.9784 9.63067 15.181 8.01662 15.181ZM6.02275 3.88259C6.02275 4.94282 5.37396 6.00304 3.8865 6.01885C3.20605 6.01885 1.62364 6.22458 1.59199 7.99687C1.59199 8.50326 1.75023 8.96217 2.08254 9.29447C2.49397 9.72173 3.14276 9.95906 3.87067 9.95906C5.15242 9.95906 5.97527 10.7819 6.03859 12.0637C6.03859 13.2188 6.65571 14.374 8.01662 14.374C9.3775 14.374 9.93133 13.5037 9.99461 12.0637C10.0421 10.7661 10.8649 9.95906 12.1151 9.94326C12.843 9.94326 13.4918 9.70589 13.919 9.27863C14.2513 8.93049 14.4254 8.48742 14.4096 7.98103C14.3779 6.16125 12.6373 6.00304 12.1151 6.00304C11.1182 6.00304 10.0421 5.43337 9.97881 3.88259C9.91549 2.44259 9.18761 1.57226 8.00078 1.57226C6.81396 1.57226 6.02275 2.47424 6.02275 3.86677V3.88259Z" fill="currentColor" stroke="currentColor" strokeWidth="0.2"/>
    </svg>
  )
}

function CompareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="2" width="6" height="12" rx="1" stroke="currentColor" strokeWidth="1" />
      <rect x="9" y="2" width="6" height="12" rx="1" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

// ── TagsCell (V7 smart overflow) ──────────────────────────────────────────────

function TagsCellInner({ tags }: { tags: Tag[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visibleCount, setVisibleCount] = useState(tags.length)

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return
    const children = Array.from(container.children) as HTMLElement[]
    if (!children.length) return
    const baseTop = container.getBoundingClientRect().top
    const rowTops: number[] = []
    for (const el of children) {
      const t = Math.round(el.getBoundingClientRect().top - baseTop)
      if (!rowTops.includes(t)) rowTops.push(t)
    }
    rowTops.sort((a, b) => a - b)
    if (rowTops.length <= 2) return
    const row2Top = rowTops[1]
    let visible = 0
    for (const el of children) {
      if (Math.round(el.getBoundingClientRect().top - baseTop) <= row2Top) visible++
    }
    setVisibleCount(Math.max(1, visible - 1))
  }, [])

  const hidden = tags.slice(visibleCount)
  return (
    <div ref={containerRef} style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'flex-start' }}>
      {tags.slice(0, visibleCount).map((tag, i) => (
        <Chip key={i} label={tag.text} chipStyle={tag.style as typeof chipStyles[keyof typeof chipStyles]} variant={chipVariants.SUBTLE} />
      ))}
      {hidden.length > 0 && (
        <Tooltip title={hidden.map(t => t.text).join(', ')}>
          <Chip label={`+${hidden.length}`} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} />
        </Tooltip>
      )}
    </div>
  )
}

function TagsCell({ tags }: { tags: Tag[] }) {
  return <TagsCellInner key={tags.map(t => t.text).join('|')} tags={tags} />
}

// ── MsLoginScreen ─────────────────────────────────────────────────────────────

function MsLoginScreen({ onNext, onClose }: { onNext: () => void; onClose: () => void }) {
  const [email, setEmail] = useState('')
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1300, background: 'linear-gradient(135deg,#fde8e8 0%,#e8e8fd 30%,#d8eef8 60%,#e8f5e8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 420, backgroundColor: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
        <div style={{ padding: '32px 44px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <MsLogo size={20} /><span style={{ fontSize: 18, color: '#1a1a1a' }}>Microsoft</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 600, color: '#1a1a1a', marginBottom: 20 }}>Sign in</div>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email, phone, or Skype" style={{ width: '100%', border: 'none', borderBottom: '1px solid #0078d4', outline: 'none', fontSize: 15, padding: '8px 0', marginBottom: 16, boxSizing: 'border-box' }} />
          <div style={{ fontSize: 13, marginBottom: 8 }}>No account? <span style={{ color: '#0078d4', cursor: 'pointer' }}>Create one!</span></div>
          <div style={{ fontSize: 13, color: '#0078d4', cursor: 'pointer', marginBottom: 24 }}>Sign in with a security key ⓘ</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#0078d4', cursor: 'pointer' }} onClick={onClose}>Back</span>
            <button onClick={onNext} style={{ backgroundColor: '#0078d4', color: '#fff', border: 'none', padding: '8px 24px', fontSize: 15, cursor: 'pointer' }}>Next</button>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #e0e0e0', padding: '14px 44px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <Icon type={iconType.SearchOutlined} size={16} color="neutral-darken3" />
          <span style={{ fontSize: 14, color: '#1a1a1a' }}>Sign-in options</span>
        </div>
      </div>
    </div>
  )
}

// ── SpFilePicker ──────────────────────────────────────────────────────────────

function SpFilePicker({ onClose, onSelect }: { onClose: () => void; onSelect: (files: SpItem[]) => void }) {
  const [navSection, setNavSection] = useState('Home')
  const [folderPath, setFolderPath] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)
  const [selectedItems, setSelectedItems] = useState<Map<string, SpItem>>(new Map())
  const loadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(t)
  }, [])

  const startLoad = (ms: number) => {
    if (loadTimerRef.current) clearTimeout(loadTimerRef.current)
    setLoading(true)
    loadTimerRef.current = setTimeout(() => setLoading(false), ms)
  }

  const switchSection = (section: string) => {
    setNavSection(section)
    setFolderPath([])
    startLoad(600)
  }

  const enterFolder = (item: SpItem) => {
    setFolderPath(prev => [...prev, { id: item.id, name: item.name }])
    startLoad(350)
  }

  const navigateToBreadcrumb = (idx: number) => {
    setFolderPath(prev => prev.slice(0, idx + 1))
    startLoad(300)
  }

  const navigateToRoot = () => {
    setFolderPath([])
    startLoad(300)
  }

  const currentItems = useMemo(() => {
    const base = SP_SECTIONS[navSection] ?? []
    if (folderPath.length === 0) return base
    return FOLDER_CONTENTS[folderPath[folderPath.length - 1].id] ?? []
  }, [navSection, folderPath])

  const toggleItem = (item: SpItem) => {
    if (item.kind === 'folder') { enterFolder(item); return }
    setSelectedItems(prev => {
      const next = new Map(prev)
      next.has(item.id) ? next.delete(item.id) : next.set(item.id, item)
      return next
    })
  }

  const sectionTitle = navSection === 'Home' ? 'Recents'
    : navSection === 'Steuerkanzlei' ? 'Steuerkanzlei Meier & Schmidt'
    : navSection === 'Bergmann' ? 'Bergmann Industrie GmbH'
    : navSection

  const contentHeader = folderPath.length > 0 ? folderPath[folderPath.length - 1].name : sectionTitle

  const navItem = (label: string, icon: string, sectionKey?: string) => {
    const key = sectionKey ?? label
    const active = navSection === key && folderPath.length === 0
    return (
      <div key={key} onClick={() => switchSection(key)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 16px', cursor: 'pointer', borderLeft: active ? '2px solid #0078d4' : '2px solid transparent', backgroundColor: active ? '#ebf4ff' : 'transparent', color: active ? '#0078d4' : '#1a1a1a', fontSize: 13, userSelect: 'none' }}>
        <Icon type={icon as typeof iconType[keyof typeof iconType]} size={16} color={active ? 'primary-base' : 'neutral-darken3'} />
        {label}
      </div>
    )
  }

  const isPeople = navSection === 'People'
  const isMeetings = navSection === 'Meetings'

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1200, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 1100, height: 760, backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.22)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${spacing(3)}px ${spacing(5)}px`, borderBottom: '1px solid #e8e8e8', flexShrink: 0 }}>
          <Typography size="base" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>Select file to import</Typography>
          <ButtonGhost onClick={onClose}>Close</ButtonGhost>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar */}
          <div style={{ width: 232, flexShrink: 0, borderRight: '1px solid #f0f0f0', overflowY: 'auto', padding: `${spacing(3)}px 0`, backgroundColor: '#fafafa' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: `${spacing(2)}px ${spacing(4)}px`, marginBottom: spacing(2) }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#0078d4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>AM</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Alex Mustermensch</span>
            </div>
            {navItem('Home', iconType.FolderFilled)}
            {navItem('My files', iconType.FolderFilled)}
            {navItem('Shared', iconType.UserOutlined)}
            {navItem('Favorites', iconType.StarOutlined)}
            <div style={{ padding: `${spacing(3)}px ${spacing(4)}px ${spacing(1)}px`, fontSize: 10, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Browse by</div>
            {navItem('People', iconType.UserOutlined)}
            {navItem('Meetings', iconType.CalendarOutlined)}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: `${spacing(3)}px ${spacing(4)}px ${spacing(1)}px` }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Quick access</span>
            </div>
            <div onClick={() => switchSection('Steuerkanzlei')} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 16px', cursor: 'pointer', borderLeft: navSection === 'Steuerkanzlei' ? '2px solid #0078d4' : '2px solid transparent', backgroundColor: navSection === 'Steuerkanzlei' ? '#ebf4ff' : 'transparent', userSelect: 'none' }}>
              <div style={{ width: 20, height: 20, borderRadius: 4, backgroundColor: '#0066cc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#fff', fontSize: 9, fontWeight: 700 }}>SM</span>
              </div>
              <span style={{ fontSize: 13, color: navSection === 'Steuerkanzlei' ? '#0078d4' : '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Steuerkanzlei Meier & Sc...</span>
            </div>
            <div onClick={() => switchSection('Bergmann')} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 16px', cursor: 'pointer', borderLeft: navSection === 'Bergmann' ? '2px solid #0078d4' : '2px solid transparent', backgroundColor: navSection === 'Bergmann' ? '#ebf4ff' : 'transparent', userSelect: 'none' }}>
              <div style={{ width: 20, height: 20, borderRadius: 4, backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#fff', fontSize: 9, fontWeight: 700 }}>BI</span>
              </div>
              <span style={{ fontSize: 13, color: navSection === 'Bergmann' ? '#0078d4' : '#1a1a1a' }}>Bergmann Industrie GmbH</span>
            </div>
            <div style={{ padding: '7px 16px', color: '#0078d4', fontSize: 13, cursor: 'pointer' }}>More places...</div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Content header + breadcrumb */}
            <div style={{ padding: `${spacing(3)}px ${spacing(4)}px`, borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
              {/* Breadcrumb */}
              {folderPath.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6, fontSize: 12, color: '#555' }}>
                  <span onClick={navigateToRoot} style={{ color: '#0078d4', cursor: 'pointer' }}>{sectionTitle}</span>
                  {folderPath.map((seg, idx) => (
                    <span key={seg.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Icon type={iconType.ChevronRightOutlined} size={12} color="neutral-darken2" />
                      {idx < folderPath.length - 1
                        ? <span onClick={() => navigateToBreadcrumb(idx)} style={{ color: '#0078d4', cursor: 'pointer' }}>{seg.name}</span>
                        : <span style={{ color: '#1a1a1a' }}>{seg.name}</span>
                      }
                    </span>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography size="base" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>{contentHeader}</Typography>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
                  <div style={{ border: '1px solid #e0e0e0', borderRadius: 6, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#555', cursor: 'pointer' }}>
                    <Icon type={iconType.SearchOutlined} size={12} color="neutral-darken3" />
                    <span>Search</span>
                  </div>
                  <Icon type={iconType.ThreeDotsHorFilled} size={16} color="neutral-darken3" />
                </div>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                  <Spinner />
                </div>
              ) : isPeople ? (
                <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {PEOPLE.map(p => (
                    <div key={p.id} style={{ border: '1px solid #e8e8e8', borderRadius: 8, padding: 14, cursor: 'pointer', transition: 'border-color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = '#0078d4')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = '#e8e8e8')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>{p.initials}</span>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: '#888' }}>{p.role}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: '#888' }}>{p.fileCount} shared files · {p.lastActive}</div>
                    </div>
                  ))}
                </div>
              ) : isMeetings ? (
                <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {MEETINGS.map(m => (
                    <div key={m.id} style={{ border: '1px solid #e8e8e8', borderRadius: 8, padding: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: '#0078d4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon type={iconType.CalendarOutlined} size={20} color="white" />
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{m.title}</div>
                          <div style={{ fontSize: 11, color: '#888' }}>{m.date} · {m.participants.length} participants</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginLeft: 46 }}>
                        {m.files.map(f => (
                          <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', backgroundColor: '#f8f8f8', borderRadius: 5 }}>
                            <SpFileTypeIcon format={f.format} size={18} />
                            <span style={{ fontSize: 12, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{f.name}</span>
                            <span style={{ fontSize: 11, color: '#888', flexShrink: 0 }}>{f.size}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* Table header */}
                  <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 140px 140px', padding: `0 ${spacing(4)}px`, borderBottom: '1px solid #f0f0f0', backgroundColor: '#fafafa', flexShrink: 0 }}>
                    <div />
                    <div style={{ padding: '7px 0 7px 10px', fontSize: 12, color: '#555', fontWeight: 600 }}>Name</div>
                    <div style={{ padding: '7px 0', fontSize: 12, color: '#555', fontWeight: 600 }}>Modified</div>
                    <div style={{ padding: '7px 0', fontSize: 12, color: '#555', fontWeight: 600 }}>Modified By</div>
                  </div>
                  {currentItems.length === 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                      <Typography size="base-sm" color="neutral-darken2">No files in this location.</Typography>
                    </div>
                  ) : currentItems.map(item => {
                    const isFolder = item.kind === 'folder'
                    const isSelected = !isFolder && selectedItems.has(item.id)
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleItem(item)}
                        style={{ display: 'grid', gridTemplateColumns: '32px 1fr 140px 140px', padding: `9px ${spacing(4)}px`, cursor: 'pointer', backgroundColor: isSelected ? '#EBF4FF' : 'transparent', borderBottom: '1px solid #f5f5f5', alignItems: 'center', transition: 'background-color 0.1s' }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = '#f7f7f7' }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {isFolder
                            ? <SpFolderIcon size={20} />
                            : <SpFileTypeIcon format={item.format ?? ''} size={20} />
                          }
                        </div>
                        <div style={{ paddingLeft: 10, overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 13, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                          {isFolder && <Icon type={iconType.ChevronRightOutlined} size={12} color="neutral-darken2" />}
                          {!isFolder && item.size && <span style={{ fontSize: 11, color: '#aaa', flexShrink: 0 }}>{item.size}</span>}
                        </div>
                        <div style={{ fontSize: 12, color: '#666' }}>{item.modified}</div>
                        <div style={{ fontSize: 12, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.modifiedBy ?? '—'}</div>
                      </div>
                    )
                  })}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${spacing(3)}px ${spacing(5)}px`, borderTop: '1px solid #e8e8e8', flexShrink: 0 }}>
          <Typography size="base-sm" color="neutral-darken2">
            {selectedItems.size > 0 ? `${selectedItems.size} file${selectedItems.size > 1 ? 's' : ''} selected` : 'Click files to select. Click folders to navigate.'}
          </Typography>
          <div style={{ display: 'flex', gap: spacing(2) }}>
            <ButtonGhost onClick={onClose}>Cancel</ButtonGhost>
            <ButtonPrimary disabled={selectedItems.size === 0} onClick={() => onSelect(Array.from(selectedItems.values()))}>
              {selectedItems.size > 0 ? `Import (${selectedItems.size})` : 'Import'}
            </ButtonPrimary>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Version6 ──────────────────────────────────────────────────────────────────

export default function Version6() {
  const { notification } = useNotifications()

  // Spaces state
  const [spaces, setSpaces] = useState<Space[]>([
    { id: PERSONAL_ID, name: 'Meine Dokumente', description: 'Ihre persönliche Dokumentenbibliothek – direkt hochladen und verwalten', initials: 'MD', color: '#374151', docCount: 7 },
  ])
  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(null)
  const [spaceDocs, setSpaceDocs] = useState<Record<string, Doc[]>>({ [PERSONAL_ID]: PERSONAL_DOCS })

  // New space modal
  const [newSpaceOpen, setNewSpaceOpen] = useState(false)
  const [nsName, setNsName] = useState('')
  const [nsDesc, setNsDesc] = useState('')
  const [nsType, setNsType] = useState('')
  const [nsAccess, setNsAccess] = useState('Private')

  // Upload / import flow
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [showMsLogin, setShowMsLogin] = useState(false)
  const [showFilePicker, setShowFilePicker] = useState(false)

  // Space detail state
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isInitialLoading, setIsInitialLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [editingCell, setEditingCell] = useState<{ id: string; key: string } | null>(null)
  const [cellValue, setCellValue] = useState('')

  // Bulk edit / selection
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_COLLAPSED_WIDTH)

  // Space card hover
  const [spaceHover, setSpaceHover] = useState<string | null>(null)
  const [addSpaceHover, setAddSpaceHover] = useState(false)

  const batchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingFilesRef = useRef<File[]>([])

  useEffect(() => {
    const sidebar = document.getElementById(LAYOUT_SIDEBAR_ID)
    if (!sidebar) return
    setSidebarWidth(sidebar.getBoundingClientRect().width)
    const observer = new ResizeObserver(entries => {
      setSidebarWidth(entries[0].contentRect.width)
    })
    observer.observe(sidebar)
    return () => observer.disconnect()
  }, [])

  const activeSpace = spaces.find(s => s.id === activeSpaceId) ?? null
  const isPersonal = activeSpaceId === PERSONAL_ID
  const docs = activeSpaceId ? (spaceDocs[activeSpaceId] ?? []) : []
  const filteredDocs = useMemo(
    () => searchQuery ? docs.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase())) : docs,
    [docs, searchQuery],
  )
  const pagedDocs = useMemo(
    () => filteredDocs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredDocs, currentPage],
  )

  const handleOpenSpace = (id: string) => {
    setSearchQuery('')
    setCurrentPage(1)
    setActiveSpaceId(id)
    setIsInitialLoading(true)
    setSelectedKeys(new Set())
    setTimeout(() => setIsInitialLoading(false), 700)
  }

  const handleBack = () => {
    setActiveSpaceId(null)
    setSearchQuery('')
    setCurrentPage(1)
    setEditingCell(null)
    setSelectedKeys(new Set())
  }

  const handleSaveSpace = () => {
    const id = `space-${Date.now()}`
    setSpaces(prev => [...prev, { id, name: nsName.trim(), description: nsDesc.trim(), initials: getInitials(nsName.trim()), color: getColor(nsName.trim()), docCount: 0 }])
    setSpaceDocs(prev => ({ ...prev, [id]: [] }))
    setNewSpaceOpen(false)
    setNsName(''); setNsDesc(''); setNsType(''); setNsAccess('Private')
    handleOpenSpace(id)
  }

  const handleSaveDoc = useCallback((updated: Doc) => {
    setSpaceDocs(prev => {
      const list = prev[activeSpaceId!] ?? []
      return { ...prev, [activeSpaceId!]: list.map(d => d.id === updated.id ? updated : d) }
    })
  }, [activeSpaceId])

  const handleUpload = useCallback((file: File | Blob) => {
    if (!(file instanceof File) || !activeSpaceId) return
    pendingFilesRef.current.push(file)
    if (batchTimerRef.current) clearTimeout(batchTimerRef.current)
    batchTimerRef.current = setTimeout(() => {
      const files = [...pendingFilesRef.current]
      pendingFilesRef.current = []
      setIsUploading(true)
      notification.default({ key: UPLOAD_KEY, title: 'Wird hochgeladen...', placement: toastPlacements.BOTTOM_RIGHT, duration: 0, leadingIcon: false })
      setTimeout(() => {
        notification.destroy(UPLOAD_KEY)
        setIsUploading(false)
        const newDocs: Doc[] = files.map((f, i) => ({
          id: `upload-${Date.now()}-${i}`,
          name: f.name.replace(/\.[^/.]+$/, ''),
          type: '—',
          tags: [],
          uploaded: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          size: formatFileSize(f.size),
          format: (f.name.split('.').pop()?.toUpperCase() ?? 'PDF'),
        }))
        setSpaceDocs(prev => ({ ...prev, [activeSpaceId!]: [...newDocs, ...(prev[activeSpaceId!] ?? [])] }))
        setCurrentPage(1)
        notification.success({ title: 'Upload erfolgreich', placement: toastPlacements.BOTTOM_LEFT, duration: 5 })
      }, 1800)
    }, 150)
  }, [activeSpaceId, notification])

  const handleSpImport = (files: SpItem[]) => {
    if (!activeSpaceId) return
    const newDocs: Doc[] = files.map(f => ({
      id: `sp-${f.id}-${Date.now()}`,
      name: f.name.replace(/\.[^/.]+$/, ''),
      type: '—',
      tags: [],
      uploaded: f.modified,
      size: f.size ?? '—',
      format: f.format ?? 'FILE',
    }))
    setSpaceDocs(prev => ({ ...prev, [activeSpaceId]: [...newDocs, ...(prev[activeSpaceId] ?? [])] }))
    setShowFilePicker(false)
    setCurrentPage(1)
    notification.success({ title: 'Import erfolgreich', content: `${files.length} Dokument${files.length > 1 ? 'e' : ''} importiert`, placement: toastPlacements.BOTTOM_LEFT, duration: 5 })
  }

  const handleDeleteDoc = useCallback((id: string) => {
    if (!activeSpaceId) return
    setSpaceDocs(prev => ({ ...prev, [activeSpaceId]: (prev[activeSpaceId] ?? []).filter(d => d.id !== id) }))
    setSelectedKeys(prev => { if (!prev.has(id)) return prev; const next = new Set(prev); next.delete(id); return next })
  }, [activeSpaceId])

  const handleBulkDelete = useCallback(() => {
    if (!activeSpaceId) return
    setSpaceDocs(prev => ({ ...prev, [activeSpaceId]: (prev[activeSpaceId] ?? []).filter(d => !selectedKeys.has(d.id)) }))
    setSelectedKeys(new Set())
  }, [activeSpaceId, selectedKeys])

  const confirmBulkDelete = useCallback(() => {
    const count = selectedKeys.size
    const doc = count === 1 ? docs.find(d => selectedKeys.has(d.id)) : undefined
    handleBulkDelete()
    setDeleteModalOpen(false)
    notification.default({
      title: count === 1 ? 'Dokument gelöscht' : 'Dokumente gelöscht',
      icon: iconType.TrashFilled,
      content: <Typography size="base" color="neutral-darken5">{count === 1 ? doc?.name : `${count} Dokumente`}</Typography>,
      placement: toastPlacements.BOTTOM_LEFT,
      duration: 4,
    })
  }, [selectedKeys, docs, handleBulkDelete, notification])

  const allSelected = filteredDocs.length > 0 && filteredDocs.every(d => selectedKeys.has(d.id))
  const someSelected = filteredDocs.some(d => selectedKeys.has(d.id))

  // Table columns
  const columns = useMemo(() => [
    {
      title: () => (
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected && !allSelected}
          onChange={e => {
            setSelectedKeys(prev => {
              const next = new Set(prev)
              filteredDocs.forEach(d => {
                if (e.target.checked) next.add(d.id)
                else next.delete(d.id)
              })
              return next
            })
          }}
        />
      ),
      key: 'checkbox',
      width: 48,
      onCell: (record: Doc) => ({
        style: { verticalAlign: 'top', backgroundColor: selectedKeys.has(record.id) ? '#EEF4FF' : undefined },
        onClick: (e: React.MouseEvent) => e.stopPropagation(),
      }),
      render: (_: unknown, record: Doc) => (
        <Checkbox
          checked={selectedKeys.has(record.id)}
          onChange={e => {
            setSelectedKeys(prev => {
              const next = new Set(prev)
              if (e.target.checked) next.add(record.id)
              else next.delete(record.id)
              return next
            })
          }}
          onClick={e => e.stopPropagation()}
        />
      ),
    },
    {
      title: 'Name', key: 'name', dataIndex: 'name', width: '28%', ellipsis: true,
      onCell: (record: Doc) => ({ style: { verticalAlign: 'top', backgroundColor: selectedKeys.has(record.id) ? '#EEF4FF' : undefined } }),
      render: (name: string) => <Typography size="base-sm" color="neutral-darken5">{name}</Typography>,
    },
    {
      title: 'Type', key: 'type', dataIndex: 'type', width: 140,
      onCell: (record: Doc) => ({
        style: { verticalAlign: 'top', cursor: editingCell?.id === record.id && editingCell.key === 'type' ? 'default' : 'text', backgroundColor: selectedKeys.has(record.id) ? '#EEF4FF' : undefined },
      }),
      render: (val: string, record: Doc) => {
        if (editingCell?.id === record.id && editingCell.key === 'type') {
          const doSave = () => { handleSaveDoc({ ...record, type: cellValue }); setEditingCell(null); setCellValue('') }
          return (
            <div onClick={e => e.stopPropagation()}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <Input
                {...({ autoFocus: true } as any)}
                value={cellValue}
                onChange={e => setCellValue(e.target.value)}
                onBlur={doSave}
                onKeyDown={e => {
                  if (e.key === 'Enter') { e.preventDefault(); doSave() }
                  if (e.key === 'Escape') { e.stopPropagation(); setEditingCell(null); setCellValue('') }
                }}
              />
            </div>
          )
        }
        return (
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 6, minHeight: 22, cursor: 'text', borderRadius: 3, border: '1px dashed transparent', padding: '1px 6px 1px 4px' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#EBF0FF'; e.currentTarget.style.borderColor = '#D0D8EE'; const p = e.currentTarget.querySelector<HTMLElement>('[data-pencil]'); if (p) p.style.opacity = '1' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.borderColor = 'transparent'; const p = e.currentTarget.querySelector<HTMLElement>('[data-pencil]'); if (p) p.style.opacity = '0' }}
            onClick={e => { e.stopPropagation(); e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.borderColor = 'transparent'; setCellValue(val); setEditingCell({ id: record.id, key: 'type' }) }}
          >
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13, color: val === '—' ? '#aaa' : '#374151' }}>{val}</span>
            <span data-pencil style={{ opacity: 0, transition: 'opacity 0.15s', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
              <Icon type={iconType.EditRecOutlined} size={12} color="neutral-darken2" />
            </span>
          </div>
        )
      },
    },
    {
      title: 'Tags', key: 'tags', dataIndex: 'tags',
      onCell: (record: Doc) => ({ style: { verticalAlign: 'top', backgroundColor: selectedKeys.has(record.id) ? '#EEF4FF' : undefined } }),
      render: (tags: string[]) => <TagsCell tags={toTags(tags)} />,
    },
    {
      title: isPersonal ? 'Hochgeladen' : 'Geändert', key: 'uploaded', dataIndex: 'uploaded', width: 115, ellipsis: true,
      onCell: (record: Doc) => ({ style: { verticalAlign: 'top', backgroundColor: selectedKeys.has(record.id) ? '#EEF4FF' : undefined } }),
      render: (d: string) => <Typography size="base-sm" color="neutral-darken3">{d}</Typography>,
    },
    {
      title: 'Größe', key: 'size', dataIndex: 'size', width: 80, ellipsis: true,
      onCell: (record: Doc) => ({ style: { verticalAlign: 'top', backgroundColor: selectedKeys.has(record.id) ? '#EEF4FF' : undefined } }),
      render: (s: string) => <Typography size="base-sm" color="neutral-darken3">{s}</Typography>,
    },
    {
      title: 'Format', key: 'format', dataIndex: 'format', width: 80,
      onCell: (record: Doc) => ({ style: { verticalAlign: 'top', backgroundColor: selectedKeys.has(record.id) ? '#EEF4FF' : undefined } }),
      render: (f: string) => <Chip label={f} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} />,
    },
    {
      title: '', key: 'actions', width: 52,
      onCell: (record: Doc) => ({ style: { verticalAlign: 'top', backgroundColor: selectedKeys.has(record.id) ? '#EEF4FF' : undefined } }),
      render: (_: unknown, record: Doc) => (
        <Dropdown
          items={[
            { key: 'download', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><Icon type={iconType.DownloadOutlined} size={16} />Download</span>, onClick: () => {} },
            { key: 'delete', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2), color: colorPalette.danger.darken2 }}><Icon type={iconType.TrashOutlined} size={16} color="danger-darken2" />Löschen</span>, onClick: () => handleDeleteDoc(record.id) },
          ]}
          trigger={dropdownTriggers.CLICK}
          placement={dropdownPlacement.BOTTOM_RIGHT}
        >
          <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.ThreeDotsHorFilled} />
        </Dropdown>
      ),
    },
  ], [isPersonal, editingCell, cellValue, handleSaveDoc, handleDeleteDoc, selectedKeys, allSelected, someSelected, filteredDocs])

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
    color: colorPalette.neutral.darken4, marginBottom: spacing(1),
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: colorPalette.white, fontFamily: "'Open Sans', sans-serif" }}>
      {showMsLogin && (
        <MsLoginScreen
          onNext={() => { setShowMsLogin(false); setShowFilePicker(true) }}
          onClose={() => setShowMsLogin(false)}
        />
      )}
      {showFilePicker && (
        <SpFilePicker onClose={() => setShowFilePicker(false)} onSelect={handleSpImport} />
      )}

      {!activeSpaceId ? (
        /* ── Spaces list ── */
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography size="heading-lg" weight="bold">Meine Platz</Typography>
            <button
              onClick={() => setNewSpaceOpen(true)}
              onMouseEnter={() => setAddSpaceHover(true)}
              onMouseLeave={() => setAddSpaceHover(false)}
              style={{ border: `1.5px solid ${addSpaceHover ? colorPalette.blue.base : '#d0d5dd'}`, borderRadius: 8, backgroundColor: '#fff', padding: `${spacing(2)}px ${spacing(4)}px`, fontSize: 14, cursor: 'pointer', color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: 6, transition: 'border-color 0.15s' }}
            >
              <Icon type={iconType.PlusOutlined} size={12} color="neutral-darken4" />
              Space
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {spaces.map(space => {
              const isP = space.id === PERSONAL_ID
              const hovered = spaceHover === space.id
              return (
                <div
                  key={space.id}
                  onClick={() => handleOpenSpace(space.id)}
                  onMouseEnter={() => setSpaceHover(space.id)}
                  onMouseLeave={() => setSpaceHover(null)}
                  style={{
                    border: `1.5px solid ${hovered ? (isP ? '#374151' : space.color) : '#e5e7eb'}`,
                    borderRadius: 12, padding: 20, backgroundColor: hovered ? '#fafafa' : '#fff',
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 14,
                    transition: 'border-color 0.15s, background-color 0.15s',
                    ...(isP ? { gridColumn: '1 / -1' } : {}),
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: isP ? '#f3f4f6' : space.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {isP
                        ? <Icon type={iconType.FolderFilled} size={20} color="neutral-darken3" />
                        : <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{space.initials}</span>
                      }
                    </div>
                    <div style={{ pointerEvents: 'none' }}>
                      {isP
                        ? <Chip label="PERSONAL LIBRARY" chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} />
                        : <span onClick={e => e.stopPropagation()} style={{ pointerEvents: 'auto', padding: 4, cursor: 'pointer', display: 'block' }}><Icon type={iconType.ThreeDotsHorFilled} size={16} color="neutral-darken3" /></span>
                      }
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Typography size="base" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>{space.name}</Typography>
                      {isP && <Icon type={iconType.LockOutlined} size={12} color="neutral-darken2" />}
                    </div>
                    <Typography size="base-sm" color="neutral-darken2">{space.description}</Typography>
                  </div>
                  <Typography size="base-sm" color="neutral-darken2">
                    {spaceDocs[space.id]?.length ?? 0} Dokumente{isP ? ' · Zuletzt aktualisiert May 5, 2026' : ''}
                  </Typography>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* ── Space detail ── */
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, height: '100%', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ButtonGhost leftIcon={iconType.ChevronLeftOutlined} onClick={handleBack} />
              <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: isPersonal ? '#f3f4f6' : activeSpace?.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {isPersonal
                  ? <Icon type={iconType.FolderFilled} size={20} color="neutral-darken3" />
                  : <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{activeSpace?.initials}</span>
                }
              </div>
              <Typography size="heading-lg" weight="bold">{activeSpace?.name}</Typography>
            </div>
            <SearchBar
              placeholder="Dokumente durchsuchen"
              value={searchQuery}
              onChange={v => { setSearchQuery(v); setCurrentPage(1) }}
            />
          </div>

          <div style={{ flexShrink: 0 }}>
            <Typography size="base-sm" color="neutral-darken2">{activeSpace?.description}</Typography>
          </div>

          {/* Upload zone (personal) or action bar (shared) */}
          {isPersonal ? (
            <div style={{ flexShrink: 0 }}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <FileUploader onUpload={handleUpload} accept={['.pdf', '.docx', '.xlsx', '.txt']} {...({ multiple: true } as any)}>
                <div style={{ border: '1.5px dashed #d0d5dd', borderRadius: 8, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: isUploading ? 'not-allowed' : 'pointer', backgroundColor: isUploading ? '#f5f5f5' : undefined, pointerEvents: isUploading ? 'none' : 'auto', transition: 'background-color 0.2s' }}>
                  <Icon type={iconType.UploadOutlined} color={isUploading ? 'disabled-lighten1' : 'neutral-darken4'} />
                  <Typography color={isUploading ? 'disabled-lighten1' : 'neutral-darken5'}>Klicken Sie, um ein Dokument auszuwählen, oder ziehen Sie es hierher.</Typography>
                  <Typography size="base-sm" color={isUploading ? 'disabled-lighten1' : 'neutral-darken2'}>PDF-, DOCX-, XLSX- und TXT-Formate, max. Größe 10 MB</Typography>
                </div>
              </FileUploader>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <Typography size="base-sm" color="primary-base">{filteredDocs.length} Dokumente</Typography>
              <ButtonPrimary leftIcon={iconType.UploadOutlined} onClick={() => setUploadModalOpen(true)}>
                Hochladen oder importieren
              </ButtonPrimary>
            </div>
          )}

          {isPersonal && (
            <div style={{ flexShrink: 0 }}>
              <Typography size="base-sm" color="primary-base">{filteredDocs.length} Dokumente</Typography>
            </div>
          )}

          {/* Table */}
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            {isInitialLoading ? (
              <Skeleton variant={skeletonVariants.TEXT} title paragraph={{ rows: PAGE_SIZE }} />
            ) : (
              <Table
                dataSource={pagedDocs.map(d => ({ ...d, key: d.id }))}
                columns={columns as never}
                pagination={false}
                innerLoading={isUploading}
              />
            )}
          </div>

          {/* Pagination */}
          <div style={{ flexShrink: 0 }}>
            <Pagination current={currentPage} total={filteredDocs.length} pageSize={PAGE_SIZE} onChange={p => setCurrentPage(p)} />
          </div>

          {/* Security footer */}
          <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: spacing(2), paddingBottom: spacing(1) }}>
            <Icon type={iconType.ShieldCheckFilled} color="primary-base" size={16} />
            <Typography size="base" color="neutral-darken2">Alle Dateien werden sicher hochgeladen und auf Viren geprüft.</Typography>
          </div>
        </div>
      )}

      {activeSpaceId && selectedKeys.size > 0 && (
        <div style={{
          position: 'fixed',
          bottom: spacing(2),
          left: sidebarWidth + spacing(2),
          right: spacing(2),
          height: 56,
          backgroundColor: colorPalette.neutral.lighten1,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `0 ${spacing(6)}px`,
          zIndex: 500,
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
              <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.CrossOutlined} onClick={() => setSelectedKeys(new Set())} />
              <Typography color="neutral-darken5">{selectedKeys.size} ausgewählt</Typography>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2), marginLeft: spacing(4) }}>
              <ButtonTertiary onClick={() => console.log('Ask CoPilot')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <CopilotIcon />
                  Ask CoPilot
                </span>
              </ButtonTertiary>
              {selectedKeys.size > 1 && (
                <ButtonTertiary onClick={() => console.log('Compare')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <CompareIcon />
                    Compare
                  </span>
                </ButtonTertiary>
              )}
              <ButtonTertiary leftIcon={iconType.DownloadOutlined} onClick={() => console.log('Download')}>Download</ButtonTertiary>
            </div>
          </div>
          <ButtonDanger leftIcon={iconType.TrashOutlined} onClick={() => setDeleteModalOpen(true)}>Löschen</ButtonDanger>
        </div>
      )}

      {/* Bulk delete confirmation modal */}
      <Modal
        visible={deleteModalOpen}
        variant={modalVariants.DANGER}
        title={selectedKeys.size === 1 ? 'Dokument löschen' : 'Dokumente löschen'}
        onClose={() => setDeleteModalOpen(false)}
        footer={{
          buttons: [
            { variant: buttonVariants.GHOST, props: { children: 'Abbrechen', onClick: () => setDeleteModalOpen(false) } },
            { variant: buttonVariants.DANGER, props: { children: 'Löschen', onClick: confirmBulkDelete } },
          ],
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
          <Typography size="base" color="neutral-darken5">
            Möchten Sie {selectedKeys.size === 1
              ? `"${docs.find(d => selectedKeys.has(d.id))?.name ?? ''}"`
              : `${selectedKeys.size} Dokumente`
            }{' '}
            <span style={{ color: colorPalette.danger.darken2, fontWeight: 700 }}>löschen</span>?
          </Typography>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
            <Icon type={iconType.InfoCircleOutlined} size={16} color="neutral-darken2" />
            <Typography size="base-sm" color="neutral-darken2">{selectedKeys.size === 1 ? 'Dieses Dokument' : 'Diese Dokumente'} stehen danach nicht mehr zur Verfügung</Typography>
          </div>
        </div>
      </Modal>

      {/* New Space modal */}
      <Modal
        visible={newSpaceOpen}
        title="Neuer Space"
        onClose={() => { setNewSpaceOpen(false); setNsName(''); setNsDesc(''); setNsType(''); setNsAccess('Private') }}
        footer={{ buttons: [
          { variant: buttonVariants.GHOST, props: { children: 'Abbrechen', onClick: () => { setNewSpaceOpen(false); setNsName(''); setNsDesc(''); setNsType(''); setNsAccess('Private') } } },
          { variant: buttonVariants.PRIMARY, props: { children: 'Speichern', onClick: handleSaveSpace, disabled: !nsName.trim() || !nsType } },
        ] }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(5) }}>
          <div>
            <div style={labelStyle}>NAME *</div>
            <Input name="ns-name" placeholder="Name für diesen Space" value={nsName} onChange={e => setNsName(e.target.value)} />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing(1) }}>
              <div style={labelStyle}>BESCHREIBUNG</div>
              <Typography size="base-sm" color="neutral-darken2">{nsDesc.length}/500</Typography>
            </div>
            <TextArea name="ns-desc" rows={3} maxLength={500} placeholder="Zweck dieses Spaces beschreiben" value={nsDesc} onChange={e => setNsDesc(e.target.value)} />
          </div>
          <div>
            <div style={labelStyle}>TYP *</div>
            <Select name="ns-type" value={nsType} placeholder="Verwendungszweck auswählen" options={[{ label: 'Mandant', value: 'Mandant' }, { label: 'Projekt', value: 'Projekt' }, { label: 'Abteilung', value: 'Abteilung' }, { label: 'Fall/Konto', value: 'Fall/Konto' }, { label: 'Sonstiges', value: 'Sonstiges' }]} onChange={v => setNsType(String(v))} />
          </div>
          <div>
            <div style={labelStyle}>ZUGRIFF</div>
            <Select name="ns-access" value={nsAccess} options={[{ label: 'Privat', value: 'Private' }, { label: 'Öffentlich', value: 'Public' }]} onChange={v => setNsAccess(String(v))} />
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing(1), marginTop: spacing(1) }}>
              <Icon type={iconType.InfoCircleOutlined} size={12} color="neutral-darken2" />
              <Typography size="base-sm" color="neutral-darken2">Privat = Nur Sie haben Zugriff. Öffentlich = Andere haben Zugriff.</Typography>
            </div>
          </div>
        </div>
      </Modal>

      {/* Upload or import modal */}
      <Modal visible={uploadModalOpen} title="Hochladen oder importieren" onClose={() => setUploadModalOpen(false)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
          <Typography size="base-sm" color="neutral-darken3">Wählen Sie, woher Sie Ihr Dokument hochladen möchten.</Typography>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <FileUploader onUpload={f => { handleUpload(f); setUploadModalOpen(false) }} accept={['.pdf', '.docx', '.xlsx', '.txt']} {...({ multiple: true } as any)}>
            <div style={{ border: '1.5px dashed #d0d5dd', borderRadius: 8, padding: '20px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <Icon type={iconType.UploadOutlined} color="neutral-darken4" />
              <Typography color="neutral-darken5">Klicken Sie, um ein Dokument auszuwählen, oder ziehen Sie es hierher.</Typography>
              <Typography size="base-sm" color="neutral-darken2">PDF-, DOCX-, XLSX- und TXT-Formate, max. Größe 10 MB</Typography>
            </div>
          </FileUploader>
          <div>
            <div style={{ ...labelStyle, marginBottom: spacing(2) }}>VERBUNDENE APPS</div>
            <div onClick={() => { setUploadModalOpen(false); setShowMsLogin(true) }} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: `${spacing(3)}px ${spacing(4)}px`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: spacing(3) }}>
              <MsLogo size={24} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing(1) }}>
                  <Typography size="base-sm" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>{CONNECTED_APP.name}</Typography>
                  <Icon type={iconType.CheckCircleFilled} size={12} color="success-base" />
                </div>
                <Typography size="base-sm" color="neutral-darken2">{CONNECTED_APP.host}</Typography>
              </div>
              <Icon type={iconType.ChevronRightOutlined} size={16} color="neutral-darken2" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing(2) }}>
            <Icon type={iconType.LockOutlined} size={12} color="neutral-darken2" />
            <Typography size="base-sm" color="neutral-darken2">Wir greifen niemals ohne Ihre Erlaubnis auf Dateien zu und speichern keine Anmeldedaten.</Typography>
          </div>
        </div>
      </Modal>
    </div>
  )
}
