"use client"

import * as React from "react"
import { ShieldCheck, AlertTriangle, ArrowRight } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useVault } from "@/components/vault-provider"
import { scorePassword, type PasswordEntry } from "@/lib/passwords"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function SecurityAuditClient() {
  const { vault } = useVault()

  const analysis = React.useMemo(() => {
    if (vault.length === 0) {
      return {
        score: 100,
        weakCount: 0,
        fairCount: 0,
        strongCount: 0,
        reusedCount: 0,
        reusedGroups: {} as Record<string, PasswordEntry[]>,
        issues: [],
      }
    }

    let weakCount = 0
    let fairCount = 0
    let strongCount = 0

    // Find duplicates/reused passwords
    const passwordGroups: Record<string, PasswordEntry[]> = {}
    vault.forEach((entry) => {
      if (entry.password) {
        if (!passwordGroups[entry.password]) {
          passwordGroups[entry.password] = []
        }
        passwordGroups[entry.password].push(entry)
      }
    })

    const reusedGroups = Object.fromEntries(
      Object.entries(passwordGroups).filter(([, group]) => group.length > 1)
    )

    let reusedCount = 0
    Object.values(reusedGroups).forEach((group) => {
      reusedCount += group.length
    })

    const scoredEntries = vault.map((entry) => {
      const strength = scorePassword(entry.password)
      if (strength.score < 40) weakCount++
      else if (strength.score < 70) fairCount++
      else strongCount++
      return { entry, strength }
    })

    // Calculate Vault Health Score (0 - 100)
    // Deduction: -25 per weak, -10 per fair, -15 per reused instance
    let score = 100
    score -= weakCount * 20
    score -= fairCount * 5
    score -= (reusedCount / 2) * 15

    score = Math.max(0, Math.min(100, Math.round(score)))

    // Generate specific issues list
    const issues: Array<{
      id: string
      type: "weak" | "reused" | "short"
      title: string
      description: string
      severity: "high" | "medium" | "low"
      entries: PasswordEntry[]
    }> = []

    // Reused issues
    Object.entries(reusedGroups).forEach(([, group], idx) => {
      issues.push({
        id: `reused-${idx}`,
        type: "reused",
        title: `Password reused on ${group.length} accounts`,
        description: `Using the same password on multiple services makes them vulnerable if one service is compromised.`,
        severity: "high",
        entries: group,
      })
    })

    // Weak issues
    const weakEntries = scoredEntries.filter((se) => se.strength.score < 40).map((se) => se.entry)
    if (weakEntries.length > 0) {
      issues.push({
        id: "weak-passwords",
        type: "weak",
        title: `${weakEntries.length} weak passwords detected`,
        description: `Weak passwords can be easily guessed or cracked using automated tools.`,
        severity: "high",
        entries: weakEntries,
      })
    }

    // Short issues
    const shortEntries = vault.filter((e) => e.password.length < 8)
    if (shortEntries.length > 0) {
      issues.push({
        id: "short-passwords",
        type: "short",
        title: `${shortEntries.length} very short passwords`,
        description: `Passwords should be at least 12 characters to defend against modern cracking methods.`,
        severity: "high",
        entries: shortEntries,
      })
    }

    return {
      score,
      weakCount,
      fairCount,
      strongCount,
      reusedCount,
      reusedGroups,
      issues,
    }
  }, [vault])

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500"
    if (score >= 50) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
    if (score >= 50) return "bg-yellow-500/10 border-yellow-500/20 text-yellow-500"
    return "bg-red-500/10 border-red-500/20 text-red-500"
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_360px]">
      {/* Issues & Details */}
      <div className="space-y-4">
        <h2 className="font-semibold text-lg">Security Analysis</h2>

        {vault.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <ShieldCheck className="size-12 text-emerald-500 mb-3" />
              <p className="font-medium text-foreground">Your Vault is Empty</p>
              <p className="text-sm mt-1">Add passwords to your vault to run a security audit.</p>
              <Link href="/dashboard/vault" className="mt-4">
                <Button size="sm">Go to Vault</Button>
              </Link>
            </CardContent>
          </Card>
        ) : analysis.issues.length === 0 ? (
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <ShieldCheck className="size-16 text-emerald-500 mb-4 animate-bounce" />
              <p className="font-semibold text-emerald-500 text-lg">All Systems Secure!</p>
              <p className="text-sm text-muted-foreground max-w-sm mt-2">
                We did not find any weak, short, or reused passwords in your vault. Keep up the excellent security!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {analysis.issues.map((issue) => (
              <Card key={issue.id} className="border-border/60">
                <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="size-4 text-red-500" />
                      <CardTitle className="text-sm font-semibold">{issue.title}</CardTitle>
                    </div>
                    <CardDescription className="text-xs mt-1">{issue.description}</CardDescription>
                  </div>
                  <Badge variant="destructive" className="text-[10px]">
                    {issue.severity.toUpperCase()}
                  </Badge>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1.5 mt-2 border-t border-border/40 pt-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Affected Accounts</p>
                    <div className="grid gap-1.5 grid-cols-1 sm:grid-cols-2">
                      {issue.entries.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between rounded-lg bg-muted/50 p-2 text-xs border border-border/30 hover:border-primary/20 transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="font-medium truncate">{entry.title}</p>
                            <p className="text-muted-foreground text-[10px] truncate">{entry.username || entry.email}</p>
                          </div>
                          <Link href={`/dashboard/vault`}>
                            <Button variant="ghost" size="icon-xs">
                              <ArrowRight className="size-3" />
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Right Score Info */}
      <div className="space-y-4">
        <h2 className="font-semibold text-lg">Vault Health</h2>
        <Card className="border-border/60 text-center p-6 space-y-4">
          <div className="flex flex-col items-center">
            {/* Circular representation */}
            <div className="relative flex items-center justify-center size-28 rounded-full bg-muted">
              <span className={cn("text-3xl font-extrabold tracking-tight", getScoreColor(analysis.score))}>
                {analysis.score}
              </span>
              <span className="text-xs text-muted-foreground absolute bottom-5">/100</span>
            </div>
            <div className={cn("mt-4 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider", getScoreBg(analysis.score))}>
              {analysis.score >= 80 ? "Excellent" : analysis.score >= 50 ? "Needs Work" : "Critical"}
            </div>
          </div>

          <div className="border-t border-border/40 pt-4 space-y-3 text-left">
            <div>
              <div className="flex justify-between text-xs mb-1 text-muted-foreground">
                <span>Strong Passwords</span>
                <span>{analysis.strongCount} / {vault.length}</span>
              </div>
              <Progress value={vault.length ? (analysis.strongCount / vault.length) * 100 : 0} className="h-1.5" indicatorClassName="bg-emerald-500" />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 text-muted-foreground">
                <span>Weak Passwords</span>
                <span>{analysis.weakCount} / {vault.length}</span>
              </div>
              <Progress value={vault.length ? (analysis.weakCount / vault.length) * 100 : 0} className="h-1.5" indicatorClassName="bg-red-500" />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 text-muted-foreground">
                <span>Reused Passwords</span>
                <span>{analysis.reusedCount} / {vault.length}</span>
              </div>
              <Progress value={vault.length ? (analysis.reusedCount / vault.length) * 100 : 0} className="h-1.5" indicatorClassName="bg-orange-500" />
            </div>
          </div>

          <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground text-left space-y-1">
            <p className="font-semibold text-foreground">Recommendations:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Use our generator to replace weak passwords.</li>
              <li>Ensure all financial services use 16+ characters.</li>
              <li>Avoid recycling passwords across social platforms.</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  )
}
