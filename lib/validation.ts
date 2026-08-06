import { z } from "zod"
import type { PasswordCategory, PasswordEntry } from "./passwords"
import { CATEGORY_LABELS } from "./passwords"

const categories = Object.keys(CATEGORY_LABELS) as [
  PasswordCategory,
  ...PasswordCategory[]
]

const passwordEntrySchema = z.object({
  id: z.string().max(128),
  title: z.string().min(1).max(200),
  username: z.string().max(200).catch(""),
  email: z.string().max(254).catch(""),
  password: z.string().min(1).max(2048),
  url: z.string().max(2048).catch(""),
  category: z.enum(categories).catch("other"),
  notes: z.string().max(4000).catch(""),
  favorite: z.boolean().catch(false),
  createdAt: z.string().max(40).catch(() => new Date(0).toISOString()),
  updatedAt: z.string().max(40).catch(() => new Date(0).toISOString()),
  lastUsed: z.string().max(40).nullable().catch(null),
})

const vaultSchema = z.array(passwordEntrySchema)

export function parseVaultImport(raw: unknown): PasswordEntry[] {
  const parsed = vaultSchema.safeParse(raw)
  if (!parsed.success) {
    throw new Error("Invalid vault backup file. The file could not be validated.")
  }
  // Ensure unique ids so React keys stay stable.
  const seen = new Set<string>()
  return parsed.data.map((entry) => {
    const id = seen.has(entry.id) ? crypto.randomUUID() : entry.id
    seen.add(id)
    return {
      id,
      title: entry.title,
      username: entry.username ?? "",
      email: entry.email ?? "",
      password: entry.password,
      url: entry.url ?? "",
      category: entry.category ?? "other",
      notes: entry.notes ?? "",
      favorite: entry.favorite ?? false,
      createdAt: entry.createdAt ?? new Date(0).toISOString(),
      updatedAt: entry.updatedAt ?? new Date(0).toISOString(),
      lastUsed: entry.lastUsed ?? null,
    }
  })
}

export function safeOpenUrl(rawUrl: string): void {
  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    return
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return
  window.open(parsed.toString(), "_blank", "noopener,noreferrer")
}

export async function copyWithAutoClear(
  text: string,
  clearAfterMs = 60_000
): Promise<void> {
  await navigator.clipboard.writeText(text)
  window.setTimeout(() => {
    navigator.clipboard.writeText("").catch(() => {})
  }, clearAfterMs)
}
