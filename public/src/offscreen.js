
// Define the readImage function inside the offscreen page
async function readImage(file) {

    const tesseractUrl = chrome.runtime.getURL('tesseract/tesseract.min.js');

    // Load the script dynamically
    await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = tesseractUrl;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });

    const { createWorker } = Tesseract;

    const worker = await createWorker('eng', 3, {
      workerBlobURL: false,
      corePath: '../tesseract/core',
      workerPath: '../tesseract/worker.min.js',
      cacheMethod: 'write',
      langPath: 'https://raw.githubusercontent.com/naptha/tessdata/gh-pages/4.0.0_best',
      logger: m => updateProgress(m),
    });

    const { data: { text } } = await worker.recognize(file);
    await worker.terminate(); // Clean up the worker after processing
    return text;
  }

  // Progress update function
  function updateProgress(message) {
    console.log("Progress:", message);
    // Send progress updates back to the background script if needed
    chrome.runtime.sendMessage({ type: 'progress', message });
  }

  // Listen for messages from the background script to process an image
  chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {

    if (request.target !== 'offscreen') return;

    if (request.type === 'process-image') {
      const file = request.file; // Assuming file data is passed in request
      const text = await readImage(file);
      // create a link and click it to download the text
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Xcreen_ocr.txt';
      a.click();
    }
    return true; // Keep the message channel open for async response
  });
