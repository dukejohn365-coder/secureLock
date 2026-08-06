import type { Metadata } from "next"
import { SecurityAuditClient } from "@/components/dashboard/security-audit-client"

export const metadata: Metadata = {
  title: "Security Audit — SecureLock",
  description: "Identify vulnerable, weak, or duplicated passwords",
}

export default function SecurityAuditPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-1 animate-fade-in-up">
        <h1 className="text-xl font-semibold">Security Audit</h1>
        <p className="text-muted-foreground text-sm">
          Run an automatic analysis of your vault entries to find weak points.
        </p>
      </div>

      <SecurityAuditClient />
    </div>
  )
}
