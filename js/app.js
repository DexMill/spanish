/**
 * Main Application Logic
 * Handles UI interactions, card management, and session state
 */

import { scheduler } from "./scheduler.js";
import { SpeechManager } from "./speech.js";
import {
  normalizeAnswer,
  numberWords,
  digitWords,
  unique,
  shuffle,
} from "./utils.js";

class SpanishAnkiApp {
  constructor() {
    this.vocabulary = null;
    this.cards = [];
    this.scheduleData = scheduler.load();
    this.queue = [];
    this.currentCard = null;
    this.seenThisSession = 0;
    this.cardStartTime = 0;
    this.speechManager = new SpeechManager();

    // DOM elements
    this.elements = {
      categoryList: document.getElementById("categoryList"),
      startBtn: document.getElementById("startBtn"),
      flipBtn: document.getElementById("flipBtn"),
      card: document.getElementById("card"),
      front: document.getElementById("front"),
      back: document.getElementById("back"),
      hint: document.getElementById("hint"),
      cardMeta: document.getElementById("cardMeta"),
      gradeBar: document.getElementById("gradeBar"),
      dueStat: document.getElementById("dueStat"),
      newStat: document.getElementById("newStat"),
      seenStat: document.getElementById("seenStat"),
      direction: document.getElementById("direction"),
      maxNew: document.getElementById("maxNew"),
      resetBtn: document.getElementById("resetBtn"),
      exportBtn: document.getElementById("exportBtn"),
      importFile: document.getElementById("importFile"),
      answerInput: document.getElementById("answerInput"),
    };

    this.init();
  }

  async init() {
    await this.loadVocabulary();
    this.setupCards();
    this.renderCategoryList();
    this.updateStats();
    this.bindEvents();
    this.addAudioControls();
  }

  async loadVocabulary() {
    try {
      const response = await fetch("./data/vocabulary.json");
      this.vocabulary = await response.json();
    } catch (error) {
      console.error("Failed to load vocabulary:", error);
      alert("Failed to load vocabulary data. Please refresh the page.");
    }
  }

  setupCards() {
    if (!this.vocabulary) return;

    this.cards = this.vocabulary.vocabulary.map((item, index) => ({
      id: `${item.category}::${item.spanish}::${item.english}`,
      category: item.category,
      spanish: item.spanish,
      english: item.english,
    }));
  }

  renderCategoryList() {
    if (!this.vocabulary) return;

    const categories = this.vocabulary.categoryOrder.filter((cat) =>
      this.getCategories().includes(cat)
    );

    this.elements.categoryList.innerHTML = "";
    categories.forEach((cat) => {
      const id = "cat_" + cat.replace(/\W+/g, "_");
      const wrap = document.createElement("label");
      wrap.className = "cat";
      wrap.innerHTML = `
        <input type="checkbox" id="${id}" data-cat="${cat}" checked />
        <span>${cat}</span>
      `;
      this.elements.categoryList.appendChild(wrap);
    });
  }

  getCategories() {
    return unique(this.cards.map((c) => c.category));
  }

  getSelectedCategories() {
    return Array.from(
      this.elements.categoryList.querySelectorAll(
        'input[type="checkbox"]:checked'
      )
    ).map((i) => i.dataset.cat);
  }

  buildQueue() {
    const selectedCats = new Set(this.getSelectedCategories());
    const maxNew = parseInt(this.elements.maxNew.value || "999", 10);
    const now = Date.now();
    const due = [];
    const fresh = [];

    this.cards.forEach((card) => {
      if (!selectedCats.has(card.category)) return;
      const schedule = this.scheduleData[card.id];
      if (!schedule) {
        fresh.push(card);
        return;
      }
      if (schedule.due <= now) due.push(card);
    });

    // Limit new cards per session
    const newLimited = fresh.slice(0, maxNew);

    // Combine due and new cards
    const combined = [...due, ...newLimited];

    // Shuffle the queue
    this.queue = shuffle(combined).map((c) => c.id);
    this.updateStats();
  }

