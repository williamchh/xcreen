// content.js
let isSelecting = false;
let startX: number, startY: number;
let selectionBox: any = null;
let overlay: any = null;

// selection-overlay css 
const style = document.createElement('style');
style.textContent = `
.selection-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10000;
  cursor: crosshair;  
}

.selection-box {
  position: absolute;
  border: 2px solid #007bff;
  pointer-events: none;
  /* Create a clear window effect using box-shadow */
/* box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5); */
  /* Ensure the selection box is above the overlay */
  z-index: 10001;
  background: transparent;
}

.selection-box::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  pointer-events: none;
  background: transparent;
}
`;

document.head.appendChild(style);

function createOverlay() {
  overlay = document.createElement('div');
  overlay.className = 'selection-overlay';
  document.body.appendChild(overlay);
  
  overlay.addEventListener('mousedown', startSelection);
  overlay.addEventListener('mousemove', updateSelection);
  overlay.addEventListener('mouseup', endSelection);
}

function startSelection(e: MouseEvent) {
  isSelecting = true;
  startX = e.clientX;
  startY = e.clientY;
  
  selectionBox = document.createElement('div');
  selectionBox.className = 'selection-box';
  overlay.appendChild(selectionBox);
}

function updateSelection(e: MouseEvent) {
  if (!isSelecting) return;
  
  const currentX = e.clientX;
  const currentY = e.clientY;
  
  const left = Math.min(startX, currentX);
  const top = Math.min(startY, currentY);
  const width = Math.abs(currentX - startX);
  const height = Math.abs(currentY - startY);
  
  selectionBox.style.left = left + 'px';
  selectionBox.style.top = top + 'px';
  selectionBox.style.width = width + 'px';
  selectionBox.style.height = height + 'px';
}

function endSelection(e: MouseEvent) {
  if (!isSelecting) return;
  isSelecting = false;
  
  const rect = selectionBox.getBoundingClientRect();
  generateImage(rect);
  
  // Clean up
  overlay.remove();
  overlay = null;
  selectionBox = null;
}

import html2canvas from 'html2canvas';

function generateImage(rect: DOMRect) {
  html2canvas(document.body, {
    x: rect.left + window.scrollX,
    y: rect.top + window.scrollY,
    width: rect.width,
    height: rect.height,
    scrollX: 0,
    scrollY: 0,
  }).then((canvas) => {
    // Convert to image and download
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = 'selection.png';
    link.click();
  }).catch((error) => {
    console.error('Failed to capture the selected area', error);
  });
}

// export createOverlay;
export { createOverlay };


// function generateImage(rect) {
//     // Create canvas
//     const canvas = document.createElement('canvas');
//     canvas.width = rect.width;
//     canvas.height = rect.height;
//     const ctx = canvas.getContext('2d');
    
//     // Capture the selected area
//     ctx.drawImage(
//       document,
//       rect.left + window.scrollX,
//       rect.top + window.scrollY,
//       rect.width,
//       rect.height,
//       0,
//       0,
//       rect.width,
//       rect.height
//     );
    
//     // Convert to image and download
//     const image = canvas.toDataURL('image/png');
//     const link = document.createElement('a');
//     link.href = image;
//     link.download = 'selection.png';
//     link.click();
//   }