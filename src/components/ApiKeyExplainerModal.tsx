import React, { useState, useEffect } from 'react';
import { X, Key, CheckCircle2, Copy, ExternalLink, Shield } from 'lucide-react';

interface ApiKeyExplainerModalProps {
  onClose: () => void;
}

export const ApiKeyExplainerModal: React.FC<ApiKeyExplainerModalProps> = ({ onClose }) => {
  const [copiedStep, setCopiedStep] = useState<string | null>(null);
  const [hasServerKey, setHasServerKey] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setHasServerKey(Boolean(data.hasApiKey)))
      .catch(() => setHasServerKey(false));
  }, []);

  const copyToClipboard = (text: string, stepId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepId);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Gemini API & Local Setup Guide
              </h3>
              <p className="text-xs text-slate-500">
                {hasServerKey
                  ? 'Connected: Server-Side Gemini Engine Active'
                  : 'Environment & VS Code Setup Instructions'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-xs">
                In Google AI Studio: Connected & Ready
              </h4>
              <p className="text-slate-700 leading-relaxed">
                Your server environment is already configured via{' '}
                <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-200 text-emerald-800 font-mono">
                  process.env.GEMINI_API_KEY
                </code>
                . All multi-agent diagnostics and peer debates run securely on the server.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs">
                01. Creating a Key for Local VS Code Runs
              </span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold"
              >
                <span>Open Key Page</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Visit{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 underline font-mono"
              >
                aistudio.google.com/app/apikey
              </a>{' '}
              to generate a key for local terminal development.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="font-bold text-slate-900 text-xs block">
              02. Setting the Environment Variable in VS Code
            </span>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-slate-600">
                <span>Terminal Command (Mac / Linux)</span>
                <button
                  onClick={() =>
                    copyToClipboard('export GEMINI_API_KEY="your-api-key-here"', 'opt-a')
                  }
                  className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-mono"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedStep === 'opt-a' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 font-mono text-indigo-900">
                export GEMINI_API_KEY="your-api-key-here"
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-slate-700 leading-relaxed">
              <strong>Resilient Ledger Engine:</strong> Even when offline, the pre-computed San Mateo 2,400-transaction general ledger model keeps all P&L nodes and resolution sequences active.
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
