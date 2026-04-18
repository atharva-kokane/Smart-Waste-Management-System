"use client"

import { useEffect, useState } from "react"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

import { supabase } from "@/lib/supabaseClient"



export function OverviewCharts() {

  const [aqiTrendData, setAqiTrendData] = useState([])



  useEffect(() => {

    fetchAqiTrend()

    // ✅ AQI REALTIME
    const aqiChannel = supabase
      .channel("public:air_quality")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "air_quality",
        },
        fetchAqiTrend
      )
      .subscribe()

    return () => {
      supabase.removeChannel(aqiChannel)
    }

  }, [])



  // ✅ AQI FETCH
  async function fetchAqiTrend() {

    const { data, error } = await supabase
      .from("air_quality")
      .select("aqi, updated_at")
      .order("updated_at", { ascending: true })

    if (error || !data) return

    const formatted = data.map(row => ({
      time: new Date(row.updated_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      aqi: row.aqi,
    }))

    setAqiTrendData(formatted)
  }



  return (

    <div className="grid grid-cols-1 gap-4">

      {/* ✅ FULL WIDTH AQI GRAPH */}
      <Card>

        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            AQI Trend (24h)
          </CardTitle>

          <CardDescription>
            Air Quality Index over time (Real-Time)
          </CardDescription>
        </CardHeader>

        <CardContent>

          <div className="h-[350px]"> {/* 👈 bigger height */}

            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={aqiTrendData}>

                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="aqi"
                  stroke="#3b82f6"
                  strokeWidth={3}   // 👈 thicker line
                  dot={{ r: 4 }}   // 👈 visible dots
                />

              </LineChart>
            </ResponsiveContainer>

          </div>

        </CardContent>

      </Card>

    </div>
  )
}