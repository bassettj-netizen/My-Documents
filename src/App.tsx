import { useState } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import {
  Avatar,
  avatarShapeEnum,
  avatarSizeEnum,
  constants,
  HaufeLogo,
  haufeLogoVariants,
  Icon,
  iconType,
  Layout,
  ThemeProvider,
  themeVariant,
} from '@goat-ui/goat-ui-core'

const { colorPalette } = constants
import type { SidebarItem, ThemeVariantValue } from '@goat-ui/goat-ui-core'
import ProfilePage from './pages/ProfilePage'
import { getInitials } from './pages/documents/workspaces/shared'
import DocumentsV1 from './pages/documents/V1'
import DocumentsV2 from './pages/documents/V2'
import DocumentsV3 from './pages/documents/V3'
import SearchDocumentsVersion1 from './pages/documents/search-documents/Version1'
import SearchDocumentsVersion2 from './pages/documents/search-documents/Version2'
import MetadataVersion1 from './pages/documents/metadata/Version1'
import MetadataVersion2 from './pages/documents/metadata/Version2'
import MetadataVersion3 from './pages/documents/metadata/Version3'
import MetadataVersion4 from './pages/documents/metadata/Version4'
import MetadataVersion5 from './pages/documents/metadata/Version5'
import MetadataVersion6 from './pages/documents/metadata/Version6'
import MetadataVersion7 from './pages/documents/metadata/Version7'
import MetadataVersion8 from './pages/documents/metadata/Version8'
import MetadataVersion9 from './pages/documents/metadata/Version9'
import MetadataVersion10 from './pages/documents/metadata/Version10'
import MetadataVersion11 from './pages/documents/metadata/Version11'
import MetadataVersion12 from './pages/documents/metadata/Version12'
import MetadataVersion13 from './pages/documents/metadata/Version13'
import MetadataVersion14 from './pages/documents/metadata/Version14'
import MetadataVersion15 from './pages/documents/metadata/Version15'
import MetadataVersion16 from './pages/documents/metadata/Version16'
import MetadataVersion17 from './pages/documents/metadata/Version17'
import MetadataVersion18 from './pages/documents/metadata/Version18'
import HackathonVersion1 from './pages/documents/hackathon/Version1'
import HackathonVersion2 from './pages/documents/hackathon/Version2'
import HackathonVersion3 from './pages/documents/hackathon/Version3'
import HackathonVersion4 from './pages/documents/hackathon/Version4'
import HackathonVersion5 from './pages/documents/hackathon/Version5'
import HackathonVersion6 from './pages/documents/hackathon/Version6'
import HackathonVersion7 from './pages/documents/hackathon/Version7'
import HackathonVersion8 from './pages/documents/hackathon/Version8'
import HackathonVersion9 from './pages/documents/hackathon/Version9'
import HackathonVersion10 from './pages/documents/hackathon/Version10'
import HackathonVersion11 from './pages/documents/hackathon/Version11'
import Workspaces2Version1 from './pages/documents/workspaces-2/Version1'
import Workspaces2Version2 from './pages/documents/workspaces-2/Version2'
import Workspaces2Version3 from './pages/documents/workspaces-2/Version3'
import Workspaces2Version4 from './pages/documents/workspaces-2/Version4'
import Workspaces2Version5 from './pages/documents/workspaces-2/Version5'
import Workspaces2Version6 from './pages/documents/workspaces-2/Version6'
import Workspaces2Version7 from './pages/documents/workspaces-2/Version7'
import Workspaces2Version8 from './pages/documents/workspaces-2/Version8'
import Workspaces2Version9 from './pages/documents/workspaces-2/Version9'
import Workspaces2Version10 from './pages/documents/workspaces-2/Version10'
import Workspaces2Version11 from './pages/documents/workspaces-2/Version11'
import Workspaces2Version12 from './pages/documents/workspaces-2/Version12'
import Workspaces2Version13 from './pages/documents/workspaces-2/Version13'
import Workspaces2Version14 from './pages/documents/workspaces-2/Version14'
import Workspaces2Version15 from './pages/documents/workspaces-2/Version15'
import Workspaces2Version16 from './pages/documents/workspaces-2/Version16'
import { byRecent, sidebarWorkspaces, useSidebarWorkspaces } from './pages/documents/workspaces-2/sidebarWorkspaces'
import { AppGlyph, HR_DOKUMENTE_GLYPH, ZEUGNIS_MANAGER_GLYPH } from './pages/documents/workspaces-2/appGlyphs'
import FileSyncVersion1 from './pages/documents/file-sync/Version1'
import FileSyncVersion2 from './pages/documents/file-sync/Version2'
import FileSyncVersion3 from './pages/documents/file-sync/Version3'
import MetadataPreviewScreenV2 from './pages/documents/metadata/PreviewScreenV2'
import MetadataPreviewV6 from './pages/documents/metadata/PreviewScreenV6'
import BulkEditV1 from './pages/documents/bulk-edit/Version1'
import BulkEditV2 from './pages/documents/bulk-edit/Version2'
import BulkEditV3 from './pages/documents/bulk-edit/Version3'
import BulkEditPreview from './pages/documents/bulk-edit/PreviewScreen'
import PreviewTasksV1 from './pages/documents/preview-tasks/Version1'
import PreviewTasksPreviewScreen from './pages/documents/preview-tasks/PreviewScreen'
import PreviewTasksV2 from './pages/documents/preview-tasks/Version2'
import PreviewTasksPreviewScreenV2 from './pages/documents/preview-tasks/PreviewScreenV2'
import PreviewTasksV3 from './pages/documents/preview-tasks/Version3'
import PreviewTasksPreviewScreenV3 from './pages/documents/preview-tasks/PreviewScreenV3'
import PreviewTasksV7 from './pages/documents/preview-tasks/Version7'
import PreviewTasksPreviewScreenV7 from './pages/documents/preview-tasks/PreviewScreenV7'
import PreviewTasksV10 from './pages/documents/preview-tasks/Version10'
import PreviewTasksPreviewScreenV10 from './pages/documents/preview-tasks/PreviewScreenV10'
import PreviewTasksV12 from './pages/documents/preview-tasks/Version12'
import PreviewTasksPreviewScreenV12 from './pages/documents/preview-tasks/PreviewScreenV12'
import PreviewTasksV13 from './pages/documents/preview-tasks/Version13'
import PreviewTasksPreviewScreenV13 from './pages/documents/preview-tasks/PreviewScreenV13'
import PreviewTasksV11 from './pages/documents/preview-tasks/Version11'
import PreviewTasksPreviewScreenV11 from './pages/documents/preview-tasks/PreviewScreenV11'
import DocumentPreviewV1 from './pages/documents/document-preview/Version1'
import DocumentPreviewV2 from './pages/documents/document-preview/Version2'
import DocumentPreviewV3 from './pages/documents/document-preview/Version3'
import DocumentPreviewV4 from './pages/documents/document-preview/Version4'
import SharepointV1 from './pages/documents/sharepoint/Version1'
import SharepointV2 from './pages/documents/sharepoint/Version2'
import SharepointV3 from './pages/documents/sharepoint/Version3'
import SharepointV4 from './pages/documents/sharepoint/Version4'
import SharepointV5 from './pages/documents/sharepoint/Version5'
import SharepointV6 from './pages/documents/sharepoint/Version6'
import SharepointV7 from './pages/documents/sharepoint/Version7'
import WorkspacesV1 from './pages/documents/workspaces/Version1'
import WorkspacesV2 from './pages/documents/workspaces/Version2'
import WorkspacesV3 from './pages/documents/workspaces/Version3'
import WorkspacesV4 from './pages/documents/workspaces/Version4'
import WorkspacesV5 from './pages/documents/workspaces/Version5'
import WorkspacesV6 from './pages/documents/workspaces/Version6'
import WorkspacesBasic from './pages/documents/workspaces/WorkspacesBasic'
import LaunchPad from './pages/documents/workspaces/LaunchPad'
import HistoryV1 from './pages/documents/history/Version1'
import HistoryV2 from './pages/documents/history/Version2'
import HistoryV3 from './pages/documents/history/Version3'
import HistoryV4 from './pages/documents/history/Version4'
import HistoryV5 from './pages/documents/history/Version5'
import HistoryV6 from './pages/documents/history/Version6'
import LaunchPad2 from './pages/documents/workspaces/LaunchPad2'
import ConnectionsPage from './pages/connections/ConnectionsPage'
import MyDocumentsV1 from './pages/documents/my-documents/Version1'
import { ConnectionsProvider } from './contexts/ConnectionsContext'
import DocumentPreviewScreen from './pages/documents/document-preview/PreviewScreen'
import PreviewScreenV2 from './pages/documents/document-preview/PreviewScreenV2'
import PreviewScreenV3 from './pages/documents/document-preview/PreviewScreenV3'
import PreviewScreenV4 from './pages/documents/document-preview/PreviewScreenV4'

