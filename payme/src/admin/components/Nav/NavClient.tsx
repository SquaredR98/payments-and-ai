'use client'

import { usePathname } from 'next/navigation'
import {
  NavGroup,
  useNav,
  useConfig,
  useAuth,
  useTranslation,
  Logout,
  Link,
} from '@payloadcms/ui'
import { NavWrapper } from '@payloadcms/next/client'
import { EntityType, type NavGroupType } from '@payloadcms/ui/shared'
import { formatAdminURL } from 'payload/shared'
import {
  LayoutDashboard,
  Users,
  Image,
  FileText,
  CreditCard,
  ClipboardList,
  FolderOpen,
  Plus,
  User,
  PanelLeftClose,
} from 'lucide-react'
import './styles.css'

// Map collection slugs to Lucide icon components
const iconMap: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  users: Users,
  media: Image,
  invoices: FileText,
  payments: CreditCard,
  'audit-logs': ClipboardList,
}

function getIcon(slug: string) {
  return iconMap[slug] || FolderOpen
}

interface AdminNavClientProps {
  groups: NavGroupType[]
  navPreferences?: {
    groups?: Record<string, { open: boolean }>
  }
}

export function AdminNavClient({ groups, navPreferences }: AdminNavClientProps) {
  const pathname = usePathname()
  const { config } = useConfig()
  const {
    routes: { admin: adminRoute },
  } = config
  const { i18n } = useTranslation()
  const { user } = useAuth()
  const { navOpen, setNavOpen } = useNav()

  const dashboardHref = formatAdminURL({ adminRoute, path: '' })
  const isDashboard =
    pathname === dashboardHref ||
    pathname === adminRoute ||
    pathname === `${adminRoute}/`

  const profileHref = user?.id
    ? formatAdminURL({ adminRoute, path: `/collections/users/${user.id}` })
    : '#'

  return (
    <NavWrapper baseClass="nav">
    <div className="sidebar">
      {/* Logo Header */}
      <div className="sidebar__header">
        <img src="/logo-icon.svg" alt="" className="sidebar__logo" />
        <span className="sidebar__brand">PayMe Admin</span>
        <button
          type="button"
          className="sidebar__collapse-btn"
          onClick={() => setNavOpen(false)}
          title="Collapse sidebar"
        >
          <PanelLeftClose size={24} strokeWidth={1.75} />
        </button>
      </div>

      {/* Quick Create */}
      <div className="sidebar__quick-create">
        <Link
          href={formatAdminURL({ adminRoute, path: '/collections/users/create' })}
          prefetch={false}
          className="sidebar__quick-create-btn"
        >
          <Plus size={15} strokeWidth={2.5} />
          Quick Create
        </Link>
      </div>

      {/* Dashboard Link */}
      <NavLink
        href={dashboardHref}
        isActive={isDashboard}
        icon={<LayoutDashboard size={18} strokeWidth={1.75} />}
        label="Dashboard"
      />

      {/* Collection Groups */}
      <div className="sidebar__collections">
        {groups.map((group, groupIndex) => (
          <NavGroup
            key={groupIndex}
            label={group.label}
            isOpen={navPreferences?.groups?.[group.label]?.open}
          >
            {group.entities.map((entity, entityIndex) => {
              let href: string
              if (entity.type === EntityType.collection) {
                href = formatAdminURL({ adminRoute, path: `/collections/${entity.slug}` })
              } else {
                href = formatAdminURL({ adminRoute, path: `/globals/${entity.slug}` })
              }

              const isActive =
                pathname.startsWith(href) &&
                ['/', undefined].includes(pathname[href.length])

              const Icon = getIcon(entity.slug)
              const label =
                typeof entity.label === 'string'
                  ? entity.label
                  : entity.label?.[i18n.language] || entity.label?.en || entity.slug

              return (
                <NavLink
                  key={entityIndex}
                  href={href}
                  isActive={isActive}
                  isCurrent={pathname === href}
                  icon={<Icon size={18} strokeWidth={1.75} />}
                  label={label}
                  id={
                    entity.type === EntityType.collection
                      ? `nav-${entity.slug}`
                      : `nav-global-${entity.slug}`
                  }
                />
              )
            })}
          </NavGroup>
        ))}
      </div>

      {/* Footer */}
      <div className="sidebar__footer">
        <a
          href={profileHref}
          title="Your profile"
          className="sidebar__icon-btn"
        >
          <User size={14} strokeWidth={1.75} />
        </a>

        <div className="sidebar__spacer">
          <Logout tabIndex={navOpen ? 0 : -1} />
        </div>
      </div>
    </div>
    </NavWrapper>
  )
}

/* Shared NavLink component */
function NavLink({
  href,
  isActive,
  isCurrent,
  icon,
  label,
  id,
}: {
  href: string
  isActive: boolean
  isCurrent?: boolean
  icon: React.ReactNode
  label: string
  id?: string
}) {
  const className = `nav-link${isActive ? ' nav-link--active' : ''}`

  const content = (
    <>
      {isActive && <div className="nav-link__indicator" />}
      <span className="nav-link__icon">{icon}</span>
      <span>{label}</span>
    </>
  )

  // If we're already on this page, render a div (not a link)
  if (isCurrent) {
    return (
      <div id={id} className={className}>
        {content}
      </div>
    )
  }

  return (
    <Link href={href} id={id} prefetch={false} className={className}>
      {content}
    </Link>
  )
}
