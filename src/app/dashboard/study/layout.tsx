export default function StudyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex-1 overflow-y-auto">
      {children}
    </div>
  )
}
