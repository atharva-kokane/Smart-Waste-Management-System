import Groq from "groq-sdk"
import { createClient } from "@supabase/supabase-js"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET() {
  try {
    // Temporary test data (later we connect database / AI)
    const insights = [
      {
        category: "Waste",
        message: "Bin B102 will be full in 2 hours",
        priority: "high",
      },
      {
        category: "Air",
        message: "PM2.5 rising in Sector 4",
        priority: "medium",
      },
    ];

    return Response.json(insights);
  } catch (error) {
    return Response.json([
      {
        category: "System",
        message: "AI insights temporarily unavailable",
        priority: "low",
      },
    ]);
  }
}