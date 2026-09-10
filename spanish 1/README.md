# Spanish Flashcard App - Restructured

A spaced repetition flashcard application for learning Spanish vocabulary from Senderos 1A – Lección Preliminar.

## Project Structure

The original single HTML file has been restructured into clean, modular files:

```
spanish/
├── index_new.html          # Clean HTML structure
├── styles.css              # All CSS styles
├── data/
│   └── vocabulary.json     # Spanish vocabulary data
├── js/
│   ├── app.js             # Main application logic
│   ├── scheduler.js       # Spaced repetition scheduler
│   ├── speech.js          # Speech recognition/synthesis
│   └── utils.js           # Utility functions
└── README.md              # This file
```

## Features

- **Spaced Repetition**: Uses SM-2-style algorithm for optimal learning
- **Multiple Study Modes**: Text-to-text, text-to-voice, voice-to-text
- **Category Selection**: Study specific vocabulary categories
- **Speech Recognition**: Practice pronunciation with voice input
- **Progress Tracking**: Export/import your learning progress
- **Local Storage**: All data saved in browser (no server required)

## Usage

### Development

Since the app uses ES modules, it needs to be served over HTTP:

```bash
# Start local development server
python3 -m http.server 8000

# Or use Node.js
npx serve .

# Then visit http://localhost:8000/index_new.html
```

### Study Modes

1. **Spanish Text → English Text**: Traditional flashcards
2. **English Text → Spanish Text**: Reverse practice
3. **Spanish Text → English Voice**: Speak English translation
4. **English Text → Spanish Voice**: Speak Spanish translation
5. **Spanish Voice → English Text**: Listen and type English
6. **English Voice → Spanish Text**: Listen and type Spanish
7. **Mix**: Random combination of all modes

### Keyboard Shortcuts

- **Enter**: Check answer / Grade with suggestion
- **1-4**: Manual grading (Again, Hard, Good, Easy)

## File Details

### `index_new.html` (90 lines)

Clean HTML structure with external references to CSS and JavaScript modules.

### `styles.css` (280+ lines)

All CSS styles including:

- Dark theme variables
- Responsive layout
- Card animations
- Audio control styling

### `data/vocabulary.json`

Structured vocabulary data with:

- 150+ Spanish-English word pairs
- 9 categories (Classroom, Time, Colors, etc.)
- Organized by difficulty/topic

### `js/app.js` (400+ lines)

Main application class handling:

- UI interactions
- Card management
- Session state
- Audio controls

### `js/scheduler.js` (80 lines)

Spaced repetition implementation:

- SM-2 algorithm
- LocalStorage persistence
- Grade processing

### `js/speech.js` (100 lines)

Speech functionality:

- Text-to-speech synthesis
- Speech recognition
- Multiple language support

### `js/utils.js` (120 lines)

Utility functions:

- Text normalization
- Number word conversion
- Array manipulation

## Benefits of Restructuring

1. **Maintainability**: Code is organized into logical modules
2. **Reusability**: Components can be easily reused or modified
3. **Debugging**: Easier to locate and fix issues
4. **Performance**: Better caching of static assets
5. **Collaboration**: Multiple developers can work on different files
6. **Testing**: Individual modules can be unit tested
7. **Extensibility**: Easy to add new features or vocabulary sets

## Browser Compatibility

- Modern browsers with ES6 module support
- Speech features require Chrome/Edge for best results
- Works offline after initial load (service worker could be added)

## Future Enhancements

- Add more vocabulary sets
- Implement service worker for offline use
- Add progress analytics and charts
- Support for custom vocabulary import
- Multiplayer/competitive modes
