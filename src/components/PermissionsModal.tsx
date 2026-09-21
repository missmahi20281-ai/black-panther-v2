import React from 'react';
import { X, ShieldCheck, Mic, Camera, Bell, Folder, MapPin, AlertCircle, Check } from 'lucide-react';
import { AndroidPermission } from '../types';

interface PermissionsModalProps {
  isOpen: boolean;
  permissions: AndroidPermission[];
  onTogglePermission: (id: string) => void;
  onClose: () => void;
}

export const PermissionsModal: React.FC<PermissionsModalProps> = ({
  isOpen,
  permissions,
  onTogglePermission,
  onClose,
}) => {
  if (!isOpen) return null;

  const getIcon = (id: string) => {
    switch (id) {
      case 'microphone':
        return <Mic size={18} className="text-cyan-400" />;
      case 'camera':
        return <Camera size={18} className="text-purple-400" />;
      case 'notifications':
        return <Bell size={18} className="text-amber-400" />;
      case 'storage':
        return <Folder size={18} className="text-emerald-400" />;
      case 'location':
        return <MapPin size={18} className="text-rose-400" />;
      default:
        return <ShieldCheck size={18} className="text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-lg bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-[0_0_40px_rgba(0,240,255,0.15)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-cyan-500/20 bg-slate-950/80">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-sm font-semibold tracking-wider">
            <ShieldCheck size={18} />
            <span>CENTRALIZED PERMISSION MANAGER</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Rationale Notice */}
        <div className="flex items-start gap-2.5 px-5 py-3 bg-cyan-950/30 border-b border-cyan-500/10 text-cyan-200 text-xs">
          <AlertCircle size={16} className="shrink-0 text-cyan-400 mt-0.5" />
          <p className="leading-relaxed">
            PENTHER enforces strict least-privilege security. Permissions are only requested when needed. If denied, PENTHER operates gracefully with reduced functionality.
          </p>
        </div>

        {/* Permissions List */}
        <div className="p-5 flex flex-col gap-3 overflow-y-auto">
          {permissions.map((perm) => (
            <div
              key={perm.id}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3 hover:border-cyan-500/30 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                  {getIcon(perm.id)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-100 text-sm">{perm.name}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        perm.granted
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {perm.granted ? 'GRANTED' : 'REVOKED / DENIED'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{perm.description}</p>
                  <p className="text-[11px] text-cyan-400/80 font-mono mt-1">
                    Rationale: {perm.rationale}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onTogglePermission(perm.id)}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-semibold shrink-0 transition-all ${
                  perm.granted
                    ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40 hover:bg-rose-900/60'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                }`}
              >
                {perm.granted ? 'Revoke' : 'Authorize'}
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs font-mono text-slate-500">
          <span>Target Android API: 34 (Android 14)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
