"use client"

import * as React from "react"
import { Shield, Key, Eye, EyeOff, Save, Trash, AlertTriangle, Download, Upload } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useVault } from "@/components/vault-provider"
import { parseVaultImport } from "@/lib/validation"

export function SettingsClient() {
  const {
    autoLockMinutes,
    setAutoLockMinutes,
    changeMasterPassword,
    importEntries,
    exportEntries,
    clearVault,
  } = useVault()

  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [masterMessage, setMasterMessage] = React.useState<{
    type: "success" | "error"
    text: string
  } | null>(null)
  const [masterLoading, setMasterLoading] = React.useState(false)

  const handleChangeMasterPassword = async () => {
    setMasterMessage(null)
    if (newPassword.length < 10) {
      setMasterMessage({ type: "error", text: "New password must be at least 10 characters long." })
      return
    }
    if (newPassword !== confirmPassword) {
      setMasterMessage({ type: "error", text: "New passwords do not match." })
      return
    }
    setMasterLoading(true)
    try {
      await changeMasterPassword(currentPassword, newPassword)
      setMasterMessage({ type: "success", text: "Password updated. Your vault has been re-encrypted and your account synced." })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      setMasterMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to change master password.",
      })
    } finally {
      setMasterLoading(false)
    }
  }

  const handleExport = () => {
    if (!confirm("Your vault will be exported as PLAIN TEXT JSON. Anyone with this file can read your passwords. Continue?")) return
    try {
      const data = exportEntries()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `securelock_backup_${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      alert("Failed to export vault data.")
    }
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const raw = JSON.parse(event.target?.result as string)
        const entries = parseVaultImport(raw)
        if (confirm(`Importing ${entries.length} entries. This will overwrite current entries. Proceed?`)) {
          importEntries(entries)
          alert("Vault imported successfully! Reloading...")
          window.location.reload()
        }
      } catch {
        alert("Failed to parse the backup file.")
      }
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  const handleClearVault = () => {
    if (confirm("CRITICAL WARNING: Are you absolutely sure you want to clear your entire password vault? This action CANNOT be undone!")) {
      clearVault()
      alert("Vault cleared successfully. Reloading...")
      window.location.reload()
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Master Password */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="size-5 text-primary" />
            <CardTitle className="text-base">Password & Encryption</CardTitle>
          </div>
          <CardDescription>
            Your account password encrypts your vault locally. It is never stored or sent anywhere.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="current-pwd">Current Password</Label>
              <Input
                id="current-pwd"
                type={showPassword ? "text" : "password"}
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-pwd">New Password</Label>
              <div className="relative">
                <Input
                  id="new-pwd"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 10 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-pwd">Confirm New Password</Label>
              <Input
                id="confirm-pwd"
                type={showPassword ? "text" : "password"}
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {masterMessage && (
            <p className={cn("text-sm", masterMessage.type === "success" ? "text-emerald-500" : "text-red-500")}>
              {masterMessage.text}
            </p>
          )}

          <div className="flex items-center justify-between border-t border-border/40 pt-4">
            <div>
              <Label htmlFor="autolock" className="font-semibold text-sm">Auto Lock Vault</Label>
              <p className="text-xs text-muted-foreground">
                Lock the vault after this many minutes of inactivity (0 disables auto-lock).
              </p>
            </div>
            <Input
              id="autolock"
              type="number"
              min={0}
              max={480}
              className="w-24"
              value={autoLockMinutes}
              onChange={(e) => setAutoLockMinutes(Number(e.target.value))}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t border-border/40 pt-4">
          <Button size="sm" id="save-settings-btn" onClick={handleChangeMasterPassword} disabled={masterLoading}>
            <Save className="size-3.5 mr-1" />
            {masterLoading ? "Saving…" : "Change Password"}
          </Button>
        </CardFooter>
      </Card>

      {/* Import & Export */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="size-5 text-primary" />
            <CardTitle className="text-base">Backup, Import & Export</CardTitle>
          </div>
          <CardDescription>
            Download your password entries in JSON format or restore your vault from a previous backup.
            Exported files are NOT encrypted — store them securely.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" onClick={handleExport} id="export-btn">
            <Download className="size-3.5 mr-1.5" />
            Export Vault (JSON)
          </Button>
          <div className="relative">
            <label
              htmlFor="import-file"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "cursor-pointer")}
              id="import-btn"
            >
              <Upload className="size-3.5 mr-1.5" />
              Import Vault (JSON)
            </label>
            <input
              type="file"
              id="import-file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleImport}
            />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-500/20 bg-red-500/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-red-500" />
            <CardTitle className="text-base text-red-500 font-semibold">Danger Zone</CardTitle>
          </div>
          <CardDescription>
            Permanent actions that will completely clear your data. Be careful.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-4">
            Clearing your vault removes all credentials stored in your encrypted local vault. This cannot be recovered.
          </p>
          <Button variant="destructive" size="sm" onClick={handleClearVault} id="clear-vault-btn">
            <Trash className="size-3.5 mr-1.5" />
            Clear Vault Data
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
