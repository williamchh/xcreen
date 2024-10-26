console.log('background is running');

type ServiceType = 'ENTIRE_PAGE_HTML' | 'SELECT_ELEMENT' | 'SELECT_AREA';
const messageMap: { [key in ServiceType]: string } = {
  'ENTIRE_PAGE_HTML': 'contentEntirePage',
  'SELECT_ELEMENT': 'contentSelectedElement',
  'SELECT_AREA': 'contentSelectArea',
}

let mediaType = 'png';
let files: File[] = [];

chrome.runtime.onConnect.addListener((port) => {

  port.onMessage.addListener((msg) => {

    mediaType = msg.mediaType || 'png';
    
    if (msg.type === 'CAPTURE') {
      chrome.tabs.query({ active: true, currentWindow: true })
      .then( (tabs) => {
      
        const windowId = tabs.length ? tabs[0].windowId || 0 : 0;
        chrome.tabs.captureVisibleTab(windowId, { format: mediaType }, (dataUrl) => {
          port.postMessage({ type: 'CAPTURE_RES', image: dataUrl });
        })
      })
      .catch((error) => {
        console.error(error)
      });
    }
    else if (msg.type === 'ENTIRE_PAGE_HTML') {
      contentPrint('ENTIRE_PAGE_HTML');
    }
    else if (msg.type === 'SELECT_ELEMENT') {
      contentPrint('SELECT_ELEMENT');
    }
    else if (msg.type === 'SELECT_AREA') {
      contentPrint('SELECT_AREA');
    }
  });

});

const contentPrint = async (type: ServiceType, retryCount = 3) => {
  
  const contentMessage = messageMap[type];

  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    if (!tabs || !tabs.length) {
      console.error('No active tab found');
      return;
    }

    const tabId = tabs.length ? tabs[0].id || 0 : 0;

    if (!tabId && retryCount > 0) {
      setTimeout(() => {
        contentPrint(type, retryCount - 1);
      }, 500);
      return;
    }
    else if (!tabId) {
      console.error('Tab not found');
      return;
    }

    await chrome.tabs.sendMessage(tabId, { message: contentMessage, mediaType });
    
  });
};

const getActiveTab = async () => {
  try {
    const tabs = await chrome.tabs.query({ 
      active: true, 
      currentWindow: true,
      lastFocusedWindow: true // Required for Firefox
    });
  
    if (!tabs || !tabs.length) {
      throw new Error('No active tab found');
    }

    return tabs[0];
  }
  catch (error) {
    console.error(error);
    throw error;
  }
};