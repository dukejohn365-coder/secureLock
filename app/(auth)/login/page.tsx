import type { Metadata } from "next"
import { LoginForm } from "@/components/login-form"

export const metadata: Metadata = {
  title: "Login — SecureLock",
  description: "Sign in to your secure SecureLock credentials vault",
}

export default function LoginPage() {
  return <LoginForm />
}
