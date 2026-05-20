import {
  Avatar,
  avatarSizeEnum,
  ButtonPrimary,
  ButtonSecondary,
  Card,
  iconType,
  Tabs,
  themeVariant,
} from '@goat-ui/goat-ui-core'
import type { TabOption, ThemeVariantValue } from '@goat-ui/goat-ui-core'

interface Props {
  selectedTheme: ThemeVariantValue
  onThemeChange: (theme: ThemeVariantValue) => void
}

const overviewContent = (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    <Card header={{ title: 'Personal Information' }} height="auto">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 32px' }}>
        {[
          ['Email', 'jane.doe@example.com'],
          ['Department', 'Product Design'],
          ['Location', 'Berlin, Germany'],
          ['Joined', 'January 2023'],
        ].map(([label, value]) => (
          <div key={label}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
            <div>{value}</div>
          </div>
        ))}
      </div>
    </Card>
    <Card header={{ title: 'Statistics' }} height="auto">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, textAlign: 'center' }}>
        {[
          ['42', 'Projects'],
          ['128', 'Tasks Done'],
          ['8', 'Teams'],
        ].map(([count, label]) => (
          <div key={label}>
            <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}>{count}</div>
            <div style={{ marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>
    </Card>
  </div>
)

const activityContent = (
  <Card header={{ title: 'Recent Activity' }} height="auto">
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[
        ['Completed task "Redesign onboarding flow"', '2 hours ago'],
        ['Commented on "Q3 Design Review"', '5 hours ago'],
        ['Joined team "Mobile App"', 'Yesterday'],
        ['Updated profile photo', '3 days ago'],
      ].map(([text, time]) => (
        <li key={text} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{text}</span>
          <span style={{ color: '#888', fontSize: 12, flexShrink: 0, marginLeft: 16 }}>{time}</span>
        </li>
      ))}
    </ul>
  </Card>
)

const settingsContent = (
  <Card header={{ title: 'Preferences' }} height="auto">
    <p style={{ margin: 0 }}>Profile settings and preferences will go here.</p>
  </Card>
)

const tabOptions: TabOption[] = [
  { key: 'overview', label: 'Overview', content: overviewContent },
  { key: 'activity', label: 'Activity', content: activityContent },
  { key: 'settings', label: 'Settings', content: settingsContent },
]

export default function ProfilePage({ selectedTheme, onThemeChange }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
      <Card height="auto">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <Avatar
            src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
            srcPlaceholder="JD"
            size={avatarSizeEnum.LARGE}
            title="Jane Doe"
            subTitle="Senior Product Designer · Product Design"
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <ButtonSecondary leftIcon={iconType.EditOutlined}>
              Edit Profile
            </ButtonSecondary>
            <ButtonPrimary leftIcon={iconType.SendOutlined}>
              Message
            </ButtonPrimary>
          </div>
        </div>
      </Card>

      <Card header={{ title: 'Theme' }} height="auto">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(Object.entries(themeVariant) as [string, ThemeVariantValue][]).map(([key, value]) => (
            <ButtonSecondary
              key={key}
              mode={selectedTheme === value ? 'contrast' : 'default'}
              onClick={() => onThemeChange(value)}
            >
              {key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')}
            </ButtonSecondary>
          ))}
        </div>
      </Card>

      <Tabs options={tabOptions} defaultActiveKey="overview" />
    </div>
  )
}
