"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { DashboardShell } from "@/components/dashboard-shell"

export default function DashboardLayout({ children }) {

  const router = useRouter()
  const [loading, setLoading] = useState(true)

  
  useEffect(() => {

    async function checkUser() {

      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push("/login")
      } else {
        setLoading(false)
      }

    }

    checkUser()

  }, [])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading Smart City Dashboard...
      </div>
    )
  }

  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  )

}