import type { Metadata } from "next"
import { PasswordGeneratorClient } from "@/components/dashboard/password-generator-client"

export const metadata: Metadata = {
  title: "Password Generator — SecureLock",
  description: "Create highly secure custom random passwords",
}

export default function GeneratorPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-1 animate-fade-in-up">
        <h1 className="text-xl font-semibold">Password Generator</h1>
        <p className="text-muted-foreground text-sm">
          Generate strong, cryptographically secure passwords and customize character sets.
        </p>
      </div>

      <PasswordGeneratorClient />
    </div>
  )
}
