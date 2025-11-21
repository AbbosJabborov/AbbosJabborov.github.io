/* main.js
   - Controls the boot sequence (Insert Cartridge style)
   - Toggle glitch
   - Open games via simple redirect
*/

const bootLines = [
  "INSERT CARTRIDGE...",
  "DETECTING ROM SLOT",
  "READING HEADER: OK",
  "CHECKSUM: 0xBEEFCAFE",
  "LOADING ASSETS...",
  "INITIALIZING AUDIO: OK",
  "READY"
];

const bootOverlay = document.getElementById("boot-overlay");
const bootTextEl = document.getElementById("bootText");
const pressStart = document.getElementById("pressStart");
const cartridge = document.getElementById("cartridge");
const screen = document.getElementById("screen");

let typedIndex = 0;
let typingTimer = null;
let canStart = false;

// Type writer effect (one line at a time)
function typeLines(lines, onComplete) {
  bootTextEl.innerHTML = "";
  let idx = 0;

  function typeLine() {
    const line = lines[idx];
    let pos = 0;
    const lineSpan = document.createElement("div");
    lineSpan.className = "line";
    bootTextEl.appendChild(lineSpan);

    typingTimer = setInterval(() => {
      pos++;
      lineSpan.textContent = line.slice(0, pos);
      if (pos >= line.length) {
        clearInterval(typingTimer);
        idx++;
        if (idx < lines.length) {
          setTimeout(typeLine, 420);
        } else {
          // done typing all lines
          onComplete();
        }
      }
    }, 18);
  }

  typeLine();
}

// Boot flow
function startBootSequence() {
  // make cartridge appear to insert
  setTimeout(() => cartridge.classList.add("inserted"), 200);

  // type lines then show PRESS START
  typeLines(bootLines, () => {
    pressStart.classList.add("visible");
    canStart = true;

    // subtle glitch burst to dramatize boot
    setTimeout(() => {
      screen.classList.add("glitching");
      setTimeout(() => screen.classList.remove("glitching"), 800);
    }, 320);
  });
}

// On pressing start, hide overlay and reveal screen
function pressToStart() {
  if (!canStart) return;
  // quick flicker
  screen.classList.add("glitching");
  setTimeout(() => {
    bootOverlay.classList.remove("visible");
    bootOverlay.classList.add("hidden");
    screen.classList.remove("glitching");
  }, 160);

  // small random glitch later
  setTimeout(() => {
    if (Math.random() > 0.5) {
      screen.classList.add("glitching");
      setTimeout(() => screen.classList.remove("glitching"), 900);
    }
  }, 900);
}

// keyboard support (press Enter / Space to start)
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "Enter") {
    if (canStart) pressToStart();
  }
});

// start button
const startBtn = document.getElementById("startButton");
if (startBtn) startBtn.addEventListener("click", () => {
  if (!canStart) return;
  pressToStart();
});

// Also allow clicking on the PRESS START text
pressStart.addEventListener("click", () => {
  if (canStart) pressToStart();
});

// Kick off the sequence after DOM loaded
window.addEventListener("load", () => {
  // Slight delay for dramatic effect
  setTimeout(startBootSequence, 420);
});

// Public redirect helper
function openGame(folder) {
  // If you want a new tab instead, change to window.open(...)
  window.location.href = "projects/" + folder + "/index.html";
}

// expose for HTML onclick usage
window.openGame = openGame;
