import React from 'react';
import { Volume2, Copy, Check, Terminal, ExternalLink, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { Message, ToolCall } from '../types';

interface ChatPanelProps {
  messages: Message[];
  onSpeakMessage: (text: string) => void;
  onConfirmToolCall: (messageId: string, toolCall: ToolCall) => void;
  onCancelToolCall: (messageId: string, toolCall: ToolCall) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSpeakMessage,
  onConfirmToolCall,
  onCancelToolCall,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full flex flex-col gap-3.5 pb-2 font-sans">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 font-mono text-xs">
          <div className="w-10 h-10 rounded-full border border-cyan-500/20 flex items-center justify-center mb-2 text-cyan-400/60">
            P
          </div>
          <p>PENTHER Neural Interface initialized.</p>
          <p className="mt-1 text-slate-600">Say &quot;Open YouTube&quot;, &quot;Factorial of 5&quot;, or ask any question in English or Hindi.</p>
        </div>
      ) : (
        messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}
            >
              <div
                className={`relative px-4 py-3 rounded-2xl max-w-[92%] sm:max-w-[85%] text-sm shadow-md transition-all ${
                  isUser
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-br-xs'
                    : 'bg-slate-900/90 border border-cyan-500/20 text-slate-200 rounded-bl-xs backdrop-blur-md'
                }`}
              >
                {/* Header label for assistant */}
                {!isUser && (
                  <div className="flex items-center justify-between gap-3 mb-1 text-[11px] font-mono text-cyan-400/80 border-b border-cyan-500/10 pb-1">
                    <span className="font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      PENTHER
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">{msg.timestamp}</span>
                      <button
                        onClick={() => onSpeakMessage(msg.text)}
                        className="hover:text-cyan-300 transition-colors"
                        title="Replay Voice"
                      >
                        <Volume2 size={13} />
                      </button>
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="hover:text-cyan-300 transition-colors"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Main Message Text */}
                <div className="whitespace-pre-wrap leading-relaxed break-words font-normal">
                  {msg.text}
                </div>

                {/* Tool Calls Execution & Confirmation Cards */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex flex-col gap-2">
                    {msg.toolCalls.map((tool, index) => {
                      if (tool.requiresConfirmation && !tool.executed) {
                        return (
                          <div
                            key={index}
                            className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 flex flex-col gap-2"
                          >
                            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-amber-300">
                              <AlertTriangle size={15} />
                              <span>Confirmation Required for Action: {tool.name}</span>
                            </div>
                            <p className="text-xs text-amber-100/90 leading-normal">
                              {tool.confirmationPrompt || 'This action involves external communications. Would you like to execute it?'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <button
                                type="button"
                                onClick={() => onConfirmToolCall(msg.id, tool)}
                                className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                              >
                                <CheckCircle2 size={14} />
                                Confirm & Dispatch
                              </button>
                              <button
                                type="button"
                                onClick={() => onCancelToolCall(msg.id, tool)}
                                className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-slate-950/60 border border-cyan-500/20 text-cyan-300 font-mono text-[11px]"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <Terminal size={12} className="text-cyan-400 shrink-0" />
                            <span className="text-slate-400">Intent:</span>
                            <span className="font-semibold text-cyan-200 truncate">{tool.name}</span>
                            {tool.arguments?.appName && (
                              <span className="text-slate-300">({tool.arguments.appName})</span>
                            )}
                          </div>
                          {tool.executed && (
                            <span className="shrink-0 flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                              <Check size={11} /> Executed
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
