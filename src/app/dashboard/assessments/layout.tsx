export default function AssessmentsLayout({
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
