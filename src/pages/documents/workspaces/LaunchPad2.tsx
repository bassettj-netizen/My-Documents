import { useLayoutEffect, useRef, useState } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  HaufeLogo,
  haufeLogoVariants,
  Icon,
  iconType,
  Sidebar,
  Typography,
} from '@goat-ui/goat-ui-core'
import type { SidebarItem } from '@goat-ui/goat-ui-core'
import { colorPalette, spacing, fontWeight } from './shared'
import ConnectionsPage from '../../connections/ConnectionsPage'
import WorkspacesV6 from './Version6'
import CoPilotPage from './CoPilotPage'
import CoPilotHrPage from './CoPilotHrPage'
import ResearchPage from './ResearchPage'
import HrOfficePage from './HrOfficePage'
import HomePage2 from './HomePage2'
import ToolsPage from './ToolsPage'

const LAUNCH_PAD_BASE = '/projects/workspaces/launch-pad-2'
const WORKSPACES_BASE = `${LAUNCH_PAD_BASE}/workspaces`

// Same custom mark used by the global AppShell sidebar (App.tsx) and Launch Pad's own — kept
// as its own copy here since each shell is intentionally independent of the others.
function CoPilotIcon() {
  return (
    <div className="goat-menu-item-icon" style={{ color: colorPalette.neutral.base }}>
      <svg width={24} height={24} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <mask id="copilot-launchpad2-icon-mask" style={{ maskType: 'luminance' }} maskUnits="userSpaceOnUse" x="0" y="0" width="22" height="22">
          <path d="M22 0H0V22H22V0Z" fill="white" />
        </mask>
        <g mask="url(#copilot-launchpad2-icon-mask)">
          <path d="M11 15.1099C8.72746 15.1099 6.89011 13.2725 6.89011 11C6.89011 8.72746 8.72746 6.89011 11 6.89011C13.2725 6.89011 15.1099 8.72746 15.1099 11C15.1099 13.2725 13.2725 15.1099 11 15.1099ZM11 8.09889C9.40442 8.09889 8.09889 9.40442 8.09889 11C8.09889 12.5956 9.40442 13.9011 11 13.9011C12.5956 13.9011 13.9011 12.5956 13.9011 11C13.9011 9.40442 12.5956 8.09889 11 8.09889ZM11.0242 21.9758C8.53409 21.9758 6.79343 20.0418 6.79343 17.2857C6.72088 15.5934 5.60879 15.2308 4.69011 15.2308C3.23956 15.2308 1.95824 14.7472 1.08791 13.8528C0.362638 13.1033 0 12.1121 0 11C0.0483517 7.92967 2.46593 6.79343 4.71429 6.76923C5.72967 6.76923 6.79343 6.21321 6.79343 4.71429C6.76923 1.88571 8.48569 0 11 0C13.5143 0 15.1099 1.83736 15.2308 4.69011C15.3033 6.47912 16.5604 6.76923 17.2857 6.76923C19.4132 6.76923 21.9275 7.90547 22 11C22 12.1121 21.6373 13.1033 20.8879 13.8528C20.0176 14.7231 18.7121 15.2308 17.2857 15.2308C16.3912 15.2308 15.3033 15.5934 15.255 17.2857C15.1341 20.1385 13.4901 21.9758 11.0242 21.9758ZM7.97801 4.71429C7.97801 6.33409 6.98679 7.95387 4.71429 7.97801C3.67472 7.97801 1.25714 8.29232 1.20879 11C1.20879 11.7736 1.45055 12.4748 1.95824 12.9824C2.58681 13.6352 3.57802 13.9978 4.69011 13.9978C6.64834 13.9978 7.90547 15.255 8.00221 17.2132C8.00221 18.978 8.94503 20.7429 11.0242 20.7429C13.1033 20.7429 13.9494 19.4132 14.0461 17.2132C14.1187 15.2308 15.3758 13.9978 17.2857 13.9736C18.3978 13.9736 19.389 13.611 20.0418 12.9582C20.5494 12.4264 20.8154 11.7494 20.7912 10.9758C20.7429 8.19558 18.0835 7.95387 17.2857 7.95387C15.7627 7.95387 14.1187 7.08354 14.022 4.71429C13.9252 2.51429 12.8132 1.18461 11 1.18461C9.18679 1.18461 7.97801 2.56264 7.97801 4.69011V4.71429Z" fill="currentColor" />
          <path d="M11 1C12.6569 1 14 2.34315 14 4C14 4.01141 13.9992 4.0228 13.999 4.03418L14.6358 4.64062L14.3731 4.91504L17.336 7.7373L17.6006 7.45996L18.1729 8.00488C19.7493 8.09443 21 9.40116 21 11C21 12.6107 19.7306 13.9241 18.1377 13.9961L17.3545 14.8105L16.6514 14.1338L14.1309 16.7539L14.8379 17.4336L13.9824 18.3223C13.8217 19.8276 12.548 21 11 21C9.34316 21 8.00002 19.6569 8.00002 18C8.00002 17.9261 8.00355 17.8529 8.00881 17.7803L7.00002 16.8203L7.33498 16.4678L5.33889 14.5674L5.07424 14.8457L4.17873 13.9941C4.11959 13.9976 4.06003 14 4.00002 14C2.34316 14 1.00002 12.6569 1.00002 11C1.00002 9.4257 2.21273 8.13549 3.7549 8.01074L4.834 6.90918L5.53029 7.59082L7.94826 5.12109L7.24904 4.43652L8.02053 3.64746C8.19503 2.15674 9.46243 1 11 1ZM10.1963 7.32227L10.0342 7.16309L7.61623 9.63281L7.61721 9.63379L6.92482 10.3398C6.9726 10.5524 7.00002 10.773 7.00002 11C7.00002 11.0949 6.99399 11.1886 6.98537 11.2812L10.8926 15.002C10.9283 15.0007 10.9641 15 11 15C11.2375 15 11.4679 15.0299 11.6895 15.082L12.0283 14.7305L15.0567 11.582C15.0196 11.3937 15 11.1992 15 11C15 10.8012 15.0188 10.6069 15.0557 10.4189L11.9492 7.46094L11.4317 6.96875C11.2907 6.98907 11.1466 7 11 7C10.8453 7 10.6933 6.9884 10.5449 6.96582L10.1963 7.32227Z" fill="currentColor" />
        </g>
      </svg>
    </div>
  )
}

