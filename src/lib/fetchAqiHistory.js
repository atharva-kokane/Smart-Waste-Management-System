import { supabase } from "@/lib/supabaseClient"

export async function fetchAqiHistory() {

  const { data, error } = await supabase
    .from("air_quality")
    .select("aqi, updated_at")
    .gte(
      "updated_at",
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    )
    .order("updated_at", { ascending: true })

  if (error) return []

  return data.map(row => ({
    time: new Date(row.updated_at).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    }),
    aqi: row.aqi
  }))

}