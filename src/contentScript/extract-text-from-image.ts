import Tesseract, { createWorker, ImageLike } from 'tesseract.js';
import { ref } from 'vue';

export const progressValue = ref(0);

const createTesseractWorker = async (language: string) => {
  const worker = await createWorker(language, 3, {
    workerBlobURL: false,
    corePath: chrome.runtime.getURL('tesseract/core'),
    workerPath: chrome.runtime.getURL('tesseract/worker.min.js'),
    cacheMethod: 'write',
    langPath: 'https://raw.githubusercontent.com/naptha/tessdata/gh-pages/4.0.0_best',
    logger: m => updateProgress(m),
  });
  return worker;
};

const readImage = async (file: ImageLike) => {

const w = await createWorker('eng', 3, {
    workerBlobURL: false,
    corePath: chrome.runtime.getURL('tesseract/core'),
    workerPath: chrome.runtime.getURL('tesseract/worker.min.js'),
    cacheMethod: 'write',
    langPath: 'https://raw.githubusercontent.com/naptha/tessdata/gh-pages/4.0.0_best',
    logger: m => updateProgress(m),
  });

  const { data: { text } } = await w.recognize(file);

  return text;
};

const extractTextFromFile = async (file: ImageLike, language: string) => {

  try {
    const worker = await createWorker(language, 3, {
      workerBlobURL: false,
      corePath: '../tesseract/core',
      workerPath: '../tesseract/worker.min.js',
      cacheMethod: 'write',
      langPath: 'https://raw.githubusercontent.com/naptha/tessdata/gh-pages/4.0.0_best',
      logger: m => updateProgress(m),
    });
  
    const { data: { text } } = await worker.recognize(file);
  
    await worker.terminate();
  
    // create a and download the text file
    const link = document.createElement('a');
    const blob = new Blob([text], { type: 'text/plain' });
    link.href = URL.createObjectURL(blob);
    link.download = 'Xcreen.txt';
    link.click();   
    progressValue.value = 0; 
  }
  catch (error) {
    console.error('Failed to extract text from image', error);
    progressValue.value = 0;
  }
};


const updateProgress = (message: any) => {
  if (message.status === 'recognizing text') {
    progressValue.value = message.progress * 100;
  }
}


  export { extractTextFromFile, updateProgress, createTesseractWorker, readImage };