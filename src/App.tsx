import { useState } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import {
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
function CoPilotIcon() {
  return (
    <div className="goat-menu-item-icon" style={{ color: colorPalette.neutral.base }}>
      <svg width={24} height={24} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <mask id="copilot-sidebar-icon-mask" style={{ maskType: 'luminance' }} maskUnits="userSpaceOnUse" x="0" y="0" width="22" height="22">
          <path d="M22 0H0V22H22V0Z" fill="white" />
        </mask>
        <g mask="url(#copilot-sidebar-icon-mask)">
          <path d="M11 15.1099C8.72746 15.1099 6.89011 13.2725 6.89011 11C6.89011 8.72746 8.72746 6.89011 11 6.89011C13.2725 6.89011 15.1099 8.72746 15.1099 11C15.1099 13.2725 13.2725 15.1099 11 15.1099ZM11 8.09889C9.40442 8.09889 8.09889 9.40442 8.09889 11C8.09889 12.5956 9.40442 13.9011 11 13.9011C12.5956 13.9011 13.9011 12.5956 13.9011 11C13.9011 9.40442 12.5956 8.09889 11 8.09889ZM11.0242 21.9758C8.53409 21.9758 6.79343 20.0418 6.79343 17.2857C6.72088 15.5934 5.60879 15.2308 4.69011 15.2308C3.23956 15.2308 1.95824 14.7472 1.08791 13.8528C0.362638 13.1033 0 12.1121 0 11C0.0483517 7.92967 2.46593 6.79343 4.71429 6.76923C5.72967 6.76923 6.79343 6.21321 6.79343 4.71429C6.76923 1.88571 8.48569 0 11 0C13.5143 0 15.1099 1.83736 15.2308 4.69011C15.3033 6.47912 16.5604 6.76923 17.2857 6.76923C19.4132 6.76923 21.9275 7.90547 22 11C22 12.1121 21.6373 13.1033 20.8879 13.8528C20.0176 14.7231 18.7121 15.2308 17.2857 15.2308C16.3912 15.2308 15.3033 15.5934 15.255 17.2857C15.1341 20.1385 13.4901 21.9758 11.0242 21.9758ZM7.97801 4.71429C7.97801 6.33409 6.98679 7.95387 4.71429 7.97801C3.67472 7.97801 1.25714 8.29232 1.20879 11C1.20879 11.7736 1.45055 12.4748 1.95824 12.9824C2.58681 13.6352 3.57802 13.9978 4.69011 13.9978C6.64834 13.9978 7.90547 15.255 8.00221 17.2132C8.00221 18.978 8.94503 20.7429 11.0242 20.7429C13.1033 20.7429 13.9494 19.4132 14.0461 17.2132C14.1187 15.2308 15.3758 13.9978 17.2857 13.9736C18.3978 13.9736 19.389 13.611 20.0418 12.9582C20.5494 12.4264 20.8154 11.7494 20.7912 10.9758C20.7429 8.19558 18.0835 7.95387 17.2857 7.95387C15.7627 7.95387 14.1187 7.08354 14.022 4.71429C13.9252 2.51429 12.8132 1.18461 11 1.18461C9.18679 1.18461 7.97801 2.56264 7.97801 4.69011V4.71429Z" fill="currentColor" />
          <path d="M11 1C12.6569 1 14 2.34315 14 4C14 4.01141 13.9992 4.0228 13.999 4.03418L14.6358 4.64062L14.3731 4.91504L17.336 7.7373L17.6006 7.45996L18.1729 8.00488C19.7493 8.09443 21 9.40116 21 11C21 12.6107 19.7306 13.9241 18.1377 13.9961L17.3545 14.8105L16.6514 14.1338L14.1309 16.7539L14.8379 17.4336L13.9824 18.3223C13.8217 19.8276 12.548 21 11 21C9.34316 21 8.00002 19.6569 8.00002 18C8.00002 17.9261 8.00355 17.8529 8.00881 17.7803L7.00002 16.8203L7.33498 16.4678L5.33889 14.5674L5.07424 14.8457L4.17873 13.9941C4.11959 13.9976 4.06003 14 4.00002 14C2.34316 14 1.00002 12.6569 1.00002 11C1.00002 9.4257 2.21273 8.13549 3.7549 8.01074L4.834 6.90918L5.53029 7.59082L7.94826 5.12109L7.24904 4.43652L8.02053 3.64746C8.19503 2.15674 9.46243 1 11 1ZM10.1963 7.32227L10.0342 7.16309L7.61623 9.63281L7.61721 9.63379L6.92482 10.3398C6.9726 10.5524 7.00002 10.773 7.00002 11C7.00002 11.0949 6.99399 11.1886 6.98537 11.2812L10.8926 15.002C10.9283 15.0007 10.9641 15 11 15C11.2375 15 11.4679 15.0299 11.6895 15.082L12.0283 14.7305L15.0567 11.582C15.0196 11.3937 15 11.1992 15 11C15 10.8012 15.0188 10.6069 15.0557 10.4189L11.9492 7.46094L11.4317 6.96875C11.2907 6.98907 11.1466 7 11 7C10.8453 7 10.6933 6.9884 10.5449 6.96582L10.1963 7.32227Z" fill="currentColor" />
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

// CoPilot has no in-app destination — it opens in a new tab.
const COPILOT_URL = 'https://example.com/copilot-placeholder'

const WORKSPACES_NUVIO_BASE = '/projects/workspaces/nuvio'
const WORKSPACES_BASIC_BASE = '/projects/workspaces/workspaces-basic'

function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()

  const inWorkspacesV6 = location.pathname.startsWith(WORKSPACES_NUVIO_BASE)
  const inWorkspacesBasic = location.pathname.startsWith(WORKSPACES_BASIC_BASE)
  // Whichever nested-routing workspaces app (if any) the sidebar's own links
  // should stay inside of, rather than jumping out to an unrelated top-level page.
  const workspacesAppBase = inWorkspacesBasic ? WORKSPACES_BASIC_BASE : WORKSPACES_NUVIO_BASE

  const activeKey =
    location.pathname === '/connectors' || location.pathname === `${WORKSPACES_NUVIO_BASE}/connectors` || location.pathname === `${WORKSPACES_BASIC_BASE}/connectors` ? 'connectors' :
    location.pathname === `${WORKSPACES_NUVIO_BASE}/my-documents` || location.pathname === `${WORKSPACES_BASIC_BASE}/my-documents` ? 'documents' :
    location.pathname.startsWith('/projects/workspaces') ? 'workspaces' :
    location.pathname.startsWith('/projects') ? 'documents' :
    ''

  const sidebarTopItems = [
    {
      key: 'documents',
      label: 'My Documents',
      icon: <Icon type={iconType.FolderFilled} />,
      // Inside a nested-routing workspaces app (V6 or Basic), "My Documents"
      // stays within that app's own URL space instead of jumping out to the
      // unrelated top-level page.
      onClick: () => navigate(inWorkspacesV6 || inWorkspacesBasic ? `${workspacesAppBase}/my-documents` : '/projects/my-documents/version-1'),
    },
    {
      key: 'workspaces',
      label: 'Workspaces',
      icon: <Icon type={iconType.ElementsFilled} />,
      onClick: () => navigate(`${workspacesAppBase}/workspaces`),
    },
    {
      key: 'copilot',
      label: 'CoPilot',
      icon: <CoPilotIcon />,
      onClick: () => window.open(COPILOT_URL, '_blank', 'noopener,noreferrer'),
    },
  ] as unknown as SidebarItem[]

  const sidebarBottomItems = [
    {
      key: 'connectors',
      label: 'Connectors',
      icon: <ConnectorIcon />,
      // Same rule as "My Documents" — stays inside the current nested workspaces
      // app when already there, rather than jumping out to the unrelated top-level page.
      onClick: () => navigate(inWorkspacesV6 || inWorkspacesBasic ? `${workspacesAppBase}/connectors` : '/connectors'),
    },
  ] as unknown as SidebarItem[]

  return (
    <Layout
      header={{
        avatar: {
          srcPlaceholder: 'AM',
          size: avatarSizeEnum.SMALL,
          title: 'Alex Mustermensch',
        },
      }}
      sidebar={{
        topItems: sidebarTopItems,
        bottomItems: sidebarBottomItems,
        collapsible: true,
        activeKeys: [activeKey],
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
