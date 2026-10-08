/**
 * Browser Speech Recognition (STT) Manager
 */

export class SpeechRecognitionService {
  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.isSupported = !!SpeechRecognition;
    this.recognition = null;
    this.isListening = false;
    this.mediaRecorder = null;
    this.audioChunks = [];

    if (this.isSupported) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-IN';
    }
  }

  start({ onInterim, onFinal, onError }) {
    if (!this.isSupported) {
      if (onError) onError(new Error("Browser speech recognition not supported. Please use typed input."));
      return;
    }

    this.isListening = true;

    this.recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (onInterim && interim) onInterim(interim);
      if (onFinal && final) onFinal(final);
    };

    this.recognition.onerror = (event) => {
      if (onError && event.error !== 'no-speech') {
        onError(event);
      }
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        try { this.recognition.start(); } catch {}
      }
    };

    try {
      this.recognition.start();
    } catch {
      // Already running
    }
  }

  stop() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
    }
  }
}

export const sttService = new SpeechRecognitionService();