// https://www.svgrepo.com/svg/352587/tools — same sidebar Tools icon as Launch Pad's own.
function ToolsSidebarIcon() {
  return (
    <div className="goat-menu-item-icon" style={{ color: colorPalette.neutral.base }}>
      <svg width={24} height={24} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M501.1 395.7L384 278.6c-23.1-23.1-57.6-27.6-85.4-13.9L192 158.1V96L64 0 0 64l96 128h62.1l106.6 106.6c-13.6 27.8-9.2 62.3 13.9 85.4l117.1 117.1c14.6 14.6 38.2 14.6 52.7 0l52.7-52.7c14.5-14.6 14.5-38.2 0-52.7zM331.7 225c28.3 0 54.9 11 74.9 31l19.4 19.4c15.8-6.9 30.8-16.5 43.8-29.5 37.1-37.1 49.7-89.3 37.9-136.7-2.2-9-13.5-12.1-20.1-5.5l-74.4 74.4-67.9-11.3L334 98.9l74.4-74.4c6.6-6.6 3.4-17.9-5.7-20.2-47.4-11.7-99.6.9-136.6 37.9-28.5 28.5-41.9 66.1-41.2 103.6l82.1 82.1c8.1-1.9 16.5-2.9 24.7-2.9zm-103.9 82l-56.7-56.7L18.7 402.8c-25 25-25 65.5 0 90.5s65.5 25 90.5 0l123.6-123.6c-7.6-19.9-9.9-41.6-5-62.7zM64 472c-13.2 0-24-10.8-24-24 0-13.3 10.7-24 24-24s24 10.7 24 24c0 13.2-10.7 24-24 24z" fill="currentColor" />
      </svg>
    </div>
  )
}

// ─── Empty placeholder screen ──────────────────────────────────────────────
function EmptyScreen({ title, align = 'center' }: { title: string; align?: 'center' | 'top-left' }) {
  return (
    <div style={
      align === 'top-left'
        ? { padding: spacing(6) }
        : { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }
    }>
      <Typography size="heading-lg" weight={fontWeight.BOLD} color="neutral-darken5">{title}</Typography>
    </div>
  )
}

// ─── Settings ─────────────────────────────────────────────────────────────

type SettingsItem = { slug: string; label: string }
type SettingsGroupDef = { title: string; items: SettingsItem[] }

const SETTINGS_GROUPS: SettingsGroupDef[] = [
  {
    title: 'General',
    items: [
      { slug: 'account', label: 'Account & Profile' },
      { slug: 'appearance', label: 'Appearance' },
      { slug: 'language', label: 'Language & Region' },
    ],
  },
  {
    title: 'Apps',
    items: [
      { slug: 'copilot', label: 'CoPilot Tax' },
      { slug: 'research', label: 'Tax Office' },
      { slug: 'copilot-hr', label: 'CoPilot HR' },
      { slug: 'hr-office', label: 'HR Office' },
      { slug: 'workspaces', label: 'Workspaces' },
    ],
  },
  {
    title: 'Integrations',
    items: [
      { slug: 'connectors', label: 'Connectors' },
    ],
  },
  {
    title: 'Security',
    items: [
      { slug: 'privacy', label: 'Privacy' },
      { slug: 'login-devices', label: 'Login & Devices' },
    ],
  },
]

