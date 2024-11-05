import html2canvas from "html2canvas";
import { createOverlay } from "./selection-crosshair";
import { ContentPortManager } from "../models/content-port-manager";
 
let mediaType = 'png';
let originalX = 0;
let originalY = 0;
let currentX = 0;
let currentY = 0;
let pageWidth = 0;
let pageHeight = 0;
let viewPortHeight = 0;
const capturedImages: any = [];

const handleTask = async (msg: any) => {
  mediaType = msg.mediaType || 'png';
  
  if (msg.type === 'ENTIRE_PAGE_HTML' || msg.type === 'contentEntirePage') {
    const element = document.documentElement;
    await printHtmlElement(element);
  }
  else if (msg.type === 'SELECT_AREA' || msg.type === 'contentSelectArea') {
    createOverlay(mediaType, msg.imageData, port);
  }
  else if (msg.type === 'ENTIRE_PAGE_HTML2') {
    pageHeight = document.documentElement.scrollHeight;
    pageWidth = document.documentElement.scrollWidth;
    viewPortHeight = window.innerHeight;
    scrollAndPrint(port);
  }

};

const port = chrome.runtime.connect({ name: 'content-bg' });

const _ = new ContentPortManager('popup-content', handleTask);

chrome.runtime.onInstalled?.addListener(async() => {
  await sleep(500);
  chrome.runtime.reload();
  
});

const sleep = async (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
  a.download = `Xcreen.${mediaType}`;
  a.click();
}

async function scrollAndPrint(port: chrome.runtime.Port) {
  
  if (!capturedImages.length) {
    // get current scroll x y positions
    originalX = window.scrollX;
    originalY = window.scrollY;

    window.scrollTo(0, 0);

    currentX = 0;
    currentY = 0;

    // send message to popup 
    port.postMessage({ type: 'ENTIRE_PAGE_HTML2', mediaType });
    return;
  }

  // scroll to next position if there is any
  currentY += viewPortHeight;

  if (currentY >= pageHeight) {

    window.scrollTo(originalX, originalY);

    // // merge all images
    // const canvas = document.createElement('canvas');
    // canvas.width = pageWidth;
    // canvas.height = pageHeight;

    // const ctx = canvas.getContext('2d');
    // let y = 0;
    // for (let i = 0; i < capturedImages.length; i++) {
    //   const img = new Image();
    //   img.src = capturedImages[i];
    //   ctx?.drawImage(img, 0, y);
    //   y += viewPortHeight;
    // }

    // printFromCanvas(canvas);
    combineAndDownloadImages(capturedImages);

    // reset
    capturedImages.length = 0;
    
    return;
  }

  window.scrollTo(0, currentY);

  await sleep(500);

  // send message to popup 
  port.postMessage({ type: 'ENTIRE_PAGE_HTML2', mediaType });


}

// listen to port messages
port.onMessage.addListener(async (msg) => {
  if (msg.type === 'ENTIRE_PAGE_HTML2') {
    
    if (msg.captured) {

      capturedImages.push(msg.image);
      scrollAndPrint(port);

    }
    else {
      capturedImages.length = 0;
      window.scrollTo(originalX, originalY);
    }
    
  }
});

async function combineAndDownloadImages(imageDataArray: any[]) {
  // Create a temporary canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Load all images first
  const loadedImages = await Promise.all(imageDataArray.map(dataUrl => {
      return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = dataUrl;
      });
  }));
  
  // Calculate total height and max width
  let totalHeight = 0;
  let maxWidth = 0;
  loadedImages.forEach((img: any) => {
      totalHeight += img.height;
      maxWidth = Math.max(maxWidth, img.width);
  });
  
  // Set canvas dimensions
  canvas.width = maxWidth;
  canvas.height = totalHeight;
  
  // Draw images
  let currentY = 0;
  loadedImages.forEach((img: any) => {
      ctx!.drawImage(img, 0, currentY);
      currentY += img.height;
  });
  
  // Convert to blob and download
  canvas.toBlob((blob: any) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Xcreen.${mediaType}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  }, `image/${mediaType}`);
}