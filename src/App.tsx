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
import MetadataVersion5 from './pages/documents/metadata/Version5'
import MetadataVersion6 from './pages/documents/metadata/Version6'
import MetadataVersion7 from './pages/documents/metadata/Version7'
import MetadataPreviewScreenV2 from './pages/documents/metadata/PreviewScreenV2'
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
          <Route path="/my-documents/metadata/version-5" element={<MetadataVersion5 />} />
          <Route path="/my-documents/metadata/version-6" element={<MetadataVersion6 />} />
          <Route path="/my-documents/metadata/version-7" element={<MetadataVersion7 />} />
          <Route path="/my-documents/sharepoint/version-1" element={<SharepointV1 />} />
          <Route path="/my-documents/sharepoint/version-2" element={<SharepointV2 />} />
          <Route path="/my-documents/bulk-edit/version-1" element={<BulkEditV1 />} />
          <Route path="/my-documents/bulk-edit/version-2" element={<BulkEditV2 />} />
          <Route path="/my-documents/bulk-edit/version-3" element={<BulkEditV3 />} />
          <Route path="/my-documents/preview-tasks/version-1" element={<PreviewTasksV1 />} />
          <Route path="/my-documents/preview-tasks/version-2" element={<PreviewTasksV2 />} />
          <Route path="/my-documents/preview-tasks/version-3" element={<PreviewTasksV3 />} />
          <Route path="/my-documents/preview-tasks/version-7" element={<PreviewTasksV7 />} />
          <Route path="/my-documents/preview-tasks/version-10" element={<PreviewTasksV10 />} />
          <Route path="/my-documents/preview-tasks/version-11" element={<PreviewTasksV11 />} />
          <Route path="/my-documents/preview-tasks/version-12" element={<PreviewTasksV12 />} />
          <Route path="/my-documents/preview-tasks/version-13" element={<PreviewTasksV13 />} />
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
        <Route path="/my-documents/metadata/version-5/:id" element={<MetadataPreviewScreenV2 />} />
        <Route path="/my-documents/metadata/version-6/:id" element={<BulkEditPreview />} />
        <Route path="/my-documents/metadata/version-7/:id" element={<BulkEditPreview />} />
        <Route path="/my-documents/bulk-edit/version-1/:id" element={<BulkEditPreview />} />
        <Route path="/my-documents/bulk-edit/version-2/:id" element={<BulkEditPreview />} />
        <Route path="/my-documents/bulk-edit/version-3/:id" element={<BulkEditPreview />} />
        <Route path="/my-documents/preview-tasks/version-1/:id" element={<PreviewTasksPreviewScreen />} />
        <Route path="/my-documents/preview-tasks/version-2/:id" element={<PreviewTasksPreviewScreenV2 />} />
        <Route path="/my-documents/preview-tasks/version-3/:id" element={<PreviewTasksPreviewScreenV3 />} />
        <Route path="/my-documents/preview-tasks/version-7/:id" element={<PreviewTasksPreviewScreenV7 />} />
        <Route path="/my-documents/preview-tasks/version-10/:id" element={<PreviewTasksPreviewScreenV10 />} />
        <Route path="/my-documents/preview-tasks/version-11/:id" element={<PreviewTasksPreviewScreenV11 />} />
        <Route path="/my-documents/preview-tasks/version-12/:id" element={<PreviewTasksPreviewScreenV12 />} />
        <Route path="/my-documents/preview-tasks/version-13/:id" element={<PreviewTasksPreviewScreenV13 />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App
