/**
 * Browser Text-to-Speech (TTS) Engine
 * Uses the Web SpeechSynthesis API with graceful degradation when voices are unavailable.
 */

export interface TtsState {
  isSupported: boolean;
  isPlaying: boolean;
  hasTeluguVoice: boolean;
  availableVoices: SpeechSynthesisVoice[];
  error: string | null;
}

export class TextToSpeechManager {
  private static instance: TextToSpeechManager;
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  private constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  public static getInstance(): TextToSpeechManager {
    if (!TextToSpeechManager.instance) {
      TextToSpeechManager.instance = new TextToSpeechManager();
    }
    return TextToSpeechManager.instance;
  }

  private initVoices() {
    if (this.synth) {
      this.voices = this.synth.getVoices();
    }
  }

  public isSupported(): boolean {
    return this.synth !== null;
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && this.synth) {
      this.voices = this.synth.getVoices();
    }
    return this.voices;
  }

  public hasTeluguVoice(): boolean {
    return this.getVoices().some(
      (v) => v.lang.toLowerCase().startsWith('te') || v.name.toLowerCase().includes('telugu')
    );
  }

  public speak(
    text: string,
    options?: {
      lang?: 'en' | 'te';
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: string) => void;
    }
  ): boolean {
    if (!this.synth) {
      options?.onError?.('Speech synthesis is not supported on this browser or platform.');
      return false;
    }

    try {
      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      const targetLang = options?.lang || 'en';
      const allVoices = this.getVoices();

      if (targetLang === 'te') {
        const teluguVoice = allVoices.find(
          (v) => v.lang.toLowerCase().startsWith('te') || v.name.toLowerCase().includes('telugu')
        );
        if (teluguVoice) {
          utterance.voice = teluguVoice;
          utterance.lang = teluguVoice.lang;
        } else {
          // Fallback to Indian English or default voice
          const indianVoice = allVoices.find((v) => v.lang.toLowerCase().includes('in'));
          if (indianVoice) {
            utterance.voice = indianVoice;
            utterance.lang = indianVoice.lang;
          } else {
            utterance.lang = 'en-US';
          }
        }
      } else {
        const enVoice = allVoices.find((v) => v.lang.startsWith('en'));
        if (enVoice) {
          utterance.voice = enVoice;
          utterance.lang = enVoice.lang;
        }
      }

      utterance.rate = 0.95; // slightly slower for maximum clarity in public healthcare navigation
      utterance.pitch = 1.0;

      if (options?.onStart) utterance.onstart = options.onStart;
      if (options?.onEnd) utterance.onend = options.onEnd;
      if (options?.onError) {
        utterance.onerror = (e) => options.onError!(e.error || 'TTS playback failed.');
      }

      this.synth.speak(utterance);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error playing speech.';
      options?.onError?.(msg);
      return false;
    }
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }
}
