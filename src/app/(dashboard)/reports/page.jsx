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

    // realtime (optional backup)
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



  // ✅ FIXED GENERATE FUNCTION (INSTANT UPDATE)
  async function generateReport() {

    setGenerating(true)

    try {

      const doc = new jsPDF()
      const date = new Date().toLocaleString()

      // ===== FETCH BIN DATA =====
      const { data: bins } = await supabase
        .from("smart_bins")
        .select("*")

      const total = bins.length
      const critical = bins.filter(b => b.status === "Critical").length
      const full = bins.filter(b => b.status === "Full" || b.status === "Critical").length
      const empty = bins.filter(b => b.status === "Empty").length

      const avgTemp = bins.reduce((s, b) => s + (b.temperature || 0), 0) / bins.length
      const avgGas = bins.reduce((s, b) => s + (b.gas_level || 0), 0) / bins.length
      const avgWeight = bins.reduce((s, b) => s + (b.weight || 0), 0) / bins.length

      // ===== FETCH AIR DATA =====
      const { data: airData } = await supabase
        .from("air_quality")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)

      const air = airData[0]

      // ===== PDF CONTENT =====
      doc.setFontSize(16)
      doc.text("City Report", 20, 20)

      doc.setFontSize(12)
      doc.text(`Generated: ${date}`, 20, 30)

      doc.text(`Total Bins: ${total}`, 20, 50)
      doc.text(`Critical: ${critical}`, 20, 60)
      doc.text(`Full: ${full}`, 20, 70)
      doc.text(`Empty: ${empty}`, 20, 80)

      doc.text(`Avg Temp: ${avgTemp.toFixed(2)} °C`, 20, 90)
      doc.text(`Avg Gas: ${avgGas.toFixed(2)}`, 20, 100)
      doc.text(`Avg Weight: ${avgWeight.toFixed(2)} kg`, 20, 110)

      doc.text(`AQI: ${air.aqi}`, 20, 130)

      // ===== UPLOAD PDF =====
      const blob = doc.output("blob")
      const fileName = `report-${Date.now()}.pdf`

      await supabase.storage
        .from("reports")
        .upload(fileName, blob, {
          contentType: "application/pdf",
          upsert: true
        })

      const { data: urlData } = supabase.storage
        .from("reports")
        .getPublicUrl(fileName)

      const fileUrl = urlData.publicUrl

      // ===== INSERT INTO DB =====
      const { data: inserted } = await supabase
        .from("reports")
        .insert({
          report_name: "City Report",
          status: "Generated",
          file_url: fileUrl
        })
        .select()

      // ✅ INSTANT UI UPDATE (NO REFRESH)
      if (inserted && inserted.length > 0) {
        setReports(prev => [inserted[0], ...prev])
      }

    } catch (err) {
      console.error(err)
      alert("Report generation failed")
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

                  {reports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No Reports
                      </TableCell>
                    </TableRow>
                  ) : (

                    reports.map(report => (

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

                    ))

                  )}

                </TableBody>

              </Table>

            )
          }

        </CardContent>

      </Card>

    </div>
  )
}