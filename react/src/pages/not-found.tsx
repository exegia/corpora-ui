import { Link } from "react-router"

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-start gap-3">
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground">
        The page you are looking for does not exist.
      </p>
      <Link to="/" className="text-sm underline">
        Back home
      </Link>
    </div>
  )
}
