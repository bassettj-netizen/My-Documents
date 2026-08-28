import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  ButtonDanger,
  ButtonGhost,
  buttonShapes,
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
  Icon,
  iconType,
  Modal,
  modalVariants,
  Pagination,
  PropertyItem,
  SearchBar,
  Spinner,
  Table,
  toastPlacements,
  Toolbar,
  Typography,
  useNotifications,
} from '@goat-ui/goat-ui-core'
import type { FileFormat } from '../bulk-edit/documents'

const { colorPalette, spacing, fontWeight } = constants

// ─── File type icons — https://www.svgrepo.com/svg/373961/pdf2, /374187/word, /373589/excel ───

function PdfFileIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M24.1,2.072h0l5.564,5.8V29.928H8.879V30H29.735V7.945L24.1,2.072" fill="#909090" />
      <path d="M24.031,2H8.808V29.928H29.664V7.873L24.03,2" fill="#f4f4f4" />
      <path d="M8.655,3.5H2.265v6.827h20.1V3.5H8.655" fill="#7a7b7c" />
      <path d="M22.472,10.211H2.395V3.379H22.472v6.832" fill="#dd2025" />
      <path d="M9.052,4.534h-.03l-.207,0H7.745v4.8H8.773V7.715L9,7.728a2.042,2.042,0,0,0,.647-.117,1.427,1.427,0,0,0,.493-.291,1.224,1.224,0,0,0,.335-.454,2.13,2.13,0,0,0,.105-.908,2.237,2.237,0,0,0-.114-.644,1.173,1.173,0,0,0-.687-.65A2.149,2.149,0,0,0,9.37,4.56a2.232,2.232,0,0,0-.319-.026M8.862,6.828l-.089,0V5.348h.193a.57.57,0,0,1,.459.181.92.92,0,0,1,.183.558c0,.246,0,.469-.222.626a.942.942,0,0,1-.524.114" fill="#464648" />
      <path d="M12.533,4.521c-.111,0-.219.008-.295.011L12,4.538h-.78v4.8h.918a2.677,2.677,0,0,0,1.028-.175,1.71,1.71,0,0,0,.68-.491,1.939,1.939,0,0,0,.373-.749,3.728,3.728,0,0,0,.114-.949,4.416,4.416,0,0,0-.087-1.127,1.777,1.777,0,0,0-.4-.733,1.63,1.63,0,0,0-.535-.4,2.413,2.413,0,0,0-.549-.178,1.282,1.282,0,0,0-.228-.017m-.182,3.937-.1,0V5.392h.013a1.062,1.062,0,0,1,.6.107,1.2,1.2,0,0,1,.324.4,1.3,1.3,0,0,1,.142.526c.009.22,0,.4,0,.549a2.926,2.926,0,0,1-.033.513,1.756,1.756,0,0,1-.169.5,1.13,1.13,0,0,1-.363.36.673.673,0,0,1-.416.106" fill="#464648" />
      <path d="M17.43,4.538H15v4.8h1.028V7.434h1.3V6.542h-1.3V5.43h1.4V4.538" fill="#464648" />
      <path d="M21.781,20.255s3.188-.578,3.188.511S22.994,21.412,21.781,20.255Zm-2.357.083a7.543,7.543,0,0,0-1.473.489l.4-.9c.4-.9.815-2.127.815-2.127a14.216,14.216,0,0,0,1.658,2.252,13.033,13.033,0,0,0-1.4.288Zm-1.262-6.5c0-.949.307-1.208.546-1.208s.508.115.517.939a10.787,10.787,0,0,1-.517,2.434A4.426,4.426,0,0,1,18.161,13.841ZM13.513,24.354c-.978-.585,2.051-2.386,2.6-2.444C16.11,21.911,14.537,24.966,13.513,24.354ZM25.9,20.895c-.01-.1-.1-1.207-2.07-1.16a14.228,14.228,0,0,0-2.453.173,12.542,12.542,0,0,1-2.012-2.655,11.76,11.76,0,0,0,.623-3.1c-.029-1.2-.316-1.888-1.236-1.878s-1.054.815-.933,2.013a9.309,9.309,0,0,0,.665,2.338s-.425,1.323-.987,2.639-.946,2.006-.946,2.006a9.622,9.622,0,0,0-2.725,1.4c-.824.767-1.159,1.356-.725,1.945.374.508,1.683.623,2.853-.91a22.549,22.549,0,0,0,1.7-2.492s1.784-.489,2.339-.623,1.226-.24,1.226-.24,1.629,1.639,3.2,1.581,1.495-.939,1.485-1.035" fill="#dd2025" />
      <path d="M23.954,2.077V7.95h5.633L23.954,2.077Z" fill="#909090" />
      <path d="M24.031,2V7.873h5.633L24.031,2Z" fill="#f4f4f4" />
      <path d="M8.975,4.457h-.03l-.207,0H7.668v4.8H8.7V7.639l.228.013a2.042,2.042,0,0,0,.647-.117,1.428,1.428,0,0,0,.493-.291A1.224,1.224,0,0,0,10.4,6.79a2.13,2.13,0,0,0,.105-.908,2.237,2.237,0,0,0-.114-.644,1.173,1.173,0,0,0-.687-.65,2.149,2.149,0,0,0-.411-.105,2.232,2.232,0,0,0-.319-.026M8.785,6.751l-.089,0V5.271H8.89a.57.57,0,0,1,.459.181.92.92,0,0,1,.183.558c0,.246,0,.469-.222.626a.942.942,0,0,1-.524.114" fill="#fff" />
      <path d="M12.456,4.444c-.111,0-.219.008-.295.011l-.235.006h-.78v4.8h.918a2.677,2.677,0,0,0,1.028-.175,1.71,1.71,0,0,0,.68-.491,1.939,1.939,0,0,0,.373-.749,3.728,3.728,0,0,0,.114-.949,4.416,4.416,0,0,0-.087-1.127,1.777,1.777,0,0,0-.4-.733,1.63,1.63,0,0,0-.535-.4,2.413,2.413,0,0,0-.549-.178,1.282,1.282,0,0,0-.228-.017m-.182,3.937-.1,0V5.315h.013a1.062,1.062,0,0,1,.6.107,1.2,1.2,0,0,1,.324.4,1.3,1.3,0,0,1,.142.526c.009.22,0,.4,0,.549a2.926,2.926,0,0,1-.033.513,1.756,1.756,0,0,1-.169.5,1.13,1.13,0,0,1-.363.36.673.673,0,0,1-.416.106" fill="#fff" />
      <path d="M17.353,4.461h-2.43v4.8h1.028V7.357h1.3V6.465h-1.3V5.353h1.4V4.461" fill="#fff" />
    </svg>
  )
}

function WordFileIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="my-documents-word-gradient" x1="4.494" y1="-1712.086" x2="13.832" y2="-1695.914" gradientTransform="translate(0 1720)" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2368c4" />
          <stop offset="0.5" stopColor="#1a5dbe" />
          <stop offset="1" stopColor="#1146ac" />
        </linearGradient>
      </defs>
      <path d="M28.806,3H9.705A1.192,1.192,0,0,0,8.512,4.191h0V9.5l11.069,3.25L30,9.5V4.191A1.192,1.192,0,0,0,28.806,3Z" fill="#41a5ee" />
      <path d="M30,9.5H8.512V16l11.069,1.95L30,16Z" fill="#2b7cd3" />
      <path d="M8.512,16v6.5L18.93,23.8,30,22.5V16Z" fill="#185abd" />
      <path d="M9.705,29h19.1A1.192,1.192,0,0,0,30,27.809h0V22.5H8.512v5.309A1.192,1.192,0,0,0,9.705,29Z" fill="#103f91" />
      <path d="M16.434,8.2H8.512V24.45h7.922a1.2,1.2,0,0,0,1.194-1.191V9.391A1.2,1.2,0,0,0,16.434,8.2Z" opacity="0.1" />
      <path d="M15.783,8.85H8.512V25.1h7.271a1.2,1.2,0,0,0,1.194-1.191V10.041A1.2,1.2,0,0,0,15.783,8.85Z" opacity="0.2" />
      <path d="M15.783,8.85H8.512V23.8h7.271a1.2,1.2,0,0,0,1.194-1.191V10.041A1.2,1.2,0,0,0,15.783,8.85Z" opacity="0.2" />
      <path d="M15.132,8.85H8.512V23.8h6.62a1.2,1.2,0,0,0,1.194-1.191V10.041A1.2,1.2,0,0,0,15.132,8.85Z" opacity="0.2" />
      <path d="M3.194,8.85H15.132a1.193,1.193,0,0,1,1.194,1.191V21.959a1.193,1.193,0,0,1-1.194,1.191H3.194A1.192,1.192,0,0,1,2,21.959V10.041A1.192,1.192,0,0,1,3.194,8.85Z" fill="url(#my-documents-word-gradient)" />
      <path d="M6.9,17.988c.023.184.039.344.046.481h.028c.01-.13.032-.287.065-.47s.062-.338.089-.465l1.255-5.407h1.624l1.3,5.326a7.761,7.761,0,0,1,.162,1h.022a7.6,7.6,0,0,1,.135-.975l1.039-5.358h1.477l-1.824,7.748H10.591L9.354,14.742q-.054-.222-.122-.578t-.084-.52H9.127q-.021.189-.084.561c-.042.249-.075.432-.1.552L7.78,19.871H6.024L4.19,12.127h1.5l1.131,5.418A4.469,4.469,0,0,1,6.9,17.988Z" fill="#fff" />
    </svg>
  )
}

function ExcelFileIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="my-documents-excel-gradient" x1="4.494" y1="-2092.086" x2="13.832" y2="-2075.914" gradientTransform="translate(0 2100)" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#18884f" />
          <stop offset="0.5" stopColor="#117e43" />
          <stop offset="1" stopColor="#0b6631" />
        </linearGradient>
      </defs>
      <path d="M19.581,15.35,8.512,13.4V27.809A1.192,1.192,0,0,0,9.705,29h19.1A1.192,1.192,0,0,0,30,27.809h0V22.5Z" fill="#185c37" />
      <path d="M19.581,3H9.705A1.192,1.192,0,0,0,8.512,4.191h0V9.5L19.581,16l5.861,1.95L30,16V9.5Z" fill="#21a366" />
      <path d="M8.512,9.5H19.581V16H8.512Z" fill="#107c41" />
      <path d="M16.434,8.2H8.512V24.45h7.922a1.2,1.2,0,0,0,1.194-1.191V9.391A1.2,1.2,0,0,0,16.434,8.2Z" opacity="0.1" />
      <path d="M15.783,8.85H8.512V25.1h7.271a1.2,1.2,0,0,0,1.194-1.191V10.041A1.2,1.2,0,0,0,15.783,8.85Z" opacity="0.2" />
      <path d="M15.783,8.85H8.512V23.8h7.271a1.2,1.2,0,0,0,1.194-1.191V10.041A1.2,1.2,0,0,0,15.783,8.85Z" opacity="0.2" />
      <path d="M15.132,8.85H8.512V23.8h6.62a1.2,1.2,0,0,0,1.194-1.191V10.041A1.2,1.2,0,0,0,15.132,8.85Z" opacity="0.2" />
      <path d="M3.194,8.85H15.132a1.193,1.193,0,1,1,1.194,1.191V21.959a1.193,1.193,0,0,1-1.194,1.191H3.194A1.192,1.192,0,0,1,2,21.959V10.041A1.192,1.192,0,0,1,3.194,8.85Z" fill="url(#my-documents-excel-gradient)" />
      <path d="M5.7,19.873l2.511-3.884-2.3-3.862H7.758L9.013,14.6c.116.234.2.408.238.524h.017c.082-.188.169-.369.26-.546l1.342-2.447h1.7l-2.359,3.84,2.419,3.905H10.821l-1.45-2.711A2.355,2.355,0,0,1,9.2,16.8H9.176a1.688,1.688,0,0,1-.168.351L7.515,19.873Z" fill="#fff" />
      <path d="M28.806,3H19.581V9.5H30V4.191A1.192,1.192,0,0,0,28.806,3Z" fill="#33c481" />
      <path d="M19.581,16H30v6.5H19.581Z" fill="#107c41" />
    </svg>
  )
}

function fileFormatIcon(format: FileFormat, size = 20) {
  if (format === 'DOCX') return <WordFileIcon size={size} />
  if (format === 'XLSX') return <ExcelFileIcon size={size} />
  return <PdfFileIcon size={size} />
}

// ─── Mock data — personal documents tend to accumulate messily: drafts,
// "final_final" revisions, stray copies, screenshots, untitled files. ────────

export type PersonalDoc = {
  _id: string
  name: string
  documentType: string
  fileFormat: FileFormat
  fileSize: string
  uploadedDate: string
  tags: string[]
  // Set on correspondence — a tax authority or a client — so the preview can
  // show who it's from. Unset for personal working files, which have none.
  sender?: string
}

