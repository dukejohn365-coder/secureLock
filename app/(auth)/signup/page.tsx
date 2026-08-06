import type { Metadata } from "next"
import { SignupForm } from "@/components/signup-form"

export const metadata: Metadata = {
  title: "Create Account — SecureLock",
  description: "Set up your zero-knowledge master password vault",
}

export default function SignupPage() {
  return <SignupForm />
}
