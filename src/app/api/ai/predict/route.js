import Groq from "groq-sdk"
import { supabase } from "@/lib/supabaseClient"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

export async function GET() {

  try {

    console.log("API called")

    // FETCH ALL BINS FIRST
    const { data: allBins, error: allError } = await supabase
      .from("smart_bins")
      .select("*")

    console.log("ALL BINS:", allBins)

    if (allError) {
      console.log("Supabase error:", allError)
    }

    // FILTER >60
    const bins = allBins?.filter(b => b.fill_level > 60) || []

    console.log("FILTERED BINS:", bins)

    // FETCH AQI
    const { data: air, error: airError } = await supabase
      .from("air_quality")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single()

    console.log("AIR:", air)

    let predictions = []

    // BIN predictions
    bins.forEach(bin => {

      const hours = Math.max(1, Math.round((100 - bin.fill_level) / 10))

      predictions.push({

        type: "Waste Fill",

        prediction: `${bin.bin_id} will reach capacity in ${hours} hours`,

        confidence: 90,

        severity:
          bin.fill_level > 85
            ? "high"
            : bin.fill_level > 70
            ? "medium"
            : "low"

      })

    })

    // AIR prediction
    if (air) {

      predictions.push({

        type: "Air Quality",

        prediction:
          air.aqi > 150
            ? "AQI expected to worsen"
            : "AQI expected to remain stable",

        confidence: 87,

        severity:
          air.aqi > 150
            ? "high"
            : air.aqi > 100
            ? "medium"
            : "low"

      })

    }

    console.log("FINAL PREDICTIONS:", predictions)

    return Response.json(predictions)

  }

  catch (err) {

    console.log("API ERROR:", err)

    return Response.json([])

  }
  

}