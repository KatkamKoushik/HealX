'use client';

/**
 * Interactive IVR (Interactive Voice Response) Simulation Console
 * Features visual telephone dialpad, dynamic state-machine navigation,
 * and text-to-speech audio narration for testing telephone caller flows.
 */

import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  PhoneOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Languages,
  ShieldCheck,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import { useAccessibility } from '@/lib/accessibility/context';
import { IvrPromptResult, IvrState } from '@/lib/notifications/ivr-service';
import APP_CONFIG from '@/config/app-config';

export default function IvrSimulatorPage() {
  const { speakText, stopSpeech, isSpeaking } = useAccessibility();

  const [callActive, setCallActive] = useState(false);
  const [ivrData, setIvrData] = useState<IvrPromptResult | null>(null);
  const [dialHistory, setDialHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const startCall = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications/ivr');
      const json = await res.json();
      setIvrData(json.data);
      setDialHistory([]);
      setCallActive(true);

      // Play introductory audio
      if (json.data?.spokenAudioText) {
        speakText(json.data.spokenAudioText, json.data.state.language);
      }
    } catch {
      // error handling
    } finally {
      setLoading(false);
    }
  };

  const endCall = () => {
    stopSpeech();
    setCallActive(false);
    setIvrData(null);
    setDialHistory([]);
  };

  const handlePressDigit = async (digit: string) => {
    if (!callActive || !ivrData || loading) return;

    setDialHistory((prev) => [...prev, digit]);
    setLoading(true);

    try {
      const res = await fetch('/api/notifications/ivr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          digit,
          state: ivrData.state,
        }),
      });

      const json = await res.json();
      setIvrData(json.data);

      if (json.data?.spokenAudioText) {
        speakText(json.data.spokenAudioText, json.data.state.language);
      }
    } catch {
      // error handling
    } finally {
      setLoading(false);
    }
  };

  const dialpadKeys = [
    { key: '1', letters: '' },
    { key: '2', letters: 'ABC' },
    { key: '3', letters: 'DEF' },
    { key: '4', letters: 'GHI' },
    { key: '5', letters: 'JKL' },
    { key: '6', letters: 'MNO' },
    { key: '7', letters: 'PQRS' },
    { key: '8', letters: 'TUV' },
    { key: '9', letters: 'WXYZ' },
    { key: '*', letters: 'BACK' },
    { key: '0', letters: 'OPER' },
    { key: '#', letters: 'MENU' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 mb-1">
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Interactive Telephony Simulation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            IVR Voice Navigation Simulator
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Simulate how citizens without smartphones access healthcare directory data via voice telephony.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Telephone Dialpad Widget */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6 flex flex-col items-center">
          {/* Virtual Display Screen */}
          <div className="w-full bg-slate-950 rounded-2xl p-4 border border-slate-800 text-center space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>{callActive ? 'LINE 1: CONNECTED' : 'READY TO CALL'}</span>
              <span>{callActive ? `${APP_CONFIG.name} HOTLINE` : 'STANDBY'}</span>
            </div>

            <div className="text-lg font-bold font-mono tracking-wider text-emerald-400">
              {callActive ? '1800-SFIC-HEALTH' : 'ENTER EXTENSION'}
            </div>

            {dialHistory.length > 0 && (
              <div className="text-xs font-mono text-slate-400 pt-1">
                Digits Pressed: [{dialHistory.join(' -> ')}]
              </div>
            )}
          </div>

          {/* Dialpad Grid (3x4) */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
            {dialpadKeys.map((item) => (
              <button
                key={item.key}
                disabled={!callActive || loading}
                onClick={() => handlePressDigit(item.key)}
                className="h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 active:bg-emerald-700 disabled:opacity-40 text-white flex flex-col items-center justify-center font-bold border border-slate-700/60 shadow-sm transition-all focus:outline-none"
              >
                <span className="text-lg leading-tight">{item.key}</span>
                {item.letters && (
                  <span className="text-[9px] text-slate-400 tracking-wider">
                    {item.letters}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Call / Hangup Trigger */}
          <div className="w-full max-w-xs pt-2">
            {!callActive ? (
              <button
                onClick={startCall}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 font-bold text-sm text-slate-950 flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Simulate Call to {APP_CONFIG.name}</span>
              </button>
            ) : (
              <button
                onClick={endCall}
                className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Hang Up Simulator</span>
              </button>
            )}
          </div>
        </div>

        {/* Current Voice Prompt & State Machine Pane */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
              Caller Telephony State
            </h2>
            {callActive && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Active Call Session</span>
              </span>
            )}
          </div>

          {!callActive ? (
            <div className="p-8 text-center space-y-3 text-slate-500">
              <PhoneCall className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">Simulation Idle</h3>
              <p className="text-xs max-w-xs mx-auto leading-relaxed">
                Click "Simulate Call" on the dialpad to start caller audio and step through the English/Telugu voice tree.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Spoken Text Display Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>Current Voice Prompt:</span>
                  <button
                    onClick={() => {
                      if (ivrData?.spokenAudioText) {
                        speakText(ivrData.spokenAudioText, ivrData.state.language);
                      }
                    }}
                    className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 text-xs font-semibold"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Replay Audio</span>
                  </button>
                </div>
                <div className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed font-sans bg-white p-3 rounded-xl border border-slate-200/80">
                  {ivrData?.promptText}
                </div>
              </div>

              {/* Available Keypad Options */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                  Accepted Keypad Actions:
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {ivrData?.availableOptions.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => handlePressDigit(opt.key)}
                      className="p-3 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 flex items-center justify-between text-left transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-md bg-slate-800 text-white font-mono text-xs flex items-center justify-center font-bold">
                          {opt.key}
                        </span>
                        <span className="text-xs font-semibold text-slate-800">
                          {opt.label}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {opt.actionDesc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