const DEFAULT_SETTINGS_SLUG = SETTINGS_GROUPS[0].items[0].slug

function SettingsView() {
  const navigate = useNavigate()
  const { section } = useParams<{ section: string }>()
  const activeSlug = section ?? DEFAULT_SETTINGS_SLUG
  const activeItem = SETTINGS_GROUPS.flatMap(g => g.items).find(i => i.slug === activeSlug)

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{
        width: 260, flexShrink: 0, borderRight: `1px solid ${colorPalette.neutral.lighten1}`,
        padding: spacing(6), display: 'flex', flexDirection: 'column', gap: spacing(6), overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3) }}>
          <div style={{ color: '#141F29', display: 'flex' }}>
            <Icon type={iconType.GearOutlined} size={32} color="inherit" />
          </div>
          <Typography size="heading-lg" weight={fontWeight.BOLD}>Settings</Typography>
        </div>
        {SETTINGS_GROUPS.map(group => (
          <div key={group.title} style={{ display: 'flex', flexDirection: 'column', gap: spacing(1) }}>
            <Typography size="base-sm" color="neutral-darken2" weight={fontWeight.SEMIBOLD}>{group.title.toUpperCase()}</Typography>
            {group.items.map(item => (
              <div
                key={item.slug}
                onClick={() => navigate(`${LAUNCH_PAD_BASE}/settings/${item.slug}`)}
                style={{
                  padding: `${spacing(2)}px ${spacing(3)}px`,
                  borderRadius: 6,
                  cursor: 'pointer',
                  backgroundColor: item.slug === activeSlug ? colorPalette.neutral.lighten4 : undefined,
                }}
              >
                <Typography size="base" color="neutral-darken5" weight={item.slug === activeSlug ? fontWeight.SEMIBOLD : undefined}>
                  {item.label}
                </Typography>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
        {activeItem?.slug === 'connectors'
          ? <ConnectionsPage />
          : <EmptyScreen title={activeItem?.label ?? 'Settings'} align="top-left" />}
      </div>
    </div>
  )
}

// ─── Shell ────────────────────────────────────────────────────────────────

function LaunchPad2Shell() {
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(true)

  // The avatar row is deliberately NOT a real bottomItems entry — see LaunchPad.tsx (this
  // version's base) for the full reasoning: the DS Avatar's built-in hover mask and the menu
  // system's own hover tooltip combined to make it look broken/cropped for a purely
  // decorative badge. Position is measured against Settings' actual rendered box.
  const settingsIconRef = useRef<HTMLDivElement>(null)
  const [avatarPos, setAvatarPos] = useState<{ top: number; left: number } | null>(null)

  useLayoutEffect(() => {
    const measure = () => {
      const el = settingsIconRef.current
      if (!el) return
      const iconRect = el.getBoundingClientRect()
      const rowRect = (el.closest('li') ?? el).getBoundingClientRect()
      setAvatarPos({ top: rowRect.bottom + 8, left: iconRect.left + iconRect.width / 2 - 16 })
    }
    measure()
    window.addEventListener('resize', measure)
    const t = setTimeout(measure, 300)
    return () => { window.removeEventListener('resize', measure); clearTimeout(t) }
  }, [collapsed])

  const activeKey =
    location.pathname.startsWith(`${LAUNCH_PAD_BASE}/copilot`) ? 'copilot' :
    location.pathname.startsWith(`${LAUNCH_PAD_BASE}/research`) ? 'research' :
    location.pathname.startsWith(`${LAUNCH_PAD_BASE}/hr-office/copilot`) ? 'copilot-hr' :
    location.pathname.startsWith(`${LAUNCH_PAD_BASE}/hr-office`) ? 'hr-office' :
    location.pathname.startsWith(WORKSPACES_BASE) ? 'workspaces' :
    location.pathname.startsWith(`${LAUNCH_PAD_BASE}/tools`) ? 'tools' :
    location.pathname.startsWith(`${LAUNCH_PAD_BASE}/settings`) ? 'settings' :
    location.pathname.startsWith(`${LAUNCH_PAD_BASE}/home`) ? 'home' :
    ''

  const sidebarTopItems = [
    {
      key: 'home',
      label: 'Home',
      icon: <Icon type={iconType.HouseFilled} />,
      onClick: () => navigate(`${LAUNCH_PAD_BASE}/home`),
    },
    {
      // Group label, not a navigation destination itself — the DS Sidebar's own multi-level
      // nav (children) renders this as an expand/collapse group rather than a clickable leaf,
      // which is exactly what's wanted: "Tax Office" and "CoPilot Tax" read as one pair
      // rather than two unrelated top-level icons.
      key: 'tax-group',
      label: 'Tax',
      icon: <Icon type={iconType.OpenBookFilled} />,
      children: [
        {
          key: 'research',
          label: 'Tax Office',
          icon: <Icon type={iconType.OpenBookFilled} />,
          onClick: () => navigate(`${LAUNCH_PAD_BASE}/research`),
        },
        {
          key: 'copilot',
          label: 'CoPilot Tax',
          icon: <CoPilotIcon />,
          onClick: () => navigate(`${LAUNCH_PAD_BASE}/copilot`),
        },
      ],
    },
    {
      key: 'hr-group',
      label: 'HR',
      icon: <Icon type={iconType.UsersFilled} />,
      children: [
        {
          key: 'hr-office',
          label: 'HR Office',
          icon: <Icon type={iconType.UsersFilled} />,
          onClick: () => navigate(`${LAUNCH_PAD_BASE}/hr-office`),
        },
        {
          key: 'copilot-hr',
          label: 'CoPilot HR',
          icon: <CoPilotIcon />,
          onClick: () => navigate(`${LAUNCH_PAD_BASE}/hr-office/copilot`),
        },
      ],
    },
    {
      key: 'workspaces',
      label: 'Workspaces',
      icon: <Icon type={iconType.ElementsFilled} />,
      onClick: () => navigate(WORKSPACES_BASE),
    },
    {
      key: 'tools',
      label: 'Tools',
      icon: <ToolsSidebarIcon />,
      onClick: () => navigate(`${LAUNCH_PAD_BASE}/tools`),
    },
  ] as unknown as SidebarItem[]

  const sidebarBottomItems = [
    {
      key: 'settings',
      label: 'Settings',
      icon: <div ref={settingsIconRef} className="goat-menu-item-icon"><Icon type={iconType.GearFilled} /></div>,
      onClick: () => navigate(`${LAUNCH_PAD_BASE}/settings`),
    },
    {
      key: 'avatar-spacer',
    },
  ] as unknown as SidebarItem[]

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <Sidebar
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        collapsible
        topItems={sidebarTopItems}
        bottomItems={sidebarBottomItems}
        activeKeys={[activeKey]}
        // Keep both groups expanded whenever the rail itself is expanded — controlled (not
        // `defaultOpenKeys`) so it reacts to collapse/expand, and only applied when expanded:
        // passing this while collapsed made the two groups' hover flyouts bleed into each
        // other (Tax's flyout started showing HR's children too).
        openKeys={collapsed ? undefined : ['tax-group', 'hr-group']}
        mode="light"
        logoProps={{
          src: (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
              <HaufeLogo variant={haufeLogoVariants.ICON} />
            </div>
          ),
        }}
      />

      {avatarPos && (
      <div style={{ position: 'absolute', zIndex: 10, top: avatarPos.top, left: avatarPos.left, display: 'flex', alignItems: 'center', gap: spacing(3) }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: '#D2DDF7', border: '1px solid #374568',
        }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#374568' }}>AM</span>
        </div>
        {!collapsed && <span style={{ fontSize: 14, fontWeight: 500, color: colorPalette.neutral.darken5, whiteSpace: 'nowrap' }}>Alex Mustermensch</span>}
      </div>
      )}

      <div style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
        <Outlet />
      </div>
    </div>
  )
}

export default function LaunchPad2() {
  return (
    <Routes>
      <Route element={<LaunchPad2Shell />}>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<HomePage2 />} />
        <Route path="copilot" element={<CoPilotPage />} />
        <Route path="research" element={<ResearchPage />} />
        <Route path="hr-office" element={<HrOfficePage />} />
        <Route path="hr-office/copilot" element={<CoPilotHrPage />} />
        <Route path="workspaces/*" element={<WorkspacesV6 basePath={WORKSPACES_BASE} />} />
        <Route path="lexicon" element={<EmptyScreen title="Lexicon" />} />
        <Route path="doc" element={<EmptyScreen title="Document" />} />
        <Route path="search" element={<EmptyScreen title="Search Results" />} />
        <Route path="tools" element={<ToolsPage />} />
        <Route path="add" element={<EmptyScreen title="Add" />} />
        <Route path="settings" element={<SettingsView />} />
        <Route path="settings/:section" element={<SettingsView />} />
        <Route path="*" element={<Navigate to="home" replace />} />
      </Route>
    </Routes>
  )
}
