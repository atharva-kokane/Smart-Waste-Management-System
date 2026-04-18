"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

const binPositions = [
  { x: 20, y: 25 }, { x: 55, y: 15 }, { x: 40, y: 45 },
  { x: 75, y: 30 }, { x: 30, y: 70 }, { x: 60, y: 55 },
  { x: 85, y: 65 }, { x: 15, y: 50 }, { x: 50, y: 80 },
  { x: 70, y: 75 },
]

const DEPOT = { x: 5, y: 90 }

// How many ms the truck takes to travel between each stop
const SEGMENT_DURATION = 2000

function getPinColor(status, fillLevel) {
  if (status === "Critical" || fillLevel >= 80) return "#DC2626"
  if (status === "Full"     || fillLevel >= 50) return "#F59E0B"
  if (status === "Medium"   || fillLevel >= 20) return "#2563EB"
  return "#16A34A"
}

function getPriority(status, fillLevel) {
  if (status === "Critical" || fillLevel >= 80) return 0
  if (status === "Full"     || fillLevel >= 50) return 1
  if (status === "Medium"   || fillLevel >= 20) return 2
  return 3
}

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function buildRoute(bins, positions) {
  const items = bins
    .map((bin, i) => ({ bin, pos: positions[i] }))
    .filter((item) => item.pos !== undefined)

  const buckets = [[], [], [], []]
  for (const item of items) {
    buckets[getPriority(item.bin.status, item.bin.fill_level)].push(item)
  }

  const route = [{ ...DEPOT }]
  let current = { ...DEPOT }

  for (const bucket of buckets) {
    const remaining = [...bucket]
    while (remaining.length > 0) {
      let nearestIdx = 0
      let nearestDist = Infinity
      for (let i = 0; i < remaining.length; i++) {
        const d = dist(current, remaining[i].pos)
        if (d < nearestDist) { nearestDist = d; nearestIdx = i }
      }
      const next = remaining.splice(nearestIdx, 1)[0]
      route.push({ ...next.pos, bin_id: next.bin.bin_id })
      current = next.pos
    }
  }

  return route
}

function lerp(a, b, t) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

