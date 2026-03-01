"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from "@/lib/supabaseClient"

function getAqiInfo(aqi) {
  if (aqi <= 50) return { label: "Good", color: "#16A34A", bg: "bg-accent/10" }
  if (aqi <= 100) return { label: "Moderate", color: "#F59E0B", bg: "bg-[var(--warning)]/10" }
  if (aqi <= 150) return { label: "Unhealthy (SG)", color: "#F97316", bg: "bg-orange-50" }
  if (aqi <= 200) return { label: "Unhealthy", color: "#DC2626", bg: "bg-destructive/10" }
  return { label: "Very Unhealthy", color: "#7C3AED", bg: "bg-purple-50" }
}

export function AqiDisplay() {

  const [aqi, setAqi] = useState(0)
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {

    fetchAqi()

    // realtime updates
    const channel = supabase
      .channel("air_quality_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "air_quality" },
        fetchAqi
      )
      .subscribe()

    return () => supabase.removeChannel(channel)

  }, [])

  async function fetchAqi() {

    const { data, error } = await supabase
      .from("air_quality")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (!error && data) {
      setAqi(data.aqi)
      setLastUpdated(data.created_at)
    }

  }

  function timeAgo(timestamp) {

    if (!timestamp) return ""

    const diff = Math.floor((Date.now() - new Date(timestamp)) / 1000)

    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff/60)} min ago`
    if (diff < 86400) return `${Math.floor(diff/3600)} hr ago`

    return `${Math.floor(diff/86400)} day ago`
  }

  const info = getAqiInfo(aqi)

  return (
    <Card className={`${info.bg} border-2`} style={{ borderColor: info.color }}>

      <CardContent className="flex flex-col items-center justify-center py-8">

        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Current AQI
        </p>

        <div
          className="flex size-28 items-center justify-center rounded-full ring-4"
          style={{
            backgroundColor: `${info.color}15`,
            boxShadow: `0 0 0 4px ${info.color}30`,
          }}
        >

          <span className="text-4xl font-bold" style={{ color: info.color }}>
            {aqi}
          </span>

        </div>

        <div className="mt-4 flex flex-col items-center gap-1">

          <span
            className="rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              backgroundColor: `${info.color}20`,
              color: info.color
            }}
          >
            {info.label}
          </span>

          <p className="text-[10px] text-muted-foreground mt-1">
            Updated {timeAgo(lastUpdated)}
          </p>

        </div>

        {/* AQI scale */}
        <div className="mt-4 w-full">

          <div className="flex justify-between text-[9px] text-muted-foreground mb-1">
            <span>0</span>
            <span>50</span>
            <span>100</span>
            <span>150</span>
            <span>200</span>
            <span>300</span>
          </div>

          <div className="flex h-2 w-full overflow-hidden rounded-full">
            <div className="flex-1 bg-accent"/>
            <div className="flex-1 bg-[var(--warning)]"/>
            <div className="flex-1 bg-orange-400"/>
            <div className="flex-1 bg-destructive"/>
            <div className="flex-1 bg-purple-500"/>
          </div>

          <div
            className="relative -mt-4 size-3 rounded-full border-2 border-card"
            style={{
              backgroundColor: info.color,
              marginLeft: `${Math.min((aqi / 300) * 100, 100)}%`,
              transform: "translateX(-50%)"
            }}
          />

        </div>

      </CardContent>

    </Card>
  )
}