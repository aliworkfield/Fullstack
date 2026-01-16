import { Briefcase, Users, Megaphone, Ticket } from "lucide-react"
import { useMemo } from "react"
import { useTranslation } from 'react-i18next'

import { SidebarAppearance } from "@/components/Common/Appearance"
import { LanguageSelector } from "@/components/Common/LanguageSelector"
import { Logo } from "@/components/Common/Logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import useAuth from "@/hooks/useAuth"
import useRoles from "@/hooks/useRoles"
import { type Item, Main } from "./Main"
import { User } from "./User"
import keycloak from "@/keycloak"

const baseItems: Item[] = [
  { icon: Megaphone, title: "announcements", path: "/announcements" },
]

const adminItems: Item[] = [
  { icon: Briefcase, title: "campaigns", path: "/campaigns" },
  { icon: Ticket, title: "coupons", path: "/coupons" },
  { icon: Users, title: "admin_panel", path: "/admin" },
]

const couponManagerItems: Item[] = [
  { icon: Briefcase, title: "campaigns", path: "/campaigns" },
  { icon: Ticket, title: "coupons", path: "/coupons" },
  // Removed duplicate Coupons entry
]

export function AppSidebar() {
  const { user: currentUser } = useAuth()
  const { hasRole } = useRoles()
  
  // Memoize the items calculation to prevent unnecessary re-renders
  const items = useMemo(() => {
    if (!keycloak.token) return baseItems
    
    const isAdmin = hasRole("admin")
    const isManager = hasRole("manager")
    
    let updatedItems = [...baseItems]
    
    if (isAdmin) {
      updatedItems = [...updatedItems, ...adminItems]
    }
    
    if (isManager) {
      updatedItems = [...updatedItems, ...couponManagerItems]
    }
    
    return updatedItems
  }, [hasRole, keycloak.token])

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-6 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center">
        <Logo variant="responsive" />
      </SidebarHeader>
      <SidebarContent>
        <Main items={items} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarAppearance />
        <LanguageSelector />
        <User user={currentUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export default AppSidebar