import { encryptVault, decryptVault, type VaultEnvelope } from "./crypto"

export type PasswordCategory =
  | "social"
  | "work"
  | "finance"
  | "shopping"
  | "gaming"
  | "email"
  | "other"

export interface PasswordEntry {
  id: string
  title: string
  username: string
  email: string
  password: string
  url: string
  category: PasswordCategory
  notes: string
  favorite: boolean
  createdAt: string
  updatedAt: string
  lastUsed: string | null
}

export type Vault = PasswordEntry[]

// Storage keys are scoped per user so that accounts sharing a browser never
// see each other's vault. localStorage is per-origin, not per-account, so a
// fixed key name would leak one user's data to the next.
const LEGACY_VAULT_KEY = "vaultx_entries"
const LEGACY_ENVELOPE_KEY = "vaultx_vault_v1"
const LEGACY_SCOPED_PREFIX = "vaultx_vault_v1_"
const LEGACY_SETTINGS_PREFIX = "vaultx_settings_"

function vaultEnvelopeKey(scope: string): string {
  return `securelock_vault_v1_${scope}`
}

function vaultSettingsKey(scope: string): string {
  return `securelock_settings_${scope}`
}

export type StoredVaultState = "ciphertext" | "empty"

// Wipe the old shared/unencrypted keys written before vaults were scoped per
// user, plus any pre-rebrand keys. They must never be surfaced to another
// account.
export function clearLegacyData(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(LEGACY_VAULT_KEY)
  localStorage.removeItem(LEGACY_ENVELOPE_KEY)
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i)
    if (
      key?.startsWith(LEGACY_SCOPED_PREFIX) ||
      key?.startsWith(LEGACY_SETTINGS_PREFIX)
    ) {
      localStorage.removeItem(key)
    }
  }
}

// ─── ENCRYPTED STORAGE ─────────────────────────────────────────────────────

export function readStoredVaultState(scope: string): StoredVaultState {
  if (typeof window === "undefined") return "empty"
  return localStorage.getItem(vaultEnvelopeKey(scope)) !== null
    ? "ciphertext"
    : "empty"
}

export async function persistEncryptedVault(
  vault: Vault,
  masterPassword: string,
  scope: string
): Promise<void> {
  const envelope = await encryptVault(JSON.stringify(vault), masterPassword)
  localStorage.setItem(vaultEnvelopeKey(scope), JSON.stringify(envelope))
  clearLegacyData()
}

export async function loadAndDecryptVault(
  masterPassword: string,
  scope: string
): Promise<Vault> {
  const raw = localStorage.getItem(vaultEnvelopeKey(scope))
  if (!raw) throw new Error("No encrypted vault found")

  let envelope: VaultEnvelope
  try {
    envelope = JSON.parse(raw) as VaultEnvelope
  } catch {
    throw new Error("Vault data is corrupted")
  }

  const plaintext = await decryptVault(envelope, masterPassword)
  try {
    return JSON.parse(plaintext) as Vault
  } catch {
    throw new Error("Vault data is corrupted")
  }
}

export function clearStoredVault(scope: string): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(vaultEnvelopeKey(scope))
  clearLegacyData()
}

// ─── SETTINGS ───────────────────────────────────────────────────────────────

const DEFAULT_AUTO_LOCK_MINUTES = 15

export interface VaultSettings {
  autoLockMinutes: number
}

export function getVaultSettings(scope: string): VaultSettings {
  if (typeof window === "undefined") return { autoLockMinutes: DEFAULT_AUTO_LOCK_MINUTES }
  try {
    const raw = localStorage.getItem(vaultSettingsKey(scope))
    if (!raw) return { autoLockMinutes: DEFAULT_AUTO_LOCK_MINUTES }
    const parsed = JSON.parse(raw)
    const minutes = Number(parsed.autoLockMinutes)
    return {
      autoLockMinutes:
        Number.isFinite(minutes) && minutes >= 0
          ? Math.min(Math.max(Math.round(minutes), 0), 480)
          : DEFAULT_AUTO_LOCK_MINUTES,
    }
  } catch {
    return { autoLockMinutes: DEFAULT_AUTO_LOCK_MINUTES }
  }
}

export function setVaultSettings(settings: VaultSettings, scope: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(vaultSettingsKey(scope), JSON.stringify(settings))
}

// ─── PURE CRUD ─────────────────────────────────────────────────────────────
// These operate on the in-memory vault and return a new array. The vault
// provider is responsible for persisting the encrypted result.

export function addEntry(
  vault: Vault,
  data: Omit<PasswordEntry, "id" | "createdAt" | "updatedAt" | "lastUsed">
): Vault {
  const now = new Date().toISOString()
  const entry: PasswordEntry = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    lastUsed: null,
  }
  return [entry, ...vault]
}

export function updateEntry(
  vault: Vault,
  id: string,
  updates: Partial<Omit<PasswordEntry, "id" | "createdAt">>
): Vault {
  return vault.map((e) =>
    e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
  )
}

export function deleteEntry(vault: Vault, id: string): Vault {
  return vault.filter((e) => e.id !== id)
}

