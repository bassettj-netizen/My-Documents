import { useState } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import {
  avatarSizeEnum,
  HaufeLogo,
  haufeLogoVariants,
  Icon,
  iconType,
  Layout,
  ThemeProvider,
  themeVariant,
} from '@goat-ui/goat-ui-core'
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
import MetadataPreviewScreenV2 from './pages/documents/metadata/PreviewScreenV2'
import BulkEditV1 from './pages/documents/bulk-edit/Version1'
import BulkEditPreview from './pages/documents/bulk-edit/PreviewScreen'
import PreviewTasksV1 from './pages/documents/preview-tasks/Version1'
import PreviewTasksPreviewScreen from './pages/documents/preview-tasks/PreviewScreen'
import PreviewTasksV2 from './pages/documents/preview-tasks/Version2'
import PreviewTasksPreviewScreenV2 from './pages/documents/preview-tasks/PreviewScreenV2'
import DocumentPreviewV1 from './pages/documents/document-preview/Version1'
import DocumentPreviewV2 from './pages/documents/document-preview/Version2'
import DocumentPreviewV3 from './pages/documents/document-preview/Version3'
import DocumentPreviewV4 from './pages/documents/document-preview/Version4'
import DocumentPreviewScreen from './pages/documents/document-preview/PreviewScreen'
import PreviewScreenV2 from './pages/documents/document-preview/PreviewScreenV2'
import PreviewScreenV3 from './pages/documents/document-preview/PreviewScreenV3'
import PreviewScreenV4 from './pages/documents/document-preview/PreviewScreenV4'

function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()

  const activeKey = location.pathname.startsWith('/my-documents') ? 'documents' : ''

  const sidebarTopItems = [
    {
      key: 'documents',
      label: 'Dokumente',
      icon: <Icon type={iconType.FolderFilled} />,
      onClick: () => navigate('/my-documents/1'),
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
      <Routes>
        {/* Routes rendered inside the sidebar/header Layout */}
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/my-documents/1" replace />} />
          <Route path="/my-documents/1" element={<DocumentsV1 />} />
          <Route path="/my-documents/2" element={<DocumentsV2 />} />
          <Route path="/my-documents/3" element={<DocumentsV3 />} />
          <Route path="/my-documents/search-documents/version-1" element={<SearchDocumentsVersion1 />} />
          <Route path="/my-documents/search-documents/version-2" element={<SearchDocumentsVersion2 />} />
          <Route path="/my-documents/metadata/version-1" element={<MetadataVersion1 />} />
          <Route path="/my-documents/metadata/version-2" element={<MetadataVersion2 />} />
          <Route path="/my-documents/metadata/version-3" element={<MetadataVersion3 />} />
          <Route path="/my-documents/metadata/version-4" element={<MetadataVersion4 />} />
          <Route path="/my-documents/bulk-edit/version-1" element={<BulkEditV1 />} />
          <Route path="/my-documents/preview-tasks/version-1" element={<PreviewTasksV1 />} />
          <Route path="/my-documents/preview-tasks/version-2" element={<PreviewTasksV2 />} />
          <Route path="/my-documents/document-preview/version-1" element={<DocumentPreviewV1 />} />
          <Route path="/my-documents/document-preview/version-2" element={<DocumentPreviewV2 />} />
          <Route path="/my-documents/document-preview/version-3" element={<DocumentPreviewV3 />} />
          <Route path="/my-documents/document-preview/version-4" element={<DocumentPreviewV4 />} />
          <Route path="/profile" element={<ProfilePage selectedTheme={selectedTheme} onThemeChange={setSelectedTheme} />} />
          <Route path="*" element={<Navigate to="/my-documents/1" replace />} />
        </Route>

        {/* Full-screen routes — rendered outside the Layout */}
        <Route path="/my-documents/document-preview/version-1/:id" element={<DocumentPreviewScreen />} />
        <Route path="/my-documents/document-preview/version-2/:id" element={<PreviewScreenV2 />} />
        <Route path="/my-documents/document-preview/version-3/:id" element={<PreviewScreenV3 />} />
        <Route path="/my-documents/document-preview/version-4/:id" element={<PreviewScreenV4 />} />
        <Route path="/my-documents/metadata/version-2/:id" element={<MetadataPreviewScreenV2 />} />
        <Route path="/my-documents/metadata/version-3/:id" element={<MetadataPreviewScreenV2 />} />
        <Route path="/my-documents/metadata/version-4/:id" element={<BulkEditPreview />} />
        <Route path="/my-documents/bulk-edit/version-1/:id" element={<BulkEditPreview />} />
        <Route path="/my-documents/preview-tasks/version-1/:id" element={<PreviewTasksPreviewScreen />} />
        <Route path="/my-documents/preview-tasks/version-2/:id" element={<PreviewTasksPreviewScreenV2 />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App
