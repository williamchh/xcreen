import html2canvas from "html2canvas";
import { downloadSvgFromCanvas } from "./generate-svg";
import { createOverlay } from "./selection-crosshair";

console.info('contentScript is running');

type ElementTo = undefined | 'png' | 'svg' 

let isSelecting = false;
let selectedElement: any = null;
let elementTo: ElementTo = undefined;
let mediaType = 'png';

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {

  mediaType = request.mediaType || 'png';
  
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
  else if (request.message === 'contentSelectArea') {
    createOverlay(mediaType, request.imageData);
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

  const dataUrl = canvas.toDataURL(`image/${mediaType}`);

  // download the image
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `entire-page.${mediaType}`;
  a.click();
}

// Function to highlight the element under the mouse
function highlightElement(event: MouseEvent) {
  
  event.preventDefault();
  event.stopPropagation();

  if (!isSelecting) return;
  
  if (selectedElement) {
    selectedElement.style.outline = "";
  }
  
  selectedElement = event.target;
  selectedElement.style.outline = "2px solid red"; // Highlighting style
}

// Function to select the element on click
function selectElement(event: MouseEvent) {

  event.preventDefault();
  event.stopPropagation();
  
  if (!isSelecting) return;
  
  isSelecting = false;
  if (selectedElement) {
    selectedElement.style.outline = "";

    if (mediaType === 'png' || mediaType === 'jpeg') {
      printHtmlElement(selectedElement);
    }
    else if (mediaType === 'svg') {
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
      useCORS: true,
      scale: 2, // Increase scale factor for better quality
      logging: false,
      width: element.offsetWidth * 2,
      height: element.offsetHeight * 2
    });

    await downloadSvgFromCanvas(canvas);
    
  } catch (error) {
    console.error(error);
  }
}

