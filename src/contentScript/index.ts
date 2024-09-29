console.info('contentScript is running');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('background has received a message from popup, and count is ')
  if (request.action === 'CAPTURE_TAB') {
    // chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    //   chrome.tabs.captureVisibleTab(tabs[0].windowId, { format: 'png' }, (dataUrl) => {
    //     sendResponse(dataUrl)
    //   })
    // })
    console.log(`tab: ${request.type}, changeInfo: ${request.changeInfo}, tab: ${request.tab}`)
  }


});
  
