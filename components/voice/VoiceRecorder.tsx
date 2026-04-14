"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Square,
  Loader2,
  Play,
  Pause,
  RotateCcw,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
// import { useVoiceVisualizer, VoiceVisualizer } from "react-voice-visualizer";

type RecordingState = "idle" | "recording" | "preview" | "processing";

interface VoiceRecorderProps {
  onRecordingComplete?: (audioBlob: Blob) => void;
}

export function VoiceRecorder({ onRecordingComplete }: VoiceRecorderProps) {
  const [state, setState] = useState<RecordingState>("idle");
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  // const recorderControls = useVoiceVisualizer();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setHasPermission(true);
    } catch (error) {
      setHasPermission(false);
      console.error("Microphone permission denied:", error);
    }
  };

  const startRecording = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());

        // Create URL for playback
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setState("preview");

        toast.success("Recording stopped - Preview your audio");
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setState("recording");

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      toast.success("Recording started");
    } catch (error) {
      console.error("Failed to start recording:", error);
      toast.error("Failed to access microphone. Please check permissions.");
      setHasPermission(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && state === "recording") {
      mediaRecorderRef.current.stop();

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleReRecord = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setState("idle");
  };

  const handleSubmit = () => {
    if (audioBlob && onRecordingComplete) {
      setState("processing");
      onRecordingComplete(audioBlob);

      // Cleanup
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      setAudioBlob(null);
      setAudioUrl(null);
      setRecordingTime(0);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setState("idle");
    }
  };

  // Check microphone permission on mount
  /* useEffect(() => {
    checkMicrophonePermission();
  }, []); */

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.stop();
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const toggleRecording = () => {
    if (state === "idle") {
      startRecording();
    } else if (state === "recording") {
      stopRecording();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Permission denied state
  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center gap-4 p-8">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <Mic className="w-8 h-8 text-red-500" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Microphone Access Required</h3>
          <p className="text-zinc-400 text-sm max-w-md">
            Please allow microphone access in your browser settings to record
            expenses.
          </p>
          <Button
            onClick={checkMicrophonePermission}
            variant="outline"
            className="mt-4"
          >
            Check Permission Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Hidden audio element for playback */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}

      {/* Main Recording Button */}
      {state !== "preview" && (
        <div className="relative">
          <AnimatePresence mode="wait">
            {state === "recording" && (
              <motion.div
                key="pulse"
                className="absolute inset-0 rounded-full bg-emerald-500/20"
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.8, 0, 0.8],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
          </AnimatePresence>

          <motion.button
            onClick={toggleRecording}
            disabled={state === "processing"}
            className={`
              relative z-10 w-24 h-24 rounded-full flex items-center justify-center
              transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
              ${
                state === "idle"
                  ? "bg-emerald-500 hover:bg-emerald-600 shadow-lg hover:shadow-emerald-500/50"
                  : state === "recording"
                    ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50"
                    : "bg-zinc-800"
              }
            `}
            whileHover={{ scale: state === "processing" ? 1 : 1.05 }}
            whileTap={{ scale: state === "processing" ? 1 : 0.95 }}
          >
            {state === "processing" ? (
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            ) : state === "recording" ? (
              <Square className="w-10 h-10 text-white fill-white" />
            ) : (
              <Mic className="w-10 h-10 text-white" />
            )}
          </motion.button>
        </div>
      )}

      {/* Preview State - Audio Player */}
      {state === "preview" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          {/* Play/Pause Button */}
          <motion.button
            onClick={togglePlayback}
            className="w-24 h-24 rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-lg hover:shadow-emerald-500/50 flex items-center justify-center transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isPlaying ? (
              <Pause className="w-10 h-10 text-white fill-white" />
            ) : (
              <Play className="w-10 h-10 text-white fill-white ml-1" />
            )}
          </motion.button>

          {/* Audio Visualizer */}
          {/* {audioBlob && (
            <div className="w-full max-w-md">
              <VoiceVisualizer
                controls={{
                  ...recorderControls,
                  recordedBlob: audioBlob,
                }}
                width={500}
                height={80}
                barWidth={5}
                isControlPanelShown
                mainBarColor="#059669"
              />
            </div>
          )} */}

          {/* Audio Progress Bar */}
          <div className="w-full max-w-md space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-400 font-mono min-w-10">
                {formatTime(Math.floor(currentTime))}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-emerald-500
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:hover:bg-emerald-400
                  [&::-moz-range-thumb]:w-4
                  [&::-moz-range-thumb]:h-4
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-emerald-500
                  [&::-moz-range-thumb]:border-0
                  [&::-moz-range-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:hover:bg-emerald-400"
                style={{
                  background: `linear-gradient(to right, #10b981 0%, #10b981 ${
                    (currentTime / (duration || 1)) * 100
                  }%, #27272a ${(currentTime / (duration || 1)) * 100}%, #27272a 100%)`,
                }}
              />
              <span className="text-xs text-zinc-400 font-mono min-w-10">
                {formatTime(Math.floor(duration))}
              </span>
            </div>
          </div>

          {/* Recording Duration */}
          <div className="text-sm text-zinc-400 font-mono">
            Duration: {formatTime(recordingTime)}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <Button
              onClick={handleReRecord}
              variant="outline"
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Re-record
            </Button>
            <Button onClick={handleSubmit} className="gradient-button gap-2">
              <Check className="w-4 h-4" />
              Submit
            </Button>
          </div>
        </motion.div>
      )}

      {/* Recording Timer */}
      <AnimatePresence>
        {state === "recording" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-zinc-400"
          >
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-mono text-lg">
              {formatTime(recordingTime)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      {state !== "preview" && (
        <div className="text-center space-y-1 max-w-md">
          <p className="text-sm font-medium">
            {state === "idle" && "Click to start recording"}
            {state === "recording" && "Recording... Click to stop"}
            {state === "processing" && "Processing your recording..."}
          </p>
          {state === "idle" && (
            <p className="text-xs text-zinc-500">
              Speak naturally about your expenses. AI will extract all details.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
