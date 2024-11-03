import html2canvas from "html2canvas";
import { createOverlay } from "./selection-crosshair";
import { ContentPortManager } from "../models/content-port-manager";
 
let mediaType = 'png';

const handleTask = async (msg: any) => {
  mediaType = msg.mediaType || 'png';
  
  if (msg.type === 'ENTIRE_PAGE_HTML' || msg.type === 'contentEntirePage') {
    const element = document.documentElement;
    await printHtmlElement(element);
  }
  else if (msg.type === 'SELECT_AREA' || msg.type === 'contentSelectArea') {
    createOverlay(mediaType, msg.imageData, port);
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
