/**
 * Utility functions for text normalization and answer processing
 */

// Number word to digit mapping (both English and Spanish)
export const numberWords = {
  // English
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
  ten: "10",
  eleven: "11",
  twelve: "12",
  thirteen: "13",
  fourteen: "14",
  fifteen: "15",
  sixteen: "16",
  seventeen: "17",
  eighteen: "18",
  nineteen: "19",
  twenty: "20",

  // Spanish (with common speech recognition variations)
  uno: "1",
  un: "1",
  dos: "2",
  dose: "2", // common misrecognition
  tres: "3",
  trace: "3", // common misrecognition
  cuatro: "4",
  cinco: "5",
  seis: "6",
  sais: "6", // common misrecognition
  siete: "7",
  ocho: "8",
  nueve: "9",
  diez: "10",
  dies: "10", // common misrecognition
  once: "11",
  doce: "12",
  trece: "13",
  catorce: "14",
  quince: "15",
  dieciseis: "16",
  dieciséis: "16",
  "dieci seis": "16", // sometimes recognized with space
  diecisiete: "17",
  "dieci siete": "17",
  dieciocho: "18",
  "dieci ocho": "18",
  diecinueve: "19",
  "dieci nueve": "19",
  veinte: "20",
  vente: "20", // common misrecognition

  // Additional variations for compound numbers
  "diez y seis": "16",
  "diez y siete": "17",
  "diez y ocho": "18",
  "diez y nueve": "19",
};

// Digit to word mapping (reverse of numberWords)
export const digitWords = Object.fromEntries(
  Object.entries(numberWords).map(([word, digit]) => [digit, word])
);

/**
 * Normalize answer text for comparison
 * @param {string} text - The text to normalize
 * @param {Object} currentCard - Current flashcard object
 * @returns {string} Normalized text
 */
export function normalizeAnswer(text, currentCard = null) {
  let normalized = text
    .toLowerCase()
    .trim()
    // Remove punctuation
    .replace(/[.,!?]/g, "")
    // Remove gender indicators in parentheses
    .replace(/\s*\([^)]*\)/g, "")
    // Remove the word "male" or "female" at the end
    .replace(/\s+(male|female)$/g, "")
    // Keep Spanish accents for Spanish answers
    .replace(/\s+/g, " ");

  // For the Numbers category, handle numeric answers
  if (currentCard && currentCard.category === "Numbers") {
    // If input is a number (e.g., "18"), convert to word
    if (/^\d+$/.test(normalized)) {
      const asWord = digitWords[normalized];
      if (asWord) return asWord;
    }
    // If input is a word (e.g., "eighteen"), convert to word
    const asDigit = numberWords[normalized];
    if (asDigit) {
      const backToWord = digitWords[asDigit];
      if (backToWord) return backToWord;
    }
  } else {
    // For non-number categories, use original logic
    // Convert number words to digits
    const asDigit = numberWords[normalized];
    if (asDigit) return asDigit;

    // Convert digits to number words
    const asWord = digitWords[normalized];
    if (asWord) return asWord;
  }

  return normalized;
}

/**
 * Get unique values from array
 * @param {Array} arr - Array to deduplicate
 * @returns {Array} Array with unique values
 */
export function unique(arr) {
  return Array.from(new Set(arr));
}

/**
 * Fisher-Yates shuffle algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
export function shuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
