"use client"

import * as React from "react"
import {
  type Vault,
  type PasswordEntry,
  readStoredVaultState,
  loadAndDecryptVault,
  persistEncryptedVault,
  clearLegacyData,
  getVaultSettings,
  setVaultSettings,
  addEntry,
  updateEntry,
  deleteEntry,
  toggleFavorite,
  markUsed,
} from "@/lib/passwords"
import { consumePendingMasterPassword } from "@/lib/vault-session"
import { authClient } from "@/lib/auth-client"
import { useQuery } from "convex/react"
import { useRouter } from "next/navigation"
import { api } from "@/convex/_generated/api"

type VaultStatus = "checking" | "unlocked"

export interface VaultContextValue {
  status: VaultStatus
  vault: Vault
  autoLockMinutes: number
  persistError: string | null
  lock: () => void
  changeMasterPassword: (oldPassword: string, newPassword: string) => Promise<void>
  add: (data: Omit<PasswordEntry, "id" | "createdAt" | "updatedAt" | "lastUsed">) => void
  update: (id: string, updates: Partial<Omit<PasswordEntry, "id" | "createdAt">>) => void
  remove: (id: string) => void
  markUsedEntry: (id: string) => void
  toggleFav: (id: string) => boolean
  importEntries: (entries: PasswordEntry[]) => void
  exportEntries: () => Vault
  clearVault: () => void
  setAutoLockMinutes: (minutes: number) => void
  clearPersistError: () => void
}

const VaultContext = React.createContext<VaultContextValue | null>(null)

export function useVault(): VaultContextValue {
  const ctx = React.useContext(VaultContext)
  if (!ctx) throw new Error("useVault must be used within a VaultProvider")
  return ctx
}

