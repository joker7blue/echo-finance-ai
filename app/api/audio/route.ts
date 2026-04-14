import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";

const BUCKET = "voice-recordings";

// Extracts the storage path from a Supabase public or signed URL
// e.g. https://xxx.supabase.co/storage/v1/object/public/voice-recordings/userId/file.webm
//   → userId/file.webm
function extractPath(audioUrl: string): string | null {
  const marker = `${BUCKET}/`;
  const idx = audioUrl.indexOf(marker);
  if (idx === -1) return null;
  return audioUrl.slice(idx + marker.length).split("?")[0];
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const audioUrl = req.nextUrl.searchParams.get("url");
    if (!audioUrl)
      return NextResponse.json({ error: "Missing url param" }, { status: 400 });

    const path = extractPath(audioUrl);
    if (!path)
      return NextResponse.json({ error: "Invalid audio URL" }, { status: 400 });

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, 3600); // 1 hour

    if (error) throw error;
    return NextResponse.json({ signedUrl: data.signedUrl });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
