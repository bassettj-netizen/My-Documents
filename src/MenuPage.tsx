const groups = [
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
