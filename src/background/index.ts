console.log('background is running')

chrome.runtime.onMessage.addListener((request, sender, senderResponse) => {
  const { type } = request;
  if (type === 'COUNT') {
    console.log('background has received a message from popup, and count is ', request?.count)
  }
  else if (type === 'CAPTURE') {
    chrome.tabs.query({ active: true, currentWindow: true })
    .then( (tabs) => {
    
      const windowId = tabs.length ? tabs[0].windowId || 0 : 0;
      chrome.tabs.captureVisibleTab(windowId, { format: 'png' }, (dataUrl) => {
        senderResponse(dataUrl)
      })
    })
    .catch((error) => {
      console.error(error)
    });
  }
  else if (type === 'CAPTURE_ENTIRE_PAGE') {
    chrome.tabs.query({ active: true, currentWindow: true })
    .then( (tabs) => {
      const tabId = tabs.length ? tabs[0].id || 0 : 0;
      captureFullPage(tabId)
      .then((dataUrls) => {
        senderResponse(dataUrls)
      })
    })
    .catch((error) => {
      console.error(error)
    });
  }

  return true;
});

function captureFullPage(tabId: number) {
  return new Promise((resolve) => {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: getScrollHeight,
    }, (results) => {
      const scrollHeight = results[0].result;
      const viewportHeight = window.innerHeight;
      const captures: any[] = [];
      let currentScroll = 0;

      function captureViewport(tabId: number) {

        chrome.tabs.captureVisibleTab(tabId, { format: 'png' }, (dataUrl) => {
          captures.push(dataUrl);
          currentScroll += viewportHeight;

          // @ts-ignore
          if (currentScroll < scrollHeight) {
            chrome.tabs.sendMessage(tabId, { scroll: viewportHeight }, () => {
              setTimeout(captureViewport, 100); // Wait for scroll to complete
            });
          } else {
            resolve(captures);
          }
        });
      }

      captureViewport(tabId);
    });
  });
}

function getScrollHeight() {
  return Math.max(
    document.body.scrollHeight, document.documentElement.scrollHeight,
    document.body.offsetHeight, document.documentElement.offsetHeight,
    document.body.clientHeight, document.documentElement.clientHeight
  );
}
