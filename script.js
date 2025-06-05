// Morse Code Dictionary
const morseCode = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', '1': '.----', '2': '..---', '3': '...--',
    '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..',
    '9': '----.', '0': '-----', '.': '.-.-.-', ',': '--..--', '?': '..--..',
    "'": '.----.', '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-',
    '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.',
    '-': '-....-', '_': '..--.-', '"': '.-..-.', '$': '...-..-', '@': '.--.-.'
};

// Reverse dictionary for decoding
const reverseMorseCode = {};
for (let key in morseCode) {
    reverseMorseCode[morseCode[key]] = key;
}

// Debug: Check if reverse dictionary was created properly
console.log('Morse Code Dictionary created:');
console.log('Sample entries:', Object.entries(reverseMorseCode).slice(0, 5));
console.log('Total entries:', Object.keys(reverseMorseCode).length);

// Test function for common letters
function testMorseDecoding() {
    const testCases = [
        { morse: '.', expected: 'E' },
        { morse: '-', expected: 'T' },
        { morse: '.-', expected: 'A' },
        { morse: '...', expected: 'S' },
        { morse: '---', expected: 'O' }
    ];
    
    console.log('Testing morse code decoding:');
    testCases.forEach(test => {
        const result = reverseMorseCode[test.morse];
        console.log(`"${test.morse}" -> "${result}" (expected: "${test.expected}") ${result === test.expected ? '✅' : '❌'}`);
    });
}

// Run test on page load
testMorseDecoding();

// DOM Elements
const morseOutput = document.getElementById('morseOutput');
const textOutput = document.getElementById('textOutput');
const clearBtn = document.getElementById('clearBtn');
const backspaceBtn = document.getElementById('backspaceBtn');
const soundToggle = document.getElementById('soundToggle');
const referenceGrid = document.getElementById('referenceGrid');
const morseButtons = document.querySelectorAll('.morse-btn');
const timingIndicator = document.getElementById('timingIndicator');
const timingBar = document.getElementById('timingBar');
const timingText = document.getElementById('timingText');

// State
let currentMorse = '';
let currentLetter = '';
let decodedText = '';

// Auto letter separation timing
let lastInputTime = 0;
let letterSeparationTimer = null;
const LETTER_SEPARATION_DELAY = 500; // ms - auto separate letters after pause

// Audio Context for sound effects
let audioContext;
let isAudioInitialized = false;

// Initialize audio context
function initAudio() {
    if (!isAudioInitialized && soundToggle.checked) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            isAudioInitialized = true;
        } catch (error) {
            console.warn('Audio not supported:', error);
        }
    }
}

// Play sound for dot or dash
function playSound(type) {
    if (!soundToggle.checked || !audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Different frequencies for dot and dash
        oscillator.frequency.value = type === 'dot' ? 800 : 600;
        oscillator.type = 'sine';
        
        // Different durations for dot and dash
        const duration = type === 'dot' ? 0.1 : 0.3;
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
        console.warn('Error playing sound:', error);
    }
}

// Update displays
function updateDisplays() {
    // Update morse display
    if (currentMorse) {
        morseOutput.innerHTML = currentMorse;
        morseOutput.classList.remove('placeholder');
    } else {
        morseOutput.innerHTML = '<span class="placeholder">Your Morse code will appear here...</span>';
    }
    
    // Update text display
    if (decodedText) {
        textOutput.innerHTML = decodedText;
        textOutput.classList.remove('placeholder');
    } else {
        textOutput.innerHTML = '<span class="placeholder">Decoded text will appear here...</span>';
    }
}

// Add morse character (dot or dash)
function addMorseChar(char) {
    if (char === '.' || char === '-') {
        currentLetter += char;
        currentMorse += char;
        
        // Play sound
        playSound(char === '.' ? 'dot' : 'dash');
        
        // Add visual feedback
        const button = document.querySelector(`[data-morse="${char}"]`);
        if (button) {
            button.classList.add('pulse');
            setTimeout(() => button.classList.remove('pulse'), 300);
        }
        
        // Update timing for auto letter separation
        lastInputTime = Date.now();
        
        // Clear existing timer and set new one
        if (letterSeparationTimer) {
            clearTimeout(letterSeparationTimer);
        }
        
        letterSeparationTimer = setTimeout(() => {
            if (currentLetter) {
                addSpace();
            }
        }, LETTER_SEPARATION_DELAY);
    }
    
    updateDisplays();
}

// Add space (end current letter)
function addSpace() {
    if (currentLetter) {
        // Decode current letter
        const decodedChar = reverseMorseCode[currentLetter];
        
        if (decodedChar) {
            decodedText += decodedChar;
            console.log(`✅ Decoded "${currentLetter}" -> "${decodedChar}"`);
        } else {
            decodedText += '?'; // Unknown morse code
            console.warn(`❌ Unknown morse code: "${currentLetter}"`);
        }
        
        currentLetter = '';
        currentMorse += ' ';
        
        // Clear the auto-separation timer
        if (letterSeparationTimer) {
            clearTimeout(letterSeparationTimer);
            letterSeparationTimer = null;
        }
        
        // Visual feedback
        const button = document.querySelector('[data-morse=" "]');
        if (button) {
            button.classList.add('pulse');
            setTimeout(() => button.classList.remove('pulse'), 300);
        }
    }
    
    updateDisplays();
}

