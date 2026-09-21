import React, { useState, useEffect } from 'react';
import { X, Play, RotateCcw, Terminal as TerminalIcon, ShieldAlert, Code2, Sparkles } from 'lucide-react';

interface PythonSandboxModalProps {
  isOpen: boolean;
  initialCode?: string;
  initialDescription?: string;
  onClose: () => void;
}

const TEMPLATES: { name: string; description: string; code: string }[] = [
  {
    name: 'Factorial Calculator',
    description: 'Calculates the factorial of an integer n with recursive and iterative paths.',
    code: `def factorial(n):\n    """Calculates factorial of n safely"""\n    if n < 0:\n        raise ValueError("Factorial is not defined for negative numbers")\n    result = 1\n    for i in range(2, n + 1):\n        result *= i\n    return result\n\n# Compute factorial of 5\nnum = 5\nprint(f"[PENTHER Sandbox] Computing factorial of {num}:")\nprint(f"{num}! = {factorial(num)}")\n`,
  },
  {
    name: 'Fibonacci Generator',
    description: 'Generates the first N Fibonacci numbers in a sequence.',
    code: `def fibonacci(limit=10):\n    sequence = [0, 1]\n    while len(sequence) < limit:\n        sequence.append(sequence[-1] + sequence[-2])\n    return sequence\n\nprint("[PENTHER Sandbox] Generating Fibonacci Sequence (N=10):")\nprint(fibonacci(10))\n`,
  },
  {
    name: 'Caesar Cipher',
    description: 'Classic shift cipher encryption and decryption demonstration.',
    code: `def caesar_encrypt(text, shift=3):\n    result = []\n    for char in text:\n        if char.isalpha():\n            base = ord('A') if char.isupper() else ord('a')\n            result.append(chr((ord(char) - base + shift) % 26 + base))\n        else:\n            result.append(char)\n    return ''.join(result)\n\nmsg = "ATTACK AT DAWN"\nencrypted = caesar_encrypt(msg, 3)\nprint(f"Plaintext:  {msg}")\nprint(f"Ciphertext: {encrypted}")\n`,
  },
  {
    name: 'Prime Sieve',
    description: 'Finds all prime numbers up to a specified maximum value.',
    code: `def sieve_primes(max_n=30):\n    is_prime = [True] * (max_n + 1)\n    is_prime[0] = is_prime[1] = False\n    for p in range(2, int(max_n**0.5) + 1):\n        if is_prime[p]:\n            for i in range(p * p, max_n + 1, p):\n                is_prime[i] = False\n    return [p for p in range(2, max_n + 1) if is_prime[p]]\n\nprint("[PENTHER Sandbox] Primes up to 30:")\nprint(sieve_primes(30))\n`,
  },
];

export const PythonSandboxModal: React.FC<PythonSandboxModalProps> = ({
  isOpen,
  initialCode,
  initialDescription,
  onClose,
}) => {
  const [code, setCode] = useState(initialCode || TEMPLATES[0].code);
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [execTime, setExecTime] = useState<number | null>(null);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      setOutput('');
      setError(null);
    }
  }, [initialCode]);

  if (!isOpen) return null;

  const handleRunCode = async () => {
    setIsRunning(true);
    setError(null);
    setOutput('');

    try {
      const res = await fetch('/api/python/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      if (!data.success && data.error) {
        setError(data.error);
      } else {
        setOutput(data.output || 'Process terminated with exit code 0 (No stdout).');
      }
      setExecTime(data.executionTimeMs ?? 0);
    } catch (err: any) {
      setError(`Execution request failed: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-amber-500/30 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-amber-500/20 bg-slate-950/80">
          <div className="flex items-center gap-2 text-amber-400 font-mono text-sm font-semibold tracking-wider">
            <TerminalIcon size={18} />
            <span>PENTHER // PYTHON SANDBOX TERMINAL</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Security Policy Badge */}
        <div className="flex items-center gap-2 px-5 py-2 bg-amber-950/30 border-b border-amber-500/10 text-amber-300 text-[11px] font-mono">
          <ShieldAlert size={14} className="shrink-0 text-amber-400" />
          <span>Security Sandbox Active: Destructive file deletion, root commands, and raw sockets are strictly filtered.</span>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto flex flex-col gap-4 font-mono text-xs">
          {/* Quick templates */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-slate-500 uppercase text-[10px] shrink-0">Templates:</span>
            {TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.name}
                onClick={() => {
                  setCode(tmpl.code);
                  setOutput('');
                  setError(null);
                }}
                className="shrink-0 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-amber-950/40 border border-slate-700 hover:border-amber-500/40 text-slate-300 hover:text-amber-200 transition-colors text-[11px]"
              >
                {tmpl.name}
              </button>
            ))}
          </div>

          {initialDescription && (
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300 text-[11px] font-sans">
              <span className="font-semibold text-amber-400 font-mono">Intent:</span> {initialDescription}
            </div>
          )}

          {/* Code Editor */}
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="flex items-center gap-1">
                <Code2 size={13} className="text-amber-400" /> main.py
              </span>
              <span>Python 3.12 (Sandboxed)</span>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={8}
              className="w-full p-3 rounded-xl bg-slate-950 border border-amber-500/25 focus:border-amber-400 focus:outline-none text-amber-100 font-mono text-xs leading-relaxed resize-y selection:bg-amber-500/30"
              spellCheck={false}
            />
          </div>

          {/* Execution Output Console */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="text-slate-400">Standard Output (stdout)</span>
              {execTime !== null && (
                <span className="text-emerald-400 font-semibold">{execTime}ms execution</span>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-black border border-slate-800 min-h-[90px] max-h-[160px] overflow-y-auto font-mono text-xs whitespace-pre-wrap">
              {isRunning ? (
                <div className="flex items-center gap-2 text-amber-400 animate-pulse">
                  <Sparkles size={14} />
                  <span>Executing inside safe sandbox container...</span>
                </div>
              ) : error ? (
                <div className="text-rose-400 flex flex-col gap-1">
                  <span className="font-bold">[Execution Intercepted / Error]</span>
                  <span>{error}</span>
                </div>
              ) : output ? (
                <div className="text-emerald-300 leading-relaxed">{output}</div>
              ) : (
                <span className="text-slate-600 italic">Click &quot;Run Code&quot; to execute standard Python in the sandbox.</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-950/80">
          <button
            onClick={() => {
              setCode(TEMPLATES[0].code);
              setOutput('');
              setError(null);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition-colors"
          >
            <RotateCcw size={13} /> Reset
          </button>

          <button
            onClick={handleRunCode}
            disabled={isRunning || !code.trim()}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 font-bold font-mono text-xs shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all active:scale-95"
          >
            <Play size={14} />
            {isRunning ? 'Running...' : 'Run Code'}
          </button>
        </div>
      </div>
    </div>
  );
};
