import React, { useState } from 'react';
import {
  X,
  Settings as SettingsIcon,
  Globe,
  Sliders,
  Sparkles,
  Palette,
  Shield,
  Trash2,
  Download,
  Info,
  Check,
  Cpu,
} from 'lucide-react';
import { AppSettings, AssistantLanguage } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onClearHistory: () => void;
  onDownloadHistory: () => void;
  onOpenPermissions: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onUpdateSettings,
  onClearHistory,
  onDownloadHistory,
  onOpenPermissions,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-xl bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.15)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-cyan-500/20 bg-slate-950/80">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-sm font-semibold tracking-wider">
            <SettingsIcon size={18} />
            <span>PENTHER SETTINGS & SYSTEM MATRIX</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-6 text-xs font-mono">
          {/* AI Neural Engine */}
          <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/20 flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-cyan-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <Cpu size={15} /> AI Brain Configuration
              </span>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Model: <span className="font-mono text-cyan-300">gemini-3.8-flash</span> running server-side with zero client-side key exposure.
            </p>
          </div>

          {/* Language Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Globe size={14} className="text-cyan-400" /> Assistant Language Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'en', label: 'English (US/UK)' },
                { id: 'hi', label: 'Hindi (हिन्दी)' },
                { id: 'hinglish', label: 'Hinglish (Natural)' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => onUpdateSettings({ language: lang.id as AssistantLanguage })}
                  className={`py-2 px-3 rounded-xl border text-center transition-all ${
                    settings.language === lang.id
                      ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 font-bold shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Speech Sliders */}
          <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Sliders size={14} className="text-cyan-400" /> Speech Rate & Pitch Synthesis
            </label>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-slate-400">
                <span>Speed Rate:</span>
                <span className="text-cyan-300">{settings.voiceSpeed}x</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.5"
                step="0.05"
                value={settings.voiceSpeed}
                onChange={(e) => onUpdateSettings({ voiceSpeed: parseFloat(e.target.value) })}
                className="accent-cyan-400 cursor-pointer"
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-slate-400">
                <span>Vocal Pitch:</span>
                <span className="text-cyan-300">{settings.voicePitch}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.4"
                step="0.05"
                value={settings.voicePitch}
                onChange={(e) => onUpdateSettings({ voicePitch: parseFloat(e.target.value) })}
                className="accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Avatar Visual Style */}
          <div className="flex flex-col gap-2">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Sparkles size={14} className="text-cyan-400" /> 3D Robotic Anime Avatar Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'cyber_cyan', label: 'Cyber Cyan', color: '#00f0ff' },
                { id: 'sakura_pink', label: 'Sakura Rose', color: '#ff4081' },
                { id: 'matrix_emerald', label: 'Matrix Emerald', color: '#00e676' },
                { id: 'solar_gold', label: 'Solar Gold', color: '#ffd600' },
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => onUpdateSettings({ avatarStyle: style.id as any })}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                    settings.avatarStyle === style.id
                      ? 'bg-slate-800 border-cyan-400 text-slate-100 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: style.color, boxShadow: `0 0 8px ${style.color}` }}
                  />
                  <span className="text-[11px] truncate">{style.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Toggles: Security Lab & Auto-Speak */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200 block">Security Lab</span>
                <span className="text-[10px] text-slate-500">Ethical cybersecurity suite</span>
              </div>
              <input
                type="checkbox"
                checked={settings.securityLabMode}
                onChange={(e) => onUpdateSettings({ securityLabMode: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200 block">Voice Feedback</span>
                <span className="text-[10px] text-slate-500">Automatic TTS vocalization</span>
              </div>
              <input
                type="checkbox"
                checked={settings.autoSpeak}
                onChange={(e) => onUpdateSettings({ autoSpeak: e.target.checked })}
                className="w-4 h-4 accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Conversation History Actions */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2.5">
            <span className="text-slate-300 font-semibold">Conversation Memory</span>
            <div className="flex items-center gap-2">
              <button
                onClick={onDownloadHistory}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center gap-1.5 transition-colors text-xs"
              >
                <Download size={14} /> Export Transcript
              </button>
              <button
                onClick={onClearHistory}
                className="py-2 px-3 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 flex items-center justify-center gap-1.5 transition-colors text-xs"
              >
                <Trash2 size={14} /> Clear History
              </button>
            </div>
          </div>

          {/* Permissions Status link */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-200">
              <Shield size={16} className="text-cyan-400" />
              <span>Android Permissions Hub</span>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenPermissions();
              }}
              className="text-cyan-400 hover:underline text-xs"
            >
              Review Status ↗
            </button>
          </div>

          {/* ABOUT SECTION (MANDATORY EXACT FORMAT) */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-950 to-cyan-950/30 border border-cyan-500/30 flex flex-col items-center text-center gap-1.5 font-mono">
            <div className="w-9 h-9 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 font-bold mb-1 shadow-[0_0_12px_rgba(0,240,255,0.4)]">
              P
            </div>
            <span className="text-base font-extrabold tracking-widest text-cyan-300">PENTHER</span>
            <span className="text-xs text-slate-300">Personal AI Assistant</span>
            <span className="text-[11px] text-cyan-400 font-bold mt-1">Created by Rai Kumar</span>
            <p className="text-[10px] text-slate-500 mt-2 font-sans max-w-sm">
              An original futuristic personal AI assistant designed with an animated 3D robotic avatar, native Android intent routing, voice synthesis, sandboxed Python terminal, and Security Lab.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
