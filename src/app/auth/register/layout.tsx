import { registerMetadata } from "../metadata"

export const metadata = registerMetadata

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
