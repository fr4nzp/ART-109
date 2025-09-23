const jsStatusBadge = document.querySelector('#js-status .badge');
const timerBox = document.querySelector('#timer-box');
const toggleImageBtn = document.querySelector('#toggle-image-btn');
const nextImageBtn = document.querySelector('#next-image-btn');
const photo = document.querySelector('#photo');
const grid = document.querySelector('#grid');
const cells = grid.querySelectorAll('.cell');
const revealAllBtn = document.querySelector('#reveal-all-btn');
const resetGridBtn = document.querySelector('#reset-grid-btn');

jsStatusBadge.textContent = 'ready';
jsStatusBadge.style.background = '#22c55e';
jsStatusBadge.style.color = '#062a21';

const TURBO_S_0_TO_100_MS = 2500;

function pulseOnce() {
  timerBox.classList.add('highlight');
  setTimeout(() => {
    timerBox.classList.remove('highlight');
  }, 450);
}
function startCadence() {
  pulseOnce();
  setInterval(pulseOnce, TURBO_S_0_TO_100_MS);
}
setTimeout(startCadence, 900);

// IMPORTANT: match your real file paths & extensions exactly
const images = [
  'images/turbo-s-1.jpeg',
  'images/turbo-s-2.jpeg',
  'images/turbo-s-3.jpeg',
  'images/turbo-s-4.jpeg'
];
let idx = 0;

toggleImageBtn.addEventListener('click', () => {
  photo.classList.toggle('hidden');
});

nextImageBtn.addEventListener('click', () => {
  if (photo.classList.contains('hidden')) photo.classList.remove('hidden');
  idx = (idx + 1) % images.length;
  photo.src = images[idx];
});

cells.forEach((cell) => {
  cell.addEventListener('click', () => cell.classList.toggle('is-off'));
});

revealAllBtn.addEventListener('click', () => {
  cells.forEach((cell) => cell.classList.remove('is-off'));
});

resetGridBtn.addEventListener('click', () => {
  cells.forEach((cell, i) => {
    cell.classList.remove('is-off');
    cell.style.background = i % 2
      ? 'linear-gradient(180deg,#131313,#0f0f0f)'
      : 'linear-gradient(180deg,#151515,#0f0f0f)';
  });
});
