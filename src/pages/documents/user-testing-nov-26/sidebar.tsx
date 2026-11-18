import { Chip, chipSizes, chipStyles, chipVariants } from '@goat-ui/goat-ui-core'
import { defineText, type Lang } from './context'

/**
 * The app sidebar's labels in the user-testing prototypes (App.tsx renders the sidebar, outside the prototype itself,
 * so it picks these by the language in the URL). The app item is named after the area's product (content/<area>.ts).
 */
export const SIDEBAR_TEXT = defineText({
  copilot: 'CoPilot',
  knowledgeHub: 'Knowledge Hub',
  myDocuments: 'My Documents',
  workspaces: 'Workspaces',
  connectors: 'Connectors',
  settings: 'Settings',
  logout: 'Log out',
  newChip: 'New',
}, {
  copilot: 'CoPilot',
  knowledgeHub: 'Knowledge Hub',
  myDocuments: 'Meine Dokumente',
  workspaces: 'Arbeitsbereiche',
  connectors: 'Konnektoren',
  settings: 'Einstellungen',
  logout: 'Abmelden',
  newChip: 'Neu',
})

/** The "New" chip after Workspaces, as on CoPilot's workspace selector. */
export function SidebarNewChip({ lang }: { lang: Lang }) {
  return <Chip label={SIDEBAR_TEXT[lang].newChip} uppercase={false} size={chipSizes.SMALL} chipStyle={chipStyles.ACCENT_BLUE} variant={chipVariants.SUBTLE} />
}
