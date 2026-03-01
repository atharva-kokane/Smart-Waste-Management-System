"use client"

import { useEffect, useState } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

import { supabase } from "@/lib/supabaseClient"


export function AqiTrendChart() {

  const [aqiTrendData, setAqiTrendData] = useState([])


  useEffect(() => {

    fetchAqiHistory()

    // realtime updates
    const channel = supabase
      .channel("aqi_trend_chart")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "air_quality" },
        fetchAqiHistory
      )
      .subscribe()

    return () => supabase.removeChannel(channel)

  }, [])


  async function fetchAqiHistory() {

    const { data, error } = await supabase
      .from("air_quality")
      .select("aqi, updated_at")
      .gte(
        "updated_at",
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      )
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
    <Card>

      <CardHeader>

        <CardTitle className="text-sm font-semibold">
          AQI Trend (24 Hours)
        </CardTitle>

        <CardDescription>
          Air Quality Index with threshold markers
        </CardDescription>

      </CardHeader>


      <CardContent>

        <div className="h-[300px]">

          <ResponsiveContainer width="100%" height="100%">

            <AreaChart data={aqiTrendData}>

              <defs>
                <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0}/>
                </linearGradient>
              </defs>


              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
              />


              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                tickLine={false}
                axisLine={false}
              />


              <YAxis
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                domain={[0, 150]}
              />


              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />


              <ReferenceLine
                y={50}
                stroke="#16A34A"
                strokeDasharray="3 3"
                label={{
                  value: "Good",
                  position: "right",
                  fontSize: 10,
                  fill: "#16A34A",
                }}
              />


              <ReferenceLine
                y={100}
                stroke="#F59E0B"
                strokeDasharray="3 3"
                label={{
                  value: "Moderate",
                  position: "right",
                  fontSize: 10,
                  fill: "#F59E0B",
                }}
              />


              <Area
                type="monotone"
                dataKey="aqi"
                stroke="var(--color-chart-1)"
                strokeWidth={2}
                fill="url(#aqiGradient)"
                dot={{ fill: "var(--color-chart-1)", r: 3 }}
                activeDot={{ r: 5 }}
              />


            </AreaChart>

          </ResponsiveContainer>

        </div>

      </CardContent>

    </Card>
  )
}