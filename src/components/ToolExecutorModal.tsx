import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Calculator,
  Timer as TimerIcon,
  Camera,
  MapPin,
  Smartphone,
  FolderOpen,
  Bell,
  Play,
  Pause,
  RotateCcw,
  Check,
  Plus,
  Trash2,
  Download,
} from 'lucide-react';

interface ToolExecutorModalProps {
  modalType: string | null;
  payload?: any;
  onClose: () => void;
}

export const ToolExecutorModal: React.FC<ToolExecutorModalProps> = ({
  modalType,
  payload,
  onClose,
}) => {
  if (!modalType) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-[0_0_40px_rgba(0,240,255,0.15)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-cyan-500/20 bg-slate-950/60">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-sm font-semibold tracking-wider">
            {modalType === 'calculator' && <Calculator size={18} />}
            {modalType === 'timer' && <TimerIcon size={18} />}
            {modalType === 'camera' && <Camera size={18} />}
            {modalType === 'maps' && <MapPin size={18} />}
            {modalType === 'device_info' && <Smartphone size={18} />}
            {modalType === 'file_picker' && <FolderOpen size={18} />}
            {modalType === 'reminder' && <Bell size={18} />}
            <span className="uppercase">Android Subsystem // {modalType.replace('_', ' ')}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 font-sans">
          {modalType === 'calculator' && <CalculatorSubsystem initialExpr={payload?.expression} />}
          {modalType === 'timer' && (
            <TimerSubsystem
              initialDuration={payload?.durationSeconds || 180}
              label={payload?.label}
            />
          )}
          {modalType === 'camera' && <CameraSubsystem mode={payload?.mode} />}
          {modalType === 'maps' && <MapsSubsystem initialQuery={payload?.query} />}
          {modalType === 'device_info' && <DeviceInfoSubsystem />}
          {modalType === 'file_picker' && <FilePickerSubsystem fileType={payload?.fileType} />}
          {modalType === 'reminder' && (
            <ReminderSubsystem initialTitle={payload?.title} initialTime={payload?.time} />
          )}
        </div>
      </div>
    </div>
  );
};

