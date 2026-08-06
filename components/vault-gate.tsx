"use client"

import { Spinner } from "@/components/ui/spinner"
import { useVault } from "@/components/vault-provider"

function LoadingScreen() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <Spinner className="size-6 text-muted-foreground" />
    </div>
  )
}

export function VaultGate({ children }: { children: React.ReactNode }) {
  const { status } = useVault()

  if (status === "checking") return <LoadingScreen />

  return <>{children}</>
}
