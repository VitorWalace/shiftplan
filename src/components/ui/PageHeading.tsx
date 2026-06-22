import type { ComponentType } from 'react'

interface PageHeadingProps {
  icon: ComponentType<{ className?: string }>
  title: string
}

export function PageHeading({ icon: Icon, title }: PageHeadingProps) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
        <Icon className="h-5 w-5" />
      </span>
      <h1 className="text-xl font-semibold text-muted-900">{title}</h1>
    </div>
  )
}
