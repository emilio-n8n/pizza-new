import 'dotenv/config'

export const config = {
  port: Number(process.env.PORT ?? 8080),
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN ?? '',
  publicWsUrl: process.env.PUBLIC_WS_URL ?? 'ws://localhost:8080/media',
  dataDir: process.env.DATA_DIR ?? './data',
  productApiUrl: process.env.PRODUCT_API_URL ?? 'http://127.0.0.1:4000',
  agentApiKey: process.env.AGENT_API_KEY ?? '',

  groqKey: process.env.GROQ_API_KEY ?? '',
  groqModel: process.env.GROQ_MODEL ?? 'whisper-large-v3-turbo',

  geminiKey: process.env.GEMINI_API_KEY ?? '',
  geminiLiveModel:
    process.env.GEMINI_LIVE_MODEL ??
    'gemini-3.8-live',
  geminiTtsModel:
    process.env.GEMINI_TTS_MODEL ?? 'gemini-2.5-flash-preview-tts',
  ttsVoice: process.env.TTS_VOICE ?? 'Kore',
  ttsIntervalMs: Number(process.env.TTS_INTERVAL_MS ?? 7000),

  jevKey: process.env.JEV_API_KEY ?? 'public',
  jevModel: process.env.JEV_MODEL ?? 'jev-1.13-free',
  jevEndpoint:
    process.env.JEV_ENDPOINT ??
    'https://opencode.ai/inference/systemone/v1/systemone',

  vadThreshold: Number(process.env.VAD_THRESHOLD ?? 420),
  vadSilenceMs: Number(process.env.VAD_SILENCE_MS ?? 650),
  vadMinSpeechMs: Number(process.env.VAD_MIN_SPEECH_MS ?? 280),
  bargeIn: process.env.BARGE_IN !== 'false',

  handoffEnabled: process.env.HANDOFF_ENABLED !== 'false',
  logTranscripts: process.env.LOG_TRANSCRIPTS === 'true',
}

export function requireKey(name: 'groqKey' | 'geminiKey') {
  const value = config[name]
  if (!value) {
    throw new Error(
      `${name === 'groqKey' ? 'GROQ_API_KEY' : 'GEMINI_API_KEY'} manque dans l'environnement.`,
    )
  }
  return value
}
