"use client"

import * as React from "react"
import { KeyRound, Star, ShieldAlert, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useVault } from "@/components/vault-provider"
import { scorePassword } from "@/lib/passwords"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  description: string
  icon: React.ElementType
  className?: string
  iconClassName?: string
  delay?: string
}

function StatCard({ title, value, description, icon: Icon, className, iconClassName, delay = "" }: StatCardProps) {
  return (
    <Card className={cn("group/stat relative overflow-hidden border-border/60 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 animate-fade-in-up", className, delay)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", iconClassName)}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
      {/* Subtle gradient overlay on hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-primary/5 to-transparent" />
    </Card>
  )
}

export function StatsCards() {
  const { vault } = useVault()

  const stats = React.useMemo(() => {
    const weak = vault.filter((e) => {
      const s = scorePassword(e.password)
      return s.score < 40
    }).length
    const strong = vault.filter((e) => {
      const s = scorePassword(e.password)
      return s.score >= 60
    }).length

    return {
      total: vault.length,
      favorites: vault.filter((e) => e.favorite).length,
      weak,
      strong,
    }
  }, [vault])

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Passwords"
        value={stats.total}
        description="Stored in your vault"
        icon={KeyRound}
        iconClassName="bg-violet-500/15 text-violet-500"
        delay="delay-100"
      />
      <StatCard
        title="Favorites"
        value={stats.favorites}
        description="Pinned for quick access"
        icon={Star}
        iconClassName="bg-yellow-500/15 text-yellow-500"
        delay="delay-200"
      />
      <StatCard
        title="Weak Passwords"
        value={stats.weak}
        description="Need strengthening"
        icon={ShieldAlert}
        iconClassName="bg-red-500/15 text-red-500"
        delay="delay-300"
      />
      <StatCard
        title="Strong Passwords"
        value={stats.strong}
        description="Well protected"
        icon={TrendingUp}
        iconClassName="bg-emerald-500/15 text-emerald-500"
        delay="delay-400"
      />
    </div>
  )
}
