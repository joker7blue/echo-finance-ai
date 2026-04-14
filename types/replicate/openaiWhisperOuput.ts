export type SrtFile = string
export type TxtFile = string
export type Translation = string
export type Transcription = string
export type DetectedLanguage = string

export interface OpenAIWhisperOutput {
  segments?: Segments
  srt_file?: SrtFile
  txt_file?: TxtFile
  translation?: Translation
  transcription: Transcription
  detected_language: DetectedLanguage
  [k: string]: unknown
}
export interface Segments {
  [k: string]: unknown
}
