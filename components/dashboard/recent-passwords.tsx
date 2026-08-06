"use client"

import * as React from "react"
import Link from "next/link"
import { Eye, EyeOff, Copy, Star, ArrowRight, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useVault } from "@/components/vault-provider"
import { copyWithAutoClear } from "@/lib/validation"
import { scorePassword, CATEGORY_LABELS, CATEGORY_COLORS, type PasswordEntry } from "@/lib/passwords"
import { cn } from "@/lib/utils"

function RecentPasswordRow({ entry }: { entry: PasswordEntry }) {
  const [revealed, setRevealed] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const strength = scorePassword(entry.password)

  const handleCopy = async () => {
    await copyWithAutoClear(entry.password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group flex items-center gap-3 rounded-xl p-3 hover:bg-muted/50 transition-colors">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary text-sm">
        {entry.title[0]?.toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-sm truncate">{entry.title}</span>
          {entry.favorite && <Star className="size-3 fill-yellow-500 text-yellow-500 shrink-0" />}
        </div>
        <p className="text-xs text-muted-foreground truncate">{entry.username || entry.email}</p>
      </div>
      <Badge className={cn("text-[10px] border shrink-0 hidden sm:inline-flex", CATEGORY_COLORS[entry.category])} variant="outline">
        {CATEGORY_LABELS[entry.category]}
      </Badge>
      <div className="hidden md:flex items-center gap-2 w-16 shrink-0">
        <Progress value={strength.score} className="h-1 flex-1" indicatorClassName={strength.color} />
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon-sm" onClick={() => setRevealed(!revealed)} aria-label="Reveal">
          {revealed ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={handleCopy} aria-label="Copy">
          {copied ? <span className="text-[10px] text-emerald-500">✓</span> : <Copy className="size-3.5" />}
        </Button>
      </div>
    </div>
  )
}

export function RecentPasswords() {
  const { vault } = useVault()

  const recent = React.useMemo(() => {
    return [...vault]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 6)
  }, [vault])

  return (
    <Card className="animate-fade-in-up delay-500">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-muted-foreground" />
          <CardTitle className="text-base">Recent Passwords</CardTitle>
        </div>
        <Link href="/dashboard/vault">
          <Button variant="ghost" size="sm" className="gap-1 text-xs" id="view-all-btn">
            View all <ArrowRight className="size-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="px-2">
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No passwords yet. Add your first one!</p>
        ) : (
          <div className="space-y-0.5">
            {recent.map((entry) => (
              <RecentPasswordRow key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
