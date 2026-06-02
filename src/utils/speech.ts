const SPANISH_LANGS = ["es-gt", "es-mx", "es-us", "es-419", "es-es", "es"];

const SPANISH_NAME_HINTS =
  /sabina|helena|pablo|paulina|monica|jorge|penelope|miguel|elvira|laura|español|spanish|españa|mexico|mexic|castellano|latino/i;

let cachedVoices: SpeechSynthesisVoice[] = [];
let currentAudio: HTMLAudioElement | null = null;
let lastSpanishSource: "online" | "device" | "none" = "none";

function normalizeLang(lang: string): string {
  return lang.replace(/_/g, "-").toLowerCase();
}

function refreshVoices(): SpeechSynthesisVoice[] {
  if (!("speechSynthesis" in window)) return [];
  cachedVoices = window.speechSynthesis.getVoices();
  return cachedVoices;
}

export function initSpeechVoices(): void {
  if (!("speechSynthesis" in window)) return;
  refreshVoices();
  window.speechSynthesis.addEventListener("voiceschanged", refreshVoices);
}

export function ensureVoicesLoaded(): Promise<SpeechSynthesisVoice[]> {
  refreshVoices();
  if (cachedVoices.length > 0) return Promise.resolve(cachedVoices);

  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) {
      resolve([]);
      return;
    }

    const finish = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", onChange);
      resolve(refreshVoices());
    };

    const onChange = () => finish();
    window.speechSynthesis.addEventListener("voiceschanged", onChange);
    window.speechSynthesis.getVoices();

    window.setTimeout(finish, 1200);
  });
}

function scoreSpanishVoice(v: SpeechSynthesisVoice): number {
  const lang = normalizeLang(v.lang);
  let score = 0;

  for (let i = 0; i < SPANISH_LANGS.length; i++) {
    const want = SPANISH_LANGS[i];
    if (lang === want) {
      score += 120 - i * 8;
      break;
    }
    if (lang.startsWith(`${want}-`) || lang.startsWith(want)) {
      score += 90 - i * 8;
      break;
    }
  }

  if (lang.startsWith("es")) score += 40;
  if (SPANISH_NAME_HINTS.test(v.name)) score += 35;
  if (v.localService) score += 15;
  if (/english|david|zira|mark|samantha|alex/i.test(v.name)) score -= 80;

  return score;
}

function pickSpanishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const spanish = voices
    .filter((v) => normalizeLang(v.lang).startsWith("es") || SPANISH_NAME_HINTS.test(v.name))
    .sort((a, b) => scoreSpanishVoice(b) - scoreSpanishVoice(a));

  return spanish[0];
}

function stopAll(): void {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = "";
    currentAudio = null;
  }
}

function googleTtsUrl(text: string, lang: string): string {
  const q = encodeURIComponent(text.slice(0, 200));
  return `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${q}`;
}

function playAudioUrl(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    currentAudio = audio;
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error("Audio playback failed"));
    audio.play().catch(reject);
  });
}

async function speakSpanishOnline(text: string): Promise<boolean> {
  const trimmed = text.trim();
  if (!trimmed) return false;

  const urls = [
    googleTtsUrl(trimmed, "es"),
    `/api/tts?lang=es&text=${encodeURIComponent(trimmed)}`,
  ];

  for (const url of urls) {
    try {
      await playAudioUrl(url);
      lastSpanishSource = "online";
      return true;
    } catch {
      /* try next */
    }
  }

  return false;
}

function speakWithWebSpeech(text: string, voice: SpeechSynthesisVoice): void {
  const u = new SpeechSynthesisUtterance(text);
  u.voice = voice;
  u.lang = voice.lang;
  u.rate = 0.82;
  u.pitch = 1;
  window.speechSynthesis.speak(u);
  lastSpanishSource = "device";
}

export async function speakSpanish(text: string): Promise<void> {
  if (!text.trim()) return;
  stopAll();

  const spokeOnline = await speakSpanishOnline(text);
  if (spokeOnline) return;

  if ("speechSynthesis" in window) {
    const voices = await ensureVoicesLoaded();
    const voice = pickSpanishVoice(voices);
    if (voice) {
      speakWithWebSpeech(text, voice);
      return;
    }

    const u = new SpeechSynthesisUtterance(text);
    u.lang = "es-MX";
    u.rate = 0.82;
    window.speechSynthesis.speak(u);
    lastSpanishSource = "device";
    return;
  }

  lastSpanishSource = "none";
}

export function speakEnglish(text: string): void {
  if (!("speechSynthesis" in window) || !text.trim()) return;
  stopAll();

  const voices = refreshVoices();
  const voice =
    voices.find((v) => normalizeLang(v.lang) === "en-us") ??
    voices.find((v) => normalizeLang(v.lang).startsWith("en")) ??
    voices.find((v) => /english|zira|david|samantha|alex/i.test(v.name));

  const u = new SpeechSynthesisUtterance(text);
  if (voice) {
    u.voice = voice;
    u.lang = voice.lang;
  } else {
    u.lang = "en-US";
  }
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

export async function speakTranslated(text: string, lang: "es" | "en"): Promise<void> {
  if (lang === "es") await speakSpanish(text);
  else speakEnglish(text);
}

export function getSpanishVoiceLabel(): string {
  if (lastSpanishSource === "online") return "Spanish · online voice";
  const voice = pickSpanishVoice(refreshVoices());
  return voice ? `${voice.name} (${voice.lang})` : "Spanish · online voice";
}

export function getLastSpanishSource(): typeof lastSpanishSource {
  return lastSpanishSource;
}