// Add word separator
function addWordSeparator() {
    // First complete current letter if exists
    if (currentLetter) {
        addSpace();
    }
    
    // Add word space
    if (decodedText && !decodedText.endsWith(' ')) {
        decodedText += ' ';
        currentMorse += ' / ';
        
        // Visual feedback
        const button = document.querySelector('[data-morse="/"]');
        if (button) {
            button.classList.add('pulse');
            setTimeout(() => button.classList.remove('pulse'), 300);
        }
    }
    
    updateDisplays();
}

// Backspace function
function backspace() {
    if (currentLetter) {
        // Remove last character from current letter
        currentLetter = currentLetter.slice(0, -1);
        currentMorse = currentMorse.slice(0, -1);
    } else if (currentMorse) {
        // Remove last space or word separator
        if (currentMorse.endsWith(' / ')) {
            currentMorse = currentMorse.slice(0, -3);
            decodedText = decodedText.trimEnd();
        } else if (currentMorse.endsWith(' ')) {
            currentMorse = currentMorse.slice(0, -1);
            decodedText = decodedText.slice(0, -1);
        }
    }
    
    updateDisplays();
}

// Clear all
function clearAll() {
    currentMorse = '';
    currentLetter = '';
    decodedText = '';
    
    // Clear any pending timers
    if (letterSeparationTimer) {
        clearTimeout(letterSeparationTimer);
        letterSeparationTimer = null;
    }
    
    updateDisplays();
    
    // Visual feedback
    clearBtn.classList.add('pulse');
    setTimeout(() => clearBtn.classList.remove('pulse'), 300);
}

// Populate reference grid
function populateReference() {
    const sortedEntries = Object.entries(morseCode).sort();
    
    sortedEntries.forEach(([char, morse]) => {
        const item = document.createElement('div');
        item.className = 'reference-item';
        item.innerHTML = `
            <span class="reference-char">${char}</span>
            <span class="reference-morse">${morse}</span>
        `;
        referenceGrid.appendChild(item);
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize displays
    updateDisplays();
    
    // Populate reference
    populateReference();
    
    // Button event listeners
    morseButtons.forEach(button => {
        button.addEventListener('click', function() {
            initAudio(); // Initialize audio on first user interaction
            
            const morseChar = this.dataset.morse;
            
            if (morseChar === '.' || morseChar === '-') {
                addMorseChar(morseChar);
            } else if (morseChar === ' ') {
                addSpace();
            } else if (morseChar === '/') {
                addWordSeparator();
            }
        });
    });
      // Control button listeners
    clearBtn.addEventListener('click', clearAll);
    backspaceBtn.addEventListener('click', backspace);
    
    // Keyboard event listeners
    document.addEventListener('keydown', function(event) {
        initAudio(); // Initialize audio on first user interaction
        
        // Handle arrow keys for morse input
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            addMorseChar('.');
            console.log('⬅️ Left arrow = DOT');
            return;
        }
        
        if (event.key === 'ArrowRight') {
            event.preventDefault();
            addMorseChar('-');
            console.log('➡️ Right arrow = DASH');
            return;
        }
        
        // Other key handlers
        switch(event.key) {
            case ' ':
                event.preventDefault();
                addSpace();
                console.log('Manual letter separation');
                break;
            case 'Enter':
                event.preventDefault();
                addWordSeparator();
                break;
            case 'Backspace':
                event.preventDefault();
                backspace();
                break;
            case 'Escape':
                event.preventDefault();
                clearAll();
                break;
        }
    });    
    // Sound toggle listener
    soundToggle.addEventListener('change', function() {
        if (this.checked && !isAudioInitialized) {
            initAudio();
        }
    });
});

// Add keyboard visual feedback
document.addEventListener('keydown', function(event) {
    let targetButton = null;
    
    switch(event.key) {
        case 'ArrowLeft':
            targetButton = document.querySelector('[data-morse="."]');
            break;
        case 'ArrowRight':
            targetButton = document.querySelector('[data-morse="-"]');
            break;
        case ' ':
            targetButton = document.querySelector('[data-morse=" "]');
            break;
        case 'Enter':
            targetButton = document.querySelector('[data-morse="/"]');
            break;
        case 'Backspace':
            targetButton = backspaceBtn;
            break;
    }
    
    if (targetButton) {
        targetButton.classList.add('flash');
        setTimeout(() => targetButton.classList.remove('flash'), 200);
    }
});

// Handle page visibility change to pause audio context when tab is not active
document.addEventListener('visibilitychange', function() {
    if (audioContext && audioContext.state !== 'closed') {
        if (document.hidden) {
            audioContext.suspend();
        } else {
            audioContext.resume();
        }
    }
});

// Add some helpful tips
console.log(`
🎯 Morse Code Typing App - ARROW KEY MODE:
⬅️ Press "Left Arrow" for DOT (•)
➡️ Press "Right Arrow" for DASH (—)
• Press "Space" to separate letters manually
• Press "Enter" to separate words  
• Press "Backspace" to delete
• Press "Escape" to clear all

✨ Features:
• Auto letter separation after 0.5s pause
• Real-time Morse to text translation
• Sound effects for dots and dashes

Have fun learning Morse code! 📡
`);
