"use client"

import { useEffect, useState } from "react"
import jsPDF from "jspdf"

import {
  FileText,
  Download,
  Loader2
} from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"

import { Button } from "@/components/ui/button"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"

import { supabase } from "@/lib/supabaseClient"



export default function ReportsPage() {

  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)


  useEffect(() => {

    fetchReports()

    const channel = supabase
      .channel("reports-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reports"
        },
        fetchReports
      )
      .subscribe()

    return () => supabase.removeChannel(channel)

  }, [])


  async function fetchReports() {

    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false })

    if (!error && data) setReports(data)

    setLoading(false)
  }



  // ✅ UPDATED GENERATE FUNCTION
  async function generateReport() {

    setGenerating(true)

    try {

      const doc = new jsPDF()
      const date = new Date().toLocaleString()

      // ===== WASTE DATA =====
      const { data: bins, error: binError } = await supabase
        .from("smart_bins")
        .select("*")

      if (binError || !bins) throw new Error("Failed to fetch bins")

      const total = bins.length
      const critical = bins.filter(b => b.status === "Critical").length
      const full = bins.filter(b => b.status === "Full" || b.status === "Critical").length
      const empty = bins.filter(b => b.status === "Empty").length

      // ✅ NEW CALCULATIONS
      const avgTemp =
        bins.reduce((sum, b) => sum + (b.temperature || 0), 0) / bins.length

      const avgGas =
        bins.reduce((sum, b) => sum + (b.gas_level || 0), 0) / bins.length

      const avgWeight =
        bins.reduce((sum, b) => sum + (b.weight || 0), 0) / bins.length


      // ===== AIR DATA =====
      const { data: airData, error: airError } = await supabase
        .from("air_quality")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)

      if (airError || !airData || airData.length === 0) {
        throw new Error("No air data found")
      }

      const air = airData[0]

      // ===== PDF =====
      doc.setFontSize(18)
      doc.text("Daily Report", 20, 20)

      doc.setFontSize(12)
      doc.text(`Generated: ${date}`, 20, 35)

      // Waste Section
      doc.text("Waste Data:", 20, 50)
      doc.text(`Total Bins: ${total}`, 20, 60)
      doc.text(`Critical: ${critical}`, 20, 70)
      doc.text(`Full: ${full}`, 20, 80)
      doc.text(`Empty: ${empty}`, 20, 90)

      doc.text(`Avg Temperature: ${avgTemp.toFixed(2)} °C`, 20, 100)
      doc.text(`Avg Gas Level: ${avgGas.toFixed(2)}`, 20, 110)
      doc.text(`Avg Weight: ${avgWeight.toFixed(2)} kg`, 20, 120)

      // Air Section (shifted down)
      doc.text("Air Quality Data:", 20, 140)
      doc.text(`AQI: ${air.aqi}`, 20, 150)
      doc.text(`PM2.5: ${air.pm25}`, 20, 160)
      doc.text(`PM10: ${air.pm10}`, 20, 170)
      doc.text(`CO: ${air.co}`, 20, 180)
      doc.text(`NO2: ${air.no2}`, 20, 190)
      doc.text(`SO2: ${air.so2}`, 20, 200)

      // ===== UPLOAD =====
      const blob = doc.output("blob")
      const fileName = `combined-report-${Date.now()}.pdf`

      const { error: uploadError } = await supabase.storage
        .from("reports")
        .upload(fileName, blob, {
          contentType: "application/pdf",
          upsert: true
        })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from("reports")
        .getPublicUrl(fileName)

      const fileUrl = urlData.publicUrl

      // ===== SAVE TO DB =====
      const { error: insertError } = await supabase
        .from("reports")
        .insert({
          report_name: "City Report",
          status: "Generated",
          file_url: fileUrl
        })

      if (insertError) throw insertError

    }
    catch (err) {
      console.error(err)
      alert(err.message || "Report generation failed")
    }

    setGenerating(false)
  }



  function downloadReport(url) {
    if (!url) {
      alert("File not available")
      return
    }
    window.open(url, "_blank")
  }



  return (

    <div className="flex flex-col gap-6">

      <Card>

        <CardHeader className="flex flex-row justify-between">

          <CardTitle>
            Reports
          </CardTitle>

          <div className="flex gap-2">

            <Button
              size="sm"
              onClick={generateReport}
              disabled={generating}
            >

              {generating
                ? <Loader2 className="size-4 animate-spin"/>
                : <FileText className="size-4"/>
              }

              Generate Report

            </Button>

          </div>

        </CardHeader>



        <CardContent>

          {loading
            ? "Loading..."
            : (

              <Table>

                <TableHeader>

                  <TableRow>

                    <TableHead>Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Download</TableHead>

                  </TableRow>

                </TableHeader>



                <TableBody>

                  {reports.map(report => (

                    <TableRow key={report.id}>

                      <TableCell>
                        {report.report_name}
                      </TableCell>

                      <TableCell>
                        {new Date(report.created_at).toLocaleString()}
                      </TableCell>

                      <TableCell>
                        <Badge className="bg-green-600 text-white">
                          {report.status}
                        </Badge>
                      </TableCell>

                      <TableCell>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            downloadReport(report.file_url)
                          }
                        >

                          <Download className="size-4"/>

                        </Button>

                      </TableCell>

                    </TableRow>

                  ))}

                </TableBody>

              </Table>

            )
          }

        </CardContent>

      </Card>

    </div>

  )
}