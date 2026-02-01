import './index.css'
import * as Tone from 'tone'
import { Chord, Note, Scale, Key, ChordType } from 'tonal'

// --- Custom Chord Types ---
// Tonal.js doesn't include maj11 by default due to its dissonance, but we'll add it for completeness.
ChordType.add(['1P', '3M', '5P', '7M', '9M', '11P'], ['maj11']);

// --- Constants & State ---
// --- Constants & State ---
const START_OCTAVE = 2; // Start lower for more range
const NUM_OCTAVES = 4; // 4 octaves total
const NOTES_IN_OCTAVE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

let currentChord = null;
let currentNotes = [];
let currentInversion = 0;
let currentScale = 'none';

// --- DOM Elements ---
const keyboard = document.getElementById('keyboard');
const rootSelect = document.getElementById('root-select');
const typeSelect = document.getElementById('type-select');
const inversionSelect = document.getElementById('inversion-select');
const scaleRootSelect = document.getElementById('scale-root-select');
const scaleTypeSelect = document.getElementById('scale-type-select');
const playBtn = document.getElementById('play-btn');
const clearBtn = document.getElementById('clear-btn');
const noteDisplay = document.getElementById('note-display');
const chordNameDisplay = document.getElementById('chord-name-display');
const intervalsDisplay = document.getElementById('intervals-display');

// Expose Tonal for debugging
window.Tonal = { Chord, Note, Scale, Key };

// --- Audio Setup ---
const sampler = new Tone.Sampler({
  urls: {
    A1: "A1.mp3",
    A2: "A2.mp3",
  },
  baseUrl: "https://tonejs.github.io/audio/casio/",
  release: 1
}).toDestination();

// Audio Engine with clear, distinct timbre
const polySynth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "triangle" },
  envelope: {
    attack: 0.02,
    decay: 0.1,
    sustain: 0.3,
    release: 1
  }
}).toDestination();

// --- Functions ---

function initKeyboard() {
  keyboard.innerHTML = '';
  for (let oct = START_OCTAVE; oct < START_OCTAVE + NUM_OCTAVES; oct++) {
    NOTES_IN_OCTAVE.forEach(n => {
      const noteName = `${n}${oct}`;
      const midi = Note.midi(noteName);
      const key = document.createElement('div');
      const isBlack = n.includes('#');
      key.className = `key ${isBlack ? 'black' : 'white'}`;
      key.dataset.note = noteName;
      key.dataset.midi = midi;

      const label = document.createElement('span');
      label.className = 'key-label';
      label.textContent = n;
      key.appendChild(label);

      key.addEventListener('mousedown', () => playNote(noteName));
      keyboard.appendChild(key);
    });
  }
}

function updateVisualization() {
  const root = rootSelect.value;
  const type = typeSelect.value;
  const chordSymbol = root + type;

  const chord = Chord.get(chordSymbol);

  if (!chord.empty) {
    currentChord = chord;
    let notes = [...chord.notes].map(n => Note.simplify(n));

    // Apply inversion
    const inv = parseInt(inversionSelect.value);
    currentInversion = inv;
    for (let i = 0; i < inv; i++) {
      const first = notes.shift();
      notes.push(first);
    }

    // Assign octaves - find a suitable starting octave to fit in range
    let startOct = START_OCTAVE + 1;

    // Custom logic: if the root is high in the scale, try starting lower
    const rootMidiBase = Note.midi(`${root}0`) % 12;
    if (rootMidiBase >= 7) startOct = START_OCTAVE;

    let lastMidi = -1;
    currentNotes = notes.map((n) => {
      let octave = startOct;
      let midi = Note.midi(`${n}${octave}`);

      while (midi <= lastMidi) {
        octave++;
        midi = Note.midi(`${n}${octave}`);
      }
      lastMidi = midi;
      return `${n}${octave}`;
    });
  } else {
    currentChord = null;
    currentNotes = [];
  }

  highlightKeys();
  if (currentChord) updateInfoPanel();
}

