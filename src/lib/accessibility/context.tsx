'use client';

/**
 * Accessibility Context & Settings
 * Manages font-scale (normal, large, x-large), contrast mode, and voice TTS.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { TextToSpeechManager } from './tts';

export type FontSizeOption = 'normal' | 'large' | 'xlarge';
export type ContrastOption = 'normal' | 'high';

interface AccessibilityContextType {
  fontSize: FontSizeOption;
  setFontSize: (size: FontSizeOption) => void;
  contrast: ContrastOption;
  setContrast: (contrast: ContrastOption) => void;
  speakText: (text: string, lang?: 'en' | 'te') => void;
  stopSpeech: () => void;
  isSpeaking: boolean;
  isTtsSupported: boolean;
  hasTeluguVoice: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSizeOption>('normal');
  const [contrast, setContrastState] = useState<ContrastOption>('normal');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTtsSupported, setIsTtsSupported] = useState(false);
  const [hasTeluguVoice, setHasTeluguVoice] = useState(false);

  useEffect(() => {
    try {
      const savedSize = localStorage.getItem('sfic_font_size') as FontSizeOption | null;
      if (savedSize) setFontSizeState(savedSize);

      const savedContrast = localStorage.getItem('sfic_contrast') as ContrastOption | null;
      if (savedContrast) setContrastState(savedContrast);

      const tts = TextToSpeechManager.getInstance();
      setIsTtsSupported(tts.isSupported());
      setHasTeluguVoice(tts.hasTeluguVoice());
    } catch {
      // Storage unavailable
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-normal', 'font-large', 'font-xlarge');
    root.classList.add(`font-${fontSize}`);

    if (contrast === 'high') {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [fontSize, contrast]);

  const setFontSize = (size: FontSizeOption) => {
    setFontSizeState(size);
    try {
      localStorage.setItem('sfic_font_size', size);
    } catch {}
  };

  const setContrast = (mode: ContrastOption) => {
    setContrastState(mode);
    try {
      localStorage.setItem('sfic_contrast', mode);
    } catch {}
  };

  const speakText = (text: string, lang: 'en' | 'te' = 'en') => {
    const tts = TextToSpeechManager.getInstance();
    setIsSpeaking(true);
    tts.speak(text, {
      lang,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const stopSpeech = () => {
    const tts = TextToSpeechManager.getInstance();
    tts.stop();
    setIsSpeaking(false);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        fontSize,
        setFontSize,
        contrast,
        setContrast,
        speakText,
        stopSpeech,
        isSpeaking,
        isTtsSupported,
        hasTeluguVoice,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