// Custom sidebar icons — not available in the DS icon library, sourced from
// screenshots/CoPilot-icon.svg and screenshots/connector-icon.svg. `currentColor`
// lets them pick up the same active/inactive tint the DS `Icon` component gets
// automatically from the Sidebar's own active-state CSS.
// Matches the wrapper the DS's own `<Icon>` renders inside sidebar menu items
// (`.goat-menu-item-icon`) — needed for correct sizing/label layout, and an
// explicit `neutral.base` color since these custom SVGs don't get the DS's
// automatic icon tint from just `currentColor` alone.
// `outline` drops the filled inner shape, for menus drawn in outlined icons (Workspaces 2.0 Version 2).
function CoPilotIcon({ outline = false }: { outline?: boolean }) {
  return (
    <div className="goat-menu-item-icon" style={{ color: colorPalette.neutral.base }}>
      <svg width={24} height={24} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <mask id="copilot-sidebar-icon-mask" style={{ maskType: 'luminance' }} maskUnits="userSpaceOnUse" x="0" y="0" width="22" height="22">
          <path d="M22 0H0V22H22V0Z" fill="white" />
        </mask>
        <g mask="url(#copilot-sidebar-icon-mask)">
          <path d="M11 15.1099C8.72746 15.1099 6.89011 13.2725 6.89011 11C6.89011 8.72746 8.72746 6.89011 11 6.89011C13.2725 6.89011 15.1099 8.72746 15.1099 11C15.1099 13.2725 13.2725 15.1099 11 15.1099ZM11 8.09889C9.40442 8.09889 8.09889 9.40442 8.09889 11C8.09889 12.5956 9.40442 13.9011 11 13.9011C12.5956 13.9011 13.9011 12.5956 13.9011 11C13.9011 9.40442 12.5956 8.09889 11 8.09889ZM11.0242 21.9758C8.53409 21.9758 6.79343 20.0418 6.79343 17.2857C6.72088 15.5934 5.60879 15.2308 4.69011 15.2308C3.23956 15.2308 1.95824 14.7472 1.08791 13.8528C0.362638 13.1033 0 12.1121 0 11C0.0483517 7.92967 2.46593 6.79343 4.71429 6.76923C5.72967 6.76923 6.79343 6.21321 6.79343 4.71429C6.76923 1.88571 8.48569 0 11 0C13.5143 0 15.1099 1.83736 15.2308 4.69011C15.3033 6.47912 16.5604 6.76923 17.2857 6.76923C19.4132 6.76923 21.9275 7.90547 22 11C22 12.1121 21.6373 13.1033 20.8879 13.8528C20.0176 14.7231 18.7121 15.2308 17.2857 15.2308C16.3912 15.2308 15.3033 15.5934 15.255 17.2857C15.1341 20.1385 13.4901 21.9758 11.0242 21.9758ZM7.97801 4.71429C7.97801 6.33409 6.98679 7.95387 4.71429 7.97801C3.67472 7.97801 1.25714 8.29232 1.20879 11C1.20879 11.7736 1.45055 12.4748 1.95824 12.9824C2.58681 13.6352 3.57802 13.9978 4.69011 13.9978C6.64834 13.9978 7.90547 15.255 8.00221 17.2132C8.00221 18.978 8.94503 20.7429 11.0242 20.7429C13.1033 20.7429 13.9494 19.4132 14.0461 17.2132C14.1187 15.2308 15.3758 13.9978 17.2857 13.9736C18.3978 13.9736 19.389 13.611 20.0418 12.9582C20.5494 12.4264 20.8154 11.7494 20.7912 10.9758C20.7429 8.19558 18.0835 7.95387 17.2857 7.95387C15.7627 7.95387 14.1187 7.08354 14.022 4.71429C13.9252 2.51429 12.8132 1.18461 11 1.18461C9.18679 1.18461 7.97801 2.56264 7.97801 4.69011V4.71429Z" fill="currentColor" />
          {!outline && <path d="M11 1C12.6569 1 14 2.34315 14 4C14 4.01141 13.9992 4.0228 13.999 4.03418L14.6358 4.64062L14.3731 4.91504L17.336 7.7373L17.6006 7.45996L18.1729 8.00488C19.7493 8.09443 21 9.40116 21 11C21 12.6107 19.7306 13.9241 18.1377 13.9961L17.3545 14.8105L16.6514 14.1338L14.1309 16.7539L14.8379 17.4336L13.9824 18.3223C13.8217 19.8276 12.548 21 11 21C9.34316 21 8.00002 19.6569 8.00002 18C8.00002 17.9261 8.00355 17.8529 8.00881 17.7803L7.00002 16.8203L7.33498 16.4678L5.33889 14.5674L5.07424 14.8457L4.17873 13.9941C4.11959 13.9976 4.06003 14 4.00002 14C2.34316 14 1.00002 12.6569 1.00002 11C1.00002 9.4257 2.21273 8.13549 3.7549 8.01074L4.834 6.90918L5.53029 7.59082L7.94826 5.12109L7.24904 4.43652L8.02053 3.64746C8.19503 2.15674 9.46243 1 11 1ZM10.1963 7.32227L10.0342 7.16309L7.61623 9.63281L7.61721 9.63379L6.92482 10.3398C6.9726 10.5524 7.00002 10.773 7.00002 11C7.00002 11.0949 6.99399 11.1886 6.98537 11.2812L10.8926 15.002C10.9283 15.0007 10.9641 15 11 15C11.2375 15 11.4679 15.0299 11.6895 15.082L12.0283 14.7305L15.0567 11.582C15.0196 11.3937 15 11.1992 15 11C15 10.8012 15.0188 10.6069 15.0557 10.4189L11.9492 7.46094L11.4317 6.96875C11.2907 6.98907 11.1466 7 11 7C10.8453 7 10.6933 6.9884 10.5449 6.96582L10.1963 7.32227Z" fill="currentColor" />}
        </g>
      </svg>
    </div>
  )
}

function ConnectorIcon() {
  return (
    <div className="goat-menu-item-icon" style={{ color: colorPalette.neutral.base }}>
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#connector-sidebar-icon-clip)">
          <path d="M6.38898 17.918C3.43393 14.9629 3.43393 10.1718 6.38897 7.2168L8.68208 4.92369C9.52638 4.07939 10.8953 4.07939 11.7396 4.92369L19.3833 12.5674C20.2276 13.4117 20.2276 14.7806 19.3833 15.6249L17.0901 17.918C14.1351 20.873 9.34402 20.873 6.38898 17.918Z" fill="currentColor" />
          <rect x="1.41549" y="19.8267" width="11.3557" height="4.32" rx="2.16" transform="rotate(-45 1.41549 19.8267)" fill="currentColor" />
          <rect x="8.00064" y="9.89026" width="11.2288" height="3" rx="1.5" transform="rotate(-45 8.00064 9.89026)" stroke="currentColor" strokeWidth="1.5" />
          <rect x="11.8249" y="13.7106" width="11.2288" height="3" rx="1.5" transform="rotate(-45 11.8249 13.7106)" stroke="currentColor" strokeWidth="1.5" />
        </g>
        <defs>
          <clipPath id="connector-sidebar-icon-clip">
            <rect width="24" height="24" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </div>
  )
}

const CURRENT_USER = { name: 'Alex Mustermensch', initials: 'AM' }

