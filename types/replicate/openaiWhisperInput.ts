/**
 * Audio file
 */
export type Audio = string
/**
 * Language spoken in the audio, specify 'auto' for automatic language detection
 */
export type Language =
  | "auto"
  | "af"
  | "am"
  | "ar"
  | "as"
  | "az"
  | "ba"
  | "be"
  | "bg"
  | "bn"
  | "bo"
  | "br"
  | "bs"
  | "ca"
  | "cs"
  | "cy"
  | "da"
  | "de"
  | "el"
  | "en"
  | "es"
  | "et"
  | "eu"
  | "fa"
  | "fi"
  | "fo"
  | "fr"
  | "gl"
  | "gu"
  | "ha"
  | "haw"
  | "he"
  | "hi"
  | "hr"
  | "ht"
  | "hu"
  | "hy"
  | "id"
  | "is"
  | "it"
  | "ja"
  | "jw"
  | "ka"
  | "kk"
  | "km"
  | "kn"
  | "ko"
  | "la"
  | "lb"
  | "ln"
  | "lo"
  | "lt"
  | "lv"
  | "mg"
  | "mi"
  | "mk"
  | "ml"
  | "mn"
  | "mr"
  | "ms"
  | "mt"
  | "my"
  | "ne"
  | "nl"
  | "nn"
  | "no"
  | "oc"
  | "pa"
  | "pl"
  | "ps"
  | "pt"
  | "ro"
  | "ru"
  | "sa"
  | "sd"
  | "si"
  | "sk"
  | "sl"
  | "sn"
  | "so"
  | "sq"
  | "sr"
  | "su"
  | "sv"
  | "sw"
  | "ta"
  | "te"
  | "tg"
  | "th"
  | "tk"
  | "tl"
  | "tr"
  | "tt"
  | "uk"
  | "ur"
  | "uz"
  | "vi"
  | "yi"
  | "yo"
  | "yue"
  | "zh"
  | "Afrikaans"
  | "Albanian"
  | "Amharic"
  | "Arabic"
  | "Armenian"
  | "Assamese"
  | "Azerbaijani"
  | "Bashkir"
  | "Basque"
  | "Belarusian"
  | "Bengali"
  | "Bosnian"
  | "Breton"
  | "Bulgarian"
  | "Burmese"
  | "Cantonese"
  | "Castilian"
  | "Catalan"
  | "Chinese"
  | "Croatian"
  | "Czech"
  | "Danish"
  | "Dutch"
  | "English"
  | "Estonian"
  | "Faroese"
  | "Finnish"
  | "Flemish"
  | "French"
  | "Galician"
  | "Georgian"
  | "German"
  | "Greek"
  | "Gujarati"
  | "Haitian"
  | "Haitian Creole"
  | "Hausa"
  | "Hawaiian"
  | "Hebrew"
  | "Hindi"
  | "Hungarian"
  | "Icelandic"
  | "Indonesian"
  | "Italian"
  | "Japanese"
  | "Javanese"
  | "Kannada"
  | "Kazakh"
  | "Khmer"
  | "Korean"
  | "Lao"
  | "Latin"
  | "Latvian"
  | "Letzeburgesch"
  | "Lingala"
  | "Lithuanian"
  | "Luxembourgish"
  | "Macedonian"
  | "Malagasy"
  | "Malay"
  | "Malayalam"
  | "Maltese"
  | "Mandarin"
  | "Maori"
  | "Marathi"
  | "Moldavian"
  | "Moldovan"
  | "Mongolian"
  | "Myanmar"
  | "Nepali"
  | "Norwegian"
  | "Nynorsk"
  | "Occitan"
  | "Panjabi"
  | "Pashto"
  | "Persian"
  | "Polish"
  | "Portuguese"
  | "Punjabi"
  | "Pushto"
  | "Romanian"
  | "Russian"
  | "Sanskrit"
  | "Serbian"
  | "Shona"
  | "Sindhi"
  | "Sinhala"
  | "Sinhalese"
  | "Slovak"
  | "Slovenian"
  | "Somali"
  | "Spanish"
  | "Sundanese"
  | "Swahili"
  | "Swedish"
  | "Tagalog"
  | "Tajik"
  | "Tamil"
  | "Tatar"
  | "Telugu"
  | "Thai"
  | "Tibetan"
  | "Turkish"
  | "Turkmen"
  | "Ukrainian"
  | "Urdu"
  | "Uzbek"
  | "Valencian"
  | "Vietnamese"
  | "Welsh"
  | "Yiddish"
  | "Yoruba"
/**
 * optional patience value to use in beam decoding, as in https://arxiv.org/abs/2204.05424, the default (1.0) is equivalent to conventional beam search
 */
export type Patience = number
/**
 * Translate the text to English when set to True
 */
export type Translate = boolean
/**
 * temperature to use for sampling
 */
export type Temperature = number
/**
 * Choose the format for the transcription
 */
export type Transcription = "plain text" | "srt" | "vtt"
/**
 * optional text to provide as a prompt for the first window.
 */
export type InitialPrompt = string
/**
 * comma-separated list of token ids to suppress during sampling; '-1' will suppress most special characters except common punctuations
 */
export type SuppressTokens = string
/**
 * if the average log probability is lower than this value, treat the decoding as failed
 */
export type LogprobThreshold = number
/**
 * if the probability of the <|nospeech|> token is higher than this value AND the decoding has failed due to `logprob_threshold`, consider the segment as silence
 */
export type NoSpeechThreshold = number
/**
 * if True, provide the previous output of the model as a prompt for the next window; disabling may make the text inconsistent across windows, but the model becomes less prone to getting stuck in a failure loop
 */
export type ConditionOnPreviousText = boolean
/**
 * if the gzip compression ratio is higher than this value, treat the decoding as failed
 */
export type CompressionRatioThreshold = number
/**
 * temperature to increase when falling back when the decoding fails to meet either of the thresholds below
 */
export type TemperatureIncrementOnFallback = number

export interface OpenAIWhisperInput {
  audio: Audio
  language?: Language
  patience?: Patience
  translate?: Translate
  temperature?: Temperature
  transcription?: Transcription
  initial_prompt?: InitialPrompt
  suppress_tokens?: SuppressTokens
  logprob_threshold?: LogprobThreshold
  no_speech_threshold?: NoSpeechThreshold
  condition_on_previous_text?: ConditionOnPreviousText
  compression_ratio_threshold?: CompressionRatioThreshold
  temperature_increment_on_fallback?: TemperatureIncrementOnFallback
  [k: string]: unknown
}
