'use client'

import type { LucideIcon } from 'lucide-react'
import { Construction } from 'lucide-react'
import './styles.css'

interface ComingSoonProps {
  title: string
  description?: string
  icon?: LucideIcon
}

export function ComingSoon({ title, description, icon: Icon = Construction }: ComingSoonProps) {
  return (
    <div className="coming-soon">
      <div className="coming-soon__icon-wrap">
        <Icon className="coming-soon__icon" />
      </div>
      <h2 className="coming-soon__title">{title}</h2>
      <p className="coming-soon__description">
        {description || 'This feature is under development and will be available soon.'}
      </p>
    </div>
  )
}
