export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-full min-h-screen py-4 md:py-8 bg-studiefy-white">
      {children}
    </div>
  )
}
