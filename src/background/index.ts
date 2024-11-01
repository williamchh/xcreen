console.log('background is running');
import { BackgroundPortManager } from "../models/background-port-manager";
type ServiceType = 'ENTIRE_PAGE_HTML' | 'SELECT_ELEMENT' | 'SELECT_AREA' | 'OPEN_SIDE_PANEL';
const messageMap: { [key in ServiceType]: string } = {
  'ENTIRE_PAGE_HTML': 'contentEntirePage',
  'SELECT_ELEMENT': 'contentSelectedElement',
  'SELECT_AREA': 'contentSelectArea',
  'OPEN_SIDE_PANEL': 'contentOpenSidePanel'
}

let mediaType = 'png';
let files: File[] = [];
let imageData: any | null = null;

const handleTask = (msg: any) => {
  mediaType = msg.mediaType || 'png';
  
  if (msg.type === 'CAPTURE' || msg.type === 'SELECT_AREA') {
    chrome.tabs.query({ active: true, currentWindow: true })
      .then(async (tabs) => {
        
        const _mediaType = ['txt', 'svg'].includes(mediaType) ? 'png' : mediaType;
        const windowId = tabs.length ? tabs[0].windowId || 0 : 0;
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

const portManager = new BackgroundPortManager('popup-background', handleTask);

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'popup-background') { return; }
  port.onMessage.addListener(msg => {
    if (msg.type === 'OPEN_SIDE_PANEL') {
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        chrome.sidePanel.open({ tabId: tab.id! });
      });
    }
  })
});

