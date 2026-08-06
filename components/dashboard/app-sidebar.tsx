"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useQuery } from "convex/react"
import {
  KeyRound,
  LayoutDashboard,
  Star,
  Clock,
  Briefcase,
  ShoppingCart,
  Banknote,
  Globe,
  Gamepad2,
  Mail,
  Wand2,
  ShieldCheck,
  Settings,
  Lock,
  ChevronRight,
  Folders,
  LogOut,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { api } from "@/convex/_generated/api"
import { authClient } from "@/lib/auth-client"

const navMain = [
  {
    label: "Vault",
    items: [
      { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { title: "All Passwords", href: "/dashboard/vault", icon: KeyRound },
      { title: "Favorites", href: "/dashboard/vault?filter=favorites", icon: Star },
      { title: "Recently Used", href: "/dashboard/vault?filter=recent", icon: Clock },
    ],
  },
  {
    label: "Categories",
    items: [
      { title: "Work", href: "/dashboard/vault?category=work", icon: Briefcase },
      { title: "Finance", href: "/dashboard/vault?category=finance", icon: Banknote },
      { title: "Social", href: "/dashboard/vault?category=social", icon: Globe },
      { title: "Shopping", href: "/dashboard/vault?category=shopping", icon: ShoppingCart },
      { title: "Gaming", href: "/dashboard/vault?category=gaming", icon: Gamepad2 },
      { title: "Email", href: "/dashboard/vault?category=email", icon: Mail },
      { title: "Other", href: "/dashboard/vault?category=other", icon: Folders },
    ],
  },
  {
    label: "Tools",
    items: [
      { title: "Generator", href: "/dashboard/generator", icon: Wand2 },
      { title: "Security Audit", href: "/dashboard/audit", icon: ShieldCheck },
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const user = useQuery(api.auth.getCurrentUser)

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?"

  const userName = user?.name || "Guest"
  const userEmail = user?.email || ""
  const handleSignOut = async () => {
    await authClient.signOut()
    router.push("/login")
  }

  return (
    <Sidebar collapsible="icon">
      {/* Header / Brand */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<div />}
              className="pointer-events-none"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <Lock className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold text-sm">SecureLock</span>
                <span className="text-[10px] text-muted-foreground">Secure Password Manager</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      {/* Navigation */}
      <SidebarContent>
        {navMain.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href.split("?")[0]))
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        render={<Link href={item.href} />}
                        isActive={isActive}
                        tooltip={item.title}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                        {isActive && (
                          <ChevronRight className="ml-auto size-3 opacity-60" />
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarSeparator />

      {/* Footer / User */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/dashboard/settings" />}
              tooltip="Settings"
            >
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut} tooltip="Sign Out">
              <LogOut />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<div />} className="pointer-events-none">
              <Avatar className="size-8 rounded-lg">
                <AvatarFallback className="rounded-lg text-xs">{userInitials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{userName}</span>
                <span className="truncate text-xs text-muted-foreground">{userEmail}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
