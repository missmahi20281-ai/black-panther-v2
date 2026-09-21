import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  Shield,
  Settings as SettingsIcon,
  MessageSquare,
  Sparkles,
  Terminal,
  Volume2,
  VolumeX,
  Share2,
  HelpCircle,
  Cpu,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import { Avatar3D } from './components/Avatar3D';
import { VoiceWave } from './components/VoiceWave';
import { InputControls } from './components/InputControls';
import { ChatPanel } from './components/ChatPanel';
import { ToolExecutorModal } from './components/ToolExecutorModal';
import { PythonSandboxModal } from './components/PythonSandboxModal';
import { SecurityLabModal } from './components/SecurityLabModal';
import { PermissionsModal } from './components/PermissionsModal';
import { SettingsModal } from './components/SettingsModal';
import { AndroidProjectModal } from './components/AndroidProjectModal';

import { PentherVoiceEngine } from './utils/voice';
import { PentherToolRouter } from './utils/tools';
import {
  AvatarState,
  Message,
  AppSettings,
  AndroidPermission,
  ToolCall,
} from './types';

export default function App() {
  // Avatar and Voice State
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showChatDrawer, setShowChatDrawer] = useState(true);

  // Settings State
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('penther_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      language: 'en',
      voiceSpeed: 1.05,
      voicePitch: 1.1,
      avatarStyle: 'cyber_cyan',
      theme: 'obsidian',
      securityLabMode: true,
      autoSpeak: true,
      notificationsEnabled: true,
    };
  });

  // Permissions State
  const [permissions, setPermissions] = useState<AndroidPermission[]>([
    {
      id: 'microphone',
      name: 'Microphone (Audio Record)',
      description: 'Permits speech recognition for hands-free voice commands.',
      granted: true,
      rationale: 'Required for real-time speech-to-text vocal interaction with PENTHER.',
    },
    {
      id: 'camera',
      name: 'Camera Hardware',
      description: 'Provides CameraX viewfinder and photo capture capability.',
      granted: false,
      rationale: 'Required only when launching camera snapshot intents.',
    },
    {
      id: 'notifications',
      name: 'System Notifications',
      description: 'Delivers timer alerts and reminder alarms.',
      granted: true,
      rationale: 'Allows PENTHER to notify you when timers complete.',
    },
    {
      id: 'storage',
      name: 'Storage Access Framework',
      description: 'Reads files selected via Android document provider.',
      granted: false,
      rationale: 'Allows inspecting files or code scripts in the sandbox.',
    },
    {
      id: 'location',
      name: 'Precise / Coarse Location',
      description: 'Provides geo-coordinates for Maps and navigation intents.',
      granted: false,
      rationale: 'Allows opening maps for nearby queries without manual search.',
    },
  ]);

  // Messages History State
  const [messages, setMessages] = useState<Message[]>(() => {
    return [
      {
        id: 'msg-welcome',
        sender: 'assistant',
        text: "Online and ready. I am PENTHER, your futuristic personal AI assistant. How may I assist you today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  // Modal Control States
  const [activeSubsystem, setActiveSubsystem] = useState<{ type: string; payload?: any } | null>(null);
  const [isPythonSandboxOpen, setIsPythonSandboxOpen] = useState(false);
  const [sandboxCode, setSandboxCode] = useState<string | undefined>(undefined);
  const [sandboxDesc, setSandboxDesc] = useState<string | undefined>(undefined);
  const [isSecurityLabOpen, setIsSecurityLabOpen] = useState(false);
  const [securityLabTopic, setSecurityLabTopic] = useState<string | undefined>(undefined);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAndroidProjectOpen, setIsAndroidProjectOpen] = useState(false);

  // Speech Voice Engine instance ref
  const voiceEngineRef = useRef<PentherVoiceEngine | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('penther_settings', JSON.stringify(settings));
    if (voiceEngineRef.current) {
      voiceEngineRef.current.setVoiceConfig({
        speed: settings.voiceSpeed,
        pitch: settings.voicePitch,
        language: settings.language,
      });
    }
  }, [settings]);

  // Initialize Voice Engine
  useEffect(() => {
    voiceEngineRef.current = new PentherVoiceEngine(
      {
        speed: settings.voiceSpeed,
        pitch: settings.voicePitch,
        language: settings.language,
      },
      {
        onSpeechStart: () => {
          setIsSpeaking(true);
          setAvatarState('speaking');
        },
        onSpeechEnd: () => {
          setIsSpeaking(false);
          setAvatarState('idle');
        },
        onSpeechError: () => {
          setIsSpeaking(false);
          setAvatarState('idle');
        },
        onListeningStart: () => {
          setIsListening(true);
          setAvatarState('listening');
        },
        onListeningEnd: () => {
          setIsListening(false);
          if (!isSpeaking) setAvatarState('idle');
        },
        onTranscriptResult: (transcript, isFinal) => {
          if (isFinal && transcript.trim()) {
            handleSendMessage(transcript);
          }
        },
      }
    );

    return () => {
      voiceEngineRef.current?.destroy();
    };
  }, []);

  // Auto-scroll chat when messages update
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Toggle voice recognition
  const handleToggleListening = () => {
    if (isListening) {
      voiceEngineRef.current?.stopListening();
      setIsListening(false);
      setAvatarState('idle');
    } else {
      // If assistant was speaking, interrupt it
      if (isSpeaking) {
        voiceEngineRef.current?.stopSpeaking();
      }
      voiceEngineRef.current?.startListening(settings.language);
    }
  };

  // Dispatch tool actions to modals or Android intents
  const executeToolCall = async (toolCall: ToolCall) => {
    setAvatarState('processing');
    const result = await PentherToolRouter.executeTool(toolCall, {
      openModal: (modalType, payload) => {
        if (modalType === 'python_sandbox') {
          setSandboxCode(payload?.code);
          setSandboxDesc(payload?.description);
          setIsPythonSandboxOpen(true);
        } else if (modalType === 'security_lab') {
          setSecurityLabTopic(payload?.topic);
          setIsSecurityLabOpen(true);
        } else if (modalType === 'settings') {
          setIsSettingsOpen(true);
        } else {
          setActiveSubsystem({ type: modalType, payload });
        }
      },
      requestPermission: async (perm) => {
        setIsPermissionsOpen(true);
        return true;
      },
    });

    setAvatarState('idle');
    return result;
  };

  // Send message to Gemini / Server
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Interrupt any ongoing speech
    if (isSpeaking) {
      voiceEngineRef.current?.stopSpeaking();
    }

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setAvatarState('thinking');

    try {
      // Build conversation history for context
      const historyPayload = messages.slice(-8).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          language: settings.language,
          history: historyPayload,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      const assistantText = data.text || "I've processed your command.";
      const toolCalls: ToolCall[] = data.toolCalls || [];

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        sender: 'assistant',
        text: assistantText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolCalls,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Handle Avatar emotion state from Gemini
      if (data.emotionState) {
        setAvatarState(data.emotionState);
      }

      // Handle automatic voice speech
      if (settings.autoSpeak) {
        voiceEngineRef.current?.speak(assistantText);
      } else {
        setAvatarState('idle');
      }

      // Execute non-confirmation tool calls immediately
      for (const tool of toolCalls) {
        if (!tool.requiresConfirmation) {
          tool.executed = true;
          executeToolCall(tool);
        }
      }
    } catch (err: any) {
      setAvatarState('error');
      const errorMessage: Message = {
        id: `msg-${Date.now()}-err`,
        sender: 'assistant',
        text: `Error processing request: ${err.message || 'Network failure'}. Ready for retry.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setTimeout(() => setAvatarState('idle'), 3000);
    }
  };

  // Confirm sensitive tool call
  const handleConfirmToolCall = async (messageId: string, toolCall: ToolCall) => {
    toolCall.executed = true;
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId && msg.toolCalls) {
          return {
            ...msg,
            toolCalls: msg.toolCalls.map((tc) =>
              tc.name === toolCall.name ? { ...tc, executed: true } : tc
            ),
          };
        }
        return msg;
      })
    );

    await executeToolCall(toolCall);
  };

  // Cancel sensitive tool call
  const handleCancelToolCall = (messageId: string, toolCall: ToolCall) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId && msg.toolCalls) {
          return {
            ...msg,
            toolCalls: msg.toolCalls.filter((tc) => tc.name !== toolCall.name),
          };
        }
        return msg;
      })
    );
  };

  // Replay voice on a specific message
  const handleSpeakMessage = (text: string) => {
    if (isSpeaking) {
      voiceEngineRef.current?.stopSpeaking();
    }
    voiceEngineRef.current?.speak(text);
  };

  // Avatar click touch feedback
  const handleAvatarTouch = () => {
    setAvatarState('happy');
    const greetings = [
      "I'm here! All systems are nominal.",
      "How can PENTHER assist you today?",
      "Neural core active. Voice and intent engine ready.",
      "Awaiting your command!",
    ];
    const pick = greetings[Math.floor(Math.random() * greetings.length)];
    if (settings.autoSpeak) {
      voiceEngineRef.current?.speak(pick);
    }
    setTimeout(() => {
      if (!isSpeaking) setAvatarState('idle');
    }, 2500);
  };

  // Clear conversation history
  const handleClearHistory = () => {
    setMessages([
      {
        id: 'msg-welcome-reset',
        sender: 'assistant',
        text: "Conversation memory cleared. Ready for your next command.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Download conversation history
  const handleDownloadHistory = () => {
    const transcript = messages
      .map((m) => `[${m.timestamp}] ${m.sender.toUpperCase()}: ${m.text}`)
      .join('\n\n');
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `penther_conversation_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Toggle permission
  const handleTogglePermission = (id: string) => {
    setPermissions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, granted: !p.granted } : p))
    );
  };

  return (
    <div className="relative w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col overflow-x-hidden selection:bg-cyan-500/30 font-sans">
      {/* Background Ambient Cyber Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="w-full h-full bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:28px_28px]" />
      </div>

      {/* TOP STATUS & NAVIGATION BAR */}
      <header className="relative z-20 w-full px-4 sm:px-6 py-3 border-b border-cyan-500/15 bg-slate-950/80 backdrop-blur-xl flex items-center justify-between">
        {/* Left: Branding & Creator Credit */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-[1.5px] shadow-[0_0_18px_rgba(0,240,255,0.4)]">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-mono font-black text-lg text-cyan-400">
              P
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-widest text-cyan-300 font-mono">
                PENTHER
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono border border-cyan-500/30">
                v1.0 ANDROID
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Personal AI Assistant • <span className="text-cyan-400 font-medium">Created by Rai Kumar</span>
            </p>
          </div>
        </div>

        {/* Right: Quick Action Hub Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-xs">
          {/* Android Project / APK Builder */}
          <button
            type="button"
            id="penther-nav-apk-button"
            onClick={() => setIsAndroidProjectOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 hover:text-cyan-100 transition-all shadow-[0_0_12px_rgba(0,240,255,0.15)]"
            title="View Android Project & Build APK"
          >
            <Smartphone size={14} className="text-cyan-400" />
            <span className="hidden md:inline font-semibold">Android APK</span>
          </button>

          {/* Security Lab Toggle */}
          <button
            type="button"
            id="penther-nav-security-lab-button"
            onClick={() => setIsSecurityLabOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 hover:text-emerald-100 transition-all"
            title="Open Ethical Security Lab"
          >
            <Shield size={14} className="text-emerald-400" />
            <span className="hidden sm:inline">Security Lab</span>
          </button>

          {/* Settings Modal */}
          <button
            type="button"
            id="penther-nav-settings-button"
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all"
            title="Settings"
          >
            <SettingsIcon size={16} />
          </button>
        </div>
      </header>

      {/* MAIN APPLICATION WORKSPACE */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row w-full max-w-7xl mx-auto p-3 sm:p-4 gap-4 overflow-hidden">
        {/* LEFT / TOP: 3D ROBOTIC AVATAR & VOICE HUD */}
        <section className="flex-1 flex flex-col items-center justify-between min-h-[380px] lg:min-h-full rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-cyan-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl p-3 sm:p-4 relative overflow-hidden">
          {/* Avatar Header HUD badge */}
          <div className="w-full flex items-center justify-between text-xs font-mono text-slate-400 px-2 pt-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>ROBOTIC AVATAR // NEURAL SYNAPSE</span>
            </div>
            <div className="text-[11px] text-cyan-400/80">
              TOUCH INTERACTION ACTIVE
            </div>
          </div>

          {/* 3D Robotic Character Canvas */}
          <div className="w-full flex-1 relative flex items-center justify-center min-h-[260px] sm:min-h-[320px]">
            <Avatar3D
              state={avatarState}
              isSpeaking={isSpeaking}
              avatarStyle={settings.avatarStyle}
              onTouchFeedback={handleAvatarTouch}
            />

            {/* Futuristic Corner HUD brackets */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-cyan-500/40 pointer-events-none" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-cyan-500/40 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-cyan-500/40 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-cyan-500/40 pointer-events-none" />
          </div>

          {/* Audio Waveform visualizer underneath avatar */}
          <VoiceWave
            state={avatarState}
            isListening={isListening}
            isSpeaking={isSpeaking}
            avatarStyle={settings.avatarStyle}
          />
        </section>

        {/* RIGHT: CONVERSATION STREAM & SYSTEM COMMAND CONTROLS */}
        <section className="w-full lg:w-[480px] xl:w-[520px] flex flex-col rounded-2xl bg-slate-900/90 border border-cyan-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl p-3 sm:p-4 h-[580px] lg:h-auto max-h-[85vh]">
          {/* Chat Header */}
          <div className="flex items-center justify-between pb-3 border-b border-cyan-500/15 text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-300 font-semibold">
              <MessageSquare size={15} className="text-cyan-400" />
              <span>NEURAL LOG & INTENT FEED</span>
            </div>
            <button
              onClick={() => setShowChatDrawer(!showChatDrawer)}
              className="lg:hidden p-1 text-slate-400 hover:text-white"
            >
              {showChatDrawer ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {/* Scrollable Conversation History */}
          <div
            className={`flex-1 overflow-y-auto py-3 pr-1 ${
              !showChatDrawer ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'
            }`}
          >
            <ChatPanel
              messages={messages}
              onSpeakMessage={handleSpeakMessage}
              onConfirmToolCall={handleConfirmToolCall}
              onCancelToolCall={handleCancelToolCall}
            />
            <div ref={chatBottomRef} />
          </div>

          {/* Command Input Controls & Quick Intent Pills */}
          <div className="pt-3 border-t border-cyan-500/15">
            <InputControls
              state={avatarState}
              isListening={isListening}
              isSpeaking={isSpeaking}
              language={settings.language}
              autoSpeak={settings.autoSpeak}
              onToggleListening={handleToggleListening}
              onSendMessage={handleSendMessage}
              onToggleAutoSpeak={() =>
                setSettings((s) => ({ ...s, autoSpeak: !s.autoSpeak }))
              }
              onOpenPythonSandbox={() => setIsPythonSandboxOpen(true)}
              onOpenSecurityLab={() => setIsSecurityLabOpen(true)}
              onQuickAction={(prompt) => handleSendMessage(prompt)}
            />
          </div>
        </section>
      </main>

      {/* FOOTER SYSTEM STRIP */}
      <footer className="relative z-10 w-full px-4 py-2 bg-slate-950/90 border-t border-cyan-500/10 text-[11px] font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-cyan-400/80">
            <Cpu size={13} /> Gemini 3.8 Flash Neural Engine
          </span>
          <span>•</span>
          <span>Android Keystore Enforced</span>
        </div>
        <div className="text-slate-400">
          PENTHER // Created by <span className="text-cyan-300 font-semibold">Rai Kumar</span>
        </div>
      </footer>

      {/* ALL MODAL OVERLAYS */}
      {/* 1. Subsystem Executor Modal (Calculator, Timer, Camera, Maps, etc.) */}
      <ToolExecutorModal
        modalType={activeSubsystem?.type || null}
        payload={activeSubsystem?.payload}
        onClose={() => setActiveSubsystem(null)}
      />

      {/* 2. Python Sandbox Modal */}
      <PythonSandboxModal
        isOpen={isPythonSandboxOpen}
        initialCode={sandboxCode}
        initialDescription={sandboxDesc}
        onClose={() => setIsPythonSandboxOpen(false)}
      />

      {/* 3. Ethical Security Lab Modal */}
      <SecurityLabModal
        isOpen={isSecurityLabOpen}
        initialTopic={securityLabTopic}
        onClose={() => setIsSecurityLabOpen(false)}
      />

      {/* 4. Centralized Permission Manager Modal */}
      <PermissionsModal
        isOpen={isPermissionsOpen}
        permissions={permissions}
        onTogglePermission={handleTogglePermission}
        onClose={() => setIsPermissionsOpen(false)}
      />

      {/* 5. System Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onUpdateSettings={(newVals) => setSettings((prev) => ({ ...prev, ...newVals }))}
        onClearHistory={handleClearHistory}
        onDownloadHistory={handleDownloadHistory}
        onOpenPermissions={() => setIsPermissionsOpen(true)}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* 6. Native Android Project & APK Inspector Modal */}
      <AndroidProjectModal
        isOpen={isAndroidProjectOpen}
        onClose={() => setIsAndroidProjectOpen(false)}
      />
    </div>
  );
}