// A tax specialist's own working files — day-to-day and ad-hoc, unlike the
// polished, formally-named client deliverables that live in a Workspace
// (e.g. "Q3 Filing — Client Agreement"). These are personal scratch copies,
// call notes, half-finished drafts, and stray scans that accumulate on
// someone's desk between client engagements.
const MOCK_DOCS: PersonalDoc[] = [
  { _id: 'p1',  name: 'Client call notes - Meier GmbH',            documentType: 'Meeting Notes',    fileFormat: 'DOCX', fileSize: '9 KB',   uploadedDate: '2026-08-25', tags: ['Client'] },
  { _id: 'p2',  name: 'VAT checklist - Q3 draft',                  documentType: 'Checklist',        fileFormat: 'DOCX', fileSize: '16 KB',  uploadedDate: '2026-08-24', tags: ['Draft', 'Deadline'] },
  { _id: 'p3',  name: 'Screenshot - ELSTER error message',         documentType: 'Screenshot',       fileFormat: 'PDF',  fileSize: '780 KB', uploadedDate: '2026-08-24', tags: [] },
  { _id: 'p4',  name: 'Deadline tracker - August',                 documentType: 'Spreadsheet',      fileFormat: 'XLSX', fileSize: '38 KB',  uploadedDate: '2026-08-23', tags: ['Deadline'] },
  { _id: 'p5',  name: 'Extension request - draft',                 documentType: 'Draft Letter',     fileFormat: 'DOCX', fileSize: '21 KB',  uploadedDate: '2026-08-22', tags: ['Draft', 'Client'] },
  { _id: 'p6',  name: 'Notes - audit prep call',                   documentType: 'Meeting Notes',    fileFormat: 'DOCX', fileSize: '11 KB',  uploadedDate: '2026-08-21', tags: ['Client'] },
  { _id: 'p7',  name: 'W-2 scan - employee 044',                   documentType: 'Scan',             fileFormat: 'PDF',  fileSize: '640 KB', uploadedDate: '2026-08-21', tags: [] },
  { _id: 'p8',  name: 'Client email - forwarded - tax question',   documentType: 'Client Enquiry',   fileFormat: 'PDF',  fileSize: '54 KB',  uploadedDate: '2026-08-20', tags: ['Client'], sender: 'Meier GmbH' },
  { _id: 'p9',  name: 'Reminder - follow up with Müller',          documentType: 'Reminder',         fileFormat: 'DOCX', fileSize: '3 KB',   uploadedDate: '2026-08-20', tags: ['Urgent'] },
  { _id: 'p10', name: 'Depreciation schedule - working draft',     documentType: 'Spreadsheet',      fileFormat: 'XLSX', fileSize: '96 KB',  uploadedDate: '2026-08-19', tags: ['Draft', 'Client'] },
  { _id: 'p11', name: 'Untitled document',                         documentType: 'Other',            fileFormat: 'DOCX', fileSize: '12 KB',  uploadedDate: '2026-08-19', tags: [] },
  { _id: 'p12', name: 'Client onboarding checklist - SME',         documentType: 'Checklist',        fileFormat: 'DOCX', fileSize: '19 KB',  uploadedDate: '2026-08-18', tags: ['Reference'] },
  { _id: 'p13', name: 'Tax bracket cheat sheet 2026',               documentType: 'Reference',        fileFormat: 'PDF',  fileSize: '210 KB', uploadedDate: '2026-08-17', tags: ['Reference'] },
  { _id: 'p14', name: 'Draft - do not send',                        documentType: 'Correspondence',   fileFormat: 'DOCX', fileSize: '13 KB',  uploadedDate: '2026-08-17', tags: ['Draft'] },
  { _id: 'p15', name: 'Receipts - client reimbursement (scanned)',  documentType: 'Scan',             fileFormat: 'PDF',  fileSize: '1.4 MB', uploadedDate: '2026-08-14', tags: ['Client'] },
  { _id: 'p16', name: 'Filing confirmation - Ref 88213',            documentType: 'Confirmation',     fileFormat: 'PDF',  fileSize: '44 KB',  uploadedDate: '2026-08-13', tags: [], sender: 'Finanzamt Berlin Mitte' },
  { _id: 'p17', name: 'Notice from tax office - unread',            documentType: 'Tax Notice',       fileFormat: 'PDF',  fileSize: '160 KB', uploadedDate: '2026-08-12', tags: ['Urgent'], sender: 'Finanzamt Berlin Mitte' },
  { _id: 'p18', name: '1099 forms - batch 3 (copy)',                documentType: 'Scan',             fileFormat: 'PDF',  fileSize: '2.1 MB', uploadedDate: '2026-08-11', tags: ['Client'] },
  { _id: 'p19', name: 'Engagement letter - draft - unsigned',       documentType: 'Draft Letter',     fileFormat: 'DOCX', fileSize: '27 KB',  uploadedDate: '2026-08-10', tags: ['Draft', 'Client'] },
  { _id: 'p20', name: 'To-do - week of Aug 24',                     documentType: 'Notes',            fileFormat: 'DOCX', fileSize: '4 KB',   uploadedDate: '2026-08-24', tags: [] },
  { _id: 'p21', name: 'Client spreadsheet - copy - do not edit',    documentType: 'Spreadsheet',      fileFormat: 'XLSX', fileSize: '112 KB', uploadedDate: '2026-08-07', tags: ['Client', 'Archive'] },
  { _id: 'p22', name: 'Working notes - year end close',             documentType: 'Notes',            fileFormat: 'DOCX', fileSize: '8 KB',   uploadedDate: '2026-08-05', tags: [] },
  { _id: 'p23', name: 'Client correspondence - thread export',      documentType: 'Correspondence',   fileFormat: 'PDF',  fileSize: '98 KB',  uploadedDate: '2026-08-03', tags: ['Client'], sender: 'Project Alpha' },
  { _id: 'p24', name: 'Draft memo - loss carryforward question',    documentType: 'Memo',             fileFormat: 'DOCX', fileSize: '15 KB',  uploadedDate: '2026-07-29', tags: ['Draft'] },
  { _id: 'p25', name: 'Copy of copy of client return',              documentType: 'Scan',             fileFormat: 'PDF',  fileSize: '1.8 MB', uploadedDate: '2026-07-24', tags: ['Client', 'Archive'] },
  { _id: 'p26', name: 'Untitled spreadsheet',                       documentType: 'Spreadsheet',      fileFormat: 'XLSX', fileSize: '7 KB',   uploadedDate: '2026-07-20', tags: [] },
  { _id: 'p27', name: 'CPE certificate - continuing education',     documentType: 'Certificate',      fileFormat: 'PDF',  fileSize: '220 KB', uploadedDate: '2026-06-30', tags: ['Reference'] },
  { _id: 'p28', name: 'Personal calendar - filing deadlines',       documentType: 'Reference',        fileFormat: 'XLSX', fileSize: '31 KB',  uploadedDate: '2026-06-15', tags: ['Reference', 'Deadline'] },
  { _id: 'p29', name: 'Old client list - archive',                  documentType: 'Reference',        fileFormat: 'XLSX', fileSize: '18 KB',  uploadedDate: '2026-04-02', tags: ['Archive'] },
  { _id: 'p30', name: 'Scan_0042',                                  documentType: 'Scan',             fileFormat: 'PDF',  fileSize: '390 KB', uploadedDate: '2026-02-11', tags: [] },

  // Correspondence — inbound letters from tax authorities, and clients
  // forwarding letters they've received and asking what they mean.
  { _id: 'p31', name: 'Steuerbescheid 2025 - Fischer & Co',         documentType: 'Assessment Letter', fileFormat: 'PDF', fileSize: '312 KB', uploadedDate: '2026-08-26', tags: ['Client', 'Urgent'], sender: 'Finanzamt Berlin Mitte' },
  { _id: 'p32', name: 'Auskunftsersuchen - Finanzamt Berlin Mitte', documentType: 'Info Request',      fileFormat: 'PDF', fileSize: '188 KB', uploadedDate: '2026-08-25', tags: ['Urgent', 'Deadline'], sender: 'Finanzamt Berlin Mitte' },
  { _id: 'p33', name: "Client enquiry - what does this letter mean", documentType: 'Client Enquiry',  fileFormat: 'PDF', fileSize: '61 KB',  uploadedDate: '2026-08-23', tags: ['Client'], sender: 'Fischer & Co' },
  { _id: 'p34', name: 'Mahnung - verspätete Abgabe',                documentType: 'Penalty Notice',    fileFormat: 'PDF', fileSize: '140 KB', uploadedDate: '2026-08-20', tags: ['Urgent'], sender: 'Finanzamt München' },
  { _id: 'p35', name: 'Prüfungsanordnung - Wagner Konsumgüter',     documentType: 'Audit Notice',      fileFormat: 'PDF', fileSize: '295 KB', uploadedDate: '2026-08-18', tags: ['Client', 'Urgent'], sender: 'Finanzamt München' },
  { _id: 'p36', name: 'Client enquiry - assessment letter forwarded', documentType: 'Client Enquiry', fileFormat: 'PDF', fileSize: '520 KB', uploadedDate: '2026-08-15', tags: ['Client'], sender: 'Wagner Konsumgüter' },
  { _id: 'p37', name: 'Finanzamt reminder - missing documents',     documentType: 'Tax Notice',        fileFormat: 'PDF', fileSize: '102 KB', uploadedDate: '2026-08-09', tags: ['Deadline'], sender: 'Bundeszentralamt für Steuern' },
  { _id: 'p38', name: 'Client scan - letter from Finanzamt (unclear)', documentType: 'Client Enquiry', fileFormat: 'PDF', fileSize: '890 KB', uploadedDate: '2026-08-06', tags: ['Client'], sender: 'Meier GmbH' },
]

