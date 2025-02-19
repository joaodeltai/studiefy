import { Sidebar } from "@/components/sidebar"
import { MobileHeader } from "@/components/mobile-header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-full relative bg-white">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-studiefy-black">
        <Sidebar />
      </div>
      <main className="md:pl-72">
        <MobileHeader />
        {children}
      </main>
    </div>
  )
}
