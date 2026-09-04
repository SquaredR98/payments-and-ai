import './styles.css'

interface AuthHeadingProps {
  title: string
  description?: string
}

export function AuthHeading({ title, description }: AuthHeadingProps) {
  return (
    <div className="auth-heading">
      <h1 className="auth-heading__title">{title}</h1>
      {description && (
        <p className="auth-heading__description">{description}</p>
      )}
    </div>
  )
}
