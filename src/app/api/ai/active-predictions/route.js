import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  try {
    // Fetch active predictions from Supabase
    const { data, error } = await supabase
      .from("ai_predictions") // your table name
      .select("*")
      .eq("status", "active");
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      count: data.length,
      predictions: data,
    });

  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}