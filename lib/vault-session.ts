// Bridges the password typed at sign-up/sign-in to the vault provider so the
// account password is also the vault master password (one password, no setup
// re-entry). Held only in memory for the current SPA session and consumed once
// by the VaultProvider on mount — never written to storage.

let pendingMasterPassword: string | null = null

export function setPendingMasterPassword(password: string): void {
  pendingMasterPassword = password
}

export function consumePendingMasterPassword(): string | null {
  const password = pendingMasterPassword
  pendingMasterPassword = null
  return password
}