  updateStats() {
    const now = Date.now();
    const selectedCats = new Set(this.getSelectedCategories());
    let due = 0;
    let fresh = 0;

    this.cards.forEach((card) => {
      if (!selectedCats.has(card.category)) return;
      const schedule = this.scheduleData[card.id];
      if (!schedule) fresh++;
      else if (schedule.due <= now) due++;
    });

    this.elements.dueStat.textContent = `Due now: ${due}`;
    this.elements.newStat.textContent = `New left: ${Math.max(
      0,
      parseInt(this.elements.maxNew.value || "999", 10) -
        this.getSeenThisSessionNewCount()
    )}`;
    this.elements.seenStat.textContent = `Seen this session: ${this.seenThisSession}`;
  }

  getSeenThisSessionNewCount() {
    return this.cards.filter((c) => c._seenNewSession).length;
  }

  nextCard() {
    if (this.queue.length === 0) {
      this.buildQueue();
      if (this.queue.length === 0) {
        this.elements.cardMeta.textContent = "No cards due. You are caught up!";
        this.elements.front.textContent = "";
        this.elements.back.textContent = "";
        this.elements.gradeBar.classList.add("hidden");
        this.elements.answerInput.value = "";
        this.elements.answerInput.classList.remove("correct", "incorrect");
        return;
      }
    }

    const id = this.queue.shift();
    this.currentCard = this.cards.find((c) => c.id === id);
    const schedule = this.scheduleData[id] || scheduler.createDefault();

    // Determine direction
    let direction = this.elements.direction.value;
    if (direction === "mix") {
      const modes = [
        "es-en",
        "en-es",
        "es-en-voice",
        "en-es-voice",
        "es-voice-en",
        "en-voice-es",
      ];
      direction = modes[Math.floor(Math.random() * modes.length)];
    }

    // Set up front and back based on direction
    let front, back;
    if (direction.startsWith("es")) {
      front = this.currentCard.spanish;
      back = this.currentCard.english;
    } else {
      front = this.currentCard.english;
      back = this.currentCard.spanish;
    }

    // Update UI elements
    this.elements.cardMeta.textContent = `${this.currentCard.category}`;

    // In voice-to-text modes, hide the text and show a prompt
    if (direction.includes("-voice-")) {
      this.elements.front.textContent =
        "Click the speaker icon to hear the word";
      this.elements.front.classList.add("muted");
    } else {
      this.elements.front.textContent = front;
      this.elements.front.classList.remove("muted");
    }

    this.elements.back.textContent = back;
    this.elements.back.classList.add("hidden");
    this.elements.gradeBar.classList.add("hidden");
    this.elements.answerInput.value = "";
    this.elements.answerInput.classList.remove("correct", "incorrect");

    // Show/hide input based on mode
    if (direction.endsWith("-voice")) {
      this.elements.answerInput.setAttribute("readonly", "true");
      this.elements.answerInput.placeholder =
        "Click microphone to record answer...";
    } else {
      this.elements.answerInput.removeAttribute("readonly");
      this.elements.answerInput.placeholder = "Type your answer...";
      this.elements.answerInput.focus();
    }

    this.cardStartTime = Date.now();
    const responseTimeText = this.currentCard._responseTime
      ? ` · Time: ${(this.currentCard._responseTime / 1000).toFixed(1)}s`
      : "";

    this.elements.hint.textContent =
      schedule.reps === 0
        ? "New card"
        : `Due ${scheduler.formatTime(schedule.due)} · EF ${schedule.ef.toFixed(
            2
          )} · Streak ${schedule.reps}${
            schedule.isLeech ? " · ⚠️ Difficult Card" : ""
          }${responseTimeText}`;
  }

