"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { TopHeader } from "@/components/top-navbar"
import Image from "next/image"

import {
  LayoutDashboard,
  Trash2,
  Wind,
  BrainCircuit,
  Workflow,
  Bell,
  FileText,
  Shield,
} from "lucide-react"


import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarFooter,
} from "@/components/ui/sidebar"

const navItems = [
  { title: "Dashboard Overview", href: "/dashboard", icon: LayoutDashboard },
  { title: "Waste Management", href: "/waste", icon: Trash2 },
  { title: "Air Pollution", href: "/pollution", icon: Wind },
  { title: "AI Analytics", href: "/analytics", icon: BrainCircuit },
  { title: "n8n Automation", href: "/automation", icon: Workflow },
  { title: "Alerts & Notifications", href: "/alerts", icon: Bell },
  { title: "Reports", href: "/reports", icon: FileText },
]

export function DashboardShell({ children }) {

  const pathname = usePathname()

  return (

    <SidebarProvider>

      <Sidebar collapsible="icon">

        {/* Sidebar Header */}
        <SidebarHeader className="p-4">

          <Link href="/dashboard" className="flex items-center gap-3">

            <div className="flex items-center justify-center">
  <Image
    src="/logo.png"
    alt="Urban Pulse Logo"
    width={32}
    height={32}
    className="rounded-md"
  />
</div>

            <div className="flex flex-col group-data-[collapsible=icon]:hidden">

              <span className="text-sm font-semibold">
                Urban Pulse
              </span>

              <span className="text-xs opacity-60">
               
              </span>

            </div>

          </Link>

        </SidebarHeader>

        {/* Sidebar Content */}
        <SidebarContent>

          <SidebarGroup>

            <SidebarGroupLabel className="uppercase text-xs opacity-60">
              Navigation
            </SidebarGroupLabel>

            <SidebarGroupContent>

              <SidebarMenu>

                {navItems.map((item) => (

                  <SidebarMenuItem key={item.href}>

                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                    >

                      <Link href={item.href}>

                        <item.icon className="size-4" />

                        <span>{item.title}</span>

                      </Link>

                    </SidebarMenuButton>

                  </SidebarMenuItem>

                ))}

              </SidebarMenu>

            </SidebarGroupContent>

          </SidebarGroup>

        </SidebarContent>

        {/* Sidebar Footer */}
        <SidebarFooter>

          <div className="p-3 text-xs opacity-60">

            System Online

          </div>

        </SidebarFooter>

      </Sidebar>

      {/* Main Content */}
      <SidebarInset>

        {/* Top Header */}
        <TopHeader />

        {/* Page Content */}
        <div className="flex flex-1 flex-col overflow-auto p-4 md:p-6">

          {children}

        </div>

      </SidebarInset>

    </SidebarProvider>

  )

}