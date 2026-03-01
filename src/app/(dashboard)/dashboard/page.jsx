"use client"

import { SummaryCards } from "@/components/summary-cards"
import { OverviewCharts } from "@/components/overview-charts"
import { RecentAlerts } from "@/components/recent-alerts"
import { QuickStatus } from "@/components/quick-status"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">

      <div>
        <h1 className="text-xl font-bold">
          Dashboard Overview
        </h1>

        <p className="text-sm text-muted-foreground">
          Real-time monitoring of city infrastructure and environmental metrics
        </p>
      </div>

      <SummaryCards />

      <OverviewCharts />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecentAlerts />
        <QuickStatus />
      </div>


    </div>
  )
}