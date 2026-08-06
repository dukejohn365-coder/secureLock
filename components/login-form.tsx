"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Lock } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { setPendingMasterPassword } from "@/lib/vault-session"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
      })

      if (error) {
        setError(error.message || "Login failed")
        setLoading(false)
        return
      }

      // Hand the password to the vault provider so it can unlock the vault
      // with the same password used to sign in.
      setPendingMasterPassword(password)
      router.push("/dashboard")
    } catch {
      setError("An unexpected error occurred")
      setLoading(false)
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-[2rem] border border-border/70 bg-card/90 p-4 shadow-2xl shadow-violet-500/10 backdrop-blur-xl md:p-5 dark:border-white/10",
        className
      )}
      {...props}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <FieldGroup className="gap-3">
          <div className="flex flex-col items-center gap-1.5 text-center">
            <Link
              href="/"
              className="flex flex-col items-center gap-1.5 font-medium"
            >
              <div className="flex size-9 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 ring-1 ring-violet-500/20 shadow-lg shadow-violet-500/10 dark:text-violet-100">
                <Lock className="size-4" />
              </div>
              <span className="sr-only">SecureLock</span>
            </Link>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              Welcome to SecureLock
            </h1>
            <FieldDescription className="text-sm text-muted-foreground">
              Sign in with your password to unlock your secure vault.
            </FieldDescription>
            <FieldDescription className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
                Sign up
              </Link>
            </FieldDescription>
          </div>
          <Field className="space-y-0.5">
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field className="space-y-0.5">
            <div className="flex items-center justify-between gap-4">
              <FieldLabel htmlFor="password">Password</FieldLabel>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          {error && (
            <div className="text-sm text-red-500 text-center">{error}</div>
          )}
          <Field>
            <Button
              type="submit"
              className="w-full rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-violet-500/20"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Login"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}
