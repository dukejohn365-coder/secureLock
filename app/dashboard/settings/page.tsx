import type { Metadata } from "next"
import { SettingsClient } from "@/components/dashboard/settings-client"

export const metadata: Metadata = {
  title: "Settings — SecureLock",
  description: "Configure security preferences, import, and export vault data",
}

export default function SettingsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-1 animate-fade-in-up">
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your master password, backup preferences, and security settings.
        </p>
      </div>

      <SettingsClient />
    </div>
  )
}
