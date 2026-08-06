"use client"

import * as React from "react"
import {
  Search,
  Plus,
  LayoutGrid,
  LayoutList,
  KeyRound,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PasswordCard } from "@/components/dashboard/password-card"
import { AddPasswordDialog } from "@/components/dashboard/add-password-dialog"
import { useVault } from "@/components/vault-provider"
import {
  type PasswordEntry,
  type PasswordCategory,
  CATEGORY_LABELS,
} from "@/lib/passwords"
import { cn } from "@/lib/utils"

type ViewMode = "grid" | "list"
type FilterMode = "all" | "favorites" | "recent"

interface VaultClientProps {
  initialFilter?: string
  initialCategory?: string
}

export function VaultClient({ initialFilter, initialCategory }: VaultClientProps) {
  const { vault, remove } = useVault()
  const [search, setSearch] = React.useState("")
  const [view, setView] = React.useState<ViewMode>("grid")
  const [filter, setFilter] = React.useState<FilterMode>(
    (initialFilter as FilterMode) ?? "all"
  )
  const [category, setCategory] = React.useState<PasswordCategory | "all">(
    (initialCategory as PasswordCategory) ?? "all"
  )
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editEntry, setEditEntry] = React.useState<PasswordEntry | null>(null)

  const handleEdit = (entry: PasswordEntry) => {
    setEditEntry(entry)
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Delete this password? This cannot be undone.")) {
      remove(id)
    }
  }

  const handleAdd = () => {
    setEditEntry(null)
    setDialogOpen(true)
  }

  // Filter and search
  const filtered = React.useMemo(() => {
    let result = vault

    if (filter === "favorites") result = result.filter((e) => e.favorite)
    if (filter === "recent") result = result.filter((e) => e.lastUsed).sort((a, b) =>
      new Date(b.lastUsed!).getTime() - new Date(a.lastUsed!).getTime()
    ).slice(0, 20)

    if (category !== "all") result = result.filter((e) => e.category === category)

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((e) =>
        e.title.toLowerCase().includes(q) ||
        e.username.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.url.toLowerCase().includes(q)
      )
    }

    return result
  }, [vault, filter, category, search])

  const categories: Array<{ value: PasswordCategory | "all"; label: string }> = [
    { value: "all", label: "All" },
    ...(Object.entries(CATEGORY_LABELS) as [PasswordCategory, string][]).map(([v, l]) => ({ value: v, label: l })),
  ]

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold">Password Vault</h1>
        <Button onClick={handleAdd} size="sm" id="add-password-btn" className="glow-sm-violet">
          <Plus className="size-4 mr-1" />
          Add Password
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            id="vault-search"
            type="text"
            placeholder="Search passwords…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 rounded-lg border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setView("grid")}
              id="view-grid-btn"
              className={cn("px-2.5 py-1.5 transition-colors", view === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}
              aria-label="Grid view"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => setView("list")}
              id="view-list-btn"
              className={cn("px-2.5 py-1.5 transition-colors", view === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}
              aria-label="List view"
            >
              <LayoutList className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterMode)}>
        <TabsList className="h-8">
          <TabsTrigger value="all" className="text-xs h-6 px-2.5" id="filter-all">All</TabsTrigger>
          <TabsTrigger value="favorites" className="text-xs h-6 px-2.5" id="filter-favorites">Favorites</TabsTrigger>
          <TabsTrigger value="recent" className="text-xs h-6 px-2.5" id="filter-recent">Recently Used</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Category pills */}
      <div className="flex flex-wrap gap-1.5">
        {categories.map((cat) => (
          <button
            key={cat.value}
            id={`cat-${cat.value}`}
            onClick={() => setCategory(cat.value)}
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all",
              category === cat.value
                ? "border-primary bg-primary/15 text-primary"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <KeyRound className="size-10 text-muted-foreground/40 mb-3" />
          <p className="font-medium text-muted-foreground">No passwords found</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Try adjusting your filters or add a new password</p>
          <Button onClick={handleAdd} variant="outline" size="sm" className="mt-4" id="empty-add-btn">
            <Plus className="size-4 mr-1" />
            Add Password
          </Button>
        </div>
      ) : (
        <div className={cn(
          view === "grid"
            ? "grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
            : "flex flex-col gap-2"
        )}>
          {filtered.map((entry) => (
            <PasswordCard
              key={entry.id}
              entry={entry}
              onEdit={handleEdit}
              onDelete={handleDelete}
              view={view}
            />
          ))}
        </div>
      )}

      {/* Count */}
      <p className="text-xs text-muted-foreground text-right">
        Showing {filtered.length} of {vault.length} passwords
      </p>

      {/* Dialog */}
      <AddPasswordDialog
        key={dialogOpen ? (editEntry?.id ?? "new-entry") : "closed"}
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v)
          if (!v) setEditEntry(null)
        }}
        editEntry={editEntry}
      />
    </div>
  )
}