export function WasteMapView() {
  const [bins, setBins] = useState([])
  const [truckPos, setTruckPos] = useState({ x: DEPOT.x, y: DEPOT.y })
  const [truckAngle, setTruckAngle] = useState(0)
  const [currentStop, setCurrentStop] = useState(0)
  const [visitedStops, setVisitedStops] = useState(new Set([0]))
  const [isPaused, setIsPaused] = useState(false)

  const animRef = useRef(null)
  const routeRef = useRef([])
  const segmentRef = useRef({ from: 0, to: 1, startTime: null })
  const pauseRef = useRef(false)

  useEffect(() => {
    fetchBins()
    const channel = supabase
      .channel("map_bins_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "smart_bins" }, fetchBins)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchBins() {
    const { data, error } = await supabase.from("smart_bins").select("*").order("bin_id")
    if (!error && data) setBins(data)
  }

  // Rebuild route and restart animation when bins change
  useEffect(() => {
    const route = buildRoute(bins, binPositions)
    routeRef.current = route
    if (route.length < 2) return

    cancelAnimationFrame(animRef.current)
    segmentRef.current = { from: 0, to: 1, startTime: null }
    setCurrentStop(0)
    setVisitedStops(new Set([0]))
    setTruckPos({ x: route[0].x, y: route[0].y })
    pauseRef.current = false
    setIsPaused(false)
    startAnimation()
  }, [bins])

  function startAnimation() {
    function tick(timestamp) {
      if (pauseRef.current) {
        animRef.current = requestAnimationFrame(tick)
        return
      }

      const route = routeRef.current
      const seg = segmentRef.current

      if (!seg.startTime) seg.startTime = timestamp
      const elapsed = timestamp - seg.startTime
      const t = Math.min(elapsed / SEGMENT_DURATION, 1)
      const eased = easeInOut(t)

      const from = route[seg.from]
      const to   = route[seg.to]
      if (!from || !to) return

      const pos = lerp(from, to, eased)
      setTruckPos(pos)

      const dx = to.x - from.x
      const dy = to.y - from.y
      setTruckAngle(Math.atan2(dy, dx) * (180 / Math.PI))

      if (t >= 1) {
        const arrivedAt = seg.to
        setCurrentStop(arrivedAt)
        setVisitedStops((prev) => new Set([...prev, arrivedAt]))

        if (arrivedAt < route.length - 1) {
          seg.startTime = null
          seg.from = arrivedAt
          seg.to   = arrivedAt + 1
          setTimeout(() => {
            if (!pauseRef.current) {
              segmentRef.current.startTime = null
              animRef.current = requestAnimationFrame(tick)
            }
          }, 600)
          return
        } else {
          // Last stop — loop back
          setTimeout(() => {
            segmentRef.current = { from: 0, to: 1, startTime: null }
            setCurrentStop(0)
            setVisitedStops(new Set([0]))
            setTruckPos({ x: route[0].x, y: route[0].y })
            animRef.current = requestAnimationFrame(tick)
          }, 2000)
          return
        }
      }

      animRef.current = requestAnimationFrame(tick)
    }

    animRef.current = requestAnimationFrame(tick)
  }

  function togglePause() {
    pauseRef.current = !pauseRef.current
    setIsPaused(pauseRef.current)
    if (!pauseRef.current) {
      segmentRef.current.startTime = null
    }
  }

  useEffect(() => {
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  const route = routeRef.current.length > 0 ? routeRef.current : buildRoute(bins, binPositions)
  const polylinePoints   = route.map((p) => `${p.x},${p.y}`).join(" ")
  const visitedPoints    = route.slice(0, currentStop + 1).map((p) => `${p.x},${p.y}`).join(" ")
  const upcomingPoints   = route.slice(currentStop).map((p) => `${p.x},${p.y}`).join(" ")

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold">Bin Locations Map</CardTitle>
        <button
          onClick={togglePause}
          className="rounded border px-2 py-0.5 text-[10px] font-medium bg-card hover:bg-muted transition-colors"
        >
          {isPaused ? "▶ Resume" : "⏸ Pause"}
        </button>
      </CardHeader>

      <CardContent>
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-muted/50 border">

          {/* SVG layer: grid + route lines + truck */}
          <svg
            className="absolute inset-0 size-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <pattern id="grid" width="6.25" height="6.25" patternUnits="userSpaceOnUse">
                <path d="M 6.25 0 L 0 0 0 6.25" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="0.3" />
              </pattern>
              <filter id="truckGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <rect width="100" height="100" fill="url(#grid)" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(0,0,0,0.15)" strokeWidth="0.6" strokeDasharray="2,1.5" />
            <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(0,0,0,0.15)" strokeWidth="0.6" strokeDasharray="2,1.5" />

            {/* Full route ghost */}
            {route.length > 1 && (
              <polyline
                points={polylinePoints}
                fill="none" stroke="#6366f1" strokeWidth="0.4"
                strokeOpacity="0.15" strokeLinejoin="round" strokeLinecap="round"
              />
            )}

            {/* Visited trail — solid green */}
            {currentStop > 0 && visitedPoints.includes(",") && (
              <polyline
                points={visitedPoints}
                fill="none" stroke="#16a34a" strokeWidth="0.7"
                strokeOpacity="0.65" strokeLinejoin="round" strokeLinecap="round"
              />
            )}

            {/* Upcoming — dashed indigo */}
            {upcomingPoints.includes(",") && (
              <polyline
                points={upcomingPoints}
                fill="none" stroke="#6366f1" strokeWidth="0.6"
                strokeOpacity="0.8" strokeDasharray="2,1"
                strokeLinejoin="round" strokeLinecap="round"
              />
            )}

            {/* Direction arrows on upcoming segments */}
            {route.slice(currentStop + 1).map((wp, idx) => {
              const prev = route[currentStop + idx]
              if (!prev) return null
              const dx = wp.x - prev.x
              const dy = wp.y - prev.y
              const mx = (prev.x + wp.x) / 2
              const my = (prev.y + wp.y) / 2
              const angle = Math.atan2(dy, dx) * (180 / Math.PI)
              return (
                <g key={idx} transform={`translate(${mx},${my}) rotate(${angle})`}>
                  <polygon points="-1.2,-0.6 0.8,0 -1.2,0.6" fill="#6366f1" opacity="0.7" />
                </g>
              )
            })}

            {/* ── TRUCK ── */}
            <g
              transform={`translate(${truckPos.x}, ${truckPos.y}) rotate(${truckAngle})`}
              filter="url(#truckGlow)"
            >
              {/* Body */}
              <rect x="-3.5" y="-2" width="7" height="4" rx="0.8" fill="#1e293b" />
              {/* Cab */}
              <rect x="1.5" y="-1.8" width="2.8" height="3.6" rx="0.6" fill="#334155" />
              {/* Windshield */}
              <rect x="2.2" y="-1.3" width="1.8" height="1.6" rx="0.3" fill="#7dd3fc" opacity="0.9" />
              {/* Wheels */}
              <circle cx="-2"  cy="2.2"  r="0.9" fill="#0f172a" />
              <circle cx="2"   cy="2.2"  r="0.9" fill="#0f172a" />
              <circle cx="-2"  cy="-2.2" r="0.9" fill="#0f172a" />
              <circle cx="2"   cy="-2.2" r="0.9" fill="#0f172a" />
              {/* Headlights */}
              <circle cx="4.2" cy="-1"   r="0.4" fill="#fde68a" opacity="0.95" />
              <circle cx="4.2" cy="1"    r="0.4" fill="#fde68a" opacity="0.95" />
              {/* Cargo / bin area */}
              <rect x="-2.8" y="-1.2" width="3.5" height="2.4" rx="0.4" fill="#22c55e" opacity="0.85" />
              <text x="-1" y="0.7" fontSize="1.8" textAnchor="middle" fill="white" fontWeight="bold">♻</text>
            </g>

            {/* Pulse ring around truck */}
            <circle
              cx={truckPos.x} cy={truckPos.y} r="3.5"
              fill="none" stroke="#6366f1" strokeWidth="0.4" strokeOpacity="0.35"
            />
          </svg>

          {/* Label */}
          <div className="absolute left-2 top-2 rounded bg-card/80 px-2 py-1 text-[10px] border z-10">
            Metro City - Live View
          </div>

          {/* Stop counter */}
          <div className="absolute right-2 top-2 rounded bg-card/80 px-2 py-1 text-[10px] border z-10 flex items-center gap-1.5">
            <span className="inline-block size-2 rounded-full bg-green-500 animate-pulse" />
            Stop {currentStop} / {Math.max(route.length - 1, 0)}
          </div>

          {/* ── BIN PINS ── */}
          {bins.map((bin, i) => {
            const pos = binPositions[i]
            if (!pos) return null
            const color = getPinColor(bin.status, bin.fill_level)
            const routeOrder = route.findIndex((r) => r.bin_id === bin.bin_id)
            const isVisited = visitedStops.has(routeOrder)

            return (
              <div
                key={bin.bin_id}
                className="group absolute flex flex-col items-center z-20"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: "translate(-50%, -100%)",
                  opacity: isVisited ? 0.4 : 1,
                  transition: "opacity 0.5s ease",
                }}
              >
                <div className="relative">
                  <MapPin
                    className="size-6 drop-shadow-md"
                    style={{ color }}
                    fill={color}
                    stroke="white"
                    strokeWidth={1.5}
                  />
                  {isVisited && (
                    <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white">✓</span>
                  )}
                  {routeOrder > 0 && !isVisited && (
                    <span
                      className="absolute -top-1 -right-2 flex size-4 items-center justify-center rounded-full text-[8px] font-bold text-white shadow"
                      style={{ backgroundColor: color, border: "1px solid white" }}
                    >
                      {routeOrder}
                    </span>
                  )}
                  {bin.status === "Critical" && !isVisited && (
                    <span className="absolute -top-1 -left-1 flex size-3">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-75" />
                      <span className="relative inline-flex size-3 rounded-full bg-red-600" />
                    </span>
                  )}
                </div>

                <div className="pointer-events-none absolute bottom-full mb-2 hidden rounded-lg border bg-card px-2 py-1.5 shadow-lg group-hover:block z-30 min-w-[110px]">
                  <p className="text-xs font-semibold">{bin.bin_id}</p>
                  <p className="text-[10px] text-muted-foreground">{bin.location}</p>
                  <p className="text-[10px] font-medium" style={{ color }}>
                    {bin.fill_level}% — {bin.status}
                  </p>
                  {routeOrder > 0 && (
                    <p className={`text-[10px] font-semibold ${isVisited ? "text-green-600" : "text-indigo-500"}`}>
                      {isVisited ? "✓ Collected" : `Stop #${routeOrder}`}
                    </p>
                  )}
                </div>
              </div>
            )
          })}

          {/* ── DEPOT PIN ── */}
          <div
            className="group absolute flex flex-col items-center z-20"
            style={{ left: `${DEPOT.x}%`, top: `${DEPOT.y}%`, transform: "translate(-50%, -100%)" }}
          >
            <MapPin className="size-7 drop-shadow-md" style={{ color: "black" }} fill="black" stroke="white" strokeWidth={1.5} />
            <div className="pointer-events-none absolute bottom-full mb-2 hidden rounded-lg border bg-card px-2 py-1 shadow-lg group-hover:block z-30">
              <p className="text-xs font-semibold">Waste Depot</p>
              <p className="text-[10px] text-muted-foreground">Route Start Point</p>
            </div>
          </div>

          {/* ── LEGEND ── */}
          <div className="absolute bottom-2 right-2 flex gap-3 rounded bg-card/80 px-2 py-1 border text-[10px] z-10">
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-green-600" /> Empty</span>
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-blue-600" /> Medium</span>
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-orange-500" /> Full</span>
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-red-600" /> Critical</span>
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-indigo-500" /> Route</span>
          </div>

        </div>
      </CardContent>
    </Card>
  )
}