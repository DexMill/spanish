/**
 * Speech Recognition and Synthesis Module
 * Handles text-to-speech and speech-to-text functionality
 */

export class SpeechManager {
  constructor() {
    this.synthesis = window.speechSynthesis;
    this.recognition = null;
    this.voices = {
      es: null,
      en: null,
    };
    this.isListening = false;
    this.audioButton = null;

    this.initRecognition();
    this.initVoices();
  }

  // Initialize speech recognition
  initRecognition() {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
      } else {
        console.error("Speech recognition not supported in this browser");
      }
    } catch (e) {
      console.error("Error initializing speech recognition:", e);
    }
  }

  // Initialize speech synthesis voices
  initVoices() {
    const loadVoices = () => {
      const voices = this.synthesis.getVoices();
      this.voices.es = voices.find((v) => v.lang.startsWith("es")) || voices[0];
      this.voices.en = voices.find((v) => v.lang.startsWith("en")) || voices[0];
    };

    // Load voices when they're ready
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = loadVoices;
    }
    loadVoices();
  }

  // Speak text in specified language
  speak(text, lang) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.voices[lang];
    utterance.lang = lang === "es" ? "es-ES" : "en-US";
    this.synthesis.speak(utterance);
  }

  // Start listening for speech input
  startListening(lang, onResult, onError) {
    if (!this.recognition || this.isListening) return;

    // Configure recognition based on language
    if (lang === "es") {
      this.recognition.lang = "es-ES";
      this.recognition.maxAlternatives = 10;
    } else {
      this.recognition.lang = "en-US";
      this.recognition.maxAlternatives = 5;
    }

    this.recognition.onresult = (event) => {
      const alternatives = Array.from(event.results[0]).map((result) =>
        result.transcript
      );
      onResult(alternatives);
      this.stopListening();
    };

    this.recognition.onend = () => {
      this.stopListening();
    };

    this.recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      this.stopListening();
      if (onError) onError(event.error);
    };

    this.recognition.start();
    this.isListening = true;
    if (this.audioButton) {
      this.audioButton.classList.add("listening");
    }
  }

  // Stop listening for speech input
  stopListening() {
    if (!this.isListening) return;
    if (this.recognition) {
      this.recognition.stop();
    }
    this.isListening = false;
    if (this.audioButton) {
      this.audioButton.classList.remove("listening");
    }
  }

  // Set reference to audio button for UI updates
  setAudioButton(button) {
    this.audioButton = button;
  }
}
