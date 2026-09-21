import { AssistantLanguage } from '../types';

export interface SpeechRecognitionResultPayload {
  transcript: string;
  isFinal: boolean;
}

export interface VoiceConfig {
  speed?: number;
  pitch?: number;
  language?: AssistantLanguage;
}

export interface VoiceEngineCallbacks {
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onSpeechError?: (err: any) => void;
  onListeningStart?: () => void;
  onListeningEnd?: () => void;
  onTranscriptResult?: (transcript: string, isFinal: boolean) => void;
}

export class PentherVoiceEngine {
  private recognition: any = null;
  private isListening: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private audioContext: AudioContext | null = null;
  private config: VoiceConfig = { speed: 1.0, pitch: 1.1, language: 'en' };
  private callbacks: VoiceEngineCallbacks = {};

  constructor(initialConfig?: VoiceConfig, callbacks?: VoiceEngineCallbacks) {
    if (initialConfig) this.config = { ...this.config, ...initialConfig };
    if (callbacks) this.callbacks = callbacks;
    this.initSpeechRecognition();
  }

  public setVoiceConfig(newConfig: Partial<VoiceConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  private initSpeechRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
      } catch (e) {
        console.warn('SpeechRecognition initialization error', e);
      }
    }
  }

  public isSpeechSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    );
  }

  public isTtsSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public startListening(
    language?: AssistantLanguage,
    onResult?: (payload: SpeechRecognitionResultPayload) => void,
    onError?: (err: any) => void,
    onEnd?: () => void
  ) {
    if (!this.recognition) {
      this.initSpeechRecognition();
    }

    if (!this.recognition) {
      const err = new Error('Speech recognition is not supported in this browser.');
      onError ? onError(err) : this.callbacks.onSpeechError?.(err);
      return;
    }

    // Stop speaking immediately when user begins speaking
    this.stopSpeaking();

    // Map language
    const lang = language || this.config.language || 'en';
    let langCode = 'en-US';
    if (lang === 'hi') langCode = 'hi-IN';
    else if (lang === 'hinglish') langCode = 'en-IN'; // en-IN handles Hinglish naturally
    this.recognition.lang = langCode;

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      const fullTranscript = final || interim;
      const isFinal = !!final;

      if (onResult) {
        onResult({ transcript: fullTranscript, isFinal });
      }
      if (this.callbacks.onTranscriptResult) {
        this.callbacks.onTranscriptResult(fullTranscript, isFinal);
      }
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      onError ? onError(event.error) : this.callbacks.onSpeechError?.(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd ? onEnd() : this.callbacks.onListeningEnd?.();
    };

    try {
      this.recognition.start();
      this.isListening = true;
      this.callbacks.onListeningStart?.();
      this.playFuturisticBeep(880, 0.08); // Listening sound cue
    } catch (e) {
      console.warn('Recognition already started', e);
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn(e);
      }
      this.isListening = false;
      this.callbacks.onListeningEnd?.();
    }
  }

  public speak(
    text: string,
    language?: AssistantLanguage,
    speed?: number,
    pitch?: number,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ) {
    if (!this.isTtsSupported()) {
      onEnd ? onEnd() : this.callbacks.onSpeechEnd?.();
      return;
    }

    // Stop previous utterance
    this.stopSpeaking();

    // Strip markdown code blocks or symbols for clean voice synthesis
    const cleanedText = text
      .replace(/```[\s\S]*?```/g, 'Code block output.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[#*_~>]/g, '')
      .trim();

    if (!cleanedText) {
      onEnd ? onEnd() : this.callbacks.onSpeechEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    this.currentUtterance = utterance;

    const lang = language || this.config.language || 'en';
    const rate = speed ?? this.config.speed ?? 1.0;
    const voicePitch = pitch ?? this.config.pitch ?? 1.1;

    // Pick appropriate voice
    const voices = window.speechSynthesis.getVoices();
    let preferredVoice = null;

    if (lang === 'hi') {
      preferredVoice = voices.find(
        (v) => v.lang.includes('hi') || v.name.toLowerCase().includes('hindi')
      );
    } else if (lang === 'hinglish') {
      preferredVoice = voices.find(
        (v) => v.lang.includes('IN') || v.name.toLowerCase().includes('india')
      );
    }

    // Default to female sounding english voice if available
    if (!preferredVoice) {
      preferredVoice =
        voices.find(
          (v) =>
            (v.name.toLowerCase().includes('female') ||
              v.name.toLowerCase().includes('samantha') ||
              v.name.toLowerCase().includes('zira') ||
              v.name.toLowerCase().includes('google')) &&
            v.lang.startsWith('en')
        ) ||
        voices.find((v) => v.lang.startsWith('en')) ||
        voices[0];
    }

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.rate = Math.max(0.6, Math.min(1.8, rate));
    utterance.pitch = Math.max(0.8, Math.min(1.5, voicePitch));

    utterance.onstart = () => {
      onStart ? onStart() : this.callbacks.onSpeechStart?.();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      onEnd ? onEnd() : this.callbacks.onSpeechEnd?.();
    };

    utterance.onerror = (e) => {
      this.currentUtterance = null;
      onError ? onError(e) : this.callbacks.onSpeechError?.(e);
      onEnd ? onEnd() : this.callbacks.onSpeechEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking() {
    if (this.isTtsSupported()) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
      this.callbacks.onSpeechEnd?.();
    }
  }

  public playFuturisticBeep(frequency: number = 880, duration: number = 0.1) {
    try {
      if (!this.audioContext) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) this.audioContext = new AudioCtx();
      }
      if (this.audioContext && this.audioContext.state !== 'suspended') {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(
          frequency * 1.5,
          this.audioContext.currentTime + duration
        );
        gain.gain.setValueAtTime(0.04, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.start();
        osc.stop(this.audioContext.currentTime + duration);
      }
    } catch (e) {
      // Ignore audio context autoplay restriction
    }
  }

  public destroy() {
    this.stopListening();
    this.stopSpeaking();
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch (e) {}
    }
  }
}

export const voiceEngine = new PentherVoiceEngine();
