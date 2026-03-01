"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabaseClient"

function getStatus(value, limit) {
  const ratio = (value / limit) * 100

  if (ratio <= 50) return "Good"
  if (ratio <= 100) return "Moderate"
  return "Poor"
}

function getStatusStyle(status) {
  switch (status) {
    case "Good":
      return { badge: "bg-accent text-accent-foreground", bar: "bg-accent" }
    case "Moderate":
      return { badge: "bg-[var(--warning)] text-foreground", bar: "bg-[var(--warning)]" }
    case "Poor":
      return { badge: "bg-destructive text-destructive-foreground", bar: "bg-destructive" }
    default:
      return { badge: "bg-muted text-muted-foreground", bar: "bg-muted-foreground" }
  }
}

export function PollutantCards() {

  const [pollutants, setPollutants] = useState([])

  useEffect(() => {

    fetchPollutants()

    // realtime updates
    const channel = supabase
      .channel("air_quality_pollutants")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "air_quality" },
        fetchPollutants
      )
      .subscribe()

    return () => supabase.removeChannel(channel)

  }, [])

  async function fetchPollutants() {

    const { data, error } = await supabase
      .from("air_quality")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error || !data) return

    const pollutantData = [

      {
        name: "PM2.5",
        value: data.pm25,
        limit: data.pm25_limit,
        unit: "µg/m³"
      },

      {
        name: "PM10",
        value: data.pm10,
        limit: data.pm10_limit,
        unit: "µg/m³"
      },

      {
        name: "CO",
        value: data.co,
        limit: data.co_limit,
        unit: "mg/m³"
      },

      {
        name: "NO2",
        value: data.no2,
        limit: data.no2_limit,
        unit: "µg/m³"
      },

      {
        name: "SO2",
        value: data.so2,
        limit: data.so2_limit,
        unit: "µg/m³"
      },

    ]

    setPollutants(pollutantData)

  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">

      {pollutants.map((p) => {

        const status = getStatus(p.value, p.limit)
        const style = getStatusStyle(status)
        const percentage = (p.value / p.limit) * 100

        return (

          <Card key={p.name} className="gap-0 py-3">

            <CardContent className="flex flex-col gap-2">

              <div className="flex items-center justify-between">

                <span className="text-xs font-semibold">
                  {p.name}
                </span>

                <Badge className={`text-[9px] px-1.5 py-0 ${style.badge}`}>
                  {status}
                </Badge>

              </div>

              <div className="flex items-baseline gap-1">

                <span className="text-2xl font-bold">
                  {p.value}
                </span>

                <span className="text-[10px] text-muted-foreground">
                  {p.unit}
                </span>

              </div>

              <div className="flex flex-col gap-1">

                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">

                  <div
                    className={`h-full rounded-full ${style.bar}`}
                    style={{
                      width: `${Math.min(percentage, 100)}%`
                    }}
                  />

                </div>

                <span className="text-[9px] text-muted-foreground">
                  Limit: {p.limit} {p.unit}
                </span>

              </div>

            </CardContent>

          </Card>

        )

      })}

    </div>
  )
}