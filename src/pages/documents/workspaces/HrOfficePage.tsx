import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Icon, iconType, SearchBar, searchbarWidth, Typography } from '@goat-ui/goat-ui-core'
import { colorPalette, spacing, fontWeight } from './shared'
import { DashboardIcon, LinkRow, NavRow, SectionCard, ToolsIcon, ViewAllLink } from './ResearchPage'

// ─── Content (HR-flavored counterpart to Tax Office's own) ──────────────────

const NAV_ITEMS: { key: string; label: string; icon?: string; customIcon?: React.ReactNode }[] = [
  { key: 'overview', label: 'Overview', customIcon: <DashboardIcon size={20} /> },
  { key: 'favorites', label: 'My Favorites', icon: iconType.StarOutlined },
  { key: 'policies', label: 'Policies & Guides', icon: iconType.ArticleOutlined },
  { key: 'onboarding', label: 'Onboarding & Forms', icon: iconType.SignatureOutlined },
  { key: 'relations', label: 'Employee Relations', icon: iconType.TaskOutlined },
  { key: 'tools', label: 'Tools', customIcon: <ToolsIcon size={20} /> },
]

const LATEST_NEWS = [
  'Works Council Co-Determination — What Changed in 2026',
  'Parental Leave Reform: New Notice Periods',
  'Remote Work Agreements — Updated Template',
]

const POLICY_UPDATES = [
  'Equal Pay Reporting Obligations, Explained',
  'Probation Period Limits — A Quick Refresher',
  'GDPR Retention Periods for Applicant Data',
  'Works Council Consultation Thresholds',
]

const ONBOARDING_CHECKLIST = [
  'Day 1: Equipment & Access Setup',
  'Week 1: Manager Check-in Schedule',
  'Month 1: Probation Goals Review',
]

const TOOLS_SHORTCUTS_HR = [
  'Employment Contract Templates',
  'Onboarding Checklist',
  'Performance Review Form',
  'Exit Interview Questionnaire',
]

const TRAINING_EVENTS = [
  'Manager Essentials: Giving Feedback',
  'Works Council Basics for New Managers',
  'Annual Compliance Refresher',
]

const EMPLOYEE_HANDBOOK = [
  'Code of Conduct',
  'Leave & Absence Policy',
  'Remote Work Policy',
]

// ─── Tools catalog (own AZ / Top 10 / By type browser, mirroring Tax Office's) ──────────────

type ToolItem = { title: string; type: string }

const HR_TOOLS_CATALOG: ToolItem[] = [
  { title: 'Employment contract, standard', type: 'Contract' },
  { title: 'Fixed-term employment contract', type: 'Contract' },
  { title: 'Offer letter', type: 'Letter' },
  { title: 'Onboarding checklist', type: 'Checklist' },
  { title: 'Offboarding checklist', type: 'Checklist' },
  { title: 'Employee handbook template', type: 'Policy' },
  { title: 'Performance review form', type: 'Sample template' },
  { title: 'Probation period assessment', type: 'Sample template' },
  { title: 'Parental leave request', type: 'Sample template' },
  { title: 'Reference letter, standard', type: 'Sample template' },
  { title: 'Warning letter, general', type: 'Sample template' },
  { title: 'Termination letter, general', type: 'Sample template' },
  { title: 'Works council notification', type: 'Letter' },
  { title: 'Remote work agreement', type: 'Contract' },
  { title: 'Salary review request', type: 'Sample template' },
  { title: 'Exit interview questionnaire', type: 'Checklist' },
  { title: 'Data privacy consent (GDPR)', type: 'Policy' },
  { title: 'Equal opportunity policy', type: 'Policy' },
]

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const TOOLS_TABS = [
  { key: 'az', label: 'A–Z' },
  { key: 'top10', label: 'Top 10' },
  { key: 'bytype', label: 'By type' },
] as const
type ToolsTab = typeof TOOLS_TABS[number]['key']

