console.log('background is running')

chrome.runtime.onConnect.addListener((port) => {

  port.onMessage.addListener((msg) => {
    
    if (msg.type === 'CAPTURE') {
      chrome.tabs.query({ active: true, currentWindow: true })
      .then( (tabs) => {
      
        const windowId = tabs.length ? tabs[0].windowId || 0 : 0;
        chrome.tabs.captureVisibleTab(windowId, { format: 'png' }, (dataUrl) => {
          port.postMessage({ type: 'CAPTURE_RES', image: dataUrl });
        })
      })
      .catch((error) => {
        console.error(error)
      });
    }
    else if (msg.type === 'ENTIRE_PAGE_HTML') {
      contentPrintEntirePage();
    }
    else if (msg.type === 'SELECT_ELEMENT') {
      contentPrintSelectedElement();
    }
    else if (msg.type === 'SELECT_ELEMENT_SVG') {
      contentPrintSelectedElementToSvg();
    }
  });

});

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

  return true;
});

const contentPrintEntirePage = () => {
  chrome.tabs.query({ active: true, currentWindow: true })
    .then( (tabs) => {
      const tabId = tabs.length ? tabs[0].id || 0 : 0;

      if (!tabId) {
        throw new Error('No tab found');
      }

      chrome.tabs.sendMessage(tabId, { message: 'contentEntirePage' });
      
    })
    .catch((error) => {
      console.error(error)
    });
};

const contentPrintSelectedElement = () => {
  chrome.tabs.query({ active: true, currentWindow: true })
    .then( (tabs) => {
      const tabId = tabs.length ? tabs[0].id || 0 : 0;

      if (!tabId) {
        throw new Error('No tab found');
      }

      chrome.tabs.sendMessage(tabId, { message: 'contentSelectedElement' });
      
    })
    .catch((error) => {
      console.error(error)
    });
};

const contentPrintSelectedElementToSvg = () => {
  chrome.tabs.query({ active: true, currentWindow: true })
    .then( (tabs) => {
      const tabId = tabs.length ? tabs[0].id || 0 : 0;

      if (!tabId) {
        throw new Error('No tab found');
      }

      chrome.tabs.sendMessage(tabId, { message: 'contentSelectedElementToSvg' });
      
    })
    .catch((error) => {
      console.error(error)
    });
};

const getEntirePageHtml = (tabId: number): Promise<{}> => {
  return new Promise((resolve, reject) => {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: async () => {
        // Helper function to convert an image URL to base64
        const toDataURL = (url: string) => {
          return fetch(url)
            .then(response => response.blob())
            .then(blob => new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            }));
        };
    
        // Get the entire page HTML
        const html = document.documentElement.outerHTML;
    
        // Get all image elements
        const images = Array.from(document.querySelectorAll('img'));
    
        // Convert image src to base64 URIs and replace in the HTML
        for (let img of images) {
          const src = img.src;
          if (src) {
            try {
              const dataURL = await toDataURL(src);
              img.src = dataURL as string;
            } catch (error) {
              console.warn(`Could not convert image: ${src}`, error);
            }
          }
        }
    
        return {
          html: document.documentElement.outerHTML, // Updated HTML with base64 images
          pageHeight: Math.max(
            document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
          ),
          pageWidth: Math.max(
            document.body.scrollWidth, document.documentElement.scrollWidth,
            document.body.offsetWidth, document.documentElement.offsetWidth,
            document.body.clientWidth, document.documentElement.clientWidth
          ),
          pageLeftPadding: parseInt(window.getComputedStyle(document.body).paddingLeft),
        };
      }
    })
    .then((result) => {
      if (result && result[0] && result[0].result) {
        resolve(result[0].result);
      } else {
        reject('No result returned');
      }
    })
    .catch((error) => {
      reject(error);
    });
  });
};

function getScrollWidth() {
  return Math.max(
    document.body.scrollWidth, document.documentElement.scrollWidth,
    document.body.offsetWidth, document.documentElement.offsetWidth,
    document.body.clientWidth, document.documentElement.clientWidth
  );
}

function getScrollHeight() {
  return Math.max(
    document.body.scrollHeight, document.documentElement.scrollHeight,
    document.body.offsetHeight, document.documentElement.offsetHeight,
    document.body.clientHeight, document.documentElement.clientHeight
  );
}

function captureFullPage(tabId: number) {
  return new Promise((resolve) => {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        const scrollHeight
          = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight);

        return {
          scrollHeight: scrollHeight,
          viewportHeight: window.innerHeight,
        };
      },
    }, (results) => {
      // @ts-ignore
      const { scrollHeight, viewportHeight } = results[0].result;

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