import { useCallback, useRef, useState, useEffect } from "react";

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

    // Stop any previous instance cleanly
    try { recognitionRef.current?.stop(); } catch {}

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
        if (event.results[i].isFinal) finalTranscript += t;
        else interimTranscript += t;
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
    try { recognitionRef.current?.stop(); } catch {}
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  return { isListening, transcript, startListening, stopListening };
}

/**
 * Always-on wake word listener for "Hey NOVA".
 * Uses a debounced restart to prevent rapid start/stop cycling.
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
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intentionalStopRef = useRef(false);

  useEffect(() => { enabledRef.current = enabled; }, [enabled]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { onWakeRef.current = onWake; }, [onWake]);

  const stopPassive = useCallback(() => {
    intentionalStopRef.current = true;
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    try { recognitionRef.current?.stop(); } catch {}
    recognitionRef.current = null;
    setIsPassiveListening(false);
  }, []);

  const startPassive = useCallback(() => {
    if (!enabledRef.current || pausedRef.current) return;

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    // Clean up existing
    try { recognitionRef.current?.stop(); } catch {}
    intentionalStopRef.current = false;

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      if (pausedRef.current) return;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (!event.results[i].isFinal) continue;
        const text = event.results[i][0].transcript.toLowerCase().trim();

        const wakePatterns = ["hey nova", "hey noba", "hey nofa", "a nova", "hey nover", "hey novo", "hello nova"];
        const matchedPattern = wakePatterns.find(p => text.includes(p));

        if (matchedPattern) {
          const idx = text.indexOf(matchedPattern);
          const followUp = text.slice(idx + matchedPattern.length).trim();

          intentionalStopRef.current = true;
          try { recognition.stop(); } catch {}
          setIsPassiveListening(false);

          onWakeRef.current(followUp);
          return;
        }
      }
    };

    recognition.onerror = (e: any) => {
      setIsPassiveListening(false);
      if (e.error !== "aborted" && enabledRef.current && !intentionalStopRef.current) {
        restartTimerRef.current = setTimeout(() => startPassive(), 1500);
      }
    };

    recognition.onend = () => {
      setIsPassiveListening(false);
      if (enabledRef.current && !intentionalStopRef.current && !pausedRef.current) {
        restartTimerRef.current = setTimeout(() => startPassive(), 500);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsPassiveListening(true);
    } catch {
      restartTimerRef.current = setTimeout(() => startPassive(), 1500);
    }
  }, []);

  useEffect(() => {
    if (enabled && !paused) {
      // Small delay to prevent rapid toggling
      const timer = setTimeout(() => startPassive(), 200);
      return () => {
        clearTimeout(timer);
        stopPassive();
      };
    } else {
      stopPassive();
    }
  }, [enabled, paused, startPassive, stopPassive]);

  return { isPassiveListening, restartPassive: startPassive };
}

/**
 * Active listening — captures a single command then stops.
 */
export function useActiveListening() {
  const recognitionRef = useRef<any>(null);
  const [isActive, setIsActive] = useState(false);
  const [activeTranscript, setActiveTranscript] = useState("");

  const listen = useCallback((onComplete: (text: string) => void) => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    // Stop previous
    try { recognitionRef.current?.stop(); } catch {}

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
    recognitionRef.current = null;
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