function highlightKeys() {
  // 1. Calculate Scale Context
  const sRoot = scaleRootSelect.value;
  const sType = scaleTypeSelect.value;
  let scaleChromas = [];
  let scaleRootChroma = -1;

  if (sRoot) {
    const scaleObj = Scale.get(`${sRoot} ${sType}`);
    if (!scaleObj.empty) {
      scaleChromas = scaleObj.notes.map(n => Note.chroma(n));
      scaleRootChroma = Note.chroma(sRoot);
    }
  }

  // 2. Calculate Chord Context
  let chordMidis = [];
  let chordRootChroma = -1;
  if (currentChord) {
    chordRootChroma = Note.chroma(currentChord.tonic || currentChord.root || rootSelect.value);
    chordMidis = currentNotes.map(n => Note.midi(n));
  }


  document.querySelectorAll('.key').forEach(k => {
    // Reset
    k.classList.remove('active', 'is-root', 'in-scale', 'scale-root');

    // Scale Logic (LED Strip)
    if (scaleChromas.length > 0) {
      const keyChroma = Note.chroma(k.dataset.note);
      if (scaleChromas.includes(keyChroma)) {
        k.classList.add('in-scale');
        if (keyChroma === scaleRootChroma) {
          k.classList.add('scale-root');
        }
      }
    }

    // Chord Logic (Key Glow)
    const keyMidi = parseInt(k.dataset.midi);
    if (chordMidis.includes(keyMidi)) {
      k.classList.add('active');
      const chroma = Note.chroma(k.dataset.note);
      if (chroma === chordRootChroma) {
        k.classList.add('is-root');
      }
    }
  });
}

function updateInfoPanel() {
  if (!currentChord) return;
  noteDisplay.innerHTML = '';
  const simplifiedRoot = Note.simplify(currentChord.root);

  currentNotes.forEach(fullNote => {
    const n = fullNote.replace(/\d/, '');
    const tag = document.createElement('div');
    tag.className = `note-tag ${n === simplifiedRoot ? 'root' : ''}`;
    tag.textContent = fullNote;
    noteDisplay.appendChild(tag);
  });

  let displayName = currentChord.name || currentChord.symbol;
  if (currentChord.symbol.endsWith('maj11')) {
    displayName = `${currentChord.tonic} Major 11th`;
  }
  chordNameDisplay.textContent = displayName;
  intervalsDisplay.textContent = `Intervals: ${currentChord.intervals.join(' - ')}`;
}

async function playChord() {
  if (!currentChord) return;
  await Tone.start();

  // Clear any hanging notes
  polySynth.releaseAll();

  const now = Tone.now();
  currentNotes.forEach((note, i) => {
    // Large 0.5s delay to make the difference between Major/Minor 3rd unmistakable
    polySynth.triggerAttackRelease(note, "2n", now + i * 0.5);
  });

  console.log(`%c CHORD PLAYING: ${currentChord.name} `, "background: #6366f1; color: white; font-weight: bold;", currentNotes);
}

async function playNote(note) {
  await Tone.start();
  polySynth.triggerAttackRelease(note, "4n");
}

function clearApp() {
  rootSelect.value = 'C';
  typeSelect.value = '';
  inversionSelect.value = '0';
  scaleRootSelect.value = ''; // Reset scale too
  updateVisualization();
}

// --- Event Listeners ---

// Helper to enable scroll-to-change on dropdowns
const enableScrollOnSelect = (select) => {
  select.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = Math.sign(e.deltaY);
    const newIndex = select.selectedIndex + delta;

    if (newIndex >= 0 && newIndex < select.options.length) {
      select.selectedIndex = newIndex;
      select.dispatchEvent(new Event('change'));
    }
  }, { passive: false });
};

[rootSelect, typeSelect, inversionSelect, scaleRootSelect, scaleTypeSelect].forEach(enableScrollOnSelect);

rootSelect.addEventListener('change', updateVisualization);
typeSelect.addEventListener('change', updateVisualization);
inversionSelect.addEventListener('change', updateVisualization);
scaleRootSelect.addEventListener('change', updateVisualization);
scaleTypeSelect.addEventListener('change', updateVisualization);

playBtn.addEventListener('click', playChord);
clearBtn.addEventListener('click', clearApp);

// Initialize
initKeyboard();
updateVisualization();
