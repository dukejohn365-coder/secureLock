import type { Metadata } from "next"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentPasswords } from "@/components/dashboard/recent-passwords"
import { AddPasswordButton } from "@/components/dashboard/add-password-button"

export const metadata: Metadata = {
  title: "Overview — SecureLock",
  description: "Your password vault overview",
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Page heading */}
      <div className="flex flex-col gap-4 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back 👋</h1>
            <p className="text-muted-foreground text-sm">
              Here&apos;s a summary of your vault. All passwords are stored locally on your device.
            </p>
          </div>
          <AddPasswordButton />
        </div>
      </div>

      {/* Stats */}
      <StatsCards />

      {/* Recent */}
      <RecentPasswords />
    </div>
  )
}
