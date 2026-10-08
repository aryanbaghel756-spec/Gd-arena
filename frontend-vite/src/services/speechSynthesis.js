/**
 * Browser Multi-Persona Speech Synthesis (TTS) Manager
 */

import { CONFIG } from '../data/config';

export class SpeechSynthesisService {
  constructor() {
    this.voices = [];
    this.isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

    if (this.isSupported) {
      this.loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    if (!this.isSupported) return;
    this.voices = window.speechSynthesis.getVoices();
  }

  cancel() {
    if (this.isSupported) {
      window.speechSynthesis.cancel();
    }
  }

  speak(text, personaId) {
    return new Promise((resolve) => {
      if (!this.isSupported) {
        // Fallback delay simulation
        const words = text.split(/\s+/).length;
        const delay = Math.max(1500, Math.min(6000, words * 240));
        setTimeout(resolve, delay);
        return;
      }

      this.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const persona = CONFIG.PERSONAS[personaId] || CONFIG.PERSONAS.moderator;

      if (persona.voiceSettings) {
        utterance.pitch = persona.voiceSettings.pitch || 1.0;
        utterance.rate = persona.voiceSettings.rate || 1.0;
      }

      if (this.voices.length > 0) {
        if (personaId === 'meera' || personaId === 'ananya') {
          const female = this.voices.find(v => /female|woman|zira|samantha|karen|veena|victoria/i.test(v.name));
          if (female) utterance.voice = female;
        } else if (personaId === 'aarav' || personaId === 'kabir' || personaId === 'rohan') {
          const male = this.voices.find(v => /male|man|david|rishi|alex|daniel|george/i.test(v.name));
          if (male) utterance.voice = male;
        }
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    });
  }
}

export const ttsService = new SpeechSynthesisService();
