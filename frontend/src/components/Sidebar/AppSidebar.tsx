import { Briefcase, Home, Users } from "lucide-react"
import { useMemo } from "react"

import { SidebarAppearance } from "@/components/Common/Appearance"
import { Logo } from "@/components/Common/Logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import useAuth from "@/hooks/useAuth"
import useRoles from "@/hooks/useRoles"
import { type Item, Main } from "./Main"
import { User } from "./User"
import keycloak from "@/keycloak"

const baseItems: Item[] = [
  { icon: Home, title: "Dashboard", path: "/" },
  { icon: Briefcase, title: "Items", path: "/items" },

  { icon: Briefcase, title: "Coupons", path: "/coupons" },
  { icon: Briefcase, title: "Announcements", path: "/announcements" },
]

const adminItems: Item[] = [
  { icon: Briefcase, title: "YOU ARE ADMIN/MANAGER", path: "" },
  { icon: Users, title: "Admin Panel", path: "/admin" },
]

const couponManagerItems: Item[] = [
  { icon: Briefcase, title: "YOU ARE MANAGER", path: "" },
  { icon: Briefcase, title: "Campaigns", path: "/campaigns" },
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
    
    if (isAdmin || isManager) {
      updatedItems = [...updatedItems, ...adminItems]
    }
    
    if (isManager || isAdmin) {
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
        <User user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar