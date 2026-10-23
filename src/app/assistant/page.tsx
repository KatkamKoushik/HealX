'use client';

/**
 * AI Healthcare Navigation Assistant Page
 * Interactive grounded chat assistant powered by Gemini and Grok with automatic failover,
 * citation cards linking to hospital records, audio TTS, and zero-diagnostic safety constraints.
 */

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Send,
  Volume2,
  VolumeX,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Bot,
  User,
  ArrowRight,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { useLanguage } from '@/i18n/context';
import { useAccessibility } from '@/lib/accessibility/context';
import { AiNavigationResponse } from '@/lib/ai/ai-service';
import APP_CONFIG from '@/config/app-config';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  responseMeta?: AiNavigationResponse;
  timestamp: string;
}

export default function AssistantPage() {
  const { t, locale } = useLanguage();
  const { speakText, stopSpeech, isSpeaking } = useAccessibility();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);
  const [providerStatus, setProviderStatus] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome greeting
  useEffect(() => {
    const welcomeText =
      locale === 'te'
        ? `నమస్కారం! నేను ${APP_CONFIG.name} ఆరోగ్య నావిగేషన్ AI సహాయకుడిని. ఆసుపత్రులు, అత్యవసర సేవలు, విభాగాలు మరియు పనివేళల గురించి నన్ను అడగవచ్చు. (గమనిక: నేను వైద్య చికిత్స లేదా రోగ నిర్ధారణ చేయలేను).`
        : `Hello! I am your ${APP_CONFIG.name} AI Healthcare Navigation Assistant. You can ask me about hospitals, 24/7 emergency care, clinical departments, and operating hours across South India.`;

    setMessages([
      {
        id: 'msg-welcome',
        sender: 'assistant',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    // Check provider health status
    fetch('/api/assistant')
      .then((r) => r.json())
      .then((d) => setProviderStatus(d.status))
      .catch(() => {});
  }, [locale]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, language: locale }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Request failed');

      const data: AiNavigationResponse = json.data;

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: data.answer,
        responseMeta: data,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text:
          locale === 'te'
            ? 'క్షమించండి, సహాయక సేవ తాత్కాలికంగా స్పందించలేదు. దయచేసి నేరుగా ఆసుపత్రుల డైరెక్టరీలో చూడండి.'
            : 'Sorry, the assistant encountered a temporary issue. Please browse the verified hospital directory directly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeakMessage = (msgId: string, text: string) => {
    if (activeSpeechId === msgId && isSpeaking) {
      stopSpeech();
      setActiveSpeechId(null);
    } else {
      setActiveSpeechId(msgId);
      speakText(text, locale);
    }
  };

  const sampleQuestions = [
    t.assistant.q1,
    t.assistant.q2,
    t.assistant.q3,
    t.assistant.q4,
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      {/* Header & Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Dual-Provider AI Navigation (Gemini & Grok)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {t.assistant.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
            {t.assistant.subtitle}
          </p>
        </div>

        {/* Live Provider Health Badge */}
        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs self-start sm:self-auto text-xs">
          <Cpu className="w-4 h-4 text-emerald-600" />
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800">
              Provider Pipeline:
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Gemini → Grok → Offline Fallback
            </span>
          </div>
        </div>
      </div>

      {/* Mandatory Non-Diagnostic Clinical Safety Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 flex items-start gap-3 text-amber-900 text-xs sm:text-sm">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Important Safety Notice:</strong> {t.assistant.disclaimer}
        </div>
      </div>

      {/* Quick Sample Questions Chips */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {t.assistant.sampleQuestionsTitle}:
        </span>
        <div className="flex flex-wrap gap-2">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSubmit(q)}
              className="text-left text-xs bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-slate-700 px-3 py-2 rounded-xl transition-all shadow-xs"
            >
              "{q}"
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Box */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 min-h-[380px] max-h-[550px] overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 space-y-3 ${
                msg.sender === 'user'
                  ? 'bg-emerald-700 text-white rounded-br-none shadow-sm'
                  : 'bg-slate-50 text-slate-800 rounded-bl-none border border-slate-200/80 shadow-xs'
              }`}
            >
              {/* Message text with whitespace preserving formatting */}
              <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                {msg.text}
              </div>

              {/* Source citations cards if provided by AI */}
              {msg.responseMeta?.sources && msg.responseMeta.sources.length > 0 && (
                <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                  <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                    {t.assistant.sourcesTitle}:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.responseMeta.sources.map((src) => (
                      <Link
                        key={src.recordId}
                        href={`/hospitals/${src.recordId}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50 transition-colors shadow-2xs"
                      >
                        <Building2 className="w-3 h-3 text-emerald-600" />
                        <span className="truncate max-w-[200px]">{src.label}</span>
                        <span>→</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer: Metadata & TTS Voice Playback */}
              <div className="flex items-center justify-between gap-2 pt-1 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span>{msg.timestamp}</span>
                  {msg.responseMeta?.providerUsed && (
                    <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                      Provider: {msg.responseMeta.providerUsed.toUpperCase()}
                      {msg.responseMeta.fallbackTriggered ? ' (Fallback)' : ''}
                    </span>
                  )}
                </div>

                {msg.sender === 'assistant' && (
                  <button
                    onClick={() => handleSpeakMessage(msg.id, msg.text)}
                    className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold p-1 hover:bg-emerald-100 rounded transition-colors"
                    title="Read response aloud"
                  >
                    {activeSpeechId === msg.id && isSpeaking ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-rose-600" />
                        <span className="text-[10px] text-rose-600">Stop Audio</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[10px] text-emerald-700">{t.assistant.readAnswer}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {/* Thinking Indicator */}
        {loading && (
          <div className="flex items-center gap-3 text-slate-500 text-xs sm:text-sm pl-2 animate-pulse">
            <Bot className="w-5 h-5 text-emerald-600" />
            <span>{t.assistant.thinking}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="flex gap-2">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder={t.assistant.inputPlaceholder}
          disabled={loading}
          className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm sm:text-base bg-white shadow-xs"
        />
        <button
          type="submit"
          disabled={loading || !inputQuery.trim()}
          className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold text-sm sm:text-base flex items-center gap-2 shadow-sm transition-colors shrink-0"
        >
          <span>{t.assistant.send}</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