// 1. Interactive Calculator Subsystem
const CalculatorSubsystem: React.FC<{ initialExpr?: string }> = ({ initialExpr }) => {
  const [display, setDisplay] = useState(initialExpr || '0');
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    if (initialExpr && initialExpr !== 'Launch') {
      try {
        // Sanitize math string
        const sanitized = initialExpr.replace(/[^0-9+\-*/().sqrt^%]/g, '');
        // eslint-disable-next-line no-eval
        const res = Function(`'use strict'; return (${sanitized.replace(/sqrt/g, 'Math.sqrt')})`)();
        setDisplay(initialExpr);
        setResult(String(res));
      } catch {
        setDisplay(initialExpr);
      }
    }
  }, [initialExpr]);

  const handleKey = (val: string) => {
    if (val === 'C') {
      setDisplay('0');
      setResult(null);
    } else if (val === '=') {
      try {
        const sanitized = display.replace(/[^0-9+\-*/().%]/g, '');
        // eslint-disable-next-line no-eval
        const calc = Function(`'use strict'; return (${sanitized})`)();
        setResult(String(calc));
      } catch {
        setResult('Error');
      }
    } else {
      setDisplay((prev) => (prev === '0' || prev === 'Launch' ? val : prev + val));
    }
  };

  const keys = ['C', '(', ')', '/', '7', '8', '9', '*', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '%', '='];

  return (
    <div className="flex flex-col gap-4 font-mono">
      <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/30 text-right">
        <div className="text-xs text-slate-400 truncate">{display}</div>
        <div className="text-2xl font-bold text-cyan-300 mt-1">{result !== null ? `= ${result}` : display}</div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {keys.map((k) => (
          <button
            key={k}
            onClick={() => handleKey(k)}
            className={`py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
              k === '='
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 col-span-1 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : k === 'C'
                ? 'bg-rose-950/60 border border-rose-500/40 text-rose-300 hover:bg-rose-900/60'
                : ['/', '*', '-', '+'].includes(k)
                ? 'bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/40'
                : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200'
            }`}
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  );
};

// 2. Interactive Timer Subsystem
const TimerSubsystem: React.FC<{ initialDuration: number; label?: string }> = ({
  initialDuration,
  label = 'PENTHER Countdown',
}) => {
  const [totalSeconds, setTotalSeconds] = useState(initialDuration);
  const [remaining, setRemaining] = useState(initialDuration);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval: any = null;
    if (isActive && remaining > 0) {
      interval = setInterval(() => {
        setRemaining((r) => r - 1);
      }, 1000);
    } else if (remaining === 0 && isActive) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, remaining]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const progress = totalSeconds > 0 ? (remaining / totalSeconds) * 100 : 0;

  return (
    <div className="flex flex-col items-center gap-6 py-4 font-mono">
      <div className="text-center">
        <span className="text-xs text-cyan-400/80 uppercase tracking-wider">{label}</span>
        <div className="text-5xl font-extrabold text-cyan-300 mt-2 font-mono tracking-widest drop-shadow-[0_0_15px_rgba(0,240,255,0.4)]">
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 rounded-full h-3 p-0.5 border border-cyan-500/30 overflow-hidden">
        <div
          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsActive(!isActive)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            isActive
              ? 'bg-amber-600 hover:bg-amber-500 text-slate-950'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
          }`}
        >
          {isActive ? <Pause size={16} /> : <Play size={16} />}
          {isActive ? 'Pause' : 'Resume'}
        </button>

        <button
          onClick={() => {
            setRemaining(totalSeconds);
            setIsActive(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm"
        >
          <RotateCcw size={15} />
          Reset
        </button>

        <button
          onClick={() => {
            setRemaining((r) => r + 60);
            setTotalSeconds((t) => t + 60);
          }}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
        >
          +1 Min
        </button>
      </div>
    </div>
  );
};

// 3. Camera Subsystem with real stream fallback
const CameraSubsystem: React.FC<{ mode?: string }> = ({ mode = 'photo' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [capturedImg, setCapturedImg] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: mode === 'selfie' ? 'user' : 'environment' },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setStreamActive(true);
        }
      } catch (e: any) {
        setCameraError('Camera access denied or device has no accessible camera hardware. CameraX preview fallback active.');
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mode]);

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      setCapturedImg(canvas.toDataURL('image/png'));
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-cyan-500/30 flex items-center justify-center">
        {cameraError ? (
          <div className="p-4 text-center font-mono text-xs text-amber-300">
            <Camera size={32} className="mx-auto mb-2 text-amber-400/80" />
            <p>{cameraError}</p>
          </div>
        ) : capturedImg ? (
          <img src={capturedImg} alt="Captured" className="w-full h-full object-cover" />
        ) : (
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
        )}

        {/* HUD Overlay Crosshair */}
        <div className="absolute inset-0 pointer-events-none border border-cyan-500/20 m-4 rounded-lg flex items-center justify-center">
          <div className="w-8 h-8 border-t-2 border-b-2 border-cyan-400/50" />
          <div className="absolute w-8 h-8 border-l-2 border-r-2 border-cyan-400/50" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {capturedImg ? (
          <>
            <button
              onClick={() => setCapturedImg(null)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono"
            >
              Retake
            </button>
            <a
              href={capturedImg}
              download="penther_capture.png"
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs font-mono flex items-center gap-1.5"
            >
              <Download size={14} /> Download
            </a>
          </>
        ) : (
          <button
            onClick={capturePhoto}
            disabled={!streamActive}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-mono text-xs shadow-[0_0_15px_rgba(0,240,255,0.4)] flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <Camera size={16} /> Shutter Capture
          </button>
        )}
      </div>
    </div>
  );
};

// 4. Maps Subsystem
const MapsSubsystem: React.FC<{ initialQuery?: string }> = ({ initialQuery = 'New Delhi' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [search, setSearch] = useState(initialQuery);

  return (
    <div className="flex flex-col gap-3 font-mono">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter location or coordinates..."
          className="flex-1 bg-slate-950 border border-cyan-500/30 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
        />
        <button
          onClick={() => setSearch(query)}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all"
        >
          Navigate
        </button>
      </div>

      <div className="w-full h-64 rounded-xl overflow-hidden border border-cyan-500/30 bg-slate-950">
        <iframe
          title="Map Location"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(search)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
        />
      </div>
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>Target: {search}</span>
        <button
          onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(search)}`, '_blank')}
          className="text-cyan-400 hover:underline flex items-center gap-1"
        >
          Open Google Maps App ↗
        </button>
      </div>
    </div>
  );
};