  showAnswer() {
    const userAnswer = normalizeAnswer(
      this.elements.answerInput.value,
      this.currentCard
    );
    const correctAnswer = normalizeAnswer(
      this.elements.back.textContent,
      this.currentCard
    );
    const isCorrect = userAnswer === correctAnswer;
    const responseTime = Date.now() - this.cardStartTime;

    this.elements.back.classList.remove("hidden");
    this.elements.gradeBar.classList.remove("hidden");
    this.elements.answerInput.classList.add(
      isCorrect ? "correct" : "incorrect"
    );

    this.elements.flipBtn.textContent = "Grade (Enter)";

    // Store response time and show suggested grade
    this.currentCard._responseTime = responseTime;

    // Show suggested grade based on correctness and time
    let suggestedGrade;
    if (!isCorrect) {
      suggestedGrade = "Again";
    } else if (responseTime < 8000) {
      suggestedGrade = "Easy";
    } else if (responseTime < 30000) {
      suggestedGrade = "Good";
    } else {
      suggestedGrade = "Hard";
    }
    this.elements.hint.textContent += ` · Suggested: ${suggestedGrade}`;
  }

  gradeCard(grade) {
    if (!this.currentCard) return;

    const id = this.currentCard.id;
    let schedule = this.scheduleData[id] || scheduler.createDefault();
    const firstTime = !this.scheduleData[id];

    schedule = scheduler.grade(schedule, grade);
    this.scheduleData[id] = schedule;
    scheduler.save(this.scheduleData);

    if (firstTime) {
      this.currentCard._seenNewSession = true;
    }

    this.seenThisSession++;
    this.updateStats();
    this.nextCard();
  }

