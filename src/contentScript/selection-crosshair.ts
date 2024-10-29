import { downloadSvgFromCanvas } from './generate-svg';

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
  z-index: 10003;
  cursor: crosshair;  
}

.selection-box {
  position: absolute;
  border: 2px solid #007bff;
  pointer-events: none;
  /* Create a clear window effect using box-shadow */
/* box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5); */
  /* Ensure the selection box is above the overlay */
  z-index: 10004;
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
let mType = 'png';

function createOverlay(mediaType: string, imageData: any) {

  // create image png and put in div position absolute top left to current scroll position
  const img = new Image();
  img.src = imageData;
  img.style.position = 'absolute';
  const scrollOffsets = getScrollOffsets();
  img.style.top = `${scrollOffsets.y}px`;
  img.style.left = '0';
  img.style.zIndex = '10001';
  img.id = 'xcreen-shot-preview-image';

  document.body.style.overflow = 'hidden';
  document.body.appendChild(img);

  mType = mediaType;
  overlay = document.createElement('div');
  overlay.className = 'selection-overlay';
  document.body.appendChild(overlay);
  
  overlay.addEventListener('mousedown', startSelection);
  overlay.addEventListener('mousemove', updateSelection);
  overlay.addEventListener('mouseup', endSelection);
}

function getScrollOffsets() {
    return {
      x: window.scrollX || document.documentElement.scrollLeft || document.body.scrollLeft,
      y: window.scrollY || document.documentElement.scrollTop || document.body.scrollTop
    };
  }

function startSelection(e: MouseEvent) {
  e.preventDefault();
  e.stopPropagation();

  isSelecting = true;
  startX = e.clientX;
  startY = e.clientY;

  if (selectionBox) {
    selectionBox.remove();
  }
  
  selectionBox = document.createElement('div');
  selectionBox.className = 'selection-box';
  overlay.appendChild(selectionBox);
}

function updateSelection(e: MouseEvent) {
  e.stopPropagation();
  if (!isSelecting || !selectionBox) return;
  
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
  e.stopPropagation();
  if (!isSelecting) return;
  isSelecting = false;
  
  const rect = selectionBox.getBoundingClientRect();

  // crop the image
  const canvas = document.createElement('canvas');
  canvas.width = rect.width;
  canvas.height = rect.height;
  const ctx = canvas.getContext('2d')!;
  const img = document.getElementById('xcreen-shot-preview-image') as HTMLImageElement;
  ctx.drawImage(img, rect.left, rect.top, rect.width, rect.height, 0, 0, rect.width, rect.height);
  generateImage(canvas);
  
  // Clean up
  // remove image
  const image = document.getElementById('xcreen-shot-preview-image');
  if (image) {
    image.remove();
    document.body.style.overflow = '';
  }
  selectionBox.remove();
  overlay.remove();
  overlay = null;
  selectionBox = null;
}


function generateImage(canvas: HTMLCanvasElement) {

  if (mType === 'svg') {
    downloadSvgFromCanvas(canvas);
  }
  else if (mType === 'txt') {
    downloadTxtFromCanvas(canvas);
  }
  else {
    downLoadImage(canvas);
  }
  
}

async function downloadTxtFromCanvas(canvas: HTMLCanvasElement) {
    
  const image = canvas.toDataURL("image/png");

  const fileMessage = {
    type: 'EXTRACT_TEXT_IMAGE',
    data: image,
    mineType: 'image/png',
    fileName: 'xcreen-shot.png'
  }

  chrome.runtime.sendMessage(fileMessage);
}

function downLoadImage(canvas: HTMLCanvasElement) {
    // Convert to image and download
    const image = canvas.toDataURL(`image/${mType}`);
    const link = document.createElement('a');
    link.href = image;
    link.download = `Xcreen.${mType}`;
    link.click();
}

// export createOverlay;
export { createOverlay };