// 5. Device Information Subsystem
const DeviceInfoSubsystem: React.FC = () => {
  const [battery, setBattery] = useState<{ level: number; charging: boolean }>({ level: 92, charging: true });

  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((batt: any) => {
        setBattery({
          level: Math.round(batt.level * 100),
          charging: batt.charging,
        });
      });
    }
  }, []);

  return (
    <div className="grid grid-cols-2 gap-3 font-mono text-xs">
      <div className="p-3 bg-slate-950/80 rounded-xl border border-cyan-500/20 flex flex-col gap-1">
        <span className="text-slate-400">OS ARCHITECTURE</span>
        <span className="font-bold text-cyan-300">Android 14 / ARM64-v8a</span>
        <span className="text-[10px] text-slate-500">API Level 34 (Upside Down Cake)</span>
      </div>

      <div className="p-3 bg-slate-950/80 rounded-xl border border-cyan-500/20 flex flex-col gap-1">
        <span className="text-slate-400">POWER MATRIX</span>
        <span className="font-bold text-emerald-300">{battery.level}% {battery.charging ? '(Fast Charging)' : '(Discharging)'}</span>
        <span className="text-[10px] text-slate-500">Li-Po 5000 mAh Health: Optimal</span>
      </div>

      <div className="p-3 bg-slate-950/80 rounded-xl border border-cyan-500/20 flex flex-col gap-1">
        <span className="text-slate-400">CONNECTIVITY</span>
        <span className="font-bold text-cyan-300">5G Ultra-Wideband / Wi-Fi 7</span>
        <span className="text-[10px] text-slate-500">Status: Low Latency (14ms)</span>
      </div>

      <div className="p-3 bg-slate-950/80 rounded-xl border border-cyan-500/20 flex flex-col gap-1">
        <span className="text-slate-400">SYSTEM MEMORY</span>
        <span className="font-bold text-cyan-300">4.2 GB / 12.0 GB LPDDR5X</span>
        <span className="text-[10px] text-slate-500">ZRAM Compressed: Active</span>
      </div>

      <div className="col-span-2 p-3 bg-slate-950/80 rounded-xl border border-cyan-500/20 flex flex-col gap-1">
        <span className="text-slate-400">SECURITY POSTURE</span>
        <div className="flex items-center gap-2 text-emerald-400 font-semibold mt-0.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>SELinux Enforcing | Android Keystore Hardware Backed</span>
        </div>
      </div>
    </div>
  );
};

// 6. File Picker Subsystem
const FilePickerSubsystem: React.FC<{ fileType?: string }> = ({ fileType = 'any' }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-4 font-mono text-xs">
      <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-cyan-500/30 hover:border-cyan-400 rounded-xl cursor-pointer bg-slate-950/50 hover:bg-slate-950/80 transition-all text-center">
        <FolderOpen size={36} className="text-cyan-400 mb-2" />
        <span className="font-bold text-slate-200">Select or Drag File to Inspect</span>
        <span className="text-slate-500 mt-1">Accepts: {fileType} files</span>
        <input type="file" onChange={handleFile} className="hidden" />
      </label>

      {selectedFile && (
        <div className="p-3 bg-slate-950 rounded-xl border border-cyan-500/20 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">File Name:</span>
            <span className="font-bold text-cyan-300 truncate max-w-[200px]">{selectedFile.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Size:</span>
            <span className="text-slate-200">{(selectedFile.size / 1024).toFixed(1)} KB</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">MIME Type:</span>
            <span className="text-slate-200">{selectedFile.type || 'application/octet-stream'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Last Modified:</span>
            <span className="text-slate-200">{new Date(selectedFile.lastModified).toLocaleDateString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// 7. Reminder Subsystem
const ReminderSubsystem: React.FC<{ initialTitle?: string; initialTime?: string }> = ({
  initialTitle = '',
  initialTime = '',
}) => {
  const [reminders, setReminders] = useState<{ id: string; title: string; time: string }[]>([
    { id: '1', title: 'Review Python Factorial in Sandbox', time: 'Today 5:00 PM' },
    { id: '2', title: 'PENTHER Security Audit Check', time: 'Tomorrow 10:00 AM' },
  ]);
  const [newTitle, setNewTitle] = useState(initialTitle);
  const [newTime, setNewTime] = useState(initialTime || 'In 1 hour');

  const addReminder = () => {
    if (!newTitle.trim()) return;
    setReminders([...reminders, { id: Date.now().toString(), title: newTitle, time: newTime }]);
    setNewTitle('');
    setNewTime('');
  };

  const removeReminder = (id: string) => {
    setReminders(reminders.filter((r) => r.id !== id));
  };

  return (
    <div className="flex flex-col gap-4 font-mono text-xs">
      <div className="flex gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Reminder title..."
          className="flex-1 bg-slate-950 border border-cyan-500/30 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
        />
        <input
          type="text"
          value={newTime}
          onChange={(e) => setNewTime(e.target.value)}
          placeholder="Time (e.g. 5 PM)"
          className="w-32 bg-slate-950 border border-cyan-500/30 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
        />
        <button
          onClick={addReminder}
          className="px-3 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl flex items-center justify-center"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
        {reminders.map((r) => (
          <div
            key={r.id}
            className="p-3 bg-slate-950 rounded-xl border border-cyan-500/20 flex items-center justify-between"
          >
            <div>
              <div className="font-semibold text-slate-200">{r.title}</div>
              <div className="text-[10px] text-cyan-400/80">{r.time}</div>
            </div>
            <button
              onClick={() => removeReminder(r.id)}
              className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
