import React, { useState } from 'react';
import {
  X,
  Shield,
  Key,
  Network,
  Lock,
  FileCode,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

interface SecurityLabModalProps {
  isOpen: boolean;
  initialTopic?: string;
  onClose: () => void;
}

export const SecurityLabModal: React.FC<SecurityLabModalProps> = ({
  isOpen,
  initialTopic,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'crypto' | 'network' | 'defense'>('crypto');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.15)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-emerald-500/20 bg-slate-950/80">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm font-semibold tracking-wider">
            <Shield size={18} />
            <span>PENTHER // ETHICAL CYBERSECURITY LAB</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Ethical Warning Banner */}
        <div className="flex items-center gap-2 px-5 py-2 bg-emerald-950/30 border-b border-emerald-500/10 text-emerald-300 text-[11px] font-mono">
          <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />
          <span>Ethical Education Framework: All modules are designed exclusively for defensive security, CTF practice, and authorized testing.</span>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-800 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('crypto')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-semibold border-b-2 transition-all ${
              activeTab === 'crypto'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key size={14} /> Cryptography & Ciphers
          </button>
          <button
            onClick={() => setActiveTab('network')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-semibold border-b-2 transition-all ${
              activeTab === 'network'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Network size={14} /> Network Protocols
          </button>
          <button
            onClick={() => setActiveTab('defense')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-semibold border-b-2 transition-all ${
              activeTab === 'defense'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock size={14} /> Defensive Coding & CTF
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto flex-1 font-mono text-xs">
          {activeTab === 'crypto' && <CryptoModule />}
          {activeTab === 'network' && <NetworkModule />}
          {activeTab === 'defense' && <DefensiveModule />}
        </div>
      </div>
    </div>
  );
};

// 1. Cryptography Module
const CryptoModule: React.FC = () => {
  const [caesarInput, setCaesarInput] = useState('DEFEND THE NETWORK');
  const [shift, setShift] = useState(3);
  const [hashInput, setHashInput] = useState('penther_secret_key');
  const [hashOutput, setHashOutput] = useState('Generating...');

  const caesarEncrypt = (text: string, s: number) => {
    return text
      .split('')
      .map((c) => {
        if (c.match(/[a-z]/i)) {
          const code = c.charCodeAt(0);
          const base = code >= 65 && code <= 90 ? 65 : 97;
          return String.fromCharCode(((code - base + s) % 26 + 26) % 26 + base);
        }
        return c;
      })
      .join('');
  };

  const calculateHash = async (text: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  React.useEffect(() => {
    calculateHash(hashInput).then((h) => setHashOutput(h));
  }, [hashInput]);

  return (
    <div className="flex flex-col gap-6">
      {/* Caesar Cipher Sandbox */}
      <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/20 flex flex-col gap-3">
        <div className="flex items-center justify-between text-emerald-400 font-semibold">
          <span>1. Caesar Shift Cipher (Classical Cryptography)</span>
          <span className="text-[11px] text-slate-500">Shift Key: +{shift}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">PLAINTEXT INPUT:</label>
            <input
              type="text"
              value={caesarInput}
              onChange={(e) => setCaesarInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-400"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">CIPHERTEXT OUTPUT:</label>
            <div className="w-full bg-slate-900 border border-emerald-500/40 rounded-lg p-2 text-emerald-300 font-bold">
              {caesarEncrypt(caesarInput, shift)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[11px] text-slate-400">Shift parameter:</span>
          {[1, 3, 5, 13].map((s) => (
            <button
              key={s}
              onClick={() => setShift(s)}
              className={`px-2 py-0.5 rounded text-[11px] ${
                shift === s ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              +{s} {s === 13 ? '(ROT13)' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* SHA-256 Hash Integrity */}
      <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/20 flex flex-col gap-3">
        <div className="flex items-center justify-between text-emerald-400 font-semibold">
          <span>2. SHA-256 Cryptographic Hash Digest</span>
          <span className="text-[11px] text-slate-500">One-way preimage resistant</span>
        </div>
        <div>
          <label className="text-[10px] text-slate-400 block mb-1">DATA STRING:</label>
          <input
            type="text"
            value={hashInput}
            onChange={(e) => setHashInput(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-400 text-xs"
          />
        </div>
        <div>
          <label className="text-[10px] text-slate-400 block mb-1">SHA-256 DIGEST (256-bit Hex):</label>
          <div className="w-full bg-slate-900 border border-emerald-500/30 rounded-lg p-2.5 text-emerald-300 font-mono text-[11px] break-all">
            {hashOutput}
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Network Protocols Module
const NetworkModule: React.FC = () => {
  const [handshakeStep, setHandshakeStep] = useState(0);

  const steps = [
    { title: 'SYN (Synchronize)', sender: 'Client (PENTHER)', receiver: 'Server', desc: 'Client initiates connection by sending a TCP SYN packet with an initial sequence number (ISN).' },
    { title: 'SYN-ACK', sender: 'Server', receiver: 'Client (PENTHER)', desc: 'Server acknowledges client SYN and sends its own SYN with server sequence number.' },
    { title: 'ACK (Acknowledge)', sender: 'Client (PENTHER)', receiver: 'Server', desc: 'Client acknowledges server SYN. Three-way handshake complete; TCP socket is now ESTABLISHED.' },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/20 flex flex-col gap-3">
        <div className="flex items-center justify-between text-emerald-400 font-semibold">
          <span>TCP 3-Way Handshake Visualizer (RFC 793)</span>
          <button
            onClick={() => setHandshakeStep((s) => (s + 1) % 3)}
            className="px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 flex items-center gap-1 text-[11px]"
          >
            <RefreshCw size={12} /> Next Step
          </button>
        </div>

        {/* Step Visualizer */}
        <div className="grid grid-cols-3 gap-2 mt-2">
          {steps.map((st, idx) => (
            <div
              key={st.title}
              onClick={() => setHandshakeStep(idx)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                handshakeStep === idx
                  ? 'bg-emerald-950/50 border-emerald-400 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <div className="font-bold text-xs mb-1">Step {idx + 1}: {st.title}</div>
              <div className="text-[10px] text-slate-400">{st.sender} → {st.receiver}</div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-slate-300 text-xs leading-relaxed mt-1">
          <span className="font-bold text-emerald-400">Step {handshakeStep + 1} Analysis:</span> {steps[handshakeStep].desc}
        </div>
      </div>

      {/* OSI 7-Layer Quick Reference */}
      <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/20 flex flex-col gap-2">
        <span className="text-emerald-400 font-semibold">OSI Reference Model Architecture</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <div className="p-2 rounded bg-slate-900 border border-slate-800">
            <span className="text-emerald-400 font-bold">L7 Application:</span> HTTP/HTTPS, DNS, SSH, WebSockets
          </div>
          <div className="p-2 rounded bg-slate-900 border border-slate-800">
            <span className="text-emerald-400 font-bold">L4 Transport:</span> TCP (Reliable), UDP (Datagram), TLS/SSL
          </div>
          <div className="p-2 rounded bg-slate-900 border border-slate-800">
            <span className="text-emerald-400 font-bold">L3 Network:</span> IPv4, IPv6, ICMP, Routing Protocols
          </div>
          <div className="p-2 rounded bg-slate-900 border border-slate-800">
            <span className="text-emerald-400 font-bold">L2 Data Link:</span> Ethernet, Wi-Fi 802.11, MAC Addressing
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Defensive Coding & CTF Module
const DefensiveModule: React.FC = () => {
  const [password, setPassword] = useState('P@ssw0rd2026!');

  const calculateEntropy = (pwd: string) => {
    let pool = 0;
    if (/[a-z]/.test(pwd)) pool += 26;
    if (/[A-Z]/.test(pwd)) pool += 26;
    if (/[0-9]/.test(pwd)) pool += 10;
    if (/[^a-zA-Z0-9]/.test(pwd)) pool += 32;
    if (pool === 0) return 0;
    return Math.round(pwd.length * Math.log2(pool));
  };

  const entropy = calculateEntropy(password);

  return (
    <div className="flex flex-col gap-5">
      {/* Password Entropy Calculator */}
      <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/20 flex flex-col gap-3">
        <div className="flex items-center justify-between text-emerald-400 font-semibold">
          <span>Password Entropy & Complexity Meter</span>
          <span className="text-xs">{entropy} bits</span>
        </div>
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter test password..."
          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-400 text-xs"
        />
        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              entropy < 40 ? 'bg-rose-500 w-1/4' : entropy < 70 ? 'bg-amber-500 w-2/3' : 'bg-emerald-500 w-full'
            }`}
          />
        </div>
        <div className="text-[11px] text-slate-400">
          Rating: {entropy < 40 ? 'Weak (Vulnerable to brute force)' : entropy < 70 ? 'Moderate (Acceptable)' : 'Strong Cryptographic Key (Resistant)'}
        </div>
      </div>

      {/* SQL Injection Defensive Comparison */}
      <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/20 flex flex-col gap-3">
        <span className="text-emerald-400 font-semibold">Defensive Pattern: SQL Injection Prevention</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
          <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/30">
            <div className="text-rose-400 font-bold mb-1 flex items-center gap-1">
              <AlertOctagon size={13} /> INSECURE (Vulnerable String Concatenation)
            </div>
            <pre className="text-rose-200 text-[10px] bg-black/40 p-2 rounded overflow-x-auto">
              {`// Malicious user enters: ' OR '1'='1\nquery = f"SELECT * FROM users\nWHERE username = '{user_input}'"`}
            </pre>
          </div>

          <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30">
            <div className="text-emerald-400 font-bold mb-1 flex items-center gap-1">
              <CheckCircle2 size={13} /> SECURE (Parameterized Query)
            </div>
            <pre className="text-emerald-200 text-[10px] bg-black/40 p-2 rounded overflow-x-auto">
              {`// Safe parameterized placeholder\ncursor.execute(\n  "SELECT * FROM users WHERE name = %s",\n  (user_input,)\n)`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