const DEFAULT_AUTO_LOCK_MINUTES = 15

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [status, setStatus] = React.useState<VaultStatus>("checking")
  const [vault, setVault] = React.useState<Vault>([])
  const [autoLockMinutes, setAutoLockMinutesState] = React.useState(
    DEFAULT_AUTO_LOCK_MINUTES
  )
  const [persistError, setPersistError] = React.useState<string | null>(null)

  // The vault is scoped to the signed-in user: localStorage is per-browser,
  // not per-account, so a fixed key name would leak one user's vault to the
  // next account created on the same browser.
  const user = useQuery(api.auth.getCurrentUser)
  const userId = user?._id ?? null
  const userLoaded = user !== undefined

  // The master password is intentionally held only in memory and never written
  // to storage. It is cleared on lock/sign-out.
  const masterPasswordRef = React.useRef<string | null>(null)
  const vaultRef = React.useRef<Vault>([])

  React.useEffect(() => {
    vaultRef.current = vault
  }, [vault])

  // Re-authenticate when the vault is encrypted but no password is in memory
  // (e.g. after a hard refresh). The account password IS the master password,
  // so signing out and back in restores it without a separate unlock screen.
  const requireReauth = React.useCallback(async () => {
    masterPasswordRef.current = null
    setVault([])
    setPersistError(null)
    setStatus("checking")
    try {
      await authClient.signOut()
    } finally {
      router.push("/login")
    }
  }, [router])

  // Determine the initial storage state once the client has mounted and the
  // current user is known. Reading localStorage during render would cause
  // hydration mismatches, so this must run in an effect after the first paint.
  /* eslint-disable react-hooks/set-state-in-effect -- mount-only init */
  React.useEffect(() => {
    if (!userLoaded) {
      // Auth session is still loading. Stay on the loading state instead of
      // flashing the unlock screen while the pending password is consumed.
      return
    }

    if (!userId) {
      // Signed out or no active session: wipe the in-memory vault. The auth
      // guard redirects to /login, so never surface the unlock screen here.
      masterPasswordRef.current = null
      setVault([])
      setPersistError(null)
      setStatus("checking")
      return
    }

    // Old shared/unencrypted keys must never surface to another account.
    clearLegacyData()
    setAutoLockMinutesState(getVaultSettings(userId).autoLockMinutes)

    const stored = readStoredVaultState(userId)

    // A password may have been handed over by the sign-up/sign-in form so the
    // account password and the vault password stay unified (one password).
    const pending = consumePendingMasterPassword()

    if (pending) {
      masterPasswordRef.current = pending
      if (stored === "ciphertext") {
        // Sign-in: decrypt this user's vault with the account password. The
        // account password is the single password, so after login the user
        // always lands on the dashboard. If the stored vault was encrypted
        // with an earlier password it can't be recovered, so start fresh.
        loadAndDecryptVault(pending, userId)
          .then((next) => {
            setVault(next)
            setStatus("unlocked")
          })
          .catch(() => {
            persistEncryptedVault([], pending, userId)
              .then(() => {
                setVault([])
                setStatus("unlocked")
              })
              .catch(() => setStatus("unlocked"))
          })
      } else {
        // Fresh sign-up: create an empty encrypted vault for this user only.
        persistEncryptedVault([], pending, userId)
          .then(() => setStatus("unlocked"))
          .catch(() => setStatus("unlocked"))
      }
      return
    }

    if (stored === "ciphertext") {
      // No password is in memory (hard refresh) and the vault is encrypted.
      // Re-authenticate so the account password can unlock it again — there is
      // no standalone unlock screen in this app.
      requireReauth()
      return
    }

    // No vault exists on this browser (e.g. new device) and no password was
    // handed over. The account password IS the vault password, so the user
    // must sign in to create the vault with it.
    requireReauth()
  }, [userLoaded, userId, requireReauth])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Persist the encrypted vault on every change (only while unlocked).
  React.useEffect(() => {
    if (status !== "unlocked" || !userId) return
    const master = masterPasswordRef.current
    if (!master) return
    persistEncryptedVault(vault, master, userId).catch((err) => {
      setPersistError(
        err instanceof Error ? err.message : "Failed to save vault changes"
      )
    })
  }, [vault, status, userId])

  const lock = React.useCallback(() => {
    masterPasswordRef.current = null
    setVault([])
    setPersistError(null)
    clearLegacyData()
    requireReauth()
  }, [requireReauth])

  const changeMasterPassword = React.useCallback(
    async (oldPassword: string, newPassword: string) => {
      if (!userId) {
        throw new Error("Not signed in.")
      }
      if (newPassword.length < 10) {
        throw new Error("Master password must be at least 10 characters long.")
      }
      // Verify the current password against the encrypted envelope first.
      await loadAndDecryptVault(oldPassword, userId)
      // Keep the account password in sync so there is only one password.
      const res = await authClient.changePassword({
        currentPassword: oldPassword,
        newPassword,
      })
      if (res.error) {
        throw new Error(res.error.message ?? "Failed to update account password.")
      }
      masterPasswordRef.current = newPassword
      await persistEncryptedVault(vaultRef.current, newPassword, userId)
    },
    [userId]
  )

  const add = React.useCallback(
    (data: Omit<PasswordEntry, "id" | "createdAt" | "updatedAt" | "lastUsed">) => {
      setVault((prev) => addEntry(prev, data))
    },
    []
  )

  const update = React.useCallback(
    (id: string, updates: Partial<Omit<PasswordEntry, "id" | "createdAt">>) => {
      setVault((prev) => updateEntry(prev, id, updates))
    },
    []
  )

  const remove = React.useCallback((id: string) => {
    setVault((prev) => deleteEntry(prev, id))
  }, [])

  const markUsedEntry = React.useCallback((id: string) => {
    setVault((prev) => markUsed(prev, id))
  }, [])

  const toggleFav = React.useCallback((id: string): boolean => {
    const { vault: next, favorite } = toggleFavorite(vaultRef.current, id)
    setVault(next)
    return favorite
  }, [])

  const importEntries = React.useCallback((entries: PasswordEntry[]) => {
    setVault(entries)
  }, [])

  const exportEntries = React.useCallback((): Vault => vaultRef.current, [])

  const clearVault = React.useCallback(() => {
    setVault([])
  }, [])

  const setAutoLockMinutes = React.useCallback(
    (minutes: number) => {
      const safe =
        Number.isFinite(minutes) && minutes >= 0
          ? Math.min(Math.max(Math.round(minutes), 0), 480)
          : DEFAULT_AUTO_LOCK_MINUTES
      setAutoLockMinutesState(safe)
      if (userId) setVaultSettings({ autoLockMinutes: safe }, userId)
    },
    [userId]
  )

  const clearPersistError = React.useCallback(() => setPersistError(null), [])

  // Inactivity auto-lock. Any user activity resets the timer; on expiry the
  // decrypted vault is wiped from memory. A value of 0 disables auto-lock.
  React.useEffect(() => {
    if (status !== "unlocked") return
    if (autoLockMinutes <= 0) return
    const timeoutMs = autoLockMinutes * 60_000

    let timer: ReturnType<typeof setTimeout> | null = null
    const startTimer = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(lock, timeoutMs)
    }
    const onActivity = () => startTimer()

    const events: Array<keyof WindowEventMap> = [
      "pointerdown",
      "keydown",
      "wheel",
      "touchstart",
      "scroll",
    ]
    events.forEach((event) =>
      window.addEventListener(event, onActivity, { passive: true })
    )
    startTimer()

    return () => {
      if (timer) clearTimeout(timer)
      events.forEach((event) => window.removeEventListener(event, onActivity))
    }
  }, [status, autoLockMinutes, lock])

  const value = React.useMemo<VaultContextValue>(
    () => ({
      status,
      vault,
      autoLockMinutes,
      persistError,
      lock,
      changeMasterPassword,
      add,
      update,
      remove,
      markUsedEntry,
      toggleFav,
      importEntries,
      exportEntries,
      clearVault,
      setAutoLockMinutes,
      clearPersistError,
    }),
    [
      status,
      vault,
      autoLockMinutes,
      persistError,
      lock,
      changeMasterPassword,
      add,
      update,
      remove,
      markUsedEntry,
      toggleFav,
      importEntries,
      exportEntries,
      clearVault,
      setAutoLockMinutes,
      clearPersistError,
    ]
  )

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>
}
