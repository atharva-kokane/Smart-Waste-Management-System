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
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"



function StatusBadge({ status }) {
  const styles = {
    Critical: "bg-destructive text-destructive-foreground",
    Full: "bg-[var(--warning)] text-foreground",
    Medium: "bg-primary text-primary-foreground",
    Empty: "bg-accent text-accent-foreground",
  }
  return (
    <Badge className={`text-[10px] ${styles[status] || ""}`}>
      {status}
    </Badge>
  )
}



export function WasteBinTable() {

  const [bins, setBins] = useState([])
  const [open, setOpen] = useState(false)
  const [selectedBin, setSelectedBin] = useState(null)

  useEffect(() => {

    fetchBins()

    const channel = supabase
      .channel("smart_bins_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "smart_bins",
        },
        () => fetchBins()
      )
      .subscribe()

    return () => supabase.removeChannel(channel)

  }, [])



  async function fetchBins() {
    const { data } = await supabase
      .from("smart_bins")
      .select("*")
      .order("bin_id")

    if (data) {
      setBins(data)

      // ✅ IMPORTANT FIX → update modal data also
      if (selectedBin) {
        const updated = data.find(b => b.bin_id === selectedBin.bin_id)
        if (updated) {
          setSelectedBin(updated)
        }
      }
    }
  }



  function handleView(bin) {
    setSelectedBin(bin)
    setOpen(true)
  }



  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            Smart Bin Status
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Table>

            <TableHeader>
              <TableRow>
                <TableHead>Bin ID</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Fill Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Live</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {bins.map((bin) => (
                <TableRow key={bin.bin_id}>
                  <TableCell>{bin.bin_id}</TableCell>
                  <TableCell>{bin.location}</TableCell>
                  <TableCell>{bin.fill_level}%</TableCell>

                  <TableCell>
                    <StatusBadge status={bin.status} />
                  </TableCell>

                  <TableCell>
                    {new Date(bin.last_updated).toLocaleTimeString()}
                  </TableCell>

                  <TableCell>
                    {bin.bin_id === "BIN-001" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(bin)}
                      >
                        <Eye className="size-4 mr-1" />
                        View
                      </Button>
                    )}
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>

          </Table>
        </CardContent>
      </Card>



      {/* MODAL */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">

          <DialogHeader>
            <DialogTitle>
              Live View - {selectedBin?.bin_id}
            </DialogTitle>
          </DialogHeader>

          {/* CAMERA */}
          <div className="w-full h-[300px] bg-black rounded overflow-hidden">
            {selectedBin && (
              <img
                src={`http://YOUR_ESP32_IP/stream`}
                alt="camera"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* LIVE SENSOR DATA */}
          {selectedBin && (
            <div className="grid grid-cols-3 gap-4 mt-4 text-center">

              <div className="p-3 rounded bg-muted">
                <p className="text-xs">Gas Level</p>
                <p className="text-lg font-semibold">
                  {selectedBin.gas_level}
                </p>
              </div>

              <div className="p-3 rounded bg-muted">
                <p className="text-xs">Temperature</p>
                <p className="text-lg font-semibold">
                  {selectedBin.temperature} °C
                </p>
              </div>

              <div className="p-3 rounded bg-muted">
                <p className="text-xs">Weight</p>
                <p className="text-lg font-semibold">
                  {selectedBin.weight}
                </p>
              </div>

            </div>
          )}

        </DialogContent>
      </Dialog>
    </>
  )
}