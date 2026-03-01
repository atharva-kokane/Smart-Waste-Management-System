"use client"

import { useEffect, useState } from "react"

import { supabase } from "@/lib/supabaseClient"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Badge } from "@/components/ui/badge"



function StatusBadge({ status }) {

  const styles = {
    Good: "bg-accent text-accent-foreground",
    Moderate: "bg-[var(--warning)] text-foreground",
    Poor: "bg-destructive text-destructive-foreground",
  }

  return (
    <Badge className={`text-[10px] ${styles[status] || ""}`}>
      {status}
    </Badge>
  )

}



export function AreaPollutionTable() {

  const [areaPollutionData, setAreaPollutionData] = useState([])



  useEffect(() => {

    fetchAreaData()

    // realtime updates
    const channel = supabase
      .channel("area_pollution_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "area_pollution" },
        fetchAreaData
      )
      .subscribe()

    return () => supabase.removeChannel(channel)

  }, [])



  async function fetchAreaData() {

    const { data, error } = await supabase
      .from("area_pollution")
      .select("*")
      .order("aqi", { ascending: false })

    if (!error && data) {
      setAreaPollutionData(data)
    }

  }



  return (

    <Card>

      <CardHeader>
        <CardTitle className="text-sm font-semibold">
          Area-wise Pollution Data
        </CardTitle>
      </CardHeader>


      <CardContent>

        <Table>

          <TableHeader>

            <TableRow>
              <TableHead>Area</TableHead>
              <TableHead>AQI</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>PM2.5 (ug/m3)</TableHead>
              <TableHead>PM10 (ug/m3)</TableHead>
            </TableRow>

          </TableHeader>


          <TableBody>

            {areaPollutionData.map((area) => (

              <TableRow key={area.id}>

                <TableCell className="font-medium text-foreground">
                  {area.area}
                </TableCell>


                <TableCell>

                  <span
                    className={`font-semibold ${
                      area.aqi > 100
                        ? "text-destructive"
                        : area.aqi > 50
                        ? "text-[var(--warning)]"
                        : "text-accent"
                    }`}
                  >
                    {area.aqi}
                  </span>

                </TableCell>


                <TableCell>

                  <StatusBadge status={area.status} />

                </TableCell>


                <TableCell className="text-muted-foreground">
                  {area.pm25}
                </TableCell>


                <TableCell className="text-muted-foreground">
                  {area.pm10}
                </TableCell>


              </TableRow>

            ))}

          </TableBody>

        </Table>

      </CardContent>

    </Card>

  )

}