import React, { useState } from 'react';
import { Mic, MicOff, Send, Sparkles, Terminal, Shield, Cpu, Volume2, VolumeX } from 'lucide-react';
import { AvatarState, AssistantLanguage } from '../types';

interface InputControlsProps {
  state: AvatarState;
  isListening: boolean;
  isSpeaking: boolean;
  language: AssistantLanguage;
  autoSpeak: boolean;
  onToggleListening: () => void;
  onSendMessage: (text: string) => void;
  onToggleAutoSpeak: () => void;
  onOpenPythonSandbox: () => void;
  onOpenSecurityLab: () => void;
  onQuickAction: (action: string) => void;
}

export const InputControls: React.FC<InputControlsProps> = ({
  state,
  isListening,
  isSpeaking,
  language,
  autoSpeak,
  onToggleListening,
  onSendMessage,
  onToggleAutoSpeak,
  onOpenPythonSandbox,
  onOpenSecurityLab,
  onQuickAction,
}) => {
  const [inputText, setInputText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const getStatusBadge = () => {
    switch (state) {
      case 'listening':
        return {
          label: 'LISTENING',
          dotColor: 'bg-emerald-400',
          textColor: 'text-emerald-300',
          borderColor: 'border-emerald-500/40',
          glow: 'shadow-[0_0_12px_rgba(52,211,153,0.5)]',
        };
      case 'thinking':
        return {
          label: 'THINKING',
          dotColor: 'bg-purple-400',
          textColor: 'text-purple-300',
          borderColor: 'border-purple-500/40',
          glow: 'shadow-[0_0_12px_rgba(192,132,252,0.5)]',
        };
      case 'speaking':
        return {
          label: 'SPEAKING',
          dotColor: 'bg-cyan-400',
          textColor: 'text-cyan-300',
          borderColor: 'border-cyan-500/40',
          glow: 'shadow-[0_0_12px_rgba(34,211,238,0.5)]',
        };
      case 'processing':
        return {
          label: 'EXECUTING INTENT',
          dotColor: 'bg-blue-400',
          textColor: 'text-blue-300',
          borderColor: 'border-blue-500/40',
          glow: 'shadow-[0_0_12px_rgba(96,165,250,0.5)]',
        };
      case 'error':
        return {
          label: 'SYSTEM ALERT',
          dotColor: 'bg-rose-400',
          textColor: 'text-rose-300',
          borderColor: 'border-rose-500/40',
          glow: 'shadow-[0_0_12px_rgba(251,113,133,0.5)]',
        };
      case 'happy':
        return {
          label: 'ONLINE / HARMONIC',
          dotColor: 'bg-amber-400',
          textColor: 'text-amber-300',
          borderColor: 'border-amber-500/40',
          glow: 'shadow-[0_0_12px_rgba(251,191,36,0.5)]',
        };
      case 'idle':
      default:
        return {
          label: 'READY',
          dotColor: 'bg-cyan-400',
          textColor: 'text-cyan-300',
          borderColor: 'border-cyan-500/30',
          glow: 'shadow-[0_0_8px_rgba(34,211,238,0.3)]',
        };
    }
  };

  const status = getStatusBadge();

  const getPlaceholder = () => {
    if (language === 'hi') return 'PENTHER se baat karein... (उदा. "Mausam kaisa hai", "Timer lagao")';
    if (language === 'hinglish') return 'Ask PENTHER anything... ("Open YouTube", "Calculate factorial", "Weather")';
    return 'Ask PENTHER anything or enter an Android command...';
  };

  return (
    <div className="w-full flex flex-col items-center gap-3">
      {/* Status indicator bar & quick action shortcuts */}
      <div className="w-full flex items-center justify-between px-2 text-xs font-mono">
        <div
          className={`flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/80 border ${status.borderColor} ${status.glow} transition-all duration-300 backdrop-blur-md`}
        >
          <span className={`w-2 h-2 rounded-full ${status.dotColor} animate-pulse`} />
          <span className={`font-semibold tracking-wider text-[11px] ${status.textColor}`}>
            {status.label}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleAutoSpeak}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] transition-colors ${
              autoSpeak
                ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-900/40 border-slate-700/50 text-slate-400 hover:text-slate-200'
            }`}
            title={autoSpeak ? 'Voice response enabled' : 'Voice response muted'}
          >
            {autoSpeak ? <Volume2 size={13} /> : <VolumeX size={13} />}
            <span className="hidden sm:inline">{autoSpeak ? 'Voice ON' : 'Muted'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenPythonSandbox}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-700/50 text-slate-300 hover:text-cyan-300 transition-colors text-[11px]"
            title="Open Python Sandbox Terminal"
          >
            <Terminal size={13} className="text-amber-400" />
            <span className="hidden sm:inline">Python</span>
          </button>

          <button
            type="button"
            onClick={onOpenSecurityLab}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-700/50 text-slate-300 hover:text-emerald-300 transition-colors text-[11px]"
            title="Open Ethical Security Lab"
          >
            <Shield size={13} className="text-emerald-400" />
            <span className="hidden sm:inline">Security Lab</span>
          </button>
        </div>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="w-full flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs">
        <span className="text-[11px] font-mono text-slate-500 uppercase shrink-0 px-1">Quick:</span>
        <button
          type="button"
          onClick={() => onQuickAction('Open YouTube')}
          className="shrink-0 px-2.5 py-1 rounded-md bg-slate-900/60 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-200 transition-all font-mono text-[11px]"
        >
          Open YouTube
        </button>
        <button
          type="button"
          onClick={() => onQuickAction('Calculate factorial of 6 in Python')}
          className="shrink-0 px-2.5 py-1 rounded-md bg-slate-900/60 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-200 transition-all font-mono text-[11px]"
        >
          Python Factorial
        </button>
        <button
          type="button"
          onClick={() => onQuickAction('Start a 3 minute timer')}
          className="shrink-0 px-2.5 py-1 rounded-md bg-slate-900/60 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-200 transition-all font-mono text-[11px]"
        >
          3m Timer
        </button>
        <button
          type="button"
          onClick={() => onQuickAction('Open Camera')}
          className="shrink-0 px-2.5 py-1 rounded-md bg-slate-900/60 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-200 transition-all font-mono text-[11px]"
        >
          Camera
        </button>
        <button
          type="button"
          onClick={() => onQuickAction('Who created you?')}
          className="shrink-0 px-2.5 py-1 rounded-md bg-slate-900/60 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/40 text-slate-300 hover:text-purple-200 transition-all font-mono text-[11px]"
        >
          Creator Info
        </button>
        <button
          type="button"
          onClick={() => onQuickAction('Explore Security Lab ciphers')}
          className="shrink-0 px-2.5 py-1 rounded-md bg-slate-900/60 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-200 transition-all font-mono text-[11px]"
        >
          Security Ciphers
        </button>
      </div>

      {/* Main Command Input Box */}
      <form
        onSubmit={handleSend}
        className="relative w-full flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-cyan-500/25 shadow-[0_4px_24px_rgba(0,0,0,0.6)] backdrop-blur-xl focus-within:border-cyan-400 focus-within:shadow-[0_0_20px_rgba(0,240,255,0.25)] transition-all duration-300"
      >
        {/* Large Voice Microphone Button */}
        <button
          type="button"
          id="penther-voice-mic-button"
          onClick={onToggleListening}
          className={`relative p-3.5 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0 ${
            isListening
              ? 'bg-rose-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.8)] scale-105 animate-pulse'
              : 'bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 hover:shadow-[0_0_16px_rgba(0,240,255,0.5)] active:scale-95'
          }`}
          title={isListening ? 'Stop Listening' : 'Tap to Speak (Voice Command)'}
        >
          {isListening ? <MicOff size={22} /> : <Mic size={22} />}
          {isListening && (
            <span className="absolute -inset-1 rounded-xl border-2 border-rose-400 animate-ping opacity-75 pointer-events-none" />
          )}
        </button>

        {/* Text Input */}
        <input
          type="text"
          id="penther-text-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={getPlaceholder()}
          className="flex-1 bg-transparent border-0 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none text-sm font-sans"
        />

        {/* Send Button */}
        <button
          type="submit"
          id="penther-send-button"
          disabled={!inputText.trim()}
          className="p-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 disabled:opacity-30 disabled:hover:bg-cyan-500/10 text-cyan-400 hover:text-cyan-300 transition-all shrink-0 active:scale-95"
          title="Send command"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};
