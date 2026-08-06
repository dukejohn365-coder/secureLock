"use client"

import * as React from "react"
import { Eye, EyeOff, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectItem } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useVault } from "@/components/vault-provider"
import {
  generatePassword,
  scorePassword,
  type PasswordEntry,
  type PasswordCategory,
  CATEGORY_LABELS,
} from "@/lib/passwords"
import { cn } from "@/lib/utils"

interface AddPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editEntry?: PasswordEntry | null
}

const defaultForm = {
  title: "",
  username: "",
  email: "",
  password: "",
  url: "",
  category: "other" as PasswordCategory,
  notes: "",
  favorite: false,
}

function formFromEntry(entry: PasswordEntry) {
  return {
    title: entry.title,
    username: entry.username,
    email: entry.email,
    password: entry.password,
    url: entry.url,
    category: entry.category,
    notes: entry.notes,
    favorite: entry.favorite,
  }
}

export function AddPasswordDialog({
  open,
  onOpenChange,
  editEntry,
}: AddPasswordDialogProps) {
  const { add, update } = useVault()
  // The parent mounts this dialog with a `key` that changes whenever it is
  // (re)opened or the edit target changes, so the form initialises fresh here
  // without needing an effect to reset state.
  const [form, setForm] = React.useState(() =>
    editEntry ? formFromEntry(editEntry) : defaultForm
  )
  const [showPassword, setShowPassword] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const strength = scorePassword(form.password)

  const handleGenerate = () => {
    const pw = generatePassword({
      length: 20,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      excludeAmbiguous: true,
    })
    setForm((f) => ({ ...f, password: pw }))
    setShowPassword(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.password) return
    setLoading(true)
    try {
      if (editEntry) {
        update(editEntry.id, form)
      } else {
        add(form)
      }
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {editEntry ? "Edit Password" : "Add New Password"}
          </DialogTitle>
          <DialogDescription>
            {editEntry ? "Update your saved credentials." : "Save a new set of credentials to your vault."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="dialog-title">Website / App Name *</Label>
            <Input
              id="dialog-title"
              placeholder="e.g. GitHub, Netflix"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Username */}
            <div className="space-y-1.5">
              <Label htmlFor="dialog-username">Username</Label>
              <Input
                id="dialog-username"
                placeholder="username"
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              />
            </div>
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="dialog-email">Email</Label>
              <Input
                id="dialog-email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="dialog-password">Password *</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="dialog-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter or generate a password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="pr-10 font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleGenerate}
                title="Generate strong password"
                id="dialog-generate-btn"
              >
                <Wand2 className="size-4" />
              </Button>
            </div>

            {/* Strength bar */}
            {form.password && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Strength</span>
                  <span className={cn("text-[11px] font-medium", {
                    "text-red-500": strength.level === "very-weak" || strength.level === "weak",
                    "text-yellow-500": strength.level === "fair",
                    "text-emerald-500": strength.level === "strong",
                    "text-violet-500": strength.level === "very-strong",
                  })}>
                    {strength.label}
                  </span>
                </div>
                <Progress value={strength.score} className="h-1.5" indicatorClassName={strength.color} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* URL */}
            <div className="space-y-1.5">
              <Label htmlFor="dialog-url">URL</Label>
              <Input
                id="dialog-url"
                placeholder="https://example.com"
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              />
            </div>
            {/* Category */}
            <div className="space-y-1.5">
              <Label htmlFor="dialog-category">Category</Label>
              <Select
                id="dialog-category"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as PasswordCategory }))}
              >
                {(Object.entries(CATEGORY_LABELS) as [PasswordCategory, string][]).map(([val, label]) => (
                  <SelectItem key={val} value={val}>{label}</SelectItem>
                ))}
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="dialog-notes">Notes</Label>
            <textarea
              id="dialog-notes"
              rows={2}
              placeholder="Optional notes..."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="flex min-h-[60px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} id="dialog-cancel-btn">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} id="dialog-save-btn">
              {loading ? "Saving…" : editEntry ? "Update" : "Save Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
