"use client"

import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import { Moon, Sun, Search, Bell, LogOut } from "lucide-react"
import { useTheme } from "next-themes"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { authClient } from "@/lib/auth-client"

const ROUTE_LABELS: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/vault": "All Passwords",
  "/dashboard/generator": "Generator",
  "/dashboard/audit": "Security Audit",
  "/dashboard/settings": "Settings",
}

export function DashboardHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()

  const label = ROUTE_LABELS[pathname] ?? "Dashboard"

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push("/login")
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/50 px-4 backdrop-blur-sm bg-background/80 sticky top-0 z-30">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-4 mx-1" />

      {/* Breadcrumb */}
      <Breadcrumb className="flex-1">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard" className="text-muted-foreground hover:text-foreground">
              SecureLock
            </BreadcrumbLink>
          </BreadcrumbItem>
          {label !== "Overview" && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{label}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Search"
          id="header-search-btn"
        >
          <Search className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Notifications"
          id="header-notifications-btn"
        >
          <Bell className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Toggle theme"
          id="header-theme-toggle"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
        <Separator orientation="vertical" className="h-4 mx-1" />
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Sign out"
          id="header-signout-btn"
          onClick={handleSignOut}
          className="text-muted-foreground hover:text-red-500"
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  )
}
