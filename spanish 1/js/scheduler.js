/**
 * Spaced Repetition Scheduler
 * Implements SM-2-style scheduling for flashcards
 */

const STORAGE_KEY = "senderos1a_anki_v1";

export const scheduler = {
  // Load schedule data from localStorage
  load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  },

  // Save schedule data to localStorage
  save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  // Create default schedule for new cards
  createDefault() {
    return { 
      ef: 2.5, 
      reps: 0, 
      interval: 0, 
      due: Date.now(), 
      lapses: 0 
    };
  },

  // Grade a card and update its schedule
  grade(schedule, grade) {
    // grade: 1 Again, 2 Hard, 3 Good, 4 Easy
    const MIN_EF = 1.3;
    const day = 24 * 60 * 60 * 1000;
    const MAX_INTERVAL = 180 * day; // Cap at 6 months

    if (grade === 1) {
      schedule.reps = 0;
      schedule.interval = 60 * 1000; // 1 minute
      schedule.ef = Math.max(MIN_EF, schedule.ef - 0.3);
      schedule.lapses = (schedule.lapses || 0) + 1;

      // Mark as leech if failed too many times
      if (schedule.lapses >= 8) {
        schedule.isLeech = true;
      }
    } else if (grade === 2) {
      schedule.ef = Math.max(MIN_EF, schedule.ef - 0.15);
      if (schedule.reps === 0) {
        schedule.interval = 5 * 60 * 1000; // 5 minutes
      } else {
        schedule.interval = Math.max(day, Math.round(schedule.interval * 1.2));
      }
    } else if (grade === 3) {
      if (schedule.reps === 0) {
        schedule.reps = 1;
        schedule.interval = day;
      } else if (schedule.reps === 1) {
        schedule.reps = 2;
        schedule.interval = 6 * day;
      } else {
        schedule.reps += 1;
        schedule.interval = Math.min(
          MAX_INTERVAL,
          Math.round(schedule.interval * schedule.ef)
        );
      }
      // keep EF stable for Good
    } else if (grade === 4) {
      schedule.ef += 0.15;
      if (schedule.reps === 0) {
        schedule.reps = 2;
        schedule.interval = 4 * day;
      } else {
        schedule.reps += 1;
        schedule.interval = Math.min(
          MAX_INTERVAL,
          Math.round(schedule.interval * (schedule.ef + 0.3))
        );
      }
    }
    
    schedule.due = Date.now() + schedule.interval;
    return schedule;
  },

  // Format timestamp for display
  formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }
};
