import { NextResponse } from "next/server";
import Replicate from "replicate";

export async function GET() {
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN
  });

  try {
    const r = await replicate.models.search("claude");

    return NextResponse.json({ success: true, models: r });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
