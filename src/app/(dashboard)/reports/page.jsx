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

    const { data } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false })

    if (data) setReports(data)

    setLoading(false)

  }



  // =====================
  // WASTE REPORT
  // =====================

  async function generateWasteReport() {

    setGenerating(true)

    try {

      const doc = new jsPDF()

      const date = new Date().toLocaleString()

      const { data: bins } = await supabase
        .from("smart_bins")
        .select("*")

      const total = bins.length

      const critical =
        bins.filter(b => b.status === "Critical").length

      const full =
        bins.filter(b =>
          b.status === "Full" ||
          b.status === "Critical"
        ).length

      const empty =
        bins.filter(b => b.status === "Empty").length


      doc.setFontSize(18)
      doc.text("Smart City Waste Report", 20, 20)

      doc.setFontSize(12)
      doc.text(`Generated: ${date}`, 20, 40)

      doc.text(`Total Bins: ${total}`, 20, 60)
      doc.text(`Critical Bins: ${critical}`, 20, 70)
      doc.text(`Full Bins: ${full}`, 20, 80)
      doc.text(`Empty Bins: ${empty}`, 20, 90)


      const blob = doc.output("blob")

      const fileName =
        `waste-report-${Date.now()}.pdf`


      // upload
      const { error } =
        await supabase.storage
          .from("reports")
          .upload(fileName, blob, {
            contentType: "application/pdf",
            upsert: true
          })

      if (error) throw error


      // get public URL
      const { data } =
        supabase.storage
          .from("reports")
          .getPublicUrl(fileName)


      const fileUrl = data.publicUrl


      // save to DB
      await supabase
        .from("reports")
        .insert({

          report_name: "Waste Report",

          report_type: "Waste",

          status: "Generated",

          file_url: fileUrl

        })

    }
    catch (err) {

      console.error(err)

      alert("Waste report failed")

    }

    setGenerating(false)

  }



  // =====================
  // AIR REPORT
  // =====================

  async function generateAirReport() {

    setGenerating(true)

    try {

      const doc = new jsPDF()

      const date = new Date().toLocaleString()

      const { data } =
        await supabase
          .from("air_quality")
          .select("*")
          .order("updated_at", { ascending: false })
          .limit(1)

      const air = data[0]


      doc.setFontSize(18)
      doc.text("Smart City Air Quality Report", 20, 20)

      doc.setFontSize(12)
      doc.text(`Generated: ${date}`, 20, 40)

      doc.text(`AQI: ${air.aqi}`, 20, 60)
      doc.text(`PM2.5: ${air.pm25}`, 20, 70)
      doc.text(`PM10: ${air.pm10}`, 20, 80)
      doc.text(`CO: ${air.co}`, 20, 90)
      doc.text(`NO2: ${air.no2}`, 20, 100)
      doc.text(`SO2: ${air.so2}`, 20, 110)


      const blob = doc.output("blob")

      const fileName =
        `air-report-${Date.now()}.pdf`


      const { error } =
        await supabase.storage
          .from("reports")
          .upload(fileName, blob, {
            contentType: "application/pdf",
            upsert: true
          })

      if (error) throw error


      const { data: urlData } =
        supabase.storage
          .from("reports")
          .getPublicUrl(fileName)


      const fileUrl = urlData.publicUrl


      await supabase
        .from("reports")
        .insert({

          report_name: "Air Quality Report",

          report_type: "Pollution",

          status: "Generated",

          file_url: fileUrl

        })

    }
    catch (err) {

      console.error(err)

      alert("Air report failed")

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
              onClick={generateWasteReport}
              disabled={generating}
            >

              {generating
                ? <Loader2 className="size-4 animate-spin"/>
                : <FileText className="size-4"/>
              }

              Waste Report

            </Button>


            <Button
              size="sm"
              onClick={generateAirReport}
              disabled={generating}
            >

              Air Report

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

                    <TableHead>Type</TableHead>

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
                        <Badge>
                          {report.report_type}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {new Date(
                          report.created_at
                        ).toLocaleString()}
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