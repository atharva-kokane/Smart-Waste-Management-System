import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET() {

  const { data, error } = await supabase
    .from("air_quality")
    .select("aqi, updated_at")
    .order("updated_at", { ascending: true })
    .limit(20)

  if (error) {
    console.error(error)
    return Response.json([])
  }

  const formatted = data.map((row, index) => ({
    time: new Date(row.updated_at).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    }),
    actual: row.aqi,
    predicted: row.aqi + Math.floor(Math.random() * 10 - 5)
  }))

  return Response.json(formatted)

}