function stripExt(name: string) {
  return name.replace(/\.(pdf|docx|xlsx|pptx)$/i, '')
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const CORRESPONDENCE_TYPES = new Set([
  'Tax Notice', 'Assessment Letter', 'Info Request', 'Penalty Notice',
  'Audit Notice', 'Client Enquiry', 'Correspondence', 'Confirmation',
])

function isCorrespondence(doc: PersonalDoc) {
  return CORRESPONDENCE_TYPES.has(doc.documentType)
}

function pseudoRef(doc: PersonalDoc) {
  return String(Math.abs(doc.name.length * 1247 + doc._id.length * 37) % 90000 + 10000)
}

/** Mock body for correspondence — an authority letter, or a client forwarding one with a question. */
function MockLetterBody({ doc }: { doc: PersonalDoc }) {
  const fromClient = doc.documentType === 'Client Enquiry'
  const sender = doc.sender ?? (fromClient ? 'Client' : 'Finanzamt Berlin Mitte')
  const subjectLine = stripExt(doc.name)
  return (
    <div style={{ fontFamily: "'Open Sans', sans-serif", lineHeight: 1.8, color: '#1a1a1a', fontSize: 14 }}>
      <div style={{ marginBottom: 24 }}>
        <strong style={{ fontSize: 15 }}>{fromClient ? 'CLIENT ENQUIRY' : subjectLine.toUpperCase()}</strong>
        <div style={{ color: '#888', marginTop: 4, fontSize: 13 }}>(Musterdokument / Beispielinhalt)</div>
      </div>
      <section style={{ marginBottom: 20 }}>
        <strong>{fromClient ? '1. From' : '1. Ausstellende Behörde'}</strong>
        <div style={{ marginTop: 8 }}>
          {sender}
          {!fromClient && <>{' '}<br />Abteilung Veranlagung<br />Musterstraße 25, 10115 Berlin</>}
        </div>
      </section>
      <section style={{ marginBottom: 20 }}>
        <strong>2. Reference</strong>
        <div style={{ marginTop: 8 }}>{fromClient ? `RE: ${subjectLine}` : `St.-Nr. ${pseudoRef(doc)} / 2026`}</div>
      </section>
      <section style={{ marginBottom: 20 }}><strong>3. Date</strong><div style={{ marginTop: 8 }}>{formatDate(doc.uploadedDate)}</div></section>
      <section>
        <strong>4. {fromClient ? 'Message' : 'Betreff'}</strong>
        <div style={{ marginTop: 8 }}>
          {fromClient
            ? `Hi — I received this letter and I'm not sure what it means or whether I need to do anything. Could you take a look and let me know? Thanks.`
            : `Bezugnehmend auf ${subjectLine} teilen wir Ihnen Folgendes mit. Bitte prüfen Sie die beigefügten Angaben und nehmen Sie bei Rückfragen innerhalb der genannten Frist Kontakt mit uns auf.`}
        </div>
      </section>
    </div>
  )
}

/** Mock body for personal working files — nothing formal to render, just a placeholder. */
function MockNoteBody({ doc }: { doc: PersonalDoc }) {
  return (
    <div style={{ fontFamily: "'Open Sans', sans-serif", lineHeight: 1.8, color: '#1a1a1a', fontSize: 14 }}>
      <div style={{ marginBottom: 16 }}>
        <strong style={{ fontSize: 15 }}>{stripExt(doc.name)}</strong>
        <div style={{ color: '#888', marginTop: 4, fontSize: 13 }}>{doc.documentType}</div>
      </div>
      <Typography size="base" color="neutral-darken2">
        This is a personal working file — a draft, note, or scratch copy rather than a formal document, so there's no formatted content to preview.
      </Typography>
    </div>
  )
}

function DocPreviewOverlay({ doc, onBack, onDelete }: { doc: PersonalDoc; onBack: () => void; onDelete: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', flexDirection: 'column', backgroundColor: colorPalette.neutral.lighten3 }}>
      <div style={{ flexShrink: 0, position: 'relative', backgroundColor: '#2f384a', boxShadow: '0px 4px 8px rgba(130,138,155,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: spacing(4) }}>
        <ButtonGhost mode="contrast" leftIcon={iconType.ChevronLeftOutlined} onClick={onBack}>Back</ButtonGhost>
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          <Typography weight="bold" color="white">{stripExt(doc.name)}.{doc.fileFormat.toLowerCase()}</Typography>
        </div>
        <Dropdown
          items={[
            { key: 'download', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><Icon type={iconType.DownloadOutlined} size={16} />Download</span>, onClick: () => {} },
            { key: 'delete', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2), color: colorPalette.danger.darken2 }}><Icon type={iconType.TrashOutlined} size={16} color="danger-darken2" />Delete</span>, onClick: onDelete },
          ]}
          trigger={dropdownTriggers.CLICK}
          placement={dropdownPlacement.BOTTOM_RIGHT}
        >
          <ButtonTertiary shape={buttonShapes.SQUARE} leftIcon={iconType.ThreeDotsHorOutlined} />
        </Dropdown>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
        <div style={{ flex: '0 0 61.67%', minWidth: 0, overflowY: 'auto', padding: `${spacing(6)}px 0 ${spacing(6)}px ${spacing(6)}px` }}>
          <div style={{ backgroundColor: colorPalette.white, borderRadius: 16, padding: spacing(4) }}>
            {isCorrespondence(doc) ? <MockLetterBody doc={doc} /> : <MockNoteBody doc={doc} />}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: `${spacing(6)}px ${spacing(6)}px ${spacing(6)}px ${spacing(4)}px` }}>
          <div style={{ backgroundColor: colorPalette.white, borderRadius: 16, padding: spacing(4) }}>
            <Typography weight="bold">Document Details</Typography>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3), marginTop: spacing(4) }}>
              <PropertyItem label="Name" value={stripExt(doc.name)} labelProps={{ size: 'base-sm', color: 'neutral-darken2' }} />
              <PropertyItem label="Type" value={doc.documentType} labelProps={{ size: 'base-sm', color: 'neutral-darken2' }} />
              {doc.sender && (
                <PropertyItem
                  label={doc.documentType === 'Client Enquiry' ? 'From' : 'Sender'}
                  value={doc.sender}
                  labelProps={{ size: 'base-sm', color: 'neutral-darken2' }}
                />
              )}
              <PropertyItem label="Uploaded" value={formatDate(doc.uploadedDate)} labelProps={{ size: 'base-sm', color: 'neutral-darken2' }} />
              <PropertyItem label="Format" value={<Chip label={doc.fileFormat} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} />} labelProps={{ size: 'base-sm', color: 'neutral-darken2' }} />
              <PropertyItem
                label="Tags"
                value={doc.tags.length === 0 ? <Typography size="base" color="neutral-base">—</Typography> : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {doc.tags.map(t => <Chip key={t} label={t} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} />)}
                  </div>
                )}
                labelProps={{ size: 'base-sm', color: 'neutral-darken2' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const PAGE_SIZE = 20

/**
 * My Documents — Version 1: personal document library.
 * Same table layout as the Workspaces full-screen documents view, minus the
 * Source column (personal files aren't synced from a connected app), plus a
 * simple upload dropzone instead of the multi-source "Add Documents" flow.
 */
export default function MyDocumentsVersion1({ onSendToChat, showTitleIcon = true }: { onSendToChat?: (docs: PersonalDoc[]) => void; showTitleIcon?: boolean } = {}) {
  const [docs, setDocs] = useState<PersonalDoc[]>(MOCK_DOCS)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Set<string> | null>(null)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { notification } = useNotifications()

  // The app's page layout has no fixed viewport height of its own — content
  // just grows the page — so a plain `height: 100%` on this page never
  // resolves. Measure the real remaining viewport space so the table can
  // scroll internally instead of pushing the toolbar off-screen.
  const pageRef = useRef<HTMLDivElement>(null)
  const [pageHeight, setPageHeight] = useState<number>()
  useLayoutEffect(() => {
    const el = pageRef.current
    if (!el) return
    const update = () => setPageHeight(window.innerHeight - el.getBoundingClientRect().top)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const filtered = useMemo(
    () => docs.filter(d => !search || stripExt(d.name).toLowerCase().includes(search.toLowerCase())),
    [docs, search],
  )
  const someSelected = filtered.some(d => selected.has(d._id))
  const allSelected = filtered.length > 0 && filtered.every(d => selected.has(d._id))
  const pageDocs = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const startUpload = (list: FileList | null) => {
    const files = list ? Array.from(list) : []
    if (files.length === 0) return
    const count = files.length
    const fileLabel = count === 1 ? files[0].name : `${count} files`
    const key = `my-documents-upload-${fileLabel}`
    notification.default({
      key,
      title: 'Uploading ...',
      leadingIcon: false,
      dismissible: false,
      content: <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><Spinner size="small" /><Typography size="base" color="neutral-darken5">{fileLabel}</Typography></div>,
      placement: toastPlacements.BOTTOM_RIGHT,
      duration: 0,
    })
    setTimeout(() => {
      notification.destroy(key)
      notification.success({
        title: count === 1 ? 'File uploaded successfully' : 'Files uploaded successfully',
        content: fileLabel,
        placement: toastPlacements.BOTTOM_LEFT,
        duration: 4,
      })
      const today = new Date().toISOString().slice(0, 10)
      const newDocs: PersonalDoc[] = files.map((f, i) => {
        const ext = (f.name.split('.').pop() ?? 'pdf').toUpperCase()
        return {
          _id: `upload-${Date.now()}-${i}`,
          name: f.name.replace(/\.[^/.]+$/, ''),
          documentType: 'Other',
          fileFormat: (['DOCX', 'XLSX', 'PPTX'].includes(ext) ? ext : 'PDF') as FileFormat,
          fileSize: f.size < 1024 * 1024 ? `${Math.max(1, Math.round(f.size / 1024))} KB` : `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
          uploadedDate: today,
          tags: [],
        }
      })
      setDocs(prev => [...newDocs, ...prev])
    }, 1200)
  }

  const previewDoc = docs.find(d => d._id === previewId) ?? null

  const columns = useMemo(() => {
    const rowStyle = (record: PersonalDoc) => ({
      cursor: 'pointer',
      verticalAlign: 'middle',
      backgroundColor: selected.has(record._id) ? '#EEF4FF' : undefined,
    })
    const openRow = (record: PersonalDoc) => ({ style: rowStyle(record), onClick: () => setPreviewId(record._id) })

    const checkboxCol = {
      title: (
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected && !allSelected}
          onChange={e => setSelected(new Set(e.target.checked ? filtered.map(d => d._id) : []))}
        />
      ),
      key: 'checkbox',
      width: 48,
      onCell: (record: PersonalDoc) => ({ style: { backgroundColor: rowStyle(record).backgroundColor }, onClick: (e: React.MouseEvent) => e.stopPropagation() }),
      render: (_: unknown, record: PersonalDoc) => (
        <Checkbox
          checked={selected.has(record._id)}
          onChange={e => {
            setSelected(prev => {
              const next = new Set(prev)
              if (e.target.checked) next.add(record._id); else next.delete(record._id)
              return next
            })
          }}
          onClick={e => e.stopPropagation()}
        />
      ),
    }

    const nameCol = {
      title: 'Document Name',
      key: 'name',
      dataIndex: 'name',
      ellipsis: true,
      sorter: (a: PersonalDoc, b: PersonalDoc) => stripExt(a.name).localeCompare(stripExt(b.name)),
      onCell: openRow,
      render: (name: string, record: PersonalDoc) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2), overflow: 'hidden' }}>
          {fileFormatIcon(record.fileFormat, 18)}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stripExt(name)}</span>
        </div>
      ),
    }

    const typeCol = {
      title: 'Type',
      key: 'documentType',
      dataIndex: 'documentType',
      width: 170,
      sorter: (a: PersonalDoc, b: PersonalDoc) => a.documentType.localeCompare(b.documentType),
      onCell: openRow,
    }

    const tagsCol = {
      title: 'Tags',
      key: 'tags',
      width: 260,
      onCell: openRow,
      render: (_: unknown, record: PersonalDoc) => (
        record.tags.length === 0
          ? <Typography size="base-sm" color="neutral-base">—</Typography>
          : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {record.tags.map(t => <Chip key={t} label={t} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} />)}
            </div>
          )
      ),
    }

    const uploadedCol = {
      title: 'Uploaded',
      key: 'uploadedDate',
      dataIndex: 'uploadedDate',
      width: 120,
      sorter: (a: PersonalDoc, b: PersonalDoc) => a.uploadedDate.localeCompare(b.uploadedDate),
      onCell: openRow,
      render: (val: string) => formatDate(val),
    }

    const sizeCol = {
      title: 'Size',
      key: 'fileSize',
      dataIndex: 'fileSize',
      width: 90,
      onCell: openRow,
    }

    const actionsCol = {
      title: '',
      key: 'actions',
      width: 56,
      onCell: (record: PersonalDoc) => ({ style: rowStyle(record), onClick: (e: React.MouseEvent) => e.stopPropagation() }),
      render: (_: unknown, record: PersonalDoc) => (
        <Dropdown
          items={[
            { key: 'download', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><Icon type={iconType.DownloadOutlined} size={16} />Download</span>, onClick: () => {} },
            { key: 'delete', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2), color: colorPalette.danger.darken2 }}><Icon type={iconType.TrashOutlined} size={16} color="danger-darken2" />Delete</span>, onClick: () => setPendingDelete(new Set([record._id])) },
          ]}
          trigger={dropdownTriggers.CLICK}
          placement={dropdownPlacement.BOTTOM_RIGHT}
        >
          <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.ThreeDotsHorFilled} />
        </Dropdown>
      ),
    }

    return [checkboxCol, nameCol, typeCol, tagsCol, uploadedCol, sizeCol, actionsCol]
  }, [selected, allSelected, someSelected, filtered])

  return (
    <div ref={pageRef} style={{ height: pageHeight ?? '100%', display: 'flex', flexDirection: 'column', backgroundColor: colorPalette.white, overflow: 'hidden' }}>
      <div style={{ flexShrink: 0, padding: `${spacing(6)}px ${spacing(6)}px ${spacing(4)}px`, display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing(2) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3) }}>
            {showTitleIcon && (
              <div style={{ color: '#141F29', display: 'flex' }}>
                <Icon type={iconType.FolderOutlined} size={32} color="inherit" />
              </div>
            )}
            <Typography size="heading-lg" weight={fontWeight.BOLD}>My Documents</Typography>
          </div>
          <div style={{ width: 300 }}>
            <SearchBar placeholder="Search documents" value={search} onChange={setSearch} />
          </div>
        </div>

        <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={e => startUpload(e.target.files)} />
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', padding: `0 ${spacing(6)}px` }}>
        <div className="docs-table-sticky-header" style={{ flex: 1, overflowY: 'auto', minHeight: 0, display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => { e.preventDefault(); setIsDragging(false); startUpload(e.dataTransfer.files) }}
            onClick={() => fileInputRef.current?.click()}
            style={{
              flexShrink: 0,
              border: `1px dashed ${isDragging ? colorPalette.blue.base : colorPalette.neutral.base}`,
              borderRadius: 8, padding: `${spacing(4)}px`, minHeight: 120,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: spacing(2),
              cursor: 'pointer', backgroundColor: isDragging ? '#F0F7FF' : colorPalette.white,
              transition: 'border-color 0.15s, background-color 0.15s', textAlign: 'center',
            }}
          >
            <Icon type={iconType.UploadOutlined} size={24} color="neutral-darken3" />
            <Typography size="base" color="neutral-darken2">Click to select a document, or drag and drop it here.</Typography>
            <Typography size="base-sm" color="neutral-base">PDF, DOCX, XLSX, and TXT formats, max size 10 MB</Typography>
          </div>

          <Typography size="base" color="neutral-darken2">
            {filtered.length} document{filtered.length !== 1 ? 's' : ''}
          </Typography>

          {pageDocs.length === 0 ? (
            <div style={{ padding: spacing(6) }}>
              <Typography size="base-sm" color="neutral-darken2">No documents match your search.</Typography>
            </div>
          ) : (
            <>
              <Table dataSource={pageDocs} columns={columns as never} pagination={false} rowHoverable />
              {filtered.length > PAGE_SIZE && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: `${spacing(3)}px 0` }}>
                  <Pagination current={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
                </div>
              )}
            </>
          )}

          <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: spacing(2), padding: `${spacing(3)}px 0` }}>
            <Icon type={iconType.ShieldCheckFilled} color="primary-base" size={16} />
            <Typography size="base-sm" color="neutral-darken2">
              All files are securely uploaded and scanned for viruses. <span style={{ color: colorPalette.blue.base, textDecoration: 'underline', cursor: 'pointer' }}>Learn more</span>
            </Typography>
          </div>
        </div>
      </div>

      {selected.size > 0 && (
        <div style={{ flexShrink: 0, padding: `0 ${spacing(2)}px ${spacing(2)}px` }}>
          <Toolbar
            visible
            position="sticky"
            leftItems={[
              <ButtonGhost key="clear" shape={buttonShapes.SQUARE} leftIcon={iconType.CrossOutlined} onClick={() => setSelected(new Set())} />,
              <ButtonTertiary key="download" leftIcon={iconType.DownloadOutlined} onClick={() => {}}>
                Download ({selected.size})
              </ButtonTertiary>,
              ...(onSendToChat ? [
                <ButtonTertiary
                  key="send-to-chat"
                  leftIcon={iconType.SendOutlined}
                  onClick={() => { onSendToChat(docs.filter(d => selected.has(d._id))); setSelected(new Set()) }}
                >
                  Send to chat ({selected.size})
                </ButtonTertiary>,
              ] : []),
            ]}
            rightItems={[
              <ButtonDanger key="delete" leftIcon={iconType.TrashOutlined} onClick={() => setPendingDelete(selected)}>Delete</ButtonDanger>,
            ]}
          />
        </div>
      )}

      {previewDoc && (
        <DocPreviewOverlay
          doc={previewDoc}
          onBack={() => setPreviewId(null)}
          onDelete={() => { setPendingDelete(new Set([previewDoc._id])); setPreviewId(null) }}
        />
      )}

      <Modal
        visible={pendingDelete !== null}
        variant={modalVariants.DANGER}
        title={pendingDelete?.size === 1 ? 'Delete Document' : 'Delete Documents'}
        onClose={() => setPendingDelete(null)}
        footer={{ buttons: [
          { variant: buttonVariants.GHOST, props: { children: 'Cancel', onClick: () => setPendingDelete(null) } },
          { variant: buttonVariants.DANGER, props: { children: 'Delete', onClick: () => {
            if (!pendingDelete) return
            setDocs(prev => prev.filter(d => !pendingDelete.has(d._id)))
            setSelected(prev => { const next = new Set(prev); pendingDelete.forEach(id => next.delete(id)); return next })
            setPendingDelete(null)
          } } },
        ]}}
      >
        <Typography size="base" color="neutral-darken5">
          {pendingDelete?.size === 1 ? (
            <>Delete <strong>{stripExt(docs.find(d => d._id === [...pendingDelete][0])?.name ?? 'this document')}</strong>? This cannot be undone.</>
          ) : (
            <>Delete <strong>{pendingDelete?.size ?? 0} document{pendingDelete?.size !== 1 ? 's' : ''}</strong>? This cannot be undone.</>
          )}
        </Typography>
      </Modal>
    </div>
  )
}