// Version 13: a workspace's own avatar as its sidebar icon — the DS's smallest square avatar (32px) scaled to the
// 24px icon slot, like the user's avatar at the foot of the sidebar.
function WorkspaceMenuAvatar({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  return (
    <div className="goat-menu-item-icon" style={{ width: 24, height: 24, flexShrink: 0 }}>
      <div style={{ width: 32, height: 32, transform: 'scale(0.75)', transformOrigin: 'top left' }}>
        <Avatar shape={avatarShapeEnum.SQUARE} size={avatarSizeEnum.SMALL} src={avatarUrl} srcPlaceholder={getInitials(name)} />
      </div>
    </div>
  )
}
const HIDDEN_HEADER_ID = 'hidden-layout-header'

// Personal Office's product logo (screenshots/Haufe-haufe-personal-office-platin.avif) — a brand mark,
// so it's shown as-is rather than tinted like the DS icons around it.
function PersonalOfficeIcon() {
  return (
    <div className="goat-menu-item-icon">
      <img src="/hackathon/personal-office.avif" alt="" width={24} height={24} style={{ display: 'block' }} />
    </div>
  )
}

// Workspaces 2.0 Versions 2–5: the Haufe apps' marks without their pink tiles, in the menu's own icon colour
// (grey, blue when active) like the DS icons around them. Haufe Office Line's logo is a raster image, so its
// mark — a "P" with a dot — is redrawn as a line icon on an outlined tile.
function MenuAppGlyph({ d }: { d: string }) {
  return (
    <div className="goat-menu-item-icon">
      <span style={{ width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><AppGlyph d={d} size={20} /></span>
    </div>
  )
}

function OfficeLineGlyph() {
  return (
    <div className="goat-menu-item-icon">
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
        <rect x="3.75" y="3.75" width="16.5" height="16.5" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="15.5" cy="8.5" r="2" fill="currentColor" />
        <path d="M7.75 17V11.25H9.75C10.716 11.25 11.5 12.034 11.5 13S10.716 14.75 9.75 14.75H7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

// The design system's Connector icon (COSmos foundations, variant=outlined), which the installed GOAT-UI
// package doesn't ship yet. In the menu's own icon colour (grey, blue when active) like the DS icons around it.
function ConnectorOutlinedGlyph() {
  return (
    <div className="goat-menu-item-icon">
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
        <path fillRule="evenodd" clipRule="evenodd" d="M13.7699 2.77026C14.6486 1.89185 16.0739 1.8916 16.9526 2.77026C17.8308 3.6488 17.8306 5.07324 16.9526 5.9519L14.8608 8.04272L16.2621 9.44507L18.3315 7.37671C19.2102 6.49829 20.6355 6.49805 21.5141 7.37671C22.3926 8.25537 22.3925 9.68066 21.5141 10.5593L19.4408 12.6306C20.2251 13.4785 20.2077 14.7997 19.3842 15.6238L17.0912 17.9177L16.8598 18.1394C14.4364 20.3689 10.9117 20.7275 8.13224 19.2185L5.99845 21.3533L5.83439 21.5017C5.04262 22.1476 3.89969 22.1475 3.10783 21.5017L2.94376 21.3533C2.15301 20.5624 2.10332 19.311 2.79533 18.4626L2.94376 18.2986L5.08048 16.1609C3.58017 13.3834 3.9421 9.86633 6.16837 7.44702L6.39005 7.21655L8.68302 4.92261C9.50656 4.09961 10.8273 4.08118 11.6752 4.86401L13.7699 2.77026ZM9.74357 5.98413C10.0022 5.72559 10.4218 5.72498 10.6801 5.98315L18.3227 13.6277C18.5809 13.8861 18.581 14.3048 18.3227 14.5632L16.0297 16.8572C14.0865 18.8 11.1499 19.1498 8.84806 17.9001C8.79006 17.8687 8.73068 17.8413 8.67031 17.8181C7.81435 17.3226 7.09424 16.6213 6.57469 15.7788L6.48377 15.6321C6.46019 15.5696 6.43223 15.5081 6.39982 15.448C5.15763 13.1482 5.51036 10.2174 7.4506 8.2771L9.74357 5.98413ZM5.92508 17.4375C6.2079 17.7758 6.51997 18.0883 6.8575 18.3713L4.93693 20.2927C4.6792 20.5502 4.26196 20.5503 4.00431 20.2927C3.74661 20.0349 3.7467 19.6168 4.00431 19.3591L5.92508 17.4375ZM19.392 8.43726C19.6849 8.14453 20.1607 8.14441 20.4535 8.43726C20.7461 8.72998 20.7458 9.20483 20.4535 9.4978L19.4189 10.532L18.3842 11.5662L17.3236 10.5056L19.392 8.43726ZM14.8305 3.83081C15.1233 3.53821 15.5982 3.53821 15.891 3.83081C16.1838 4.12366 16.1837 4.59839 15.891 4.89136L13.8002 6.98218L12.7387 5.92163L14.8305 3.83081Z" fill="currentColor" />
      </svg>
    </div>
  )
}

// Version 15: a brain for My Knowledge. The DS has no brain icon, so this is drawn on its 24px grid with its
// 1.5px outline, in the menu's own icon colour (grey, blue when active).
function BrainGlyph() {
  return (
    <div className="goat-menu-item-icon">
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
        <path d="M12 5.5C12 4.12 10.88 3 9.5 3S7 4.12 7 5.5v.1A2.75 2.75 0 0 0 4.75 8.5c0 .5.13.97.37 1.37A3 3 0 0 0 4 12.25c0 1.03.52 1.94 1.3 2.48A2.75 2.75 0 0 0 7.75 18.5H8a2 2 0 0 0 4 0" />
        <path d="M12 5.5C12 4.12 13.12 3 14.5 3S17 4.12 17 5.5v.1a2.75 2.75 0 0 1 2.25 2.9c0 .5-.13.97-.37 1.37A3 3 0 0 1 20 12.25c0 1.03-.52 1.94-1.3 2.48a2.75 2.75 0 0 1-2.45 3.77H16a2 2 0 0 1-4 0" />
        <path d="M12 5.5v13" />
        <path d="M8.5 9.25c1 0 1.75.6 2 1.5M15.5 9.25c-1 0-1.75.6-2 1.5M8 14.25c.8-.6 1.8-.6 2.5 0M16 14.25c-.8-.6-1.8-.6-2.5 0" />
      </svg>
    </div>
  )
}

// CoPilot has no in-app destination — it opens in a new tab.
const COPILOT_URL = 'https://example.com/copilot-placeholder'

const WORKSPACES_NUVIO_BASE = '/projects/workspaces/nuvio'
const WORKSPACES_BASIC_BASE = '/projects/workspaces/workspaces-basic'
// Metadata V8 and V9 reuse Workspaces Basic's nested spaces routing under their own prefixes.
const METADATA_V8_BASE = '/projects/metadata/version-8'
const METADATA_V9_BASE = '/projects/metadata/version-9'
const METADATA_V10_BASE = '/projects/metadata/version-10'
const METADATA_V11_BASE = '/projects/metadata/version-11'
const METADATA_V12_BASE = '/projects/metadata/table'
const METADATA_V13_BASE = '/projects/metadata/version-13'
const METADATA_V14_BASE = '/projects/metadata/version-14'
const METADATA_V15_BASE = '/projects/metadata/cards-horizontal'
const METADATA_V16_BASE = '/projects/metadata/preview-panel'
const METADATA_V17_BASE = '/projects/metadata/cards-vertical'
const METADATA_V18_BASE = '/projects/metadata/cards-grouped'
// Hackathon Oct '26 versions start from Metadata Table, so they share the same shell.
const HACKATHON_V1_BASE = '/projects/hackathon-oct-26/version-1'
const HACKATHON_V2_BASE = '/projects/hackathon-oct-26/version-2'
const HACKATHON_V3_BASE = '/projects/hackathon-oct-26/version-3'
const HACKATHON_V4_BASE = '/projects/hackathon-oct-26/version-4'
const HACKATHON_V5_BASE = '/projects/hackathon-oct-26/version-5'
const HACKATHON_V6_BASE = '/projects/hackathon-oct-26/version-6'
const HACKATHON_V7_BASE = '/projects/hackathon-oct-26/version-7'
const HACKATHON_V8_BASE = '/projects/hackathon-oct-26/version-8'
const HACKATHON_V9_BASE = '/projects/hackathon-oct-26/version-9'
const HACKATHON_V10_BASE = '/projects/hackathon-oct-26/version-10'
const HACKATHON_V11_BASE = '/projects/hackathon-oct-26/version-11'
// Workspaces 2.0 continues from Hackathon Oct '26 Version 10, so it shares the hackathon sidebar.
const WORKSPACES_2_V1_BASE = '/projects/workspaces-2/version-1'
// Version 2 swaps in the product's full menu (Figma "2 · Client dossier").
const WORKSPACES_2_V2_BASE = '/projects/workspaces-2/version-2'
// Version 3: Version 2 with Version 1's workspace cards.
const WORKSPACES_2_V3_BASE = '/projects/workspaces-2/version-3'
// Version 4: Version 2 with the workspace cards' files and apps as a line of text.
const WORKSPACES_2_V4_BASE = '/projects/workspaces-2/version-4'
// Version 5: Version 4 with roomier overview cards on the Workspaces page.
const WORKSPACES_2_V5_BASE = '/projects/workspaces-2/version-5'
// Version 6: Version 4 with the workspace cards coloured by type.
const WORKSPACES_2_V6_BASE = '/projects/workspaces-2/version-6'
// Version 7: Version 5 with workspace cards combining its overview with the product's Spaces cards.
const WORKSPACES_2_V7_BASE = '/projects/workspaces-2/version-7'
// Version 8: Version 7 with the workspace cards rearranged — one wide card per row, contents side by side.
const WORKSPACES_2_V8_BASE = '/projects/workspaces-2/version-8'
const WORKSPACES_2_V9_BASE = '/projects/workspaces-2/version-9'
const WORKSPACES_2_V10_BASE = '/projects/workspaces-2/version-10'
// Version 11: Version 4 before the user has added anything — no workspaces, knowledge, chats or connectors.
const WORKSPACES_2_V11_BASE = '/projects/workspaces-2/version-11'
// Version 12: Version 4 with a slimmer sidebar (no Calculators, Cowork, Workflows or Gesetzesradar; Connectors under My Knowledge).
const WORKSPACES_2_V12_BASE = '/projects/workspaces-2/version-12'
// Version 13: Version 12 with the user's workspaces in the sidebar, to jump straight into one.
const WORKSPACES_2_V13_BASE = '/projects/workspaces-2/version-13'
// Version 14: Version 12 built around My files — one library of files, with workspaces on top of it.
const WORKSPACES_2_V14_BASE = '/projects/workspaces-2/version-14'
// Version 15: Version 14 with My Documents, Workspaces and Connectors grouped under My Knowledge.
const WORKSPACES_2_V15_BASE = '/projects/workspaces-2/version-15'
// Version 16: Version 15 with My Knowledge opening on a secondary menu (My Documents, Workspaces, Connectors).
const WORKSPACES_2_V16_BASE = '/projects/workspaces-2/version-16'
// File Sync versions are Metadata V12/15/16 with the out-of-sync flow, so they share the same shell.
const FILE_SYNC_V1_BASE = '/projects/file-sync/version-1'
const FILE_SYNC_V2_BASE = '/projects/file-sync/version-2'
const FILE_SYNC_V3_BASE = '/projects/file-sync/version-3'
// History V1–V6 are Workspaces Basic plus a History panel, so they get the same nested-app sidebar treatment.
const HISTORY_V1_BASE = '/projects/history/version-1'
const HISTORY_V2_BASE = '/projects/history/version-2'
const HISTORY_V3_BASE = '/projects/history/version-3'
const HISTORY_V4_BASE = '/projects/history/version-4'
const HISTORY_V5_BASE = '/projects/history/version-5'
const HISTORY_V6_BASE = '/projects/history/version-6'

/** Sends an old URL to its renamed one, keeping the rest of the path (space, document) and the query. */
function RenamedPath({ from, to }: { from: string; to: string }) {
  const location = useLocation()
  return <Navigate to={`${to}${location.pathname.slice(from.length)}${location.search}`} replace />
}

function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  // Workspaces 2.0 Versions 2 and 3: the sidebar starts open, as in their Figma.
  const [productMenuCollapsed, setProductMenuCollapsed] = useState(false)

  const inWorkspacesV6 = location.pathname.startsWith(WORKSPACES_NUVIO_BASE)
  const metadataAppBase = [METADATA_V8_BASE, METADATA_V9_BASE, METADATA_V10_BASE, METADATA_V11_BASE, METADATA_V12_BASE, METADATA_V13_BASE, METADATA_V14_BASE, METADATA_V15_BASE, METADATA_V16_BASE, METADATA_V17_BASE, METADATA_V18_BASE, HACKATHON_V1_BASE, HACKATHON_V2_BASE, HACKATHON_V3_BASE, HACKATHON_V4_BASE, HACKATHON_V5_BASE, HACKATHON_V6_BASE, HACKATHON_V7_BASE, HACKATHON_V8_BASE, HACKATHON_V9_BASE, HACKATHON_V10_BASE, HACKATHON_V11_BASE, WORKSPACES_2_V1_BASE, WORKSPACES_2_V2_BASE, WORKSPACES_2_V3_BASE, WORKSPACES_2_V4_BASE, WORKSPACES_2_V5_BASE, WORKSPACES_2_V6_BASE, WORKSPACES_2_V7_BASE, WORKSPACES_2_V8_BASE, WORKSPACES_2_V9_BASE, WORKSPACES_2_V10_BASE, WORKSPACES_2_V11_BASE, WORKSPACES_2_V12_BASE, WORKSPACES_2_V13_BASE, WORKSPACES_2_V14_BASE, WORKSPACES_2_V15_BASE, WORKSPACES_2_V16_BASE, FILE_SYNC_V1_BASE, FILE_SYNC_V2_BASE, FILE_SYNC_V3_BASE, HISTORY_V1_BASE, HISTORY_V2_BASE, HISTORY_V3_BASE, HISTORY_V4_BASE, HISTORY_V5_BASE, HISTORY_V6_BASE].find(b => location.pathname === b || location.pathname.startsWith(`${b}/`))
  const inMetadataV8 = !!metadataAppBase
  // Metadata V8 is Workspaces Basic under another prefix, so it gets the same sidebar treatment.
  const inWorkspacesBasic = location.pathname.startsWith(WORKSPACES_BASIC_BASE) || inMetadataV8
  // Whichever nested-routing workspaces app (if any) the sidebar's own links
  // should stay inside of, rather than jumping out to an unrelated top-level page.
  const workspacesAppBase = metadataAppBase ? metadataAppBase : inWorkspacesBasic ? WORKSPACES_BASIC_BASE : WORKSPACES_NUVIO_BASE

  // Whichever Hackathon Oct '26 version (if any) we're in — they share the same sidebar.
  const hackathonBase = [HACKATHON_V1_BASE, HACKATHON_V2_BASE, HACKATHON_V3_BASE, HACKATHON_V4_BASE, HACKATHON_V5_BASE, HACKATHON_V6_BASE, HACKATHON_V7_BASE, HACKATHON_V8_BASE, HACKATHON_V9_BASE, HACKATHON_V10_BASE, HACKATHON_V11_BASE, WORKSPACES_2_V1_BASE, WORKSPACES_2_V2_BASE, WORKSPACES_2_V3_BASE, WORKSPACES_2_V4_BASE, WORKSPACES_2_V5_BASE, WORKSPACES_2_V6_BASE, WORKSPACES_2_V7_BASE, WORKSPACES_2_V8_BASE, WORKSPACES_2_V9_BASE, WORKSPACES_2_V10_BASE, WORKSPACES_2_V11_BASE, WORKSPACES_2_V12_BASE, WORKSPACES_2_V13_BASE, WORKSPACES_2_V14_BASE, WORKSPACES_2_V15_BASE, WORKSPACES_2_V16_BASE].find(b => b === metadataAppBase) ?? null
  const inHackathon = !!hackathonBase
  // Versions 5, 7, 9 and 11 are the German copies of 4, 6, 8 and 10, so their sidebar is in German too.
  const de = [HACKATHON_V5_BASE, HACKATHON_V7_BASE, HACKATHON_V9_BASE, HACKATHON_V11_BASE].includes(hackathonBase!)

  const activeKey =
    location.pathname === `${hackathonBase}/home` ? 'home' :
    location.pathname === `${hackathonBase}/personal-office` ? 'personal-office' :
    location.pathname === `${hackathonBase}/hr-dokumente` ? 'hr-dokumente' :
    location.pathname === `${hackathonBase}/zeugnis-manager` ? 'zeugnis-manager' :
    location.pathname === `${hackathonBase}/copilot` ? 'copilot' :
    location.pathname === '/connectors' || location.pathname === `${WORKSPACES_NUVIO_BASE}/connectors` || location.pathname === `${WORKSPACES_BASIC_BASE}/connectors` || location.pathname === `${metadataAppBase}/connectors` ? 'connectors' :
    location.pathname === `${metadataAppBase}/my-files` ||
    location.pathname === `${WORKSPACES_NUVIO_BASE}/my-documents` || location.pathname === `${WORKSPACES_BASIC_BASE}/my-documents` || location.pathname.startsWith(`${metadataAppBase}/my-documents`) ? 'documents' :
    location.pathname.startsWith('/projects/workspaces') || (!!metadataAppBase && location.pathname.startsWith(`${metadataAppBase}/workspaces`)) ? 'workspaces' :
    location.pathname.startsWith('/projects') ? 'documents' :
    ''
  // Version 16: My Documents, Workspaces and Connectors are all under the one My Knowledge item.
  const inV16Knowledge = hackathonBase === WORKSPACES_2_V16_BASE && ['my-documents', 'workspaces', 'connectors'].some(area => location.pathname.startsWith(`${hackathonBase}/${area}`))
  // Version 13 lists the user's workspaces in the sidebar; inside one, its own item is the active one.
  const sidebarWs = useSidebarWorkspaces()
  const openWorkspace = hackathonBase === WORKSPACES_2_V13_BASE
    ? sidebarWs.workspaces.find(w => location.pathname === `${hackathonBase}/workspaces/${w.slug}` || location.pathname.startsWith(`${hackathonBase}/workspaces/${w.slug}/`))
    : undefined

  const homeItem = {
    key: 'home',
    label: de ? 'Startseite' : 'Home',
    icon: <Icon type={iconType.HouseFilled} />,
    onClick: () => navigate(`${hackathonBase}/home`),
  }
  const personalOfficeItem = {
    key: 'personal-office',
    label: 'Personal Office',
    icon: <PersonalOfficeIcon />,
    onClick: () => navigate(`${hackathonBase}/personal-office`),
  }
  const documentsItem = {
    key: 'documents',
    label: 'My Documents',
    icon: <Icon type={iconType.FolderFilled} />,
    // Inside a nested-routing workspaces app (V6 or Basic), "My Documents"
    // stays within that app's own URL space instead of jumping out to the
    // unrelated top-level page.
    onClick: () => navigate(inWorkspacesV6 || inWorkspacesBasic ? `${workspacesAppBase}/my-documents` : '/projects/my-documents/version-1'),
  }
  const workspacesItem = {
    key: 'workspaces',
    // Workspaces Basic calls these "Spaces" throughout, so the sidebar matches
    // whichever nested app the user is currently inside — except Hackathon Oct '26, which says "Workspaces".
    label: de ? 'Arbeitsbereiche' : inWorkspacesBasic && !inHackathon ? 'Spaces' : 'Workspaces',
    icon: <Icon type={iconType.ElementsFilled} />,
    onClick: () => navigate(`${workspacesAppBase}/workspaces`),
  }
  const copilotItem = {
    key: 'copilot',
    label: 'CoPilot',
    icon: <CoPilotIcon />,
    // Hackathon Oct '26 has its own CoPilot page; elsewhere CoPilot opens in a new tab.
    onClick: () => inHackathon ? navigate(`${hackathonBase}/copilot`) : window.open(COPILOT_URL, '_blank', 'noopener,noreferrer'),
  }

  // Hackathon Oct '26 has its own order, with Home and Personal Office and without My Documents.
  const sidebarTopItems = (inHackathon
    // Versions 6 to 11 drop Home from the sidebar.
    ? ([HACKATHON_V6_BASE, HACKATHON_V7_BASE, HACKATHON_V8_BASE, HACKATHON_V9_BASE, HACKATHON_V10_BASE, HACKATHON_V11_BASE, WORKSPACES_2_V1_BASE].includes(hackathonBase!) ? [copilotItem, personalOfficeItem, workspacesItem] : [homeItem, copilotItem, personalOfficeItem, workspacesItem])
    : [documentsItem, workspacesItem, copilotItem]
  ) as unknown as SidebarItem[]

  const connectorsItem = {
    key: 'connectors',
    label: de ? 'Konnektoren' : 'Connectors',
    icon: <ConnectorIcon />,
    // Same rule as "My Documents" — stays inside the current nested workspaces
    // app when already there, rather than jumping out to the unrelated top-level page.
    onClick: () => navigate(inWorkspacesV6 || inWorkspacesBasic ? `${workspacesAppBase}/connectors` : '/connectors'),
  }
  // Hackathon Oct '26 has no header, so the user's avatar sits at the foot of the sidebar instead.
  const userItem = {
    key: 'user',
    label: CURRENT_USER.name,
    icon: (
      // The DS's smallest avatar is 32px, taller than the sidebar's 24px icon slot (it was cut off at the
      // bottom), so it's scaled to 24px to sit like the other icons.
      <div className="goat-menu-item-icon" style={{ width: 24, height: 24, flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, transform: 'scale(0.75)', transformOrigin: 'top left' }}>
          <Avatar srcPlaceholder={CURRENT_USER.initials} size={avatarSizeEnum.SMALL} />
        </div>
      </div>
    ),
  }
  const sidebarBottomItems = [connectorsItem, ...(inHackathon ? [userItem] : [])] as unknown as SidebarItem[]

  // Workspaces 2.0 Versions 2 and 3 use the product's full menu, with My Knowledge and Cowork as open groups. Items
  // without a page in this prototype (Calculators, Cowork, Workflows, Gesetzesradar,
  // Einstellungen, Abmelden) do nothing; the avatar stays at the foot as in Version 1.
  const productMenu = hackathonBase === WORKSPACES_2_V2_BASE || hackathonBase === WORKSPACES_2_V3_BASE || hackathonBase === WORKSPACES_2_V4_BASE || hackathonBase === WORKSPACES_2_V5_BASE || hackathonBase === WORKSPACES_2_V6_BASE || hackathonBase === WORKSPACES_2_V7_BASE || hackathonBase === WORKSPACES_2_V8_BASE || hackathonBase === WORKSPACES_2_V9_BASE || hackathonBase === WORKSPACES_2_V10_BASE || hackathonBase === WORKSPACES_2_V11_BASE || hackathonBase === WORKSPACES_2_V12_BASE || hackathonBase === WORKSPACES_2_V13_BASE || hackathonBase === WORKSPACES_2_V14_BASE || hackathonBase === WORKSPACES_2_V15_BASE || hackathonBase === WORKSPACES_2_V16_BASE
  const productTopItems = [
    { ...copilotItem, label: 'Copilot Tax', icon: <CoPilotIcon outline /> },
    { key: 'calculators', label: 'Calculators', icon: <Icon type={iconType.CalculatorOutlined} /> },
    { ...personalOfficeItem, label: 'Haufe Office Line', icon: <OfficeLineGlyph /> },
    { key: 'hr-dokumente', label: 'HR Dokumente', icon: <MenuAppGlyph d={HR_DOKUMENTE_GLYPH} />, onClick: () => navigate(`${hackathonBase}/hr-dokumente`) },
    { key: 'zeugnis-manager', label: 'Haufe Zeugnis Manager', icon: <MenuAppGlyph d={ZEUGNIS_MANAGER_GLYPH} />, onClick: () => navigate(`${hackathonBase}/zeugnis-manager`) },
    { key: 'content', label: 'My Knowledge', icon: <Icon type={iconType.FolderOutlined} />, children: [
      { key: 'documents', label: 'Meine Dokumente', icon: <Icon type={iconType.FolderOutlined} />, onClick: () => navigate(`${hackathonBase}/my-documents`) },
      { ...workspacesItem, icon: <Icon type={iconType.ElementsOutlined} /> },
    ] },
    { key: 'cowork', label: 'Cowork', icon: <Icon type={iconType.RouteOutlined} />, children: [
      { key: 'cowork-tax', label: 'Tax', icon: <Icon type={iconType.RouteOutlined} /> },
      { key: 'cowork-finki', label: 'Finki', icon: <Icon type={iconType.RouteOutlined} /> },
    ] },
    { key: 'workflows', label: 'Workflows', icon: <Icon type={iconType.ArticleOutlined} /> },
    { key: 'gesetzesradar', label: 'Gesetzesradar', icon: <Icon type={iconType.WorldOutlined} /> },
    { ...connectorsItem, icon: <Icon type={iconType.LinkOutlined} /> },
  ] as unknown as SidebarItem[]
  // Version 12: only the apps and Workspaces, which holds its Overview (the workspaces list) and Connectors.
  const productTopItemsV12 = [
    { ...copilotItem, label: 'Copilot Tax', icon: <CoPilotIcon outline /> },
    { ...personalOfficeItem, label: 'Haufe Office Line', icon: <OfficeLineGlyph /> },
    { key: 'hr-dokumente', label: 'HR Dokumente', icon: <MenuAppGlyph d={HR_DOKUMENTE_GLYPH} />, onClick: () => navigate(`${hackathonBase}/hr-dokumente`) },
    { key: 'zeugnis-manager', label: 'Haufe Zeugnis Manager', icon: <MenuAppGlyph d={ZEUGNIS_MANAGER_GLYPH} />, onClick: () => navigate(`${hackathonBase}/zeugnis-manager`) },
    { key: 'content', label: 'Workspaces', icon: <Icon type={iconType.ElementsOutlined} />, children: [
      { ...workspacesItem, label: 'Overview', icon: <Icon type={iconType.ElementsOutlined} /> },
      { ...connectorsItem, icon: <ConnectorOutlinedGlyph /> },
    ] },
  ] as unknown as SidebarItem[]
  // Version 13: Version 12's menu, plus the five most recently opened workspaces under Workspaces and a
  // "Find a workspace" switcher (also ⌘K) for the rest. The "Recent" heading isn't a sidebar item type the DS
  // has — it's an item drawn as a heading (index.css).
  const productTopItemsV13 = [
    ...productTopItemsV12.slice(0, 4),
    { key: 'content', label: 'Workspaces', icon: <Icon type={iconType.ElementsOutlined} />, children: [
      { ...workspacesItem, label: 'Overview', icon: <Icon type={iconType.ElementsOutlined} /> },
      { ...connectorsItem, icon: <ConnectorOutlinedGlyph /> },
      { key: 'ws-recent-heading', label: <span className="sidebar-section-heading">Recent</span> },
      ...byRecent(sidebarWs).slice(0, 5).map(w => ({
        key: `ws-${w.id}`,
        label: w.name,
        icon: <WorkspaceMenuAvatar name={w.name} avatarUrl={w.avatarUrl} />,
        onClick: () => navigate(`${hackathonBase}/workspaces/${w.slug}`),
      })),
      {
        key: 'ws-find',
        label: <span title="Find a workspace (⌘K)">Find a workspace</span>,
        icon: <Icon type={iconType.SearchOutlined} />,
        onClick: () => sidebarWorkspaces.setSwitcherOpen(true),
      },
    ] },
  ] as unknown as SidebarItem[]
  // Version 14: My files first — the landing page and the one place files live — then Workspaces, built on
  // top of it, and Connectors, which feed My files.
  const productTopItemsV14 = [
    ...productTopItemsV12.slice(0, 4),
    { key: 'documents', label: 'My files', icon: <Icon type={iconType.FolderOutlined} />, onClick: () => navigate(`${hackathonBase}/my-files`) },
    { ...workspacesItem, icon: <Icon type={iconType.ElementsOutlined} /> },
    { ...connectorsItem, icon: <ConnectorOutlinedGlyph /> },
  ] as unknown as SidebarItem[]
  // Version 15: Version 14's three, grouped under My Knowledge, with My files renamed My Documents.
  const productTopItemsV15 = [
    ...productTopItemsV12.slice(0, 4),
    { key: 'content', label: 'My Knowledge', icon: <BrainGlyph />, children: [
      { key: 'documents', label: 'My Documents', icon: <Icon type={iconType.FolderOutlined} />, onClick: () => navigate(`${hackathonBase}/my-documents`) },
      { ...workspacesItem, icon: <Icon type={iconType.ElementsOutlined} /> },
      { ...connectorsItem, icon: <ConnectorOutlinedGlyph /> },
    ] },
  ] as unknown as SidebarItem[]
  // Version 16: My Knowledge as one item; its areas are in its own secondary menu (Version16's KnowledgeShell).
  const productTopItemsV16 = [
    ...productTopItemsV12.slice(0, 4),
    { key: 'knowledge', label: 'My Knowledge', icon: <BrainGlyph />, onClick: () => navigate(`${hackathonBase}/my-documents`) },
  ] as unknown as SidebarItem[]
  const productBottomItems = [
    { key: 'settings', label: 'Einstellungen', icon: <Icon type={iconType.GearOutlined} /> },
    { key: 'logout', label: 'Abmelden', icon: <Icon type={iconType.LogoutOutlined} /> },
    userItem,
  ] as unknown as SidebarItem[]

  return (
    <Layout
      header={inHackathon ? { id: HIDDEN_HEADER_ID } : {
        avatar: {
          srcPlaceholder: CURRENT_USER.initials,
          size: avatarSizeEnum.SMALL,
          title: CURRENT_USER.name,
        },
      }}
      sidebar={{
        topItems: productMenu ? (hackathonBase === WORKSPACES_2_V16_BASE ? productTopItemsV16 : hackathonBase === WORKSPACES_2_V15_BASE ? productTopItemsV15 : hackathonBase === WORKSPACES_2_V14_BASE ? productTopItemsV14 : hackathonBase === WORKSPACES_2_V13_BASE ? productTopItemsV13 : hackathonBase === WORKSPACES_2_V12_BASE ? productTopItemsV12 : productTopItems) : sidebarTopItems,
        bottomItems: productMenu ? productBottomItems : sidebarBottomItems,
        collapsible: true,
        ...(productMenu ? { collapsed: productMenuCollapsed, onCollapsedChange: setProductMenuCollapsed, defaultOpenKeys: ['content', 'cowork'] } : {}),
        activeKeys: [openWorkspace ? `ws-${openWorkspace.id}` : inV16Knowledge ? 'knowledge' : activeKey],
        mode: 'light',
        logoProps: {
          src: (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
              <HaufeLogo variant={haufeLogoVariants.ICON} />
            </div>
          ),
        },
      }}
    >
      {/* The Layout always renders its header, so Hackathon Oct '26 hides it to drop the header entirely. */}
      {inHackathon && <style>{`#${HIDDEN_HEADER_ID} { display: none; }`}</style>}
      {/* The sidebar switches between a scrolling menu (when it doesn't fit) and one with the bottom items
          pinned to the foot (when it does). The pinned layout is a few pixels taller, so at window heights
          where the long product menu only just fits it flips between the two every frame and the bottom items
          jump. Giving both layouts the same rules — scroll if needed, bottom items pushed to the foot — makes
          the flip invisible. */}
      {productMenu && <style>{`aside.goat-layout-sider div:has(> ul.goat-menu-root) { overflow-y: auto !important; overflow-x: hidden !important; justify-content: space-between !important; }`}</style>}
      {/* Workspaces 2.0 Versions 2 and 3: the pages are white, so the Layout's own tinted background (seen while a page
          loads, or below a short one) is white too. */}
      {productMenu && <style>{`.goat-layout { background: ${colorPalette.white} !important; }`}</style>}
      <Outlet />
    </Layout>
  )
}

function App() {
  const [selectedTheme, setSelectedTheme] = useState<ThemeVariantValue>(themeVariant.BLUE)

  return (
    <ThemeProvider selectedTheme={selectedTheme}>
      <ConnectionsProvider>
      <Routes>
        {/* Routes rendered inside the sidebar/header Layout */}
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/projects/sharepoint/version-3/my-documents" replace />} />
          <Route path="/connectors" element={<ConnectionsPage />} />
          <Route path="/projects/my-documents/version-1" element={<MyDocumentsV1 />} />
          <Route path="/projects/documents/version-1" element={<DocumentsV1 />} />
          <Route path="/projects/documents/version-2" element={<DocumentsV2 />} />
          <Route path="/projects/documents/version-3" element={<DocumentsV3 />} />
          <Route path="/projects/search-documents/version-1" element={<SearchDocumentsVersion1 />} />
          <Route path="/projects/search-documents/version-2" element={<SearchDocumentsVersion2 />} />
          <Route path="/projects/metadata/version-1" element={<MetadataVersion1 />} />
          <Route path="/projects/metadata/version-2" element={<MetadataVersion2 />} />
          <Route path="/projects/metadata/version-3" element={<MetadataVersion3 />} />
          <Route path="/projects/metadata/version-4" element={<MetadataVersion4 />} />
          <Route path="/projects/metadata/version-5" element={<MetadataVersion5 />} />
          <Route path="/projects/metadata/version-6" element={<MetadataVersion6 />} />
          <Route path="/projects/metadata/version-7" element={<MetadataVersion7 />} />
          {/* Workspaces Basic's spaces → documents routing, with the reduced
              four-field metadata model and its own in-layout document preview. */}
          <Route path="/projects/metadata/version-8/*" element={<MetadataVersion8 />} />
          {/* V9: V8 with the documents table reworked to the Metadata Figma (tooltips, popover editors, status/size columns). */}
          <Route path="/projects/metadata/version-9/*" element={<MetadataVersion9 />} />
          {/* V10: V9 with a label/value Dates column coloured by state, and file size under the name. */}
          <Route path="/projects/metadata/version-10/*" element={<MetadataVersion10 />} />
          {/* V11: V9 without the Summary column (summary lives in the preview only). */}
          <Route path="/projects/metadata/version-11/*" element={<MetadataVersion11 />} />
          {/* V12: V9 with rows as tall as their content — nothing in the table is cut off. */}
          <Route path="/projects/metadata/table/*" element={<MetadataVersion12 />} />
          <Route path="/projects/metadata/version-12/*" element={<RenamedPath from="/projects/metadata/version-12" to="/projects/metadata/table" />} />
          {/* V13: V12's data without the table — document cards grouped by matter, with deadline cues. */}
          <Route path="/projects/metadata/version-13/*" element={<MetadataVersion13 />} />
          {/* V14: V13's cards in one sorted list — no grouping, matter reference on every card. */}
          <Route path="/projects/metadata/version-14/*" element={<MetadataVersion14 />} />
          {/* V15: V14 without deadline chips or date colouring; long party lists capped at five, "+N more" tooltip. */}
          <Route path="/projects/metadata/cards-horizontal/*" element={<MetadataVersion15 />} />
          <Route path="/projects/metadata/version-15/*" element={<RenamedPath from="/projects/metadata/version-15" to="/projects/metadata/cards-horizontal" />} />
          {/* V16: list + details — compact two-line rows, the selected document's full details and editing in a side panel. */}
          <Route path="/projects/metadata/preview-panel/*" element={<MetadataVersion16 />} />
          <Route path="/projects/metadata/version-16/*" element={<RenamedPath from="/projects/metadata/version-16" to="/projects/metadata/preview-panel" />} />
          {/* V17: V15's information as a grid of upright cards — chips, parties and a dates footer instead of columns; the whole card opens the preview. */}
          <Route path="/projects/metadata/cards-vertical/*" element={<MetadataVersion17 />} />
          <Route path="/projects/metadata/version-17/*" element={<RenamedPath from="/projects/metadata/version-17" to="/projects/metadata/cards-vertical" />} />
          {/* Cards Grouped: Cards Horizontal restyled — date headings, file-type and source icons, path and parties lines. */}
          <Route path="/projects/metadata/cards-grouped/*" element={<MetadataVersion18 />} />
          {/* Hackathon Oct '26: starts as a copy of Metadata Table. */}
          <Route path="/projects/hackathon-oct-26/version-1/*" element={<HackathonVersion1 />} />
          {/* Version 2: Version 1 with the workspace's documents, context, guardrails, bookmarks and templates on one screen. */}
          <Route path="/projects/hackathon-oct-26/version-2/*" element={<HackathonVersion2 />} />
          {/* Version 3: a summary page per workspace, with a page of its own for each area behind it. */}
          <Route path="/projects/hackathon-oct-26/version-3/*" element={<HackathonVersion3 />} />
          {/* Version 4: starts as a copy of Version 3. */}
          <Route path="/projects/hackathon-oct-26/version-4/*" element={<HackathonVersion4 />} />
          {/* Version 5: Version 4 in German ("Arbeitsbereich" for workspace). */}
          <Route path="/projects/hackathon-oct-26/version-5/*" element={<HackathonVersion5 />} />
          {/* Versions 6 and 7: Versions 4 and 5 populated with Metadata Table's workspaces (7 is German). */}
          <Route path="/projects/hackathon-oct-26/version-6/*" element={<HackathonVersion6 />} />
          <Route path="/projects/hackathon-oct-26/version-7/*" element={<HackathonVersion7 />} />
          {/* Versions 8 and 9: 6 and 7 with My knowledge filled in from one side panel (9 is German). */}
          <Route path="/projects/hackathon-oct-26/version-8/*" element={<HackathonVersion8 />} />
          <Route path="/projects/hackathon-oct-26/version-9/*" element={<HackathonVersion9 />} />
          {/* Versions 10 and 11: 8 and 9 where a new workspace opens on an animated "ready" view (11 is German). */}
          <Route path="/projects/hackathon-oct-26/version-10/*" element={<HackathonVersion10 />} />
          <Route path="/projects/hackathon-oct-26/version-11/*" element={<HackathonVersion11 />} />
          {/* Workspaces 2.0: Version 1 starts as a copy of Hackathon Oct '26 Version 10. */}
          <Route path="/projects/workspaces-2/version-1/*" element={<Workspaces2Version1 />} />
          {/* Version 2: Version 1's workspace page reworked to the "2 · Client dossier" Figma, with the product's full sidebar menu. */}
          <Route path="/projects/workspaces-2/version-2/*" element={<Workspaces2Version2 />} />
          {/* Version 3: Version 2 with Version 1's workspace cards on the Workspaces page. */}
          <Route path="/projects/workspaces-2/version-3/*" element={<Workspaces2Version3 />} />
          {/* Version 4: Version 2 with the workspace cards' files and apps summarised as text. */}
          <Route path="/projects/workspaces-2/version-4/*" element={<Workspaces2Version4 />} />
          {/* Version 5: Version 4 with roomier overview cards — key details, contents and recent activity. */}
          <Route path="/projects/workspaces-2/version-5/*" element={<Workspaces2Version5 />} />
          {/* Version 6: Version 4 with the workspace cards coloured by type (chip and a soft tint). */}
          <Route path="/projects/workspaces-2/version-6/*" element={<Workspaces2Version6 />} />
          {/* Version 7: Version 5 with workspace cards combining its overview with the product's Spaces cards. */}
          <Route path="/projects/workspaces-2/version-7/*" element={<Workspaces2Version7 />} />
          {/* Version 8: Version 7 with the workspace cards rearranged — one wide card per row, contents side by side. */}
          <Route path="/projects/workspaces-2/version-8/*" element={<Workspaces2Version8 />} />
          <Route path="/projects/workspaces-2/version-9/*" element={<Workspaces2Version9 />} />
          <Route path="/projects/workspaces-2/version-10/*" element={<Workspaces2Version10 />} />
          {/* Version 11: Version 4 empty — before the user has added a workspace or filled it with anything. */}
          <Route path="/projects/workspaces-2/version-11/*" element={<Workspaces2Version11 />} />
          {/* Version 12: Version 4 with a slimmer sidebar, for working on the menu. */}
          <Route path="/projects/workspaces-2/version-12/*" element={<Workspaces2Version12 />} />
          {/* Version 13: Version 12 with the user's workspaces in the sidebar. */}
          <Route path="/projects/workspaces-2/version-13/*" element={<Workspaces2Version13 />} />
          {/* Version 14: Version 12 built around My files, with workspaces on top of it. */}
          <Route path="/projects/workspaces-2/version-14/*" element={<Workspaces2Version14 />} />
          {/* Version 15: My Documents, Workspaces and Connectors under My Knowledge; My Documents as the Metadata Table, with filters. */}
          <Route path="/projects/workspaces-2/version-15/*" element={<Workspaces2Version15 />} />
          {/* Version 16: My Knowledge opens on a secondary menu with My Documents, Workspaces and Connectors. */}
          <Route path="/projects/workspaces-2/version-16/*" element={<Workspaces2Version16 />} />
          {/* File Sync: Metadata V12, V15 and V16 with the out-of-sync documents banner, statuses and sync toasts. */}
          <Route path="/projects/file-sync/version-1/*" element={<FileSyncVersion1 />} />
          <Route path="/projects/file-sync/version-2/*" element={<FileSyncVersion2 />} />
          <Route path="/projects/file-sync/version-3/*" element={<FileSyncVersion3 />} />
          <Route path="/projects/sharepoint/version-1" element={<SharepointV1 />} />
          <Route path="/projects/sharepoint/version-1/connections" element={<ConnectionsPage />} />
          <Route path="/projects/sharepoint/version-2" element={<SharepointV2 />} />
          <Route path="/projects/sharepoint/version-2/connections" element={<ConnectionsPage />} />
          <Route path="/projects/sharepoint/version-3" element={<Navigate to="/projects/sharepoint/version-3/my-documents" replace />} />
          <Route path="/projects/sharepoint/version-3/my-documents" element={<SharepointV3 />} />
          <Route path="/projects/sharepoint/version-3/connections" element={<ConnectionsPage />} />
          <Route path="/projects/sharepoint/version-4" element={<SharepointV4 />} />
          <Route path="/projects/sharepoint/version-5" element={<SharepointV5 />} />
          <Route path="/projects/sharepoint/version-6" element={<SharepointV6 />} />
          <Route path="/projects/sharepoint/version-7" element={<SharepointV7 />} />
          <Route path="/projects/workspaces/version-1" element={<WorkspacesV1 />} />
          <Route path="/projects/workspaces/version-2" element={<WorkspacesV2 />} />
          <Route path="/projects/workspaces/version-3" element={<WorkspacesV3 />} />
          <Route path="/projects/workspaces/version-4" element={<WorkspacesV4 />} />
          <Route path="/projects/workspaces/version-5" element={<WorkspacesV5 />} />
          {/* Every screen inside Workspaces V6 (spaces list, a space's chat, its
              documents drawer, a document preview) is its own nested route under
              this prefix — WorkspacesV6 renders its own <Routes> for the rest. */}
          <Route path="/projects/workspaces/nuvio/*" element={<WorkspacesV6 />} />
          {/* Same spaces list/detail routing as Workspaces V6, but a space's
              detail route lands straight on its documents table — no chat. */}
          <Route path="/projects/workspaces/workspaces-basic/*" element={<WorkspacesBasic />} />
          {/* Workspaces Basic with a History button/panel for a space's uploads and connector changes. */}
          <Route path="/projects/history/version-1/*" element={<HistoryV1 />} />
          {/* V2: V1 with every file of an event listed — no "+ N" cut-off. */}
          <Route path="/projects/history/version-2/*" element={<HistoryV2 />} />
          {/* V3: V2's data in a panel built only from design-system components, with filters and a file table. */}
          <Route path="/projects/history/version-3/*" element={<HistoryV3 />} />
          {/* V4: V3 with an entry's files as a plain paged list, alert icons instead of status chips. */}
          <Route path="/projects/history/version-4/*" element={<HistoryV4 />} />
          {/* V5: V4 with long file lists scrolling inside the card instead of paging. */}
          <Route path="/projects/history/version-5/*" element={<HistoryV5 />} />
          {/* V6: V5 with entries as Cards — type, user, date and app always shown, "View more" for the documents. */}
          <Route path="/projects/history/version-6/*" element={<HistoryV6 />} />
          <Route path="/projects/bulk-edit/version-1" element={<BulkEditV1 />} />
          <Route path="/projects/bulk-edit/version-2" element={<BulkEditV2 />} />
          <Route path="/projects/bulk-edit/version-3" element={<BulkEditV3 />} />
          <Route path="/projects/preview-tasks/version-1" element={<PreviewTasksV1 />} />
          <Route path="/projects/preview-tasks/version-2" element={<PreviewTasksV2 />} />
          <Route path="/projects/preview-tasks/version-3" element={<PreviewTasksV3 />} />
          <Route path="/projects/preview-tasks/version-7" element={<PreviewTasksV7 />} />
          <Route path="/projects/preview-tasks/version-10" element={<PreviewTasksV10 />} />
          <Route path="/projects/preview-tasks/version-11" element={<PreviewTasksV11 />} />
          <Route path="/projects/preview-tasks/version-12" element={<PreviewTasksV12 />} />
          <Route path="/projects/preview-tasks/version-13" element={<PreviewTasksV13 />} />
          <Route path="/projects/document-preview/version-1" element={<DocumentPreviewV1 />} />
          <Route path="/projects/document-preview/version-2" element={<DocumentPreviewV2 />} />
          <Route path="/projects/document-preview/version-3" element={<DocumentPreviewV3 />} />
          <Route path="/projects/document-preview/version-4" element={<DocumentPreviewV4 />} />
          <Route path="/profile" element={<ProfilePage selectedTheme={selectedTheme} onThemeChange={setSelectedTheme} />} />
          <Route path="*" element={<Navigate to="/projects/sharepoint/version-3/my-documents" replace />} />
        </Route>

        {/* Full-screen routes — rendered outside the Layout */}
        {/* Launch Pad is a distinct product-suite shell with its own sidebar/nav, so it owns its
            full chrome here rather than nesting inside AppShell's Layout. */}
        <Route path="/projects/workspaces/launch-pad/*" element={<LaunchPad />} />
        <Route path="/projects/workspaces/launch-pad-2/*" element={<LaunchPad2 />} />
        <Route path="/projects/document-preview/version-1/:id" element={<DocumentPreviewScreen />} />
        <Route path="/projects/document-preview/version-2/:id" element={<PreviewScreenV2 />} />
        <Route path="/projects/document-preview/version-3/:id" element={<PreviewScreenV3 />} />
        <Route path="/projects/document-preview/version-4/:id" element={<PreviewScreenV4 />} />
        <Route path="/projects/metadata/version-2/:id" element={<MetadataPreviewScreenV2 />} />
        <Route path="/projects/metadata/version-3/:id" element={<MetadataPreviewScreenV2 />} />
        <Route path="/projects/metadata/version-4/:id" element={<BulkEditPreview />} />
        <Route path="/projects/metadata/version-5/:id" element={<MetadataPreviewScreenV2 />} />
        <Route path="/projects/metadata/version-6/:id" element={<MetadataPreviewV6 />} />
        <Route path="/projects/metadata/version-7/:id" element={<MetadataPreviewV6 />} />
        <Route path="/projects/bulk-edit/version-1/:id" element={<BulkEditPreview />} />
        <Route path="/projects/bulk-edit/version-2/:id" element={<BulkEditPreview />} />
        <Route path="/projects/bulk-edit/version-3/:id" element={<BulkEditPreview />} />
        <Route path="/projects/preview-tasks/version-1/:id" element={<PreviewTasksPreviewScreen />} />
        <Route path="/projects/preview-tasks/version-2/:id" element={<PreviewTasksPreviewScreenV2 />} />
        <Route path="/projects/preview-tasks/version-3/:id" element={<PreviewTasksPreviewScreenV3 />} />
        <Route path="/projects/preview-tasks/version-7/:id" element={<PreviewTasksPreviewScreenV7 />} />
        <Route path="/projects/preview-tasks/version-10/:id" element={<PreviewTasksPreviewScreenV10 />} />
        <Route path="/projects/preview-tasks/version-11/:id" element={<PreviewTasksPreviewScreenV11 />} />
        <Route path="/projects/preview-tasks/version-12/:id" element={<PreviewTasksPreviewScreenV12 />} />
        <Route path="/projects/preview-tasks/version-13/:id" element={<PreviewTasksPreviewScreenV13 />} />
      </Routes>
      </ConnectionsProvider>
    </ThemeProvider>
  )
}

export default App
