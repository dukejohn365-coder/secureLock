"use client"

import * as React from "react"
import {
  Copy,
  Eye,
  EyeOff,
  Star,
  Pencil,
  Trash2,
  ExternalLink,
  MoreHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useVault } from "@/components/vault-provider"
import { copyWithAutoClear, safeOpenUrl } from "@/lib/validation"
import {
  type PasswordEntry,
  scorePassword,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from "@/lib/passwords"

interface PasswordCardProps {
  entry: PasswordEntry
  onEdit: (entry: PasswordEntry) => void
  onDelete: (id: string) => void
  view?: "grid" | "list"
}

const MASK_LENGTH = 12

function initials(title: string): string {
  return title[0]?.toUpperCase() ?? "?"
}

export function PasswordCard({ entry, onEdit, onDelete, view = "grid" }: PasswordCardProps) {
  const { toggleFav, markUsedEntry } = useVault()
  const [revealed, setRevealed] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [isFavorite, setIsFavorite] = React.useState(entry.favorite)
  const strength = scorePassword(entry.password)

  const handleCopy = async () => {
    await copyWithAutoClear(entry.password)
    markUsedEntry(entry.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFavorite = () => {
    setIsFavorite(toggleFav(entry.id))
  }

  const maskedPassword = "•".repeat(MASK_LENGTH)

  if (view === "list") {
    return (
      <div className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 transition-all hover:border-primary/30 hover:shadow-md hover:bg-accent/30">
        {/* Icon */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          <span className="text-sm font-bold text-muted-foreground">{initials(entry.title)}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{entry.title}</span>
            <span className={cn("inline-flex items-center rounded-full border px-1.5 py-0 text-[10px] font-semibold", CATEGORY_COLORS[entry.category])}>
              {CATEGORY_LABELS[entry.category]}
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate">{entry.username || entry.email}</p>
        </div>

        {/* Password */}
        <div className="hidden sm:flex items-center gap-2">
          <code className="text-xs font-mono text-muted-foreground">
            {revealed ? entry.password : maskedPassword}
          </code>
        </div>

        {/* Strength */}
        <div className="hidden md:flex items-center gap-2 w-20">
          <Progress value={strength.score} className="h-1" indicatorClassName={strength.color} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon-sm" onClick={() => setRevealed(!revealed)} aria-label="Toggle visibility" id={`reveal-${entry.id}`}>
            {revealed ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={handleCopy} aria-label="Copy password" id={`copy-${entry.id}`}>
            {copied ? <span className="text-[10px] text-emerald-500">✓</span> : <Copy className="size-3.5" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" id={`menu-${entry.id}`}>
                <MoreHorizontal className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(entry)}><Pencil className="size-3.5" /> Edit</DropdownMenuItem>
              {entry.url && (
                <DropdownMenuItem onClick={() => safeOpenUrl(entry.url)}><ExternalLink className="size-3.5" /> Open URL</DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleFavorite}><Star className="size-3.5" /> {isFavorite ? "Unfavorite" : "Favorite"}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => onDelete(entry.id)}><Trash2 className="size-3.5" /> Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    )
  }

  // Grid view
  return (
    <div className="group relative flex flex-col rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted ring-1 ring-border/50">
            <span className="text-sm font-bold text-primary">{initials(entry.title)}</span>
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm leading-tight truncate">{entry.title}</p>
            <p className="text-xs text-muted-foreground truncate">{entry.username || entry.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleFavorite}
          aria-label="Toggle favorite"
          id={`fav-${entry.id}`}
          className={cn(isFavorite ? "text-yellow-500" : "text-muted-foreground")}
        >
          <Star className={cn("size-3.5", isFavorite && "fill-yellow-500")} />
        </Button>
      </div>

      {/* Category badge */}
      <div className="mb-3">
        <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold", CATEGORY_COLORS[entry.category])}>
          {CATEGORY_LABELS[entry.category]}
        </span>
      </div>

      {/* Password field */}
      <div className="mb-3 flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2">
        <code className="flex-1 text-xs font-mono text-muted-foreground truncate">
          {revealed ? entry.password : maskedPassword}
        </code>
        <button
          onClick={() => setRevealed(!revealed)}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Toggle password visibility"
          id={`reveal-grid-${entry.id}`}
        >
          {revealed ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
        </button>
      </div>

      {/* Strength bar */}
      <div className="mb-4 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">Strength</span>
          <span className={cn("text-[10px] font-medium", {
            "text-red-500": strength.level === "very-weak" || strength.level === "weak",
            "text-yellow-500": strength.level === "fair",
            "text-emerald-500": strength.level === "strong",
            "text-violet-500": strength.level === "very-strong",
          })}>
            {strength.label}
          </span>
        </div>
        <Progress value={strength.score} className="h-1" indicatorClassName={strength.color} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 mt-auto">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-7 text-xs"
          onClick={handleCopy}
          id={`copy-grid-${entry.id}`}
        >
          {copied ? (
            <span className="text-emerald-500">Copied!</span>
          ) : (
            <><Copy className="size-3 mr-1" />Copy</>
          )}
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={() => onEdit(entry)} aria-label="Edit" id={`edit-grid-${entry.id}`}>
          <Pencil className="size-3.5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" id={`menu-grid-${entry.id}`}>
              <MoreHorizontal className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {entry.url && (
              <DropdownMenuItem onClick={() => safeOpenUrl(entry.url)}><ExternalLink className="size-3.5" /> Open URL</DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(entry.id)}><Trash2 className="size-3.5" /> Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
