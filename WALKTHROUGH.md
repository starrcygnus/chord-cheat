# Chord Cheat: Visual Music Theory Companion

**Chord Cheat** is a powerful visual reference tool designed for musicians of all levels to explorer complex chords and their relationships with scales.

## Key Features

### 1. Visual Mapping
Instantly translate complex chord symbols like `Cmaj7(#11)` or `Dsus4` into a high-contrast visual "glow" on a virtual keyboard.
- **Root Note Recognition**: The root note is highlighted in a distinct **Red Glow**, while extension notes use a **Purple/Indigo Gradient**.
- **Interactive Feedback**: Hover over keys or play the chord to see real-time updates.

### 2. Intelligent Chord Logic
Powered by `Tonal.js`, the app calculates notes and intervals on the fly.
- **Support for Extensions**: Handles 9ths, 11ths, and 13ths across multiple octaves.
- **Suspensions & Alterations**: Correct mapping for `sus2`, `sus4`, `#5`, `b9`, etc.

### 3. Positional Awareness (Inversions)
Master keyboard voicings with the **Inversion Toggle**.
- Learn how to "flip" chords from Root Position to 1st, 2nd, and 3rd inversions.
- Visualizes how notes shift octaves to maintain smooth voice leading.

### 4. Interactive Learning
- **Audio Playback**: Use the `Play` button to hear the chord (powered by `Tone.js`).
- **Scale Context**: Select a parent scale (e.g., C Major) to see how the chord notes fit within that scale. Scale notes are subtly highlighted in the background.
- **Theory Info**: A dedicated panel shows the full chord name, intervals (e.g., 1P, 3M, 5P, 7M), and the exact notes being played.

## Technology Stack
- **Frontend**: Vanilla HTML/JavaScript
- **Styling**: Modern CSS with Glassmorphism and Glow effects
- **Libraries**:
  - `Tonal.js` for music theory engine
  - `Tone.js` for high-quality audio synthesis
  - `Lucide` for intuitive iconography
- **Build Tool**: Vite

---
Developed with ❤️ by Antigravity.
