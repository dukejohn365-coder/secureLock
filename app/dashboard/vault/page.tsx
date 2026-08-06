import type { Metadata } from "next"
import { VaultClient } from "@/components/dashboard/vault-client"

export const metadata: Metadata = {
  title: "Vault — SecureLock",
  description: "Securely view and manage your password credentials",
}

interface PageProps {
  searchParams: Promise<{
    filter?: string
    category?: string
  }>
}

export default async function VaultPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams
  const filter = resolvedParams.filter
  const category = resolvedParams.category

  return (
    <div className="max-w-7xl mx-auto">
      <VaultClient initialFilter={filter} initialCategory={category} />
    </div>
  )
}
