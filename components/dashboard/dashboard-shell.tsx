"use client"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { VaultProvider, useVault } from "@/components/vault-provider"
import { VaultGate } from "@/components/vault-gate"
import { AlertTriangle } from "lucide-react"

function PersistErrorBanner() {
  const { persistError, clearPersistError } = useVault()
  if (!persistError) return null
  return (
    <div className="flex items-center gap-2 border-b border-red-500/30 bg-red-500/10 px-4 py-2 text-xs text-red-400">
      <AlertTriangle className="size-3.5 shrink-0" />
      <span className="flex-1 truncate">{persistError}</span>
      <button
        onClick={clearPersistError}
        className="shrink-0 rounded px-1.5 py-0.5 font-semibold hover:bg-red-500/20"
      >
        Dismiss
      </button>
    </div>
  )
}

function DashboardShellInner({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-svh overflow-hidden">
        <DashboardHeader />
        <PersistErrorBanner />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <VaultProvider>
      <VaultGate>
        <DashboardShellInner>{children}</DashboardShellInner>
      </VaultGate>
    </VaultProvider>
  )
}
