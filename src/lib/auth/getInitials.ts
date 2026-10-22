export const getInitials = (name: string, email: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return (email[0] ?? "?").toUpperCase()
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase()
}
