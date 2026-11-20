const groups = [
  {
    // Workspaces 2.0 Version 21 for six subject areas, each in English and German (src/pages/documents/user-testing-nov-26).
    title: "Workspaces User Testing Nov '26",
    items: [
      { label: 'HR (English)', path: '/projects/user-testing-nov-26/hr-en' },
      { label: 'HR (Deutsch)', path: '/projects/user-testing-nov-26/hr-de' },
      { label: 'Law (English)', path: '/projects/user-testing-nov-26/law-en' },
      { label: 'Law (Deutsch)', path: '/projects/user-testing-nov-26/law-de' },
      { label: 'Finance (English)', path: '/projects/user-testing-nov-26/finance-en' },
      { label: 'Finance (Deutsch)', path: '/projects/user-testing-nov-26/finance-de' },
      { label: 'oD (English)', path: '/projects/user-testing-nov-26/od-en' },
      { label: 'oD (Deutsch)', path: '/projects/user-testing-nov-26/od-de' },
      { label: 'Real estate (English)', path: '/projects/user-testing-nov-26/real-estate-en' },
      { label: 'Real estate (Deutsch)', path: '/projects/user-testing-nov-26/real-estate-de' },
      { label: 'Tax (English)', path: '/projects/user-testing-nov-26/tax-en' },
      { label: 'Tax (Deutsch)', path: '/projects/user-testing-nov-26/tax-de' },
    ],
  },
  {
    title: 'Documents',
    items: [
      { label: 'V1', path: '/projects/documents/version-1' },
      { label: 'V2', path: '/projects/documents/version-2' },
      { label: 'V3', path: '/projects/documents/version-3' },
    ],
  },
  {
    title: 'Search Documents',
    items: [
      { label: 'Version 1', path: '/projects/search-documents/version-1' },
      { label: 'Version 2', path: '/projects/search-documents/version-2' },
    ],
  },
  {
    title: 'Metadata',
    items: [
      { label: 'Version 1', path: '/projects/metadata/version-1' },
      { label: 'Version 2', path: '/projects/metadata/version-2' },
      { label: 'Version 3', path: '/projects/metadata/version-3' },
      { label: 'Version 4', path: '/projects/metadata/version-4' },
      { label: 'Version 5', path: '/projects/metadata/version-5' },
      { label: 'Version 6', path: '/projects/metadata/version-6' },
      { label: 'Version 7', path: '/projects/metadata/version-7' },
      { label: 'Version 8', path: '/projects/metadata/version-8' },
      { label: 'Version 9', path: '/projects/metadata/version-9' },
      { label: 'Version 10', path: '/projects/metadata/version-10' },
      { label: 'Version 11', path: '/projects/metadata/version-11' },
      { label: 'Table', path: '/projects/metadata/table' },
      { label: 'Version 13', path: '/projects/metadata/version-13' },
      { label: 'Version 14', path: '/projects/metadata/version-14' },
      { label: 'Cards Horizontal', path: '/projects/metadata/cards-horizontal' },
      { label: 'Preview Panel', path: '/projects/metadata/preview-panel' },
      { label: 'Cards Vertical', path: '/projects/metadata/cards-vertical' },
      { label: 'Cards Grouped', path: '/projects/metadata/cards-grouped' },
    ],
  },
  {
    title: "Hackathon Oct '26",
    items: [
      { label: 'Version 1', path: '/projects/hackathon-oct-26/version-1' },
      { label: 'Version 2', path: '/projects/hackathon-oct-26/version-2' },
      { label: 'Version 3', path: '/projects/hackathon-oct-26/version-3' },
      { label: 'Version 4', path: '/projects/hackathon-oct-26/version-4' },
      { label: 'Version 5 (Deutsch)', path: '/projects/hackathon-oct-26/version-5' },
      { label: 'Version 6', path: '/projects/hackathon-oct-26/version-6' },
      { label: 'Version 7 (Deutsch)', path: '/projects/hackathon-oct-26/version-7' },
      { label: 'Version 8', path: '/projects/hackathon-oct-26/version-8' },
      { label: 'Version 9 (Deutsch)', path: '/projects/hackathon-oct-26/version-9' },
      { label: 'Version 10', path: '/projects/hackathon-oct-26/version-10' },
      { label: 'Version 11 (Deutsch)', path: '/projects/hackathon-oct-26/version-11' },
    ],
  },
  {
    title: 'Workspaces 2.0',
    items: [
      { label: 'Version 1', path: '/projects/workspaces-2/version-1' },
      { label: 'Version 2', path: '/projects/workspaces-2/version-2' },
      { label: 'Version 3', path: '/projects/workspaces-2/version-3' },
      { label: 'Version 4', path: '/projects/workspaces-2/version-4' },
      { label: 'Version 5', path: '/projects/workspaces-2/version-5' },
      { label: 'Version 6', path: '/projects/workspaces-2/version-6' },
      { label: 'Version 7', path: '/projects/workspaces-2/version-7' },
      { label: 'Version 8', path: '/projects/workspaces-2/version-8' },
      { label: 'Version 9', path: '/projects/workspaces-2/version-9' },
      { label: 'Version 10', path: '/projects/workspaces-2/version-10' },
      { label: 'Version 11 (empty)', path: '/projects/workspaces-2/version-11' },
      { label: 'Version 12 (sidebar)', path: '/projects/workspaces-2/version-12' },
      { label: 'Version 13 (jump to a workspace)', path: '/projects/workspaces-2/version-13' },
      { label: 'Version 14 (My files)', path: '/projects/workspaces-2/version-14' },
      { label: 'Version 15 (My Knowledge)', path: '/projects/workspaces-2/version-15' },
      { label: 'Version 16 (My Knowledge menu)', path: '/projects/workspaces-2/version-16' },
      { label: 'Version 17 (aligned screens)', path: '/projects/workspaces-2/version-17' },
      { label: 'Version 18 (aligned Connectors)', path: '/projects/workspaces-2/version-18' },
      { label: 'Version 19 (Version 21 with sample workspaces)', path: '/projects/workspaces-2/version-19' },
      { label: 'Version 20 (no workspaces yet, illustrated empty workspace)', path: '/projects/workspaces-2/version-20' },
      { label: 'Version 21 (no workspaces yet, empty containers)', path: '/projects/workspaces-2/version-21' },
    ],
  },
  {
    title: 'Upload limits',
    items: [
      { label: 'Version 1 (50 files at a time)', path: '/projects/upload-limits/version-1/my-documents' },
      { label: 'Version 2 (numbered batches)', path: '/projects/upload-limits/version-2/my-documents' },
      { label: 'Version 3 (buttons in the banner)', path: '/projects/upload-limits/version-3/my-documents' },
      { label: 'Version 4 (buttons under the banner, no upload area)', path: '/projects/upload-limits/version-4/my-documents' },
      { label: 'Version 5 (banner title only, roomier)', path: '/projects/upload-limits/version-5/my-documents' },
      { label: 'Version 6 (Figma: File upload limit)', path: '/projects/upload-limits/version-6/my-documents' },
      { label: 'Version 7 (Version 3 without the uploader)', path: '/projects/upload-limits/version-7/my-documents' },
    ],
  },
  {
    title: 'File Sync',
    items: [
      { label: 'Version 1', path: '/projects/file-sync/version-1' },
      { label: 'Version 2', path: '/projects/file-sync/version-2' },
      { label: 'Version 3', path: '/projects/file-sync/version-3' },
    ],
  },
  {
    title: 'SharePoint Sync',
    items: [
      { label: 'Version 1', path: '/projects/sharepoint/version-1' },
      { label: 'Version 2', path: '/projects/sharepoint/version-2' },
      { label: 'Version 3', path: '/projects/sharepoint/version-3/my-documents' },
      { label: 'Version 4', path: '/projects/sharepoint/version-4' },
      { label: 'Version 5', path: '/projects/sharepoint/version-5' },
      { label: 'Version 6', path: '/projects/sharepoint/version-6' },
      { label: 'Version 7', path: '/projects/sharepoint/version-7' },
    ],
  },
  {
    title: 'Workspaces',
    items: [
      { label: 'Version 1', path: '/projects/workspaces/version-1' },
      { label: 'Version 2', path: '/projects/workspaces/version-2' },
      { label: 'Version 3', path: '/projects/workspaces/version-3' },
      { label: 'Version 4', path: '/projects/workspaces/version-4' },
      { label: 'Version 5', path: '/projects/workspaces/version-5' },
      { label: 'Version 6', path: '/projects/workspaces/nuvio' },
      { label: 'Workspaces Basic', path: '/projects/workspaces/workspaces-basic' },
      { label: 'Launch Pad', path: '/projects/workspaces/launch-pad' },
      { label: 'Launch Pad 2', path: '/projects/workspaces/launch-pad-2' },
    ],
  },
  {
    title: 'History',
    items: [
      { label: 'Version 1', path: '/projects/history/version-1' },
      { label: 'Version 2', path: '/projects/history/version-2' },
      { label: 'Version 3', path: '/projects/history/version-3' },
      { label: 'Version 4', path: '/projects/history/version-4' },
      { label: 'Version 5', path: '/projects/history/version-5' },
      { label: 'Version 6', path: '/projects/history/version-6' },
    ],
  },
  {
    title: 'Bulk Edit',
    items: [
      { label: 'Version 1', path: '/projects/bulk-edit/version-1' },
      { label: 'Version 2', path: '/projects/bulk-edit/version-2' },
      { label: 'Version 3', path: '/projects/bulk-edit/version-3' },
    ],
  },
  {
    title: 'Preview Tasks',
    items: [
      { label: 'Version 1', path: '/projects/preview-tasks/version-1' },
      { label: 'Version 2', path: '/projects/preview-tasks/version-2' },
      { label: 'Version 3', path: '/projects/preview-tasks/version-3' },
      { label: 'Version 7', path: '/projects/preview-tasks/version-7' },
      { label: 'Version 10', path: '/projects/preview-tasks/version-10' },
      { label: 'Version 11', path: '/projects/preview-tasks/version-11' },
      { label: 'Version 12', path: '/projects/preview-tasks/version-12' },
      { label: 'Version 13', path: '/projects/preview-tasks/version-13' },
    ],
  },
  {
    title: 'Document Preview',
    items: [
      { label: 'Version 1', path: '/projects/document-preview/version-1' },
      { label: 'Version 2', path: '/projects/document-preview/version-2' },
      { label: 'Version 3', path: '/projects/document-preview/version-3' },
      { label: 'Version 4', path: '/projects/document-preview/version-4' },
    ],
  },
]

export default function MenuPage() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.heading}>UI Versions</h1>
        <div style={styles.grid}>
          {groups.map((group) => (
            <div key={group.title} style={styles.card}>
              <h2 style={styles.cardTitle}>{group.title}</h2>
              <ul style={styles.list}>
                {group.items.map((item) => (
                  <li key={item.path}>
                    <a href={item.path} style={styles.link}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: "'Open Sans', sans-serif",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
  },
  container: {
    width: '100%',
    maxWidth: '720px',
  },
  heading: {
    fontSize: '28px',
    fontWeight: 600,
    color: '#1a1a1a',
    marginBottom: '32px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px 24px',
  },
  cardTitle: {
    fontSize: '13px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: '#888',
    marginBottom: '12px',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  link: {
    display: 'block',
    fontSize: '15px',
    color: '#0066cc',
    textDecoration: 'none',
    padding: '4px 0',
  },
}
