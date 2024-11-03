// console.log('background is running');
import { BackgroundPortManager } from "../models/background-port-manager";


let mediaType = 'png';
let lang = 'eng';

const handleTask = (msg: any) => {
  mediaType = msg.mediaType || 'png';
  
  if (msg.type === 'CAPTURE' || msg.type === 'SELECT_AREA') {

    chrome.tabs.query({ active: true, currentWindow: true })
      .then(async (tabs) => {
        
        const _mediaType = ['txt', 'svg'].includes(mediaType) ? 'png' : mediaType;
        const windowId = tabs.length ? tabs[0].windowId || 0 : 0;

        lang = msg.lang || 'eng';

        chrome.tabs.captureVisibleTab(windowId, { format: _mediaType }, (dataUrl) => {
          portManager.postMessage({ type: getType(msg.type), image: dataUrl });
        })          
        
      })
      .catch((error) => {
        console.error(error)
      });
  }
};

const getType = (type: string) => {
  return `${type}_RES`;
};

let portManager = new BackgroundPortManager('popup-background', handleTask);
// let offscreenPort = chrome.runtime.connect({ name: 'bg-offscreen' });

async function createOffscreen() {
  if (await chrome.offscreen.hasDocument()) return;
  await chrome.offscreen.createDocument({
    url: 'src/offscreen.html',  // This page will create and run the worker
    reasons: [chrome.offscreen.Reason.WORKERS, chrome.offscreen.Reason.IFRAME_SCRIPTING],
    justification: 'Background processing in a worker'
  });
}

chrome.runtime.onInstalled.addListener(async() => {
  portManager = new BackgroundPortManager('popup-background', handleTask);
});

chrome.runtime.onStartup.addListener(() => {
  setTimeout(async () => {
    const windows = await chrome.windows.getAll();

    if (!windows || !windows.length) return;
    
    portManager = new BackgroundPortManager('popup-background', handleTask);

  }, 1000);
});

chrome.runtime.onConnect.addListener((port) => {
  if (!['popup-background', 'content-bg'].includes(port.name)) { return; }

  port.onMessage.addListener(msg => {
    if (msg.type === 'OPEN_SIDE_PANEL') {
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        chrome.sidePanel.open({ tabId: tab.id! });
      });
    }
    else if (msg.type === 'EXTRACT_TEXT_IMAGE') {

      offscreenExtractText(msg);
      
    }
  })
});

const offscreenExtractText = async (msg: any) => {

  await createOffscreen();
  const file = msg.data;
  chrome.runtime.sendMessage({ target: 'offscreen', type: 'process-image', lang, file });
};