  // Export/Import/Reset functions
  exportProgress() {
    const blob = new Blob([JSON.stringify(this.scheduleData, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "senderos1a_progress.json";
    a.click();
  }

  importProgress(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (typeof data === "object" && data) {
          this.scheduleData = data;
          scheduler.save(this.scheduleData);
          alert("Progress imported!");
          this.updateStats();
        } else throw new Error("Invalid file");
      } catch (e) {
        alert("Import failed: " + e.message);
      }
    };
    reader.readAsText(file);
  }

  resetProgress() {
    if (confirm("Reset all spaced-repetition data for this deck?")) {
      this.scheduleData = {};
      scheduler.save(this.scheduleData);
      this.seenThisSession = 0;
      this.cards.forEach((c) => delete c._seenNewSession);
      this.updateStats();
      this.nextCard();
    }
  }

  addAudioControls() {
    const direction = this.elements.direction.value;
    const isTextToVoice = direction.endsWith("-voice");
    const isVoiceToText = direction.includes("-voice-");

    // Remove existing controls
    const existingControls = document.querySelector(".audio-controls");
    if (existingControls) {
      existingControls.remove();
    }

    if (isTextToVoice || isVoiceToText) {
      const audioControls = document.createElement("div");
      audioControls.className = "audio-controls";

      let html = "";
      if (isTextToVoice) {
        html += `
          <button class="btn audio-btn" id="recordBtn" title="Record Answer">
            <span class="material-icons">mic</span>
          </button>
        `;
      }
      if (isVoiceToText) {
        html += `
          <button class="btn audio-btn" id="playBtn" title="Play Text">
            <span class="material-icons">volume_up</span>
          </button>
        `;
      }

      audioControls.innerHTML = html;
      this.elements.card.insertBefore(audioControls, this.elements.gradeBar);

      // Wire up events
      const playBtn = document.getElementById("playBtn");
      const recordBtn = document.getElementById("recordBtn");

      if (playBtn) {
        playBtn.onclick = () => {
          const text = direction.startsWith("es")
            ? this.currentCard.spanish
            : this.currentCard.english;
          const lang = direction.startsWith("es") ? "es" : "en";
          this.speechManager.speak(text, lang);
        };
      }

      if (recordBtn) {
        this.speechManager.setAudioButton(recordBtn);
        recordBtn.onclick = () => {
          if (this.speechManager.isListening) {
            this.speechManager.stopListening();
          } else {
            const lang = direction.endsWith("-voice")
              ? direction.startsWith("en-")
                ? "es"
                : "en"
              : direction.startsWith("es-")
              ? "es"
              : "en";

            this.speechManager.startListening(
              lang,
              (alternatives) =>
                this.handleSpeechResult(alternatives, direction),
              (error) => alert("Speech recognition error. Please try again.")
            );
          }
        };
      }
    }
  }

  handleSpeechResult(alternatives, direction) {
    const normalizedAlts = alternatives.map((alt) =>
      normalizeAnswer(alt, this.currentCard)
    );
    const expectedAnswer = direction.endsWith("-voice")
      ? direction.startsWith("en-")
        ? this.currentCard.spanish
        : this.currentCard.english
      : direction.startsWith("es-")
      ? this.currentCard.spanish
      : this.currentCard.english;
    const normalizedExpected = normalizeAnswer(
      expectedAnswer,
      this.currentCard
    );

    // Handle number categories specially
    if (this.currentCard.category === "Numbers") {
      const isSpanish =
        direction.includes("es-voice") ||
        (direction.endsWith("-voice") && direction.startsWith("en-"));

      const numberAlts = normalizedAlts.map((alt) => {
        if (/^\d+$/.test(alt)) return alt;
        return numberWords[alt] || alt;
      });

      const expectedNumber = /^\d+$/.test(normalizedExpected)
        ? normalizedExpected
        : numberWords[normalizedExpected];

      const matchingNumber = numberAlts.find((alt) => alt === expectedNumber);

      if (matchingNumber) {
        if (isSpanish) {
          const spanishWord = Object.entries(numberWords).find(
            ([word, num]) => num === matchingNumber && /[aeiouáéíóú]/.test(word)
          )?.[0];
          this.elements.answerInput.value = spanishWord || alternatives[0];
        } else {
          const englishWord = Object.entries(numberWords).find(
            ([word, num]) =>
              num === matchingNumber && !/[aeiouáéíóú]/.test(word)
          )?.[0];
          this.elements.answerInput.value = englishWord || alternatives[0];
        }
      } else {
        this.elements.answerInput.value = alternatives[0];
      }
    } else {
      const matchingAlt = normalizedAlts.find(
        (alt) => alt === normalizedExpected
      );
      this.elements.answerInput.value = matchingAlt || alternatives[0];
    }

    this.showAnswer();
  }

  bindEvents() {
    // Main UI events
    this.elements.startBtn.onclick = () => {
      this.buildQueue();
      this.nextCard();
    };

    this.elements.flipBtn.onclick = () => this.showAnswer();

    this.elements.gradeBar.querySelectorAll("[data-grade]").forEach((btn) => {
      btn.onclick = () => this.gradeCard(parseInt(btn.dataset.grade, 10));
    });

    // Settings events
    this.elements.resetBtn.onclick = () => this.resetProgress();
    this.elements.exportBtn.onclick = () => this.exportProgress();
    this.elements.importFile.onchange = (e) => {
      const file = e.target.files[0];
      if (file) this.importProgress(file);
    };

    // Category and settings changes
    this.elements.categoryList.addEventListener("change", () => {
      this.updateStats();
      this.buildQueue();
    });

    this.elements.direction.addEventListener("change", () => {
      this.addAudioControls();
    });

    this.elements.maxNew.addEventListener("change", () => this.updateStats());

    // Speaker button for Spanish TTS
    const speakBtn = document.getElementById("speakBtn");
    if (speakBtn) {
      speakBtn.onclick = () => {
        if (this.currentCard) {
          this.speechManager.speak(this.currentCard.spanish, "es");
        }
      };
    }

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.code === "Enter") {
        e.preventDefault();
        if (this.elements.back.classList.contains("hidden")) {
          this.showAnswer();
        } else if (
          this.currentCard &&
          this.currentCard._responseTime !== undefined
        ) {
          const responseTime = this.currentCard._responseTime;
          const isCorrect =
            this.elements.answerInput.classList.contains("correct");

          if (!isCorrect) {
            this.gradeCard(1); // Again
          } else if (responseTime < 8000) {
            this.gradeCard(4); // Easy
          } else if (responseTime < 30000) {
            this.gradeCard(3); // Good
          } else {
            this.gradeCard(2); // Hard
          }
        }
      }

      // Manual grading shortcuts
      if (!this.elements.back.classList.contains("hidden")) {
        if (e.key === "1") this.gradeCard(1);
        if (e.key === "2") this.gradeCard(2);
        if (e.key === "3") this.gradeCard(3);
        if (e.key === "4") this.gradeCard(4);
      }
    });
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new SpanishAnkiApp();
});
