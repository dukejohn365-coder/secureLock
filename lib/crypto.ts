// Client-side encryption/decryption utilities using the Web Crypto API.
// The vault is encrypted at rest as an AES-GCM-256 envelope whose key is
// derived from the user's master password via PBKDF2 (SHA-256).

export const DEFAULT_PBKDF2_ITERATIONS = 600_000

export interface VaultEnvelope {
  version: 1
  iterations: number
  salt: string
  iv: string
  ciphertext: string
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = ""
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}

export async function deriveKey(
  password: string,
  salt: Uint8Array,
  iterations: number = DEFAULT_PBKDF2_ITERATIONS
): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  )
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  )
}

export async function encryptData(
  data: string,
  password: string,
  iterations: number = DEFAULT_PBKDF2_ITERATIONS
): Promise<{ ciphertext: string; salt: string; iv: string; iterations: number }> {
  if (typeof window === "undefined" || !window.crypto) {
    throw new Error("Crypto API is only available in the browser")
  }

  const enc = new TextEncoder()
  const salt = window.crypto.getRandomValues(new Uint8Array(16))
  const iv = window.crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(password, salt, iterations)

  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    enc.encode(data)
  )

  return {
    ciphertext: arrayBufferToBase64(encrypted),
    salt: arrayBufferToBase64(salt.buffer),
    iv: arrayBufferToBase64(iv.buffer),
    iterations,
  }
}

export async function decryptData(
  ciphertext: string,
  password: string,
  saltStr: string,
  ivStr: string,
  iterations: number = DEFAULT_PBKDF2_ITERATIONS
): Promise<string> {
  if (typeof window === "undefined" || !window.crypto) {
    throw new Error("Crypto API is only available in the browser")
  }

  const dec = new TextDecoder()
  const salt = new Uint8Array(base64ToArrayBuffer(saltStr))
  const iv = new Uint8Array(base64ToArrayBuffer(ivStr))
  const encrypted = base64ToArrayBuffer(ciphertext)

  const key = await deriveKey(password, salt, iterations)

  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encrypted
  )

  return dec.decode(decrypted)
}

export async function encryptVault(
  plaintext: string,
  password: string
): Promise<VaultEnvelope> {
  const { ciphertext, salt, iv, iterations } = await encryptData(plaintext, password)
  return { version: 1, iterations, salt, iv, ciphertext }
}

export async function decryptVault(
  envelope: VaultEnvelope,
  password: string
): Promise<string> {
  return decryptData(
    envelope.ciphertext,
    password,
    envelope.salt,
    envelope.iv,
    envelope.iterations
  )
}
