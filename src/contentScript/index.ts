import html2canvas from "html2canvas";
import { Potrace } from '../libs/potrace'

console.info('contentScript is running');

type ElementTo = undefined | 'png' | 'svg' 

let isSelecting = false;
let selectedElement: any = null;
let elementTo: ElementTo = undefined;

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {

  if (request.message === 'contentEntirePage') {

    const element = document.documentElement;

    await printHtmlElement(element);
  }
  else if (request.message === 'contentSelectedElement') {
    isSelecting = true;
    elementTo = 'png';
    document.addEventListener('mouseover', highlightElement);
    document.addEventListener('click', selectElement);
  }
  else if (request.message === 'contentSelectedElementToSvg') {
    isSelecting = true;
    elementTo = 'svg';
    document.addEventListener('mouseover', highlightElement);
    document.addEventListener('click', selectElement);
  }
});
  
async function printHtmlElement(element: HTMLElement) {
  try {
    const canvas = await html2canvas(element, {
      allowTaint: true,
      useCORS: true
    });

    printFromCanvas(canvas);
  } catch (error) {

    try {
      const cv = await html2canvas(element, {
        allowTaint: false,
        useCORS: true
      });

      printFromCanvas(cv);
    }
    catch (error) {
      console.error(error);
    }
  }
}

function printFromCanvas(canvas: HTMLCanvasElement) {
  const dataUrl = canvas.toDataURL('image/png');

  // download the image
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = 'entire-page.png';
  a.click();
}

// Function to highlight the element under the mouse
function highlightElement(event: MouseEvent) {
  if (!isSelecting) return;
  
  if (selectedElement) {
    selectedElement.style.outline = "";
  }
  
  selectedElement = event.target;
  selectedElement.style.outline = "2px solid red"; // Highlighting style
}

// Function to select the element on click
function selectElement(event: MouseEvent) {
  if (!isSelecting) return;
  
  event.preventDefault();
  event.stopPropagation();

  isSelecting = false;
  if (selectedElement) {
    selectedElement.style.outline = "";

    if (elementTo === 'png') {
      printHtmlElement(selectedElement);
    }
    else if (elementTo === 'svg') {
      downloadSvg(selectedElement);
    }

  }

  // Clean up event listeners
  document.removeEventListener("mouseover", highlightElement);
  document.removeEventListener("click", selectElement);
}

async function downloadSvg(element: HTMLElement) {
 
  try {
    const canvas = await html2canvas(element, {
      allowTaint: true,
      useCORS: true
    });

     // Convert canvas to blob directly instead of going through data URL
    const canvasBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png');
    });

    // Create a proper File object that matches what you'd get from a file input
    const file = new File([canvasBlob], 'element.png', { 
      type: 'image/png',
      lastModified: Date.now()
    });

    Potrace.loadImageFromFile(file);
    Potrace.process(function() {
      const svg = Potrace.getSVG(1);

      // download the image
      const a = document.createElement('a');
      a.href = 'data:image/svg+xml,' + encodeURIComponent(svg);
      a.download = 'element.svg';
      a.click();
    });
    
  } catch (error) {
    console.error(error);
  }
}