function HrToolsResultsPanel({ tab }: { tab: ToolsTab }) {
  const [search, setSearch] = useState('')
  const [activeLetter, setActiveLetter] = useState<string | null>(null)

  useEffect(() => setActiveLetter(null), [tab])

  const filtered = useMemo(
    () => HR_TOOLS_CATALOG.filter(item => item.title.toLowerCase().includes(search.trim().toLowerCase())),
    [search],
  )
  const availableLetters = useMemo(() => new Set(filtered.map(item => item.title[0].toUpperCase())), [filtered])

  const groups = useMemo(() => {
    if (tab === 'top10') return [{ heading: 'Top 10', items: filtered.slice(0, 10) }]
    if (tab === 'bytype') {
      return [...new Set(filtered.map(item => item.type))].sort()
        .map(type => ({ heading: type, items: filtered.filter(item => item.type === type) }))
    }
    return [...availableLetters].sort()
      .filter(letter => !activeLetter || letter === activeLetter)
      .map(letter => ({
        heading: letter,
        items: filtered.filter(item => item.title[0].toUpperCase() === letter).sort((a, b) => a.title.localeCompare(b.title)),
      }))
  }, [tab, filtered, activeLetter, availableLetters])

  return (
    <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: spacing(5), display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
      {tab === 'az' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing(2) }}>
          {ALPHABET.map(letter => {
            const has = availableLetters.has(letter)
            const active = activeLetter === letter
            return (
              <div
                key={letter}
                onClick={() => has && setActiveLetter(active ? null : letter)}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  border: `1px solid ${active ? colorPalette.blue.base : has ? colorPalette.neutral.lighten1 : colorPalette.neutral.lighten2}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: has ? 'pointer' : 'default', backgroundColor: active ? colorPalette.blue.base : colorPalette.white,
                }}
              >
                <Typography size="base-sm" color={active ? 'white' : has ? 'neutral-darken4' : 'neutral-lighten1'}>{letter}</Typography>
              </div>
            )
          })}
        </div>
      )}

      <SearchBar placeholder="Narrow down list" value={search} onChange={setSearch} width={searchbarWidth.EXPANDED} />

      <div style={{ border: `1px solid ${colorPalette.neutral.lighten2}`, borderRadius: 8, overflow: 'hidden' }}>
        {groups.filter(g => g.items.length > 0).length === 0 ? (
          <div style={{ padding: spacing(6) }}>
            <Typography size="base-sm" color="neutral-darken2">No items match your search.</Typography>
          </div>
        ) : groups.filter(g => g.items.length > 0).map(group => (
          <div key={group.heading}>
            <div style={{ padding: `${spacing(2)}px ${spacing(4)}px`, backgroundColor: colorPalette.blue.lighten5 }}>
              <Typography size="base-sm" weight={fontWeight.SEMIBOLD} color="blue-darken2">{group.heading}</Typography>
            </div>
            {group.items.map((item, i) => (
              <div
                key={item.title}
                style={{
                  padding: `${spacing(3)}px ${spacing(4)}px`, cursor: 'pointer',
                  borderBottom: i === group.items.length - 1 ? undefined : `1px solid ${colorPalette.neutral.lighten2}`,
                }}
              >
                <Typography size="base" weight={fontWeight.SEMIBOLD} color="neutral-darken5">{item.title}</Typography>
                <Typography size="base-sm" color="neutral-darken3">{item.type}</Typography>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function HrToolsView() {
  const [tab, setTab] = useState<ToolsTab>('az')

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ width: 220, flexShrink: 0, borderRight: `1px solid ${colorPalette.neutral.lighten1}`, padding: spacing(5), display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
        <Typography size="base-lg" weight={fontWeight.SEMIBOLD} color="neutral-darken5">Tools</Typography>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {TOOLS_TABS.map(t => (
            <div
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{ padding: `${spacing(2)}px ${spacing(3)}px`, borderRadius: 6, cursor: 'pointer', backgroundColor: tab === t.key ? colorPalette.blue.lighten5 : undefined }}
            >
              <Typography size="base-sm" color={tab === t.key ? 'blue-base' : 'neutral-darken5'} weight={tab === t.key ? fontWeight.SEMIBOLD : undefined}>{t.label}</Typography>
            </div>
          ))}
        </div>
      </div>

      <HrToolsResultsPanel tab={tab} />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────

type HrOfficeView = 'overview' | 'tools'

export default function HrOfficePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [view, setView] = useState<HrOfficeView>('overview')

  // Deep-link support, matching Tax Office's own — the primary sidebar's HR Office item
  // (and CoPilot HR's "Tools" cross-links, should any get added later) can land straight on
  // a specific sub-view instead of always opening on Overview.
  useEffect(() => {
    const initialView = (location.state as { initialView?: HrOfficeView } | null)?.initialView
    if (!initialView) return
    setView(initialView)
    navigate(location.pathname, { replace: true, state: null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ width: 260, flexShrink: 0, borderRight: `1px solid ${colorPalette.neutral.lighten1}`, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3), padding: `${spacing(5)}px ${spacing(4)}px` }}>
          <div style={{ color: '#141F29', display: 'flex' }}>
            <Icon type={iconType.UsersOutlined} size={32} color="inherit" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#001344' }}>HR Office</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {NAV_ITEMS.map(item => (
            <NavRow
              key={item.key}
              label={item.label}
              icon={item.icon}
              customIcon={item.customIcon}
              active={item.key === view}
              onClick={item.key === 'overview' || item.key === 'tools' ? () => setView(item.key as HrOfficeView) : undefined}
            />
          ))}
        </div>
      </div>

      {view === 'tools' ? <HrToolsView /> : (
      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', position: 'relative' }}>
        <div style={{ padding: spacing(5) }}>
          <SearchBar placeholder="Search keyword" width={searchbarWidth.EXPANDED} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: spacing(5), padding: `0 ${spacing(5)}px ${spacing(10)}px` }}>
          {/* Column 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(5), minWidth: 0 }}>
            <SectionCard title="Latest News">
              {LATEST_NEWS.map((item, i) => (
                <LinkRow key={item} last={i === LATEST_NEWS.length - 1}>{item}</LinkRow>
              ))}
            </SectionCard>

            <SectionCard title="Policy Updates">
              {POLICY_UPDATES.map((item, i) => (
                <LinkRow key={item} last={i === POLICY_UPDATES.length - 1}>{item}</LinkRow>
              ))}
              <ViewAllLink />
            </SectionCard>
          </div>

          {/* Column 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(5), minWidth: 0 }}>
            <SectionCard title="CoPilot HR">
              <div style={{ padding: spacing(4) }}>
                <Typography size="base" color="neutral-darken5">
                  Ask the AI chatbot your HR questions. Its answers are based on the extensive expertise of Haufe HR.
                </Typography>
              </div>
              <div style={{ borderTop: `1px solid ${colorPalette.neutral.lighten2}` }}>
                <LinkRow>Getting Started Tips &amp; FAQ</LinkRow>
                <LinkRow last>CoPilot HR Training</LinkRow>
              </div>
            </SectionCard>

            <SectionCard title="Onboarding Checklist">
              {ONBOARDING_CHECKLIST.map((item, i) => (
                <LinkRow key={item} last={i === ONBOARDING_CHECKLIST.length - 1}>{item}</LinkRow>
              ))}
              <ViewAllLink />
            </SectionCard>

            <SectionCard title="Tools">
              {TOOLS_SHORTCUTS_HR.map((item, i) => (
                <LinkRow key={item} last={i === TOOLS_SHORTCUTS_HR.length - 1}>{item}</LinkRow>
              ))}
              <ViewAllLink onClick={() => setView('tools')} />
            </SectionCard>
          </div>

          {/* Column 3 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(5), minWidth: 0 }}>
            <SectionCard title="Training & Events">
              {TRAINING_EVENTS.map((item, i) => (
                <LinkRow key={item} last={i === TRAINING_EVENTS.length - 1}>{item}</LinkRow>
              ))}
            </SectionCard>

            <SectionCard title="Employee Handbook">
              {EMPLOYEE_HANDBOOK.map((item, i) => (
                <LinkRow key={item} last={i === EMPLOYEE_HANDBOOK.length - 1}>{item}</LinkRow>
              ))}
              <ViewAllLink />
            </SectionCard>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}