export function markUsed(vault: Vault, id: string): Vault {
  return updateEntry(vault, id, { lastUsed: new Date().toISOString() })
}

export function toggleFavorite(
  vault: Vault,
  id: string
): { vault: Vault; favorite: boolean } {
  const entry = vault.find((e) => e.id === id)
  if (!entry) return { vault, favorite: false }
  const favorite = !entry.favorite
  return { vault: updateEntry(vault, id, { favorite }), favorite }
}

// ─── STRENGTH ────────────────────────────────────────────────────────────────

export type StrengthLevel = "very-weak" | "weak" | "fair" | "strong" | "very-strong"

export interface StrengthResult {
  score: number       // 0–100
  level: StrengthLevel
  label: string
  color: string
}

export function scorePassword(password: string): StrengthResult {
  if (!password) return { score: 0, level: "very-weak", label: "None", color: "bg-zinc-600" }

  let score = 0
  const len = password.length

  // Length scoring
  if (len >= 8)  score += 10
  if (len >= 12) score += 15
  if (len >= 16) score += 15
  if (len >= 20) score += 10

  // Character variety
  if (/[a-z]/.test(password)) score += 10
  if (/[A-Z]/.test(password)) score += 10
  if (/[0-9]/.test(password)) score += 10
  if (/[^a-zA-Z0-9]/.test(password)) score += 15

  // Bonus for mixed types
  const types = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter((r) => r.test(password)).length
  if (types >= 3) score += 5
  if (types === 4) score += 5

  // Penalty for common patterns
  if (/^[a-zA-Z]+$/.test(password)) score -= 10
  if (/^[0-9]+$/.test(password)) score -= 15
  if (/(.)\1{2,}/.test(password)) score -= 10  // repeated chars

  score = Math.max(0, Math.min(100, score))

  if (score < 20)  return { score, level: "very-weak",   label: "Very Weak",   color: "bg-red-500" }
  if (score < 40)  return { score, level: "weak",        label: "Weak",        color: "bg-orange-500" }
  if (score < 60)  return { score, level: "fair",        label: "Fair",        color: "bg-yellow-500" }
  if (score < 80)  return { score, level: "strong",      label: "Strong",      color: "bg-emerald-500" }
  return            { score, level: "very-strong",  label: "Very Strong", color: "bg-violet-500" }
}

// ─── GENERATOR ───────────────────────────────────────────────────────────────

export interface GeneratorOptions {
  length: number
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
  excludeAmbiguous: boolean
}

const CHARS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  uppercaseClean: "ABCDEFGHJKLMNPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  lowercaseClean: "abcdefghjkmnpqrstuvwxyz",
  numbers: "0123456789",
  numbersClean: "23456789",
  symbols: "!@#$%^&*()-_=+[]{}|;:,.<>?",
}

// Unbiased random integer in [0, max) using rejection sampling.
function secureRandom(max: number): number {
  const range = 0x100000000 - (0x100000000 % max)
  const arr = new Uint32Array(1)
  let value = 0
  do {
    crypto.getRandomValues(arr)
    value = arr[0]
  } while (value >= range)
  return value % max
}

export function generatePassword(opts: GeneratorOptions): string {
  const {
    length = 16,
    uppercase = true,
    lowercase = true,
    numbers = true,
    symbols = true,
    excludeAmbiguous = false,
  } = opts

  let pool = ""
  const guaranteed: string[] = []

  if (uppercase) {
    const set = excludeAmbiguous ? CHARS.uppercaseClean : CHARS.uppercase
    pool += set
    guaranteed.push(set[secureRandom(set.length)])
  }
  if (lowercase) {
    const set = excludeAmbiguous ? CHARS.lowercaseClean : CHARS.lowercase
    pool += set
    guaranteed.push(set[secureRandom(set.length)])
  }
  if (numbers) {
    const set = excludeAmbiguous ? CHARS.numbersClean : CHARS.numbers
    pool += set
    guaranteed.push(set[secureRandom(set.length)])
  }
  if (symbols) {
    const set = CHARS.symbols
    pool += set
    guaranteed.push(set[secureRandom(set.length)])
  }

  if (!pool) pool = CHARS.lowercase

  const chars = Array.from({ length }, () => pool[secureRandom(pool.length)])

  // Inject guaranteed chars at random positions
  guaranteed.forEach((ch, i) => {
    const pos = i % length
    chars[pos] = ch
  })

  // Shuffle using Fisher-Yates with cryptographic randomness
  for (let i = chars.length - 1; i > 0; i--) {
    const j = secureRandom(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }

  return chars.join("")
}

// ─── CATEGORY HELPERS ────────────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<PasswordCategory, string> = {
  social: "Social",
  work: "Work",
  finance: "Finance",
  shopping: "Shopping",
  gaming: "Gaming",
  email: "Email",
  other: "Other",
}

export const CATEGORY_COLORS: Record<PasswordCategory, string> = {
  social: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  work: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  finance: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  shopping: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  gaming: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  email: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  other: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
}
