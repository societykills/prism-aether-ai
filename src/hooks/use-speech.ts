import { useCallback, useRef, useState, useEffect } from "react";

/**
 * Always-on speech recognition with "Hey NOVA" wake word detection.
 * After wake word is detected, captures the user's command and sends it.
 * After NOVA responds (and finishes speaking), automatically resumes listening.
 */
export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const onResultRef = useRef<((text: string) => void) | null>(null);

  const startListening = useCallback((onResult: (text: string) => void) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported");
      return;
    }

    onResultRef.current = onResult;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += t;
        } else {
          interimTranscript += t;
        }
      }
      setTranscript(finalTranscript || interimTranscript);
      if (finalTranscript) {
        onResultRef.current?.(finalTranscript);
        setIsListening(false);
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setTranscript("");
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { isListening, transcript, startListening, stopListening };
}

/**
 * Always-on wake word listener.
 * Runs continuous speech recognition in the background, waiting for "hey nova".
 * When detected, calls onWake with any text that followed the wake phrase.
 */
export function useWakeWord(
  enabled: boolean,
  onWake: (followUp: string) => void,
  paused: boolean = false
) {
  const recognitionRef = useRef<any>(null);
  const [isPassiveListening, setIsPassiveListening] = useState(false);
  const enabledRef = useRef(enabled);
  const pausedRef = useRef(paused);
  const onWakeRef = useRef(onWake);

  useEffect(() => { enabledRef.current = enabled; }, [enabled]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { onWakeRef.current = onWake; }, [onWake]);

  const startPassive = useCallback(() => {
    if (!enabledRef.current) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    // Stop any existing instance
    try { recognitionRef.current?.stop(); } catch {}

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      if (pausedRef.current) return;
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (!event.results[i].isFinal) continue;
        const text = event.results[i][0].transcript.toLowerCase().trim();
        
        // Check for wake word variations
        const wakePatterns = ["hey nova", "hey noba", "hey nofa", "a nova", "hey nover", "hey novo"];
        const matchedPattern = wakePatterns.find(p => text.includes(p));
        
        if (matchedPattern) {
          // Extract the command after the wake word
          const idx = text.indexOf(matchedPattern);
          const followUp = text.slice(idx + matchedPattern.length).trim();
          
          // Stop passive listening while NOVA processes
          try { recognition.stop(); } catch {}
          setIsPassiveListening(false);
          
          onWakeRef.current(followUp);
          return;
        }
      }
    };

    recognition.onerror = (e: any) => {
      // Restart on most errors (not "aborted" which is intentional)
      if (e.error !== "aborted" && enabledRef.current) {
        setTimeout(() => startPassive(), 1000);
      }
      setIsPassiveListening(false);
    };

    recognition.onend = () => {
      setIsPassiveListening(false);
      // Auto-restart if still enabled
      if (enabledRef.current) {
        setTimeout(() => startPassive(), 300);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsPassiveListening(true);
    } catch {
      setTimeout(() => startPassive(), 1000);
    }
  }, []);

  const stopPassive = useCallback(() => {
    try { recognitionRef.current?.stop(); } catch {}
    recognitionRef.current = null;
    setIsPassiveListening(false);
  }, []);

  useEffect(() => {
    if (enabled && !paused) {
      startPassive();
    } else {
      stopPassive();
    }
    return () => stopPassive();
  }, [enabled, paused, startPassive, stopPassive]);

  return { isPassiveListening, restartPassive: startPassive };
}

/**
 * Active listening mode — captures a single command then stops.
 * Used after wake word is detected to capture the full command.
 */
export function useActiveListening() {
  const recognitionRef = useRef<any>(null);
  const [isActive, setIsActive] = useState(false);
  const [activeTranscript, setActiveTranscript] = useState("");

  const listen = useCallback((onComplete: (text: string) => void) => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t;
        else interim += t;
      }
      setActiveTranscript(final || interim);
      if (final) {
        onComplete(final);
        setIsActive(false);
      }
    };

    recognition.onerror = () => setIsActive(false);
    recognition.onend = () => setIsActive(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsActive(true);
    setActiveTranscript("");
  }, []);

  const cancel = useCallback(() => {
    try { recognitionRef.current?.stop(); } catch {}
    setIsActive(false);
  }, []);

  return { isActive, activeTranscript, listen, cancel };
}

export function speak(text: string, onEnd?: () => void) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 0.9;
  utterance.volume = 1;

  // Try to pick a good voice
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(
    (v) => v.name.includes("Google") && v.lang.startsWith("en")
  ) || voices.find((v) => v.lang.startsWith("en"));
  if (preferred) utterance.voice = preferred;

  utterance.onend = () => onEnd?.();
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  window.speechSynthesis?.cancel();
}
