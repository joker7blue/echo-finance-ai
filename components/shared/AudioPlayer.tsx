"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Volume2 } from "lucide-react";

interface AudioPlayerProps {
  audioUrl: string;
}

export function AudioPlayer({ audioUrl }: AudioPlayerProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const fetchedRef = useRef<string | null>(null);

  useEffect(() => {
    // Avoid refetching the same URL
    if (fetchedRef.current === audioUrl) return;
    fetchedRef.current = audioUrl;

    setLoading(true);
    setError(false);

    fetch(`/api/audio?url=${encodeURIComponent(audioUrl)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.signedUrl) setSignedUrl(data.signedUrl);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [audioUrl]);

  if (loading) {
    return (
      <div className="flex items-center gap-1 text-zinc-500">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span className="text-xs">Loading...</span>
      </div>
    );
  }

  if (error || !signedUrl) {
    return (
      <div className="flex items-center gap-1 text-zinc-500">
        <Volume2 className="w-3 h-3" />
        <span className="text-xs">Unavailable</span>
      </div>
    );
  }

  return <audio controls src={signedUrl} className="h-8 w-36" />;
}
