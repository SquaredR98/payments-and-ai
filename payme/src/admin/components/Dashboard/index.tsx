import type { ServerProps } from 'payload'
import {
  Users,
  Image,
  FileText,
  DollarSign,
  TrendingUp,
} from 'lucide-react'
import './styles.css'

export async function AdminDashboard(props: ServerProps) {
  const { payload } = props

  if (!payload?.config) return null

  // Fetch live collection stats
  let userCount = 0
  let mediaCount = 0

  try {
    const [users, media] = await Promise.all([
      payload.count({ collection: 'users' }),
      payload.count({ collection: 'media' }),
    ])
    userCount = users.totalDocs
    mediaCount = media.totalDocs
  } catch {
    // Collections may not exist yet
  }

  const stats = [
    {
      label: 'Total Users',
      value: userCount.toLocaleString(),
      description: 'Registered accounts',
      subtext: 'Active and verified users',
      icon: Users,
      trend: null as string | null,
    },
    {
      label: 'Media Files',
      value: mediaCount.toLocaleString(),
      description: 'Uploaded assets',
      subtext: 'Images, documents & files',
      icon: Image,
      trend: null as string | null,
    },
    {
      label: 'Invoices',
      value: '\u2014',
      description: 'Coming soon',
      subtext: 'Feature 05 \u2014 Invoice system',
      icon: FileText,
      trend: null as string | null,
    },
    {
      label: 'Revenue',
      value: '\u2014',
      description: 'Coming soon',
      subtext: 'Feature 07 \u2014 Payment tracking',
      icon: DollarSign,
      trend: null as string | null,
    },
  ]

  return (
    <div className="dashboard">
      <div className="dashboard__grid">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="stat-card">
              <div className="stat-card__header">
                <span className="stat-card__label">{stat.label}</span>
                {stat.trend && (
                  <span className="stat-card__trend">
                    <TrendingUp size={12} strokeWidth={2} />
                    {stat.trend}
                  </span>
                )}
              </div>

              <div className="stat-card__body">
                <div className="stat-card__icon">
                  <Icon size={20} strokeWidth={1.75} />
                </div>
                <span className="stat-card__value">{stat.value}</span>
              </div>

              <div>
                <p className="stat-card__description">{stat.description}</p>
                <p className="stat-card__subtext">{stat.subtext}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